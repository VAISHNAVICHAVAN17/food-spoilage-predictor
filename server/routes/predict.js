// routes/predict.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Default shelf life (days) for common grains/pulses when expiry isn't provided
const DEFAULT_SHELF_DAYS = {
  rice: 365,
  wheat: 365,
  dal: 365,
  maize: 270,
  barley: 300,
  millet: 300,
  sorghum: 300,
  default: 240
};

// Helpers
const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const sqftToSqm = (sqft) => sqft * 0.092903;
const tonnesToKg = (t) => t * 1000;

router.post('/', async (req, res) => {
  try {
    let {
      cropType,
      amountKg,
      amountTonnes,
      amountTon,
      amount,
      warehouseSizeSqm,
      warehouseSizeSqft,
      city,
      manufactureDate,
      expiryDate,
      insulation = 'average',
      refrigeration = false
    } = req.body;

    // Normalize numeric inputs
    if (!amountKg) {
      if (amountTonnes) amountKg = tonnesToKg(toNumber(amountTonnes));
      else if (amountTon) amountKg = tonnesToKg(toNumber(amountTon));
      else if (amount) amountKg = toNumber(amount);
    } else amountKg = toNumber(amountKg);

    if (!warehouseSizeSqm && warehouseSizeSqft) {
      warehouseSizeSqm = sqftToSqm(toNumber(warehouseSizeSqft));
    }
    warehouseSizeSqm = toNumber(warehouseSizeSqm);

    // Required fields
    if (!city || !manufactureDate) {
      return res.status(400).json({ error: 'Required: city and manufactureDate' });
    }
    if (!amountKg || !warehouseSizeSqm) {
      return res.status(400).json({ error: 'Required: amount (kg/tonnes) and warehouse size' });
    }
    if (!process.env.OPENWEATHER_API_KEY) {
      return res.status(500).json({ error: 'Missing weather API key' });
    }

    cropType = (cropType || 'default').toLowerCase();

    // Base expiry from manufacture or supplied expiry
    const manufacture = new Date(manufactureDate);
    if (isNaN(manufacture)) return res.status(400).json({ error: 'Invalid manufactureDate' });

    let baseExpiry, baseShelfDays;
    if (expiryDate) {
      baseExpiry = new Date(expiryDate);
      if (isNaN(baseExpiry)) return res.status(400).json({ error: 'Invalid expiryDate' });
      baseShelfDays = Math.round((baseExpiry - manufacture) / (1000 * 60 * 60 * 24));
    } else {
      baseShelfDays = DEFAULT_SHELF_DAYS[cropType] ?? DEFAULT_SHELF_DAYS.default;
      baseExpiry = new Date(manufacture);
      baseExpiry.setDate(baseExpiry.getDate() + baseShelfDays);
    }

    // Weather
    let weather;
    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
      );
      weather = weatherRes.data;
    } catch (err) {
      console.error('Weather API error:', err.response?.data || err.message);
      return res.status(502).json({ error: 'Weather API request failed', details: err.response?.data || err.message });
    }
    const temp = toNumber(weather?.main?.temp, null);
    const humidity = toNumber(weather?.main?.humidity, null);

    // Days remaining
    const now = new Date();
    const baseRemainingDays = Math.max(0, Math.ceil((baseExpiry - now) / (1000 * 60 * 60 * 24)));
    const storageDensity = amountKg / (warehouseSizeSqm || 1);

    // Contributions
    let contributions = { tempPct: 0, humidityPct: 0, densityPct: 0, insulationPct: 0, refrigerationPct: 0 };

    if (temp != null) {
      const hotThreshold = 28;
      const coolThreshold = 12;
      if (temp > hotThreshold) contributions.tempPct = (temp - hotThreshold) * 0.02;
      else if (temp < coolThreshold) contributions.tempPct = -(coolThreshold - temp) * 0.01;
    }

    if (humidity != null) {
      const humHigh = 70, humLow = 50;
      if (humidity > humHigh) contributions.humidityPct = (humidity - humHigh) * 0.008;
      else if (humidity < humLow) contributions.humidityPct = -(humLow - humidity) * 0.004;
    }

    if (storageDensity > 600) contributions.densityPct = 0.15;
    else if (storageDensity > 400) contributions.densityPct = 0.08;
    else if (storageDensity < 150) contributions.densityPct = -0.06;

    if (insulation === 'poor') contributions.insulationPct = 0.08;
    else if (insulation === 'good') contributions.insulationPct = -0.05;

    if (refrigeration === true || refrigeration === 'true') contributions.refrigerationPct = -0.25;

    // Total percentage change cap
    let totalPct = Object.values(contributions).reduce((a, b) => a + b, 0);
    if (totalPct > 0.6) totalPct = 0.6;
    if (totalPct < -0.6) totalPct = -0.6;

    const predictedRemainingDays = Math.max(0, Math.round(baseRemainingDays * (1 - totalPct)));
    const predictedExpiry = new Date(now);
    predictedExpiry.setDate(predictedExpiry.getDate() + predictedRemainingDays);
    const adjustmentDays = Math.round((predictedExpiry - baseExpiry) / (1000 * 60 * 60 * 24));

    // Risk level
    let riskLevel = 'Low';
    if (predictedRemainingDays <= 30) riskLevel = 'High';
    else if (predictedRemainingDays <= 180) riskLevel = 'Moderate';

    // Breakdown
    const breakdown = {
      tempPct: Math.round(contributions.tempPct * 1000) / 10,
      humidityPct: Math.round(contributions.humidityPct * 1000) / 10,
      densityPct: Math.round(contributions.densityPct * 1000) / 10,
      insulationPct: Math.round(contributions.insulationPct * 1000) / 10,
      refrigerationPct: Math.round(contributions.refrigerationPct * 1000) / 10,
      totalPct: Math.round(totalPct * 1000) / 10
    };

    // Build adjustmentReasons array (NEW always-on logic)
    const adjustmentReasons = [];
    if (contributions.tempPct > 0) adjustmentReasons.push(`Reduced by ${Math.round(contributions.tempPct * 100)}% due to high temperature (${temp}°C)`);
    else if (contributions.tempPct < 0) adjustmentReasons.push(`Extended by ${Math.abs(Math.round(contributions.tempPct * 100))}% due to low temperature (${temp}°C)`);

    if (contributions.humidityPct > 0) adjustmentReasons.push(`Reduced by ${Math.round(contributions.humidityPct * 100)}% due to high humidity (${humidity}%)`);
    else if (contributions.humidityPct < 0) adjustmentReasons.push(`Extended by ${Math.abs(Math.round(contributions.humidityPct * 100))}% due to low humidity (${humidity}%)`);

    if (contributions.densityPct > 0) adjustmentReasons.push('Reduced shelf life due to high storage density');
    else if (contributions.densityPct < 0) adjustmentReasons.push('Extended shelf life due to low storage density');

    if (contributions.insulationPct > 0) adjustmentReasons.push('Reduced due to poor insulation');
    else if (contributions.insulationPct < 0) adjustmentReasons.push('Extended due to good insulation');

    if (contributions.refrigerationPct < 0) adjustmentReasons.push('Extended due to refrigeration/cooling');

    // Suggestions (unchanged)
    const suggestions = [];
    if (contributions.tempPct > 0.02) suggestions.push('Temperatures are high — improve ventilation or cooling.');
    if (contributions.humidityPct > 0.02) suggestions.push('High humidity — use dehumidifiers and moisture-proof packaging.');
    if (contributions.densityPct > 0.08) suggestions.push('Storage density is high — reduce stacking and increase airflow.');
    if (insulation === 'poor') suggestions.push('Upgrade insulation to reduce temperature swings.');
    if (!refrigeration) suggestions.push('Consider refrigeration or temporary cooling for high-value lots.');

    // Response
    res.json({
      cropType,
      amountKg,
      warehouseSizeSqm,
      storageDensity: Math.round(storageDensity * 100) / 100,
      city: weather.name,
      temp,
      humidity,
      baseExpiry: baseExpiry.toISOString().split('T')[0],
      baseRemainingDays,
      predictedRemainingDays,
      predictedExpiry: predictedExpiry.toISOString().split('T')[0],
      adjustmentDays,
      breakdown,
      riskLevel,
      adjustmentReasons,  // added here
      suggestions
    });
  } catch (err) {
    console.error('Prediction route error:', err);
    res.status(500).json({ error: 'Prediction failed', details: err.message });
  }
});

module.exports = router;

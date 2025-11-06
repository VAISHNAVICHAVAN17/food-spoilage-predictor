const express = require('express');
const router = express.Router();
const axios = require('axios');
const Prediction = require('../models/Prediction');

// --- Heuristic Prediction Route ---
router.post('/', async (req, res) => {
  try {
    let {
      cropType, amountKg, amountTonnes, amountTon, amount,
      warehouseSizeSqm, warehouseSizeSqft, city,
      manufactureDate, expiryDate,
      insulation = 'average', refrigeration = false
    } = req.body;

    if (!city || !manufactureDate)
      return res.status(400).json({ error: 'Required: city and manufactureDate' });

    cropType = (cropType || 'default').toLowerCase();
    const toNumber = (v, fallback = 0) => {
      const n = Number(v); return Number.isFinite(n) ? n : fallback;
    };
    if (!amountKg) {
      if (amountTonnes) amountKg = toNumber(amountTonnes) * 1000;
      else if (amountTon) amountKg = toNumber(amountTon) * 1000;
      else if (amount) amountKg = toNumber(amount);
    } else amountKg = toNumber(amountKg);

    if (!warehouseSizeSqm && warehouseSizeSqft) {
      warehouseSizeSqm = toNumber(warehouseSizeSqft) * 0.092903;
    }
    warehouseSizeSqm = toNumber(warehouseSizeSqm);

    if (!amountKg || !warehouseSizeSqm)
      return res.status(400).json({ error: 'Required: amount (kg/tonnes) and warehouse size' });

    if (!process.env.OPENWEATHER_API_KEY)
      return res.status(500).json({ error: 'Missing weather API key' });

    const manufacture = new Date(manufactureDate);
    if (isNaN(manufacture)) return res.status(400).json({ error: 'Invalid manufactureDate' });

    let baseExpiry, baseShelfDays;
    if (expiryDate) {
      baseExpiry = new Date(expiryDate);
      if (isNaN(baseExpiry)) return res.status(400).json({ error: 'Invalid expiryDate' });
      baseShelfDays = Math.round((baseExpiry - manufacture) / (1000 * 60 * 60 * 24));
    } else {
      const DEFAULT_SHELF_DAYS = {
        rice: 365, wheat: 365, dal: 365, maize: 270,
        barley: 300, millet: 300, sorghum: 300, default: 240
      };
      baseShelfDays = DEFAULT_SHELF_DAYS[cropType] ?? DEFAULT_SHELF_DAYS.default;
      baseExpiry = new Date(manufacture);
      baseExpiry.setDate(baseExpiry.getDate() + baseShelfDays);
    }

    let weather;
    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`,
        { timeout: 7000 }
      );
      weather = weatherRes.data;
    } catch (err) {
      return res.status(502).json({ error: 'Weather API request failed', details: err.response?.data || err.message });
    }
    const temp = toNumber(weather?.main?.temp, null);
    const humidity = toNumber(weather?.main?.humidity, null);

    const now = new Date();
    const baseRemainingDays = Math.max(0, Math.ceil((baseExpiry - now) / (1000 * 60 * 60 * 24)));
    const storageDensity = amountKg / (warehouseSizeSqm || 1);

    let contributions = { tempPct: 0, humidityPct: 0, densityPct: 0, insulationPct: 0, refrigerationPct: 0 };
    if (temp != null) {
      const hotThreshold = 28, coolThreshold = 12;
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

    let totalPct = Object.values(contributions).reduce((a, b) => a + b, 0);
    totalPct = Math.max(-0.6, Math.min(totalPct, 0.6));

    const predictedRemainingDays = Math.max(0, Math.round(baseRemainingDays * (1 - totalPct)));
    const predictedExpiry = new Date(now);
    predictedExpiry.setDate(predictedExpiry.getDate() + predictedRemainingDays);

    let riskLevel = 'Low';
    if (predictedRemainingDays <= 30) riskLevel = 'High';
    else if (predictedRemainingDays <= 180) riskLevel = 'Moderate';

    const breakdown = {
      tempPct: Math.round(contributions.tempPct * 1000) / 10,
      humidityPct: Math.round(contributions.humidityPct * 1000) / 10,
      densityPct: Math.round(contributions.densityPct * 1000) / 10,
      insulationPct: Math.round(contributions.insulationPct * 1000) / 10,
      refrigerationPct: Math.round(contributions.refrigerationPct * 1000) / 10,
      totalPct: Math.round(totalPct * 1000) / 10
    };

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

    const suggestions = [];
    if (contributions.tempPct > 0.02) suggestions.push('Temperatures are high — improve ventilation or cooling.');
    if (contributions.humidityPct > 0.02) suggestions.push('High humidity — use dehumidifiers and moisture-proof packaging.');
    if (contributions.densityPct > 0.08) suggestions.push('Storage density is high — reduce stacking and increase airflow.');
    if (insulation === 'poor') suggestions.push('Upgrade insulation to reduce temperature swings.');
    if (!refrigeration) suggestions.push('Consider refrigeration or temporary cooling for high-value lots.');

    res.json({
      cropType,
      amountKg,
      warehouseSizeSqm,
      storageDensity: Math.round(storageDensity * 100) / 100,
      city: weather.name,
      manufactureDate,
      expiryDate,
      temp,
      humidity,
      baseExpiry: baseExpiry.toISOString().split('T')[0],
      baseRemainingDays,
      predictedRemainingDays,
      predictedExpiry: predictedExpiry.toISOString().split('T')[0],
      riskLevel,
      breakdown,
      adjustmentReasons,
      suggestions
    });
  } catch (err) {
    res.status(500).json({ error: 'Prediction failed', details: err.message });
  }
});

// --- ML Prediction Route ---
router.post('/mlpredict', async (req, res) => {
  try {
    const {
      cropType, amountKg, warehouseSizeSqm, city,
      insulation = 'average', refrigeration = false,
      manufactureDate, expiryDate
    } = req.body;

    // Validate dates
    if (!manufactureDate)
      return res.status(400).json({ error: "manufactureDate is required" });
    
    const manufacture = new Date(manufactureDate);
    if (isNaN(manufacture))
      return res.status(400).json({ error: "Invalid manufactureDate format" });
    
    let supplierExpiry = expiryDate ? new Date(expiryDate) : null;
    if (expiryDate && isNaN(supplierExpiry))
      return res.status(400).json({ error: "Invalid expiryDate format" });

    // Fetch temperature and humidity if not provided
    let { temperature, humidity } = req.body;
    if (!temperature || !humidity) {
      try {
        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`,
          { timeout: 7000 }
        );
        temperature = weatherRes.data?.main?.temp;
        humidity = weatherRes.data?.main?.humidity;
      } catch (err) {
        temperature = humidity = 'N/A';
      }
    }

    // Calculate base shelf life
    let baseShelfDays;
    if (supplierExpiry) {
      baseShelfDays = Math.round((supplierExpiry - manufacture) / (1000 * 60 * 60 * 24));
    } else {
      const DEFAULT_SHELF = { 
        rice: 365, wheat: 365, dal: 365, maize: 270, 
        barley: 300, millet: 300, sorghum: 300, default: 240 
      };
      baseShelfDays = DEFAULT_SHELF[cropType?.toLowerCase()] || DEFAULT_SHELF.default;
    }

    baseShelfDays = Math.max(30, baseShelfDays);

    // Prepare ML features
    const features = {
      cropType,
      amountKg: Number(amountKg),
      warehouseSizeSqm: Number(warehouseSizeSqm),
      city,
      temperature: Number(temperature),
      humidity: Number(humidity),
      insulation,
      refrigeration: refrigeration ? 1 : 0,
      baseRemainingDays: baseShelfDays
    };
    
    Object.entries(features).forEach(([k, v]) => {
      if (typeof v === 'number' && isNaN(v)) features[k] = 0;
    });

    // Call Flask ML backend
    let flaskResp;
    try {
      flaskResp = await axios.post('http://127.0.0.1:6000/predict', features, { timeout: 7000 });
    } catch (err) {
      console.error('Error calling Flask ML backend:', err.message);
      return res.status(502).json({ error: "ML Model unavailable", details: err.message });
    }
    
    let predictedDays = Math.round(flaskResp.data.predictedShelfLifeDays);

    // Calculate storage density
    let storageDensity = 'N/A';
    if (!isNaN(amountKg) && !isNaN(warehouseSizeSqm) && Number(warehouseSizeSqm) > 0)
      storageDensity = Math.round((Number(amountKg) / Number(warehouseSizeSqm)) * 100) / 100;

    const temp = Number(temperature);
    const hum = Number(humidity);

    // AGGRESSIVE REDUCTION for high-risk conditions
    let reductionDays = 0;
    
    if (hum >= 90 && temp < 25) {
      reductionDays += 120; // 4 months
    } else if (hum >= 85 && temp < 25) {
      reductionDays += 90;  // 3 months
    } else if (hum >= 80) {
      reductionDays += 60;  // 2 months
    } else if (hum >= 70) {
      reductionDays += 30;  // 1 month
    }

    if (temp > 35) {
      reductionDays += 45;
    } else if (temp > 30) {
      reductionDays += 30;
    }

    if (hum >= 85 && temp > 30) {
      reductionDays += 60;
    }

    if (storageDensity !== 'N/A' && storageDensity > 450) {
      reductionDays += 45;
    } else if (storageDensity !== 'N/A' && storageDensity > 350) {
      reductionDays += 30;
    }

    if (insulation === 'poor') {
      reductionDays += 20;
    }

    predictedDays = Math.max(30, predictedDays - reductionDays);

    // Calculate predicted expiry FROM MANUFACTURE DATE
    let predExpiry = new Date(manufacture);
    predExpiry.setDate(predExpiry.getDate() + predictedDays);
    
    const today = new Date();
    if (predExpiry < today) {
      predExpiry = new Date(today);
      predExpiry.setDate(predExpiry.getDate() + 30);
    }
    
    let capped = false;
    if (supplierExpiry && predExpiry > supplierExpiry) {
      predExpiry = supplierExpiry;
      capped = true;
    }

    // RISK CALCULATION
    let riskLevel = 'Low';
    
    if (hum >= 80) {
      riskLevel = 'High';
    } else if (hum >= 60 && hum < 80) {
      if (temp > 30) {
        riskLevel = 'High';
      } else {
        riskLevel = 'Moderate';
      }
    } else {
      if (temp > 35) {
        riskLevel = 'Moderate';
      } else {
        riskLevel = 'Low';
      }
    }

    if (storageDensity !== 'N/A' && storageDensity > 400) {
      if (riskLevel === 'Low') riskLevel = 'Moderate';
      else if (riskLevel === 'Moderate') riskLevel = 'High';
    }

    const daysFromNow = Math.ceil((predExpiry - today) / (1000 * 60 * 60 * 24));
    if (daysFromNow <= 30) riskLevel = 'High';
    else if (daysFromNow <= 90 && riskLevel === 'Low') riskLevel = 'Moderate';

    // Generate SEPARATE factors
    const increasingFactors = [];
    const decreasingFactors = [];
    const suggestions = [];

    // DECREASING FACTORS
    if (hum >= 90) {
      decreasingFactors.push(`Extreme humidity (${hum}%) creates severe mold and fungal growth risk, reducing shelf life by ~4 months`);
      suggestions.push('URGENT: Install industrial dehumidifiers and ensure 24/7 ventilation');
    } else if (hum >= 85) {
      decreasingFactors.push(`Very high humidity (${hum}%) significantly increases mold and spoilage risk, reducing shelf life by ~3 months`);
      suggestions.push('Install dehumidifiers and ensure proper ventilation immediately');
    } else if (hum >= 80) {
      decreasingFactors.push(`High humidity (${hum}%) increases spoilage risk`);
      suggestions.push('Use dehumidifiers and moisture-proof packaging');
    } else if (hum >= 70) {
      decreasingFactors.push(`Moderate-high humidity (${hum}%) may affect shelf life`);
      suggestions.push('Monitor humidity levels and use moisture barriers');
    }

    if (temp > 35) {
      decreasingFactors.push(`Extreme temperature (${temp}°C) rapidly accelerates spoilage`);
      suggestions.push('Install cooling systems immediately');
    } else if (temp > 30) {
      decreasingFactors.push(`High temperature (${temp}°C) accelerates spoilage`);
      suggestions.push('Improve cooling systems or add ventilation');
    }

    if (storageDensity !== 'N/A' && storageDensity > 450) {
      decreasingFactors.push(`Extremely high storage density (${storageDensity} kg/sqm) severely restricts airflow and creates hotspots`);
      suggestions.push('CRITICAL: Reduce stacking to max 400 kg/sqm or split inventory to additional warehouse');
    } else if (storageDensity !== 'N/A' && storageDensity > 350) {
      decreasingFactors.push(`Very high storage density (${storageDensity} kg/sqm) restricts airflow`);
      suggestions.push('Reduce stacking height and increase spacing between batches');
    }

    if (insulation === 'poor') {
      decreasingFactors.push('Poor insulation causes temperature fluctuations');
      suggestions.push('Upgrade warehouse insulation');
    }

    // INCREASING FACTORS
    if (hum < 50) {
      increasingFactors.push(`Low humidity (${hum}%) helps preserve quality`);
    }

    if (temp < 15) {
      increasingFactors.push(`Cool temperature (${temp}°C) helps preserve quality`);
    }

    if (storageDensity !== 'N/A' && storageDensity < 150) {
      increasingFactors.push(`Low storage density (${storageDensity} kg/sqm) allows excellent air circulation`);
    }

    if (refrigeration) {
      increasingFactors.push('Refrigeration significantly extends shelf life');
    }

    if (insulation === 'good') {
      increasingFactors.push('Good insulation helps maintain stable conditions');
    }

    const adjustmentReasons = [...decreasingFactors, ...increasingFactors];

    res.json({
      cropType,
      amountKg,
      warehouseSizeSqm,
      city,
      temperature,
      humidity,
      insulation,
      refrigeration,
      manufactureDate,
      baseShelfDays,
      predictedShelfLifeDays: predictedDays,
      predictedExpiryDate: predExpiry.toISOString().split('T')[0],
      supplierExpiryDate: supplierExpiry ? supplierExpiry.toISOString().split('T')[0] : null,
      cappedBySupplier: capped,
      riskLevel,
      storageDensity,
      adjustmentReasons,
      increasingFactors,      // NEW
      decreasingFactors,      // NEW
      suggestions
    });
  } catch (err) {
    res.status(500).json({ error: 'ML prediction failed', details: err.message });
  }
});

module.exports = router;

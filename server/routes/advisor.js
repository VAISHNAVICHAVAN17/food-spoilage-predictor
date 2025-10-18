const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

router.post('/', async (req, res) => {
  const { city } = req.body;

  try {
    const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: city,
        appid: process.env.OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    const { temp, humidity, weather } = weatherRes.data.main;
    let advice = '';

    if (temp > 30) {
      advice = 'It’s hot. Make sure your crops get enough water and consider mulching.';
    } else if (temp < 15) {
      advice = 'It’s cold. Protect young plants and reduce watering.';
    } else {
      advice = 'Ideal temperature. Continue regular irrigation and monitor weather updates.';
    }

    res.json({ advice });
  } catch (err) {
    console.error('Advisor API error:', err);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
});

module.exports = router;

// src/api/weather.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_OWM_KEY; // Works with CRA

export async function fetchWeather(lat, lon) {
  if (!API_KEY) throw new Error('Missing OpenWeatherMap API key');
  const { data } = await axios.get(
    'https://api.openweathermap.org/data/2.5/onecall',
    { params: { lat, lon, exclude: 'minutely,hourly,alerts', units: 'metric', appid: API_KEY } }
  );
  return data;
}

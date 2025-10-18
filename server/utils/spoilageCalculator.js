const baseShelfLife = {
  tomato: 5,
  rice: 90,
  wheat: 30,
  mango: 7,
  onion: 14
};

const calculateSpoilage = (foodType, temperature, humidity, storageType) => {
  let days = baseShelfLife[foodType.toLowerCase()] || 10;

  if (temperature > 30) days -= 2;
  else if (temperature < 15) days += 1;

  if (humidity > 70) days -= 1;
  else if (humidity < 40) days += 1;

  if (storageType === 'refrigerated') days += 3;
  else if (storageType === 'open') days -= 2;

  return Math.max(days, 1);
};

module.exports = calculateSpoilage;

const messageRenderer = (param) => {
  if (!param) {
    return null;
  }

  const { current } = param;
  const { cloudcover, feelslike, temperature, precip } = current;

  let cloudMoji;
  if (cloudcover < 25) {
    cloudMoji = '☀️';
  } else if (cloudcover > 25 && cloudcover < 50) {
    cloudMoji = '🌤';
  } else if (cloudcover > 50 && cloudcover < 75) {
    cloudMoji = '🌥️';
  } else {
    cloudMoji = '☁️';
  }

  return `Сейчас ${temperature}°C\nчувствуется как ${feelslike}°C\n${cloudMoji},  вероятность ☔ = ${precip}%`;
};

export { messageRenderer };
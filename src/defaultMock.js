//Example of APIXU server response
const defaultMock = {
  request:
    {
      type: 'City',
      query: 'Kiev, Ukraine',
      language: 'en',
      unit: 'm',
    },
  location:
    {
      name: 'Kiev',
      country: 'Ukraine',
      region: 'Kyyivs\'ka Oblast\'',
      lat: '50.433',
      lon: '30.517',
      timezone_id: 'Europe/Kiev',
      localtime: '2020-01-27 12:45',
      localtime_epoch: 1580129100,
      utc_offset: '2.0',
    },
  current:
    {
      observation_time: '10:45 AM',
      temperature: 0,
      weather_code: 143,
      weather_icons:
        ['https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0006_mist.png'],
      weather_descriptions: ['Mist'],
      wind_speed: 11,
      wind_degree: 200,
      wind_dir: 'SSW',
      pressure: 1016,
      precip: 0,
      humidity: 93,
      cloudcover: 75,
      feelslike: -4,
      uv_index: 1,
      visibility: 4,
      is_day: 'yes',
    },
};

export default defaultMock;
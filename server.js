import dotenv from 'dotenv';
import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';
import Sequelize from 'sequelize';
import uuid from 'uuid';
import moment from 'moment';

dotenv.config({ path: '.env' });

const bot = new TelegramBot(process.env.API_KEY, { polling: true });
const DEFAULT_LOCATION = 'Kiev';
const WEATHER_TOKEN = process.env.WEATHER_KEY;


const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASS, {
  host: process.env.MYSQL_HOST,
  dialect: 'mysql',
  define: {
    timestamps: false,
  },
});

const UserModel = (sequelize, type) => {
  return sequelize.define('weather_consumers', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chat_id: {
      type: type.INTEGER,
      allowNull: true,
    },
    name: {
      type: type.STRING(255),
      allowNull: true,
    },
    visits: {
      type: type.INTEGER,
      allowNull: true,
    },
  });
};

const WeatherConsumer = UserModel(sequelize, Sequelize);

sequelize.authenticate().then(() => {
  console.log('Connection established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});

bot.on('message', (msg, type) => {
  const { first_name, last_name, username } = msg.from;
  const chatId = msg.chat.id;
  const { text } = msg;
  const { id } = msg.chat;

  if (text === '/start') {
    bot.sendMessage(chatId, 'Взглянуть на 🌡️ в Киеве: /weather');
  } else if (text === '/weather') {
    WeatherConsumer.findOrCreate({
      where: {
        chat_id: chatId,
      },
      defaults: {
        chat_id: chatId,
        name: `${first_name} ${last_name} @${username}`,
        visits: 0,
      },
    }).then(result => {
      //FIXME: dirty parameter assignment
      const foundChat = result.map(i => i.chat_id)[0];
      let visits = result.map(i => i.visits)[0];
      WeatherConsumer.update(
        { visits: ++visits },
        {
          where: { chat_id: foundChat },
        });
    }).catch(error => console.log(`[${moment(Date.now()).format()}] ${error}`));

    const url = `http://api.weatherstack.com/current?access_key=${WEATHER_TOKEN}&query=${DEFAULT_LOCATION}`;
    fetch(url)
      .then(res => res.json())
      .then(result => {
        bot.sendMessage(chatId, messageRenderer(result));
      })
      .catch(error => {
        console.log(`[${moment(Date.now()).format()}] ${error}`);
        bot.sendMessage(chatId, 'Ooops, something goes wrong');
      });
  } else {
    //dialogflow case
    fetch(encodeURI(`https://api.dialogflow.com/v1/query?v=20150910&contexts=shop&lang=ru&query=${text}&sessionId=${uuid.v4()}&timezone=Ukraine/Kiev`)
      , {
        method: 'GET',
        headers: {
          'Content-Type':'application/json',
          'Authorization':`Bearer ${process.env.DIALOGFLOW_AUTH_BEARER}`,
        },
      })
      .then(res => res.json())
      .then(i => {
        bot.sendMessage(chatId, i.result.fulfillment.speech);
      });
  }
});

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

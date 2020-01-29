import dotenv from 'dotenv';
import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';
import Sequelize from 'sequelize';
import uuid from 'uuid';
import moment from 'moment';
import { DialogFlow } from './dialogflow';
import { messageRenderer } from './messageRenderer';
import { UserModel } from '../db/models/UserModel';


//------------------- init app ------------------
dotenv.config({ path: '.env' });
const {
  API_KEY,
  WEATHER_KEY,
  MYSQL_DATABASE,
  MYSQL_USER,
  MYSQL_PASS,
  MYSQL_HOST,
  DIALOGFLOW_PROJECT_ID,
// eslint-disable-next-line no-undef
} = process.env;

const bot = new TelegramBot(API_KEY, { polling: true });

const DEFAULT_LOCATION = 'Kiev';
const WEATHER_TOKEN = WEATHER_KEY;

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASS, {
  host: MYSQL_HOST,
  dialect: 'mysql',
  define: {
    timestamps: false,
  },
});

const WeatherConsumer = UserModel(sequelize, Sequelize);
const dialogflow = new DialogFlow(DIALOGFLOW_PROJECT_ID);

sequelize.authenticate().then(() => {
  console.log('Connection established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
//------------------- end of init app ------------------

bot.on('message', handleInput);

async function handleInput(msg, type) {

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
    // DialogFlow speech request (Google API v2 based)
    let dialogFlowResponse;
    try {
      dialogFlowResponse = await dialogflow.sendTextMessageToDialogFlow(text, uuid.v4());
    } catch (error) {
      console.log('troubles with dialogflow');
      await bot.sendMessage(chatId, 'искувственный интеллект немного потерпел крушение, давай пообщаемся позже');
    }
    await bot.sendMessage(chatId, dialogFlowResponse[0].queryResult.fulfillmentText);
  }
}
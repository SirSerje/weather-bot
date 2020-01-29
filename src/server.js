import dotenv from 'dotenv';
import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';
import Sequelize from 'sequelize';
import uuid from 'uuid';
import moment from 'moment';
import { DialogFlow } from './dialogflow';
import { UserModel } from '../db/models/UserModel';
import { messageRenderer } from './messageRenderer';


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
const DEFAULT_LOCATION = 'Kiev';
const WEATHER_TOKEN = WEATHER_KEY;

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASS, {
  host: MYSQL_HOST,
  dialect: 'mysql',
  define: {
    timestamps: false,
  },
});
sequelize.authenticate().then(() => {
  console.log('Connection established successfully.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
const bot = new TelegramBot(API_KEY, { polling: true });
const WeatherConsumer = UserModel(sequelize, Sequelize);
const dialogflow = new DialogFlow(DIALOGFLOW_PROJECT_ID);
//------------------- end of init app ------------------

bot.on('message', handleInput);

async function handleInput({
  message_id,
  from: { id, is_bot, first_name, last_name, username, language_code },
  chat: { id: chatId },
  date, text,
},
type) {

  if (text === '/start') {
    bot.sendMessage(chatId, 'Взглянуть на 🌡️ в Киеве: /weather');
  } else if (text === '/weather') {
    // add to MySQL user, who requests weather (to count API calls)
    try {
      let result = await WeatherConsumer.findOrCreate(mySQLFindOrCreateDefaultRequest(chatId, first_name, last_name, username));
      const foundChat = result.map(({chat_id,visits}) => ({chat_id, visits}))[0];
      await WeatherConsumer.update({ visits: ++foundChat.visits }, { where: { chat_id: foundChat.chat_id } });
    } catch (error) {
      //TODO: add notification to mail / telegram, than sql is down
      console.log(`[${moment(Date.now()).format()}] ${error}`);
    }

    //API weather request
    try {
      const url = `http://api.weatherstack.com/current?access_key=${WEATHER_TOKEN}&query=${DEFAULT_LOCATION}`;
      let weatherAPIResponse = await fetch(url);
      let parsedWeatherAPIResponse = await weatherAPIResponse.json();
      await bot.sendMessage(chatId, messageRenderer(parsedWeatherAPIResponse));
    } catch (error) {
      //TODO: add notification than weather API is down
      console.log(`[${moment(Date.now()).format()}] ${error}`);
      await bot.sendMessage(chatId, 'Ooops, something goes wrong with weather API');
    }
  } else {
    // DialogFlow speech request (Google API v2 based)
    let dialogFlowResponse;
    try {
      dialogFlowResponse = await dialogflow.sendTextMessageToDialogFlow(text, uuid.v4());
    } catch (error) {
      //TODO: notify that Dialogflow is down
      console.log('troubles with dialogflow');
      await bot.sendMessage(chatId, 'искувственный интеллект немного потерпел крушение, давай пообщаемся позже');
    }
    await bot.sendMessage(chatId, dialogFlowResponse[0].queryResult.fulfillmentText);
  }
}

const mySQLFindOrCreateDefaultRequest = (chatId, first_name, last_name, username = '') => ({
  where: {
    chat_id: chatId,
  },
  defaults: {
    chat_id: chatId,
    name: `${first_name} ${last_name} @${username}`,
    visits: 0,
  },
});
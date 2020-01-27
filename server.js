import dotenv from 'dotenv';
import fetch from 'node-fetch';
import TelegramBot from 'node-telegram-bot-api';
import winston from 'winston';
import moment from 'moment';
import Sequelize from 'sequelize';

const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
    )
});

dotenv.config({path: '.env'});

const bot = new TelegramBot(process.env.API_KEY, {polling: true});
const DEFAULT_LOCATION = 'Kiev';
const WEATHER_TOKEN = process.env.WEATHER_KEY;
const ROOT_ROUTE = '/weather';


// const path = ':3306/weather_consumers';
// const sequelize = new Sequelize(path, { operatorsAliases: false });
//
// sequelize.authenticate().then(() => {
//     console.log('Connection established successfully.');
// }).catch(err => {
//     console.error('Unable to connect to the database:', err);
// }).finally(() => {
//     sequelize.close();
// });

bot.on('message', (msg, type) => {
    const chatId = msg.chat.id;
    const {text} = msg;
    console.log(text);
    if(text === '/start') {
        bot.sendMessage(chatId, 'Взглянуть на 🌡️ в Киеве: /weather');

    }
    if (text === ROOT_ROUTE) {
        const url = `http://api.weatherstack.com/current?access_key=${WEATHER_TOKEN}&query=${DEFAULT_LOCATION}`;
        fetch(url)
            .then(res => res.json())
            .then(result => {
                bot.sendMessage(chatId, messageRenderer(result));
            })
            .catch(error => {
                logger.error(`[${moment(Date.now()).format()}] ${error}`);
                bot.sendMessage(chatId, 'something goes wrong');
            });
    }
});

const messageRenderer = (param) => {
    if (!param) {
        return null;
    }

    const {current} = param;
    const {cloudcover, feelslike, temperature, precip} = current;

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

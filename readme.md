# weather-bot 🌧 

Simple Telegram bot for *#СЕРЕГИНАПОГОДА* on Instagram ⭐

### Motivation
It's fun, that's enough :)

### How to run?
0. Prerequisites: you need Dialogflow by Google, any MySQL database, APIXU weather api key and telegram bot (api key also needed)
1. Set required info into .env file (example you can see in `.env-default`)
2. `yarn start`

### How to get Google Cloud credentials:
Google offers install their SDK, use gcloud, make tons of manipulations. But we're don't give a damn!  (Thanks [Tzahi Efrati
article](https://medium.com/@tzahi/how-to-setup-dialogflow-v2-authentication-programmatically-with-node-js-b37fa4815d89) for solution)
0. Visit [Google Dialogflow](https://dialogflow.cloud.google.com/)
1. Create new bot
2. From bot's `settings` proceed to `Service Account` option
3. Create new service account. (!) Created account `email` equals `GCLOUD_PRIVATE_MAIL`
4. `GCLOUD_PRIVATE_KEY` can be taken from `Settings` see previous step
5. When account create, generate key, then you will download json file. `GCLOUD_PRIVATE_KEY` means path to this jso (by default it should be placed in project root) 

And you have own bot with weather and smalltalks (you can customize answers in dialogflow console)
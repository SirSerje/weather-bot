import dialogflow from 'dialogflow';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const LANGUAGE_CODE = 'ru';
const DIALOGFLOW_PRIVATE_KEY = require(`../${process.env.GCLOUD_PRIVATE_KEY}`).private_key;
const DIALOGFLOW_CLIENT_EMAIL = process.env.GCLOUD_PRIVATE_MAIL;


class DialogFlow {
  constructor(projectId) {
    this.projectId = projectId;
    let config = {
      credentials: {
        private_key: DIALOGFLOW_PRIVATE_KEY,
        client_email: DIALOGFLOW_CLIENT_EMAIL,
      },
    };

    this.sessionClient = new dialogflow.SessionsClient(config);
  }

  async sendTextMessageToDialogFlow(textMessage, sessionId, languageCode = LANGUAGE_CODE) {
    const sessionPath = this.sessionClient.sessionPath(this.projectId, sessionId);
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: textMessage,
          languageCode: languageCode,
        },
      },
    };
    try {
      let responses = await this.sessionClient.detectIntent(request);
      console.log('DialogFlow.sendTextMessageToDialogFlow: Detected intent');
      return responses;
    } catch (err) {
      console.error('DialogFlow.sendTextMessageToDialogFlow ERROR:', err);
      throw err;
    }
  }
}

export { DialogFlow };
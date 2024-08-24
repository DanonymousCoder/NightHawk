require('dotenv').config();
const { App } = require('@slack/bolt');
const { startArcadeRoutine, stopArcadeRoutine, setArcadeResponse } = require('./arcade');
const config = require('../config/default.json');

const app = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret
});

app.command('/start-hawk', async ({ command, ack, say }) => {
  await ack();
  try {
    if (command.channel_type === 'im' && command.user_id === config.slack.userId) {
      if (!botIsActive) {
        startArcadeRoutine(app);
        say('Bot started! Please enter the response you want to use for the #arcade prompt:');
      } else {
        say('Bot is already running.');
      }
    } else {
      say('Unauthorized user.');
    }
  } catch (error) {
    console.error('Error in /start-hawk command:', error);
    say('There was an error starting the bot.');
  }
});

app.command('/stop-hawk', async ({ command, ack, say }) => {
  await ack();
  try {
    if (command.channel_type === 'im' && command.user_id === config.slack.userId) {
      if (botIsActive) {
        stopArcadeRoutine();
        say('Bot stopped. The /arcade command will no longer be sent.');
      } else {
        say('Bot is not currently running.');
      }
    } else {
      say('Unauthorized user.');
    }
  } catch (error) {
    console.error('Error in /stop-hawk command:', error);
    say('There was an error stopping the bot.');
  }
});

app.message(async ({ message, say }) => {
  try {
    if (botIsActive && message.channel_type === 'im' && message.user === config.slack.userId) {
      const response = setArcadeResponse(message.text);
      say(`Response saved! The bot will now run /arcade in #arcade every 1 hour with the response: "${response}"`);
    }
  } catch (error) {
    console.error('Error processing DM message:', error);
    say('There was an error processing your message.');
  }
});

(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
  } catch (error) {
    console.error('Error starting app:', error);
  }
})();

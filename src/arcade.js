const { App } = require('@slack/bolt');
const config = require('../config/default.json');

let botIsActive = false;
let arcadeResponse = '';
let intervalId = null;

async function sendArcadeCommand(app) {
  try {
    const response = await app.client.chat.postMessage({
      channel: '#arcade',
      text: '/arcade'
    });

    if (response.ok) {
      const promptText = 'What are you working on'; // Adjust prompt text as necessary
      if (!response.message.text.includes(promptText)) {
        setTimeout(() => sendArcadeCommand(app), 60000); // Retry in 1 minute
      } else {
        await replyToArcadePrompt(app);
      }
    }
  } catch (error) {
    console.error('Error running /arcade command:', error);
    setTimeout(() => sendArcadeCommand(app), 60000); // Retry in 1 minute
  }
}

async function replyToArcadePrompt(app) {
  if (!arcadeResponse) {
    console.error('Arcade response is not set.');
    return;
  }

  try {
    await app.client.chat.postMessage({
      channel: '#arcade',
      text: arcadeResponse
    });
  } catch (error) {
    console.error('Error replying to arcade prompt:', error);
  }
}

function startArcadeRoutine(app) {
  if (!botIsActive) {
    botIsActive = true;
    sendArcadeCommand(app); // Initial trigger
    intervalId = setInterval(() => sendArcadeCommand(app), 3600000); // Every 1 hour
    console.log('Arcade routine started.');
  }
}

function stopArcadeRoutine() {
  if (botIsActive) {
    clearInterval(intervalId);
    intervalId = null;
    botIsActive = false;
    console.log('Arcade routine stopped.');
  }
}

function setArcadeResponse(response) {
  if (typeof response === 'string' && response.length <= 4096) { // Validate response length
    arcadeResponse = response;
    return arcadeResponse;
  } else {
    throw new Error('Invalid arcade response.');
  }
}

module.exports = {
  startArcadeRoutine,
  stopArcadeRoutine,
  setArcadeResponse
};

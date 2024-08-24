const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    userId: process.env.SLACK_USER_ID
  }
};

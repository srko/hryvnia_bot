const TOKEN = process.env.TELEGRAM_TOKEN || '197462224:AAEDcz9mG3CM1M_dAK_XPF_Qp9wGGG7X-NA';
const url = process.env.APP_URL || 'https://hryvnia.herokuapp.com';
const port = process.env.PORT || 3000;

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN, { 
  polling: true,
//   webHook: {
//     port: process.env.PORT,
//   },
});

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);

const app = express();

// parse the updates to JSON
app.use(bodyParser.json());

// Main page
app.get('/', (req, res) => res.send('<h1 style="font-family: sans-serif;">ГривняБот</h1>'));

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Handle 404 - Keep this as a last route
app.use(function(req, res, next) {
    res.status(404);
    res.send('404: File Not Found');
});

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

// Just to ping!
bot.on('text', msg => {
  bot.sendMessage(msg.chat.id, 'I am alive!');
});

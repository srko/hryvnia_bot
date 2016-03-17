var TelegramBot = require('node-telegram-bot-api');
var fetch = require('node-fetch');
// var http = require('http');

var token = '197462224:AAEDcz9mG3CM1M_dAK_XPF_Qp9wGGG7X-NA';
var botOptions = {
  polling: true,
};

var bot = new TelegramBot(token, botOptions);

var options = {
  host: 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5',
};

var content = '';

bot.getMe().then(function(me) {
  console.log('Hello! My name is %s', me.first_name);
  console.log('My id is %s', me.id);
  console.log('And my username is %s', me.username);
});

bot.on('text', function(msg) {
  var messageChatId = msg.chat.id;
  var messageText = msg.text;
  var messageDate = msg.date;
  var messageUser = msg.from.username;
  
  if (messageText.indexOf('/every') === 0) {
    var time = new Date();
    console.log(time.getMinutes() % 2);
    if (time.getMinutes() % 2 > 0) {
      setInterval(function() {
        updateGlobalCurrencyList(messageChatId);
      }, 5000);
    }
  }

  if (messageText.indexOf('/rates') === 0) {
    updateGlobalCurrencyList(messageChatId);
  } else if (messageText) {
    numberToCurrency(messageChatId, messageText);
  }
})

function sendMessageByBot(aChatId, aMessage) {
  bot.sendMessage(aChatId, aMessage, { caption: 'I\'m a cute bot!' });
}

function updateGlobalCurrencyList(aMessageChatId) {
  fetch(options.host)
    .then(function(res) {
      return res.json();
    }).then(function(json) {
      var dBuy = parseFloat(Math.round(json[2].buy * 100) / 100).toFixed(2);
      var dSale = parseFloat(Math.round(json[2].sale * 100) / 100).toFixed(2);
      var eBuy = parseFloat(Math.round(json[0].buy * 100) / 100).toFixed(2);
      var eSale = parseFloat(Math.round(json[0].sale * 100) / 100).toFixed(2);
      var rBuy = parseFloat(Math.round(json[1].buy * 100) / 100).toFixed(2);
      var rSale = parseFloat(Math.round(json[1].sale * 100) / 100).toFixed(2);

      var em = String.fromCodePoint(0x1F910);
      
      return `${em}
Долар: ${dBuy} / ${dSale}
Євро: ${eBuy} / ${eSale}
Рубль: ${rBuy} / ${rSale}`;
      
    }).then(function(data) {
      sendMessageByBot(aMessageChatId, data);
    });
}

function numberToCurrency(aMessageChatId, aMessageText) {
  fetch(options.host)
  .then(function(res) {
    return res.json();
  }).then(function(json) {
    var d = parseFloat( +aMessageText / (Math.round( (json[2].sale) * 100 ) / 100) ).toFixed(2);
    var e = parseFloat( +aMessageText / (Math.round( (json[0].sale) * 100 ) / 100) ).toFixed(2);
    var r = parseFloat( +aMessageText / (Math.round( (json[1].sale) * 100 ) / 100) ).toFixed(2);
    
    console.log(parseMessage(aMessageText));

    return `
${d} $
${e} €
${r} ₽`;
  }).then(function(data) {
    sendMessageByBot(aMessageChatId, data);
  })
  
}

function parseMessage(aMessageText) {
    var result = [];
    var line = aMessageText;
    
    line = line.replace(/^\d+/gm, "$& ");
    
    result = line.split(/\s+/g);
    
    result[0] = +result[0];
    
    return result;
}
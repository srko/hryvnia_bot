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
      
      return `${em} Долар: ${dBuy} / ${dSale}, Євро: ${eBuy} / ${eSale}, Рубль: ${rBuy} / ${rSale}`;
      
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
    
    console.log(arrayToMoney( parseMessage(aMessageText), json ));

    return `${d} $, ${e} €, ${r} ₽`;
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
    
    switch (result[1].toLowerCase()) {
        case 'доллар':
        case 'долар':
        case 'дол':
        case 'д':
        case 'долларов':
        case 'доларів':
        case 'даллари':
        case 'доллары':
        case 'доллара':
        case 'долара':
            result[1] = 'USD';
            break;
        case 'евро':
        case 'євро':
        case 'евр':
        case 'євр':
        case 'єв':
        case 'ев':
        case 'е':
        case 'є':
        case 'евров':
        case 'євров':
        case 'евры':
        case 'єври':
        case 'еври':
        case 'евра':
        case 'євра':
            result[1] = 'EUR';
            break;
        case 'рубль':
        case 'рубл':
        case 'руб':
        case 'ру':
        case 'р':
        case 'рублей':
        case 'рублів':
        case 'рубли':
        case 'рублі':
        case 'рубля':
            result[1] = 'RUB';
            break;        
        default:
            result[1] = 'UAH';
    }
    
    return result;
}

function arrayToMoney(array, rates) {
    var money = array[0];
    var h;
    var d;
    var e;
    var r;
    var result = [];
    
    if (array[1] == 'USD') {
        h = money * rates[2].sale;
        d = array[0];
        e = h / rates[0].sale;
        r = h / rates[1].sale;
    } else if (array[1] == 'EUR') {
        h = money * rates[0].sale;
        d = h / rates[2].sale;
        e = array[0];
        r = h / rates[1].sale;
    } else if (array[1] == 'RUB') {
        h = money * rates[1].sale;
        d = h / rates[2].sale;
        e = h / rates[0].sale;
        r = array[0]; 
    } else {
        h = array[0];
        d = money / rates[2].sale + ' $';
        e = money / rates[0].sale + ' €';
        r = money / rates[1].sale + ' ₽';       
    }
    
    result.push(h, d, e, r);
    
    return result;
}
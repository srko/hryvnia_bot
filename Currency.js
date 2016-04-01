var TelegramBot = require('node-telegram-bot-api');
var fetch = require('node-fetch');
// var http = require('http');
var CronJob = require('cron').CronJob;

var token = '197462224:AAEDcz9mG3CM1M_dAK_XPF_Qp9wGGG7X-NA';
var botOptions = {
  polling: true,
};

var bot = new TelegramBot(token, botOptions);

var options = {
  host: 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5',
};

var job = new CronJob({
  cronTime: '*/3 * * * * 1-5',
  onTick() {
    console.log('working...');
    console.log(bot.getUpdates());
    // updateGlobalCurrencyList(messageChatId);
  },
  onComplete() {
    console.log('_________and finished');
  },
  start: false,
  timeZone: 'Europe/Kiev',
});

bot.getMe().then((me) => {
  console.log('Hello! My name is %s', me.first_name);
  console.log('My id is %s', me.id);
  console.log('And my username is %s', me.username);
});

bot.on('text', (msg) => {
  var messageChatId = msg.chat.id;
  var messageText = msg.text;
  // var messageDate = msg.date;
  // var messageUser = msg.from.username;
  var opts = {
    // reply_to_message_id: msg.message_id, // выбирает предыдущее сообщение
    reply_markup: JSON.stringify({
      keyboard: [
        ['one'],
        ['two', 'three'],
        ['four', 'five', 'six'],
      ],
    }),
  };

  if (messageText.indexOf('/every') === 0) {
    job.start();
  }
  if (messageText.indexOf('/none') === 0) {
    console.log('must stop');
    job.stop();
  }

  if (messageText.indexOf('/rates') === 0) {
    updateGlobalCurrencyList(messageChatId);
  } else if (messageText) {
    numberToCurrency(messageChatId, messageText, opts);
  }
});

function sendMessageByBot(aChatId, aMessage, sendingOpts) {
  bot.sendMessage(aChatId, aMessage, sendingOpts);
}

function updateGlobalCurrencyList(aMessageChatId) {
  fetch(options.host)
    .then((res) => res.json())
    .then((json) => {
      var dBuy = parseFloat(Math.round(json[2].buy * 100) / 100).toFixed(2);
      var dSale = parseFloat(Math.round(json[2].sale * 100) / 100).toFixed(2);
      var eBuy = parseFloat(Math.round(json[0].buy * 100) / 100).toFixed(2);
      var eSale = parseFloat(Math.round(json[0].sale * 100) / 100).toFixed(2);
      var rBuy = parseFloat(Math.round(json[1].buy * 100) / 100).toFixed(2);
      var rSale = parseFloat(Math.round(json[1].sale * 100) / 100).toFixed(2);

      var em = String.fromCodePoint(0x1F911);

      return `${em} Долар: ${dBuy} / ${dSale}, Євро: ${eBuy} / ${eSale}, Рубль: ${rBuy} / ${rSale}`;
    }).then((data) => {
      sendMessageByBot(aMessageChatId, data);
    });
}

function numberToCurrency(aMessageChatId, aMessageText, op) {
  fetch(options.host)
    .then((res) => res.json())
    .then((json) => {
      var text = parseMessage(aMessageText);
      var rates = arrayToMoney(text, json);
      // var d = parseFloat(+aMessageText / (Math.round((json[2].sale) * 100) / 100)).toFixed(2);
      // var e = parseFloat(+aMessageText / (Math.round((json[0].sale) * 100) / 100)).toFixed(2);
      // var r = parseFloat(+aMessageText / (Math.round((json[1].sale) * 100) / 100)).toFixed(2);

      return rates;
    }).then((data) => {
      sendMessageByBot(aMessageChatId, data, op);
    });
}

function parseMessage(aMessageText) {
  var result = [];
  var line = aMessageText.replace(/ /g, '');

  line = line.replace(/^\d+[,.]*\d*/gm, '$& ');
  line = line.replace(/,/g, '.');

  result = line.split(/\s+/g);
  result[0] = parseFloat(result[0]);

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

  if (array[1] === 'USD') {
    h = parseFloat(
      (Math.round(money * 100) / 100) * (Math.round(rates[2].sale * 100) / 100)
    ).toFixed(2);
    d = array[0];
    e = parseFloat(h / (Math.round(rates[0].sale * 100) / 100)).toFixed(2);
    r = parseFloat(h / (Math.round(rates[1].sale * 100) / 100)).toFixed(2);
    result.push(`${h} ₴`, `${e} €`, `${r} ₽`);
  } else if (array[1] === 'EUR') {
    h = parseFloat(
      (Math.round(money * 100) / 100) * (Math.round(rates[0].sale * 100) / 100)
    ).toFixed(2);
    d = parseFloat(h / (Math.round(rates[2].sale * 100) / 100)).toFixed(2);
    e = array[0];
    r = parseFloat(h / (Math.round(rates[1].sale * 100) / 100)).toFixed(2);
    result.push(`${h} ₴`, `${d} $`, `${r} ₽`);
  } else if (array[1] === 'RUB') {
    h = parseFloat(
      (Math.round(money * 100) / 100) * (Math.round(rates[1].sale * 100) / 100)
    ).toFixed(2);
    d = parseFloat(h / (Math.round(rates[2].sale * 100) / 100)).toFixed(2);
    e = parseFloat(h / (Math.round(rates[0].sale * 100) / 100)).toFixed(2);
    r = array[0];
    result.push(`${h} ₴`, `${d} $`, `${e} €`);
  } else {
    h = array[0];
    d = parseFloat(money / (Math.round(rates[2].sale * 100) / 100)).toFixed(2);
    e = parseFloat(money / (Math.round(rates[0].sale * 100) / 100)).toFixed(2);
    r = parseFloat(money / (Math.round(rates[1].sale * 100) / 100)).toFixed(2);
    result.push(`${d} $`, `${e} €`, `${r} ₽`);
  }

  return result.join(',\n');
}

var TelegramBot = require('node-telegram-bot-api');
var fetch = require('node-fetch');
var http = require('http');

var token = '197462224:AAEDcz9mG3CM1M_dAK_XPF_Qp9wGGG7X-NA';
var botOptions = {
    polling: true,
};

var bot = new TelegramBot(token, botOptions);

var options = {
    host: 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5',
};

var content = '';

bot.getMe().then(function (me) {
    console.log('Hello! My name is %s', me.first_name);
    console.log('My id is %s', me.id);
    console.log('And my username is %s', me.username);
});

bot.on('text', function (msg) {
    var messageChatId = msg.chat.id;
    var messageText = msg.text;
    var messageDate = msg.date;
    var messageUser = msg.from.username;

    if (messageText.indexOf('/currency') === 0) {
        updateGlobalCurrencyList(messageChatId);
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
		console.log(json);
        return 'Еврики' + '(' + json[0].ccy + ') по ' + json[0].buy + ', братишка';
    }).then(function (data) {
        sendMessageByBot(aMessageChatId, data);
    });
}
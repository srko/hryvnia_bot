var express = require('express');
var currency = require('./Currency');

var app = express();


app.get('/', (req, res) => {
  res.send('ГривняБот');
}
);

app.listen(3000, () => console.log('Example app listening on port 3000!'));
/*
This file should contain all the api callbacks to module ccxt
*/

//Init

let f = require("./funk.js");
let keys = require("../keys.json");  //keys file location
let ccxt = require('ccxt');
let exchangeName = "binance";
let exchange;

switch (exchangeName) {
    case "bitstamp":
        exchange = new ccxt.bitstamp({
            apiKey: keys.bitstamp.apiKey,
            secret: keys.bitstamp.secret,
            uid: keys.bitstamp.uid
        });
        break;
    case "poloniex":
        exchange = new ccxt.poloniex({
            apiKey: keys.poloniex.apiKey,
            secret: keys.poloniex.secret,
        });
        break;
    case "bittrex":
        exchange = new ccxt.bittrex({
            apiKey: keys.bittrex.apiKey,
            secret: keys.bittrex.secret,
        });
        break;
    case "coinbase":
        exchange = new ccxt.coinbase({
            apiKey: keys.coinbase.apiKey,
            secret: keys.coinbase.secret,
        });
        break;
    case "binance":
        exchange = new ccxt.binance({
            apiKey: keys.binance.apiKey,
            secret: keys.binance.secret,
        });
        break;
    case "hitbtc":
        exchange = new ccxt.hitbtc({
            apiKey: keys.hitbtc.apiKey,
            secret: keys.hitbtc.secret,
        });
        break;
    case "bitmex":
        exchange = new ccxt.bitmex({
            apiKey: keys.bitmex.apiKey,
            secret: keys.bitmex.secret
        })
        break;
}

/*
f.cs("Software version: " + ccxt.version);
f.cs("Available exchanges: " + ccxt.exchanges);
f.cs(exchange.name);
f.cs(exchange.urls.www);
f.cs("Referral link: "+exchange.urls.referral);
f.cs("Fees: "+exchange.fees.trading.maker);
*/

//Call functions of CCXT--------

async function change(symbol) {
    result = await exchange.fetchTicker(symbol);
    return result.percentage;
}

//Exports of this module--------

exports.change = change;






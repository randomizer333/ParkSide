/*
This file should contain all the api callbacks to module ccxt
*/

//  Reqiurements

let f = require("./funk.js");           //common functions
let keys = require("../keys.json");     //keys file location
let ccxt = require('ccxt');             //api module

//  Init

let exchange = "binance";
switch (exchange) {     //Select exchange
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

//  Call functions of CCXT

function exInfo() {     //returns JSON of exchange info
    return {
        version: ccxt.version,
        exchange: exchange.name,
        url: exchange.urls.www,
        referral: exchange.urls.referral,
        feeMaker: exchange.fees.trading.maker,
        feeTaker: exchange.fees.trading.taker,
        exchanges: ccxt.exchanges,
        markets: exchange.symbols
    }
}

async function change(symbol) {             //returns Variable change percentage of a market
    r = await exchange.fetchTicker(symbol);
    return r.percentage;
}
async function minAmount(symbol) {          //returns minimum amount of base allowed to buy
    r = await exchange.loadMarkets();
    re = r[symbol].limits.amount.min;
    return re;
}
async function wallet() {                   //returns Array of Objects balances of an account
    r = await exchange.fetchBalance();
    curs = Object.keys(r);
    vals = Object.values(r.total);
    let balances = [];
    parseBlances();
    function parseBlances() {
        let j = 0
        for (i = 0; i < curs.length; i++) {
            if (vals[i] > 0) {
                balances[j] = { currency: curs[i + 1], balance: vals[i] }
                j++
            }
        }
    }
    return await balances;
}
async function balance(currency) {          //returns Array of Objects balances of an account
    r = await exchange.fetchBalance();
    return await r[currency].total;
}
async function bid(symbol) {                //reurns Array of Objects bid,ask
    r = await exchange.fetchOrderBook(symbol);
    return bid = r.bids[0][0];
}
async function ask(symbol) {                //reurns Array of Objects bid,ask
    r = await exchange.fetchOrderBook(symbol);
    return ask = r.asks[0][0];
}
async function price(symbol) {                //reurns Array of Objects bid,ask
    r = await exchange.fetchOrderBook(symbol);
    high = r.asks[0][0];
    low = r.bids[0][0];
    spread = high - low;
    return price = high - (spread / 2);
}
async function cancel(id) {                 //cancels order with id
    r = await exchange.cancelOrder(id);
    return "Canceled order" + JSON.stringify(r);
}
async function sell(symbol, amount, price) {// symbol, amount, ask 
    r = await exchange.createLimitSellOrder(symbol, amount, price)
    orderId = r.id;
    orderStatus = r.status;
    sendMail("Sold", msg + "\n" + JSON.stringify(r));
    orderType = "sold";
    setTimeout(function () { cancelOrder(orderId) }, timeTicker * 0.9);
}
async function buy(symbol, amount, price) { // symbol, amount, bid 
    r = exchange.createLimitBuyOrder(symbol, amount, price)
    orderId = r.id;
    orderStatus = r.status;
    sendMail("Bougth", msg + "\n" + JSON.stringify(r));  //dev
    bougthPrice = price;
    setTimeout(function () { cancelOrder(orderId) }, timeTicker * 0.9);
}
async function markets() {                   //load all available markets on exchange
    r = await exchange.loadMarkets();
    return exchange.symbols;
}


//  Exports of this module

exports.exInfo = exInfo;
exports.balance = balance;
exports.bid = bid;
exports.ask = ask;
exports.change = change;
exports.wallet = wallet;
exports.minAmount = minAmount;
exports.cancel = cancel;
exports.sell = sell;
exports.buy = buy;
exports.price = price;
exports.markets = markets;





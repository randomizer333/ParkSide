/*
This file should contain all the api callbacks to module ccxt
*/

//  Reqiurements

const f = require("./funk.js");           //common functions
const keys = require("../keys.json");     //keys file location
const ccxt = require('ccxt');             //api module
const main = require("./main.js");             //api module

let m;
let ticker;
req();
async function req() {
    m = await require("./main.js");
    ticker = m.ticker;
    //f.cs("Ticker time: " + ticker);
}

//  Init

let orderId = 0;
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
            //verbose: true,
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

function exInfos() {     //returns JSON of exchange info
    return {
        version: ccxt.version,
        exchange: exchange.name,
        url: exchange.urls.www,
        referral: exchange.urls.referral,
        feeMaker: exchange.fees.trading.maker,
        feeTaker: exchange.fees.trading.taker,
        exchanges: ccxt.exchanges,

    }
}
async function change(symbol) {             //returns Variable change percentage of a market
    try {
        r = await exchange.fetchTicker(symbol);
    } catch (error) {
        console.log("EEE: ", error.message);
    }
    return await r.percentage;
}
async function minAmount(symbol) {          //returns minimum amount of base allowed to buy
    try {
        r = await exchange.loadMarkets();
        re = r[symbol].limits.amount.min;
    } catch (error) {
        console.log("EEE: ", error.message);
    }
    return await re;
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
    try {
        r = await exchange.fetchBalance();
    } catch (error) {
        console.log("EEE: ", error.message);
    }
    return await r[currency].total;
}
async function bid(symbol) {                //reurns Array of Objects bid,ask
    try {
        r = await exchange.fetchOrderBook(symbol);
    } catch (error) {
        console.log("EEE: ", error.message);
    }
    return bid = await r.bids[0][0];
}
async function ask(symbol) {                //reurns Array of Objects bid,ask
    try {
        r = await exchange.fetchOrderBook(symbol);
    } catch (error) {
        console.log("EEE: ", error.message);
    }
    return ask = await r.asks[0][0];
}
async function price(symbol) {                //reurns Array of Objects bid,ask
    try {
        r = await exchange.fetchOrderBook(symbol);
        high = r.asks[0][0];
        low = r.bids[0][0];
        spread = high - low;
        return price = high - (spread / 2);
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}
async function cancel(orderId, symbol) {                 //cancels order with id
    try {
        r = await exchange.cancelOrder(orderId, symbol);
        f.sendMail("Canceled", JSON.stringify(r));
        return true;
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}
async function sell(symbol, amount, price) {// symbol, amount, ask 
    try {
        r = await exchange.createLimitSellOrder(symbol, amount, price)
        orderId = r.id;
        orderStatus = r.status;
        orderType = "sold";
        //main.clear();
        let noSale;
        setTimeout(function () {noSale = cancel(orderId, symbol) }, ticker * 0.85);
        if(await !noSale){
            main.clear();
        }
        //setTimeout(function () { main.clear(); }, ticker * 0.9);
        f.sendMail(orderType, JSON.stringify(r)+"\n"+JSON.stringify(main.marketInfo));
        return price;
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}
async function buy(symbol, amount, price) { // symbol, amount, bid 
    try {
        r = await exchange.createLimitBuyOrder(symbol, amount, price);
        orderId = r.id;
        orderStatus = r.status;
        orderType = "bougth";
        setTimeout(function () { cancel(orderId, symbol) }, ticker * 0.9);
        f.sendMail(await orderType, JSON.stringify(r)+"\n"+JSON.stringify(await main.marketInfo));  //dev
        return price;
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}
async function markets() {                   //load all available markets on exchange
    try {
        r = await exchange.loadMarkets();
        return exchange.symbols;
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}

async function bestbuy() {
    let symbols = await markets();

    let bestbuy = new Array();
    bestbuy = await populate(symbols.length);
    function populate(length) {
        let arr = new Array();
        for (i = 0; i < length - 1; i++) {
            arr[i] = {
                id: "",
                market: "",
                change: "",
                base: "",
                quote: ""
            };
        }
        return arr;
    }

    bestbuy = await parseChanges(symbols.length);
    async function parseChanges(length) {
        for (i = 0; i < length - 1; i++) {
            r = await change(symbols[i]);
            bestbuy[i].id = length - i;
            bestbuy[i].market = symbols[i];
            bestbuy[i].change = r;
            bestbuy[i].base = f.splitSymbol(symbols[i], "first");
            bestbuy[i].quote = f.splitSymbol(symbols[i], "second");
            f.cs(bestbuy[i]);
        }
        return await bestbuy;
    };

    let sortedMarks = new Array();
    sortedMarks = await populate(bestbuy);
    sortedMarks = await bestbuy.sort(SortByAtribute);
    function SortByAtribute(x, y) { //sort array of JSON objects by one of its properties
        return ((x.change == y.change) ? 0 : ((x.change > y.change) ? -1 : 1));
    }

    return await sortedMarks;
}

//  Exports of this module

exports.bestbuy = bestbuy;
exports.exInfos = exInfos;
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





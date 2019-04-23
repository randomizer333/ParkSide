/*
This file should contain all the api callbacks to module ccxt
*/

//  Reqiurements

const f = require("./funk.js");           //common functions
const keys = require("../keys.json");     //keys file location
const ccxt = require('ccxt');             //api module
//const main = require("./main.js");             //api module

let m;
let ticker;
req();
async function req() {
    m = await require("./main.js");
    ticker = m.ticker;
    //f.cs("Ticker time: " + ticker);
}

//  Init

let filled;
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
    let r = {
        version: ccxt.version,
        exchange: exchange.name,
        url: exchange.urls.www,
        referral: exchange.urls.referral,
        feeMaker: exchange.fees.trading.maker,
        feeTaker: exchange.fees.trading.taker,
        exchanges: ccxt.exchanges
    }
    return r;
}
/*
let exInfos;
exInfos = {
        version: ccxt.version,
        exchange: exchange.name,
        url: exchange.urls.www,
        referral: exchange.urls.referral,
        feeMaker: exchange.fees.trading.maker,
        feeTaker: exchange.fees.trading.taker,
        exchanges: ccxt.exchanges
};*/

//symbol = "BTC/USDT";
//volume(symbol);
async function volume(symbol) {
    try {
        v = await exchange.fetchTicker(symbol);
        //f.cs(v);
        return await v.quoteVolume;
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}

async function change(symbol) {             //returns Variable change percentage of a market
    try {
        r = await exchange.fetchTicker(symbol);
        return await r.percentage;
    } catch (error) {
        console.log("EEE: ", error.message);
    }
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
        return re = await r.bids[0][0];
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}
async function ask(symbol) {                //reurns Array of Objects bid,ask
    try {
        r2 = await exchange.fetchOrderBook(symbol);
        return await r2.asks[0][0];
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}
async function price(symbol) {                //reurns Array of Objects bid,ask
    try {
        r = await exchange.fetchOrderBook(symbol);
        higher = r.asks[1][0];
        high = r.asks[0][0];
        low = r.bids[0][0];
        lower = r.bids[1][0];
        //f.cs("high: "+high+" higher: "+higher);
        //f.cs("low: "+low+" lower: "+lower);

        //spread = low - lower;   //bid spread
        //price = low - (spread / 2); //bid spread

        spread = high - low;        //real spread
        price = high - (spread / 2);//real spread

        //spread = higher - high;   //ask spread
        //price = higher - (spread / 2); //ask spread

        return price;
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}
async function cancel(orderId, symbol) {                 //cancels order with id
    try {
        r = await exchange.cancelOrder(orderId, symbol);
        //order was NOT filled
        filled = false;
        f.sendMail("Canceled", JSON.stringify(r));
        return filled;
    } catch (error) {
        //order was filled
        filled = true;
        console.log("EEE: ", error.message);
    }
}
async function sell(symbol, amount, price) {// symbol, amount, ask 
    try {
        r = await exchange.createLimitSellOrder(symbol, amount, price);
        orderId = r.id;
        setTimeout(function () { cancel(orderId, symbol); }, ticker * 0.9);
        
        if (await filled) {
            //order was filled
            f.sendMail("sold", JSON.stringify(r));
            filled = true;
            orderType = "sold";
        } else {
            //order was canceled
            orderType = "canceled";
        }
        ret = {
            orderId: r.id,
            orderStatus: r.status,
            orderType: orderType,
            filled: filled,
            bougthPrice: price,
        }
        return await ret;
    } catch (error) {
        console.log("EEE: ", error.message);
    }
}
let c;
async function buy(symbol, amount, price) { // symbol, amount, bid 
    try {
        r = await exchange.createLimitBuyOrder(symbol, amount, price);
        orderId = r.id;
        setTimeout(function () { c = cancel(orderId, symbol) }, ticker * 0.9);
        if (await c) {
            //order was filled
            f.sendMail("bougth", JSON.stringify(r));
            bougthPrice = price;
            orderType = "bougth";
        } else {
            //order was canceled
            orderType = "canceled";
        }
        ret = await {
            orderId: r.id,
            orderStatus: r.status,
            orderType: orderType,
            filled: filled,
            bougthPrice: price,
        }
        return await ret;
    } catch (error) {
        console.log("EEE: ", error.message);
        ret = await {
            orderId: r.id,
            orderStatus: r.status,
            orderType: "invalid",
            filled: false,
            bougthPrice: price,
        }
        return await ret;
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

async function bestbuy(num, mainQuoteCurrency) {
    let symbols = await markets();  //get all market symbols

    let symbols2 = symbols;
    symbols2 = await filter(mainQuoteCurrency, symbols);
    async function filter(mainQuoteCurrency, syms) {
        let results = new Array();;
        let quote = new Array();
        f.cs("Main quote: " + mainQuoteCurrency);
        for (i = 0; i < syms.length - 1; i++) {
            quote = f.splitSymbol(syms[i], "second");
            if (quote == mainQuoteCurrency) {
                results[i] = syms[i];
            }
        }
        let results2;
        results2 = await f.cleanArray(results);
        f.cs(results2);
        return results2;
    }

    let bestbuy = new Array();
    bestbuy = await populate(symbols2.length);
    function populate(length) {
        let arr = new Array();
        for (i = 0; i < length - 1; i++) {
            arr[i] = {
                id: "",
                market: "",
                price: "",
                change: "",
                base: "",
                quote: ""
            };
        }
        return arr;
    }

    bestbuy = await parseChanges(symbols2.length, symbols2);
    async function parseChanges(length, symbols) {   //sim
        for (i = 0; i < length - 1; i++) {
            r = await change(symbols[i]);
            //p = await ask(symbols[i]);
            bestbuy[i].id = length - i;
            bestbuy[i].market = symbols[i];
            //bestbuy[i].price = p;
            bestbuy[i].change = r;
            bestbuy[i].base = f.splitSymbol(symbols[i], "first");
            bestbuy[i].quote = f.splitSymbol(symbols[i], "second");
            f.cs(bestbuy[i]);
        }
        return await bestbuy;
    };

    let sortedMarks = new Array();
    sortedMarks = await bestbuy.sort(SortByAtribute);
    function SortByAtribute(x, y) { //sort array of JSON objects by one of its properties
        return ((x.change == y.change) ? 0 : ((x.change > y.change) ? - 1 : 1));
    }

    let bests = new Array();
    bests = await f.cutArray(sortedMarks, num);

    return bests;
}

// get microPrice markets
async function microPrice(num, mainQuoteCurrency) {
    let symbols = await markets();  //get all market symbols

    let symbols2 = symbols;
    symbols2 = await filter(mainQuoteCurrency, symbols);
    async function filter(mainQuoteCurrency, syms) {
        let results = new Array();;
        let quote = new Array();
        f.cs("Main quote: " + mainQuoteCurrency);
        for (i = 0; i < syms.length - 1; i++) {
            quote = f.splitSymbol(syms[i], "second");
            if (quote == mainQuoteCurrency) {
                results[i] = syms[i];
            }
        }
        let results2;
        results2 = await f.cleanArray(results);
        f.cs(results2);
        return results2;
    }

    let bestbuy = new Array();
    bestbuy = await populate(symbols2.length);
    function populate(length) {
        let arr = new Array();
        for (i = 0; i < length - 1; i++) {
            arr[i] = {
                id: "",
                market: "",
                price: "",
                change: "",
                base: "",
                quote: ""
            };
        }
        return arr;
    }

    bestbuy = await parseChanges(symbols2.length, symbols2);
    async function parseChanges(length, symbols) {   //sim
        for (i = 0; i < length - 1; i++) {
            //r = await change(symbols[i]);
            p = await ask(symbols[i]);
            bestbuy[i].id = length - i;
            bestbuy[i].market = symbols[i];
            bestbuy[i].price = p;
            //bestbuy[i].change = r;
            bestbuy[i].base = f.splitSymbol(symbols[i], "first");
            bestbuy[i].quote = f.splitSymbol(symbols[i], "second");
            f.cs(bestbuy[i]);
        }
        return await bestbuy;
    };

    let sortedMarks = new Array();
    sortedMarks = await bestbuy.sort(SortByAtribute);
    function SortByAtribute(x, y) { //sort array of JSON objects by one of its properties
        return ((x.price == y.price) ? 0 : ((x.price > y.price) ? 1 : - 1));
    }

    let bests = new Array();
    bests = await f.cutArray(sortedMarks, num);

    return bests;
}

// Exports of this module

exports.volume = volume;
exports.microPrice = microPrice;
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





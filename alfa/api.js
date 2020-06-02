/*
This file should contain all the api callbacks to module ccxt
*/

//  Reqiurements

const f = require("./funk.js");           //common functions
const keys = require("../keys.json");     //keys file location
const ccxt = require('ccxt');             //api module
const set = require("../set.json");
//const main = require("./main.js");             //api module

let m;
let ticker;
ticker = f.minToMs(set.tickerMinutes);

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

let exInfos;
exInfos = {
    version: ccxt.version,
    exchange: exchange.name,
    url: exchange.urls.www,
    referral: exchange.urls.referral,
    feeMaker: exchange.fees.trading.maker,
    feeTaker: exchange.fees.trading.taker,
    exchanges: ccxt.exchanges
};


//ohlcv("BTC/USDT")
async function ohlcv(symbol) {

    const klines = await exchange.fetchOHLCV(symbol, "1d")
    //resolve(klines)

    //f.cs(klines)

    return

}

async function volume(symbol) {
    try {
        v = await exchange.fetchTicker(symbol);
        //f.cs(v);
        return await v.quoteVolume;
    } catch (error) {
        console.log("EEE: ", error);
    }
}

async function change(symbol) {             //returns Variable change percentage of a market
    try {
        r = await exchange.fetchTicker(symbol);
        return await r.percentage;
    } catch (error) {
        console.log("EEE: ", error);
    }
}
async function minAmount(symbol) {          //returns minimum amount of base allowed to buy
    try {
        r = await exchange.loadMarkets();
        re = r[symbol].limits.amount.min;
    } catch (error) {
        console.log("EEE: ", error);
    }
    return await re;
}

//sellAll(wallet);
async function sellAll(array) {
    for (var cell in array) {
        r = await sell(array[cell].currency + "/USDT");
    }
    return r;
}

let curs;
let balances = [];
async function wallet() {                   //returns Array of Objects balances of an account
    try {
        r = await exchange.fetchBalance();
        curs = await Object.keys(r);
        vals = await Object.values(r.total);
        balances = await parseBalances();
        async function parseBalances() {
            let j = 0
            /*for (i in curs) {
                if (r[i] > 0) {
                    balances[j] = await { currency: curs[i + 1], balance: vals[i]};
                    j++
                }
            }*/
            for (i = 0; i < curs.length; i++) {
                if (vals[i] > 0) {
                    balances[j] = await { currency: curs[i+1], balance: vals[i] };
                    j++
                }
}
            return await balances
        }
        //await f.cs(balances);
        return await balances;
    } catch (error) {
        console.log("EEE: ", error);
    }

}

let wal;
async function priceAll() { //dev
    wal = await wallet();
    for (i = 0; i < wal.length; i++) {
        sym = wal[i].currency + "/BTC";
        r = price(sym);
        wal[i].price;
    }
    /*
    for (var cell in array) {
        r = await price(sym);
        wal[i].price = r;
        i++
        await f.cs(wal);
    }*/
    await f.cs(wall);
    return wal;
}

async function balance(currency) {          //returns Array of Objects balances of an account
    try {
        let bR = await exchange.fetchBalance();
        //f.cs(bR)
        let balanceR = await bR[currency].total;
        return await balanceR;
    } catch (error) {
        console.log("EEE: ", error);
    }
}
async function bid(symbol) {                //reurns Array of Objects bid,ask
    try {
        r = await exchange.fetchOrderBook(symbol);
        return re = await r.bids[0][0];
    } catch (error) {
        if(error.name = 'BadSymbol'){
            console.log("Ni "+symbol +" marketa!!!")
        }else{
        console.log("EEE: ", error);
        }
    }
}
async function ask(symbol) {                //reurns Array of Objects bid,ask
    try {
        r2 = await exchange.fetchOrderBook(symbol);
        return await r2.asks[0][0];
    } catch (error) {
        if(error.name = 'BadSymbol'){
            console.log("Ni "+symbol +" marketa!!!")
        }else{
        console.log("EEE: ", error);
        }
    }
}
async function price(symbol) {                //reurns Array of Objects bid,ask
    try {
        r = await exchange.fetchOrderBook(symbol);
        higher = await r.asks[1][0];
        high = await r.asks[0][0];
        low = await r.bids[0][0];
        lower = await r.bids[1][0];
        //f.cs("high: "+high+" higher: "+higher);
        //f.cs("low: "+low+" lower: "+lower);

        //spread = low - lower;   //bid spread
        //price = low - (spread / 2); //bid spread

        spread = await high - low;        //real spread
        price = await high - (spread / 2);//real spread

        //spread = higher - high;   //ask spread
        //price = higher - (spread / 2); //ask spread

        //price = high    //market price
        
        return price;
    } catch (error) {
        console.log("EEE: ", error);
        return price = 0
    }
}
async function cancel(orderId, symbol) {    //cancels order with id
    try {
        r = await exchange.cancelOrder(orderId, symbol);
        //order was NOT filled
        filled = false;
        //f.sendMail("Canceled", JSON.stringify(r));
        return await filled;
    } catch (error) {
        //order was filled
        filled = true;
        console.log("EEE: ", error);
    }
}
async function sell(symbol, amount, price) {// symbol, amount, ask 
    try {
        r = await exchange.createLimitSellOrder(symbol, amount, price);
        orderId = r.id;
        //f.sendMail("sold", JSON.stringify(r));
        setTimeout(function () { cancel(orderId, symbol); }, ticker * 0.9);

        if (await filled) {
            //order was filled
            //f.sendMail("sold2", JSON.stringify(r));
            filled = true;
            orderType = "sold";
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
        console.log("EEE in sell: ", error);
    }
}
let c;
async function buy(symbol, amount, price) { // symbol, amount, bid 
    try {
        r = await exchange.createLimitBuyOrder(symbol, amount, price);
        orderId = r.id;
        setTimeout(function () { c = cancel(orderId, symbol) }, ticker * 0.9);
        //f.sendMail("bougth", JSON.stringify(r));
        if (await filled) {//order was filled
            //f.sendMail("sold2", JSON.stringify(r));
            filled = true;
            orderType = "bougth";
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
        console.log("EEE in buy: ", error);
        ret = await {
            orderId: r.id,
            orderStatus: r.status,
            orderType: "invalid order: " + error.message,
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
        console.log("EEE: ", error);
    }
}

async function filterAll(markets, qus) {
    
    r = await filter(qus, markets)

    /*
    qus = ["USDT", "BTC", "BNB", "ETH", "PAX", "USDC", "TUSD", "USDS","XRP"]
    r1 = await filter(qus[0], markets)  //USDT
    r2 = await filter(qus[1], markets)   //BTC
    r3 = await filter(qus[2], markets)  //BNB
    r4 = await filter(qus[3], markets)  //ETH
    r9 = await filter(qus[8], markets)  //XRP

    r5 = await filter(qus[4], markets)  //PAX
    r6 = await filter(qus[5], markets)  //USDC
    r7 = await filter(qus[6], markets)  //TUSD
    r8 = await filter(qus[7], markets)  //USDS

    //r = r1                      //USDT
    //let f = ["BTC/USDT"]
    r = f.concat(r2)
    //r = r1.concat(r2);        //USDT BTC
    //r = r1.concat(r2,r3);     //USDT BTC BNB
    //r = r1.concat(r2,r3,r4);  //USDT BTC BNB ETH
    //r = r1.concat(r5,r6,r7,r8);  //USDT PAX USDC TUSD USDS
*/
    return await r;
}

//symbols2 = await filter(mainQuoteCurrency, symbols);
async function filter(mainQuoteCurrency, syms) {
    let results = [];
    let quote = [];
    //f.cs("Main quote: " + mainQuoteCurrency);
    for (i = 0; i < syms.length - 1; i++) {
        quote = f.splitSymbol(syms[i], "second");
        if (quote == mainQuoteCurrency) {
            results[i] = syms[i];
        }
    }
    let results2;
    results2 = await f.cleanArray(results);
    //f.cs(results2);
    return results2;
}

//selects top riser
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

    let sortedMarks = [];
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

exports.filterAll = filterAll;
exports.filter = filter;
exports.priceAll = priceAll;
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
exports.filled = filled;
////exports.orderType = orderType;



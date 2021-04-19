/*
This file should contain all the api callbacks to module ccxt
*/

//  Reqiurements

const f = require("../js/funk.js");           //common functions
const keys = require("../json/keys.json");     //keys file location
const ccxt = require('ccxt');             //api module
const set = require("../json/set.json");

let ticker;
ticker = f.minToMs(set.tickerMinutes);

//  Init

let exchange1 = new ccxt.coinmarketcap();
//cap()
async function cap() {                //reurns Array of Objects bid,ask
    try {
        r = await exchange1.fetchTicker('BTC/USDT');
        console.log("X:::" + r)
        console.log(r)
        return r;
    } catch (error) {
        console.log("EEE: ", error.name);
        return false
    }
}


let filled;
let exchange = set.exchangeName;
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
    exchanges: ccxt.exchanges,
    exchange: exchange.name,
    url: exchange.urls.www,
    referral: exchange.urls.referral,
    feeMaker: exchange.fees.trading.maker,
    feeTaker: exchange.fees.trading.taker,
};

test()
async function test() {
    //let rel = await buy("MKR/USDT", 0.05, 300)
    //let rel = await orderInfo(3062164674, "ETH/BTC")

    //fetchTicker("BNB/EUR")
    //loadMarkets("XRP/EUR")
    //rel = await sellMarket("DOGE/EUR", 50)
    //let rel = await loadMarketMinAmount("BNB/EUR")
    //let rel = await checker(401016118, "XRP/BTC")
    console.log("DONE")
    //console.log(rel)
}

async function fetchTicker(symbol) {//high,low,close,vwap,volume,percentage
    try {
        r = await exchange.fetchTicker(symbol);
        //console.dir(r);
        return await r     //high,low,close,vwap,volume,percentage
    } catch (error) {
        console.log("EEE at fetchTicker: ", error);
    }
}
async function loadMarkets() {    //returns all available markets
    try {
        r = await exchange.loadMarkets();
        return await r
    } catch (error) {
        console.log("EEE: ", error);
    }
}
async function loadMarketMinAmount(symbol) {    //returns minimum amount of base allowed to buy
    try {
        r = await exchange.loadMarkets();
        re = await r[symbol].limits.amount.min;
        return await re
    } catch (error) {
        console.log("EEE: ", error);
    }
}
async function fetchCurrencies() {   //returns minimum amount of base allowed to buy
    try {
        r = await exchange.fetchCurrencies();
        //re = await r[symbol]//.limits.amount.min;
        //console.log(re);
        return await r
    } catch (error) {
        console.log("EEE: ", error);
    }
}
//console.log(fetchOrderBook("XRP/EUR"))
async function fetchOrderBook(symbol) {//returns Array of Objects bid,ask
    try {
        r = await exchange.fetchOrderBook(symbol);
        //console.log(r)
        re = {
            symbol: symbol,
            ask: r.asks[0][0],
            bid: r.bids[0][0],
            askV: r.asks[0][1],
            bidV: r.bids[0][1],
            spread: r.asks[0][0] - r.bids[0][0],
            price: r.asks[0][0] - ((r.asks[0][0] - r.bids[0][0]) / 2),
            time: f.getTime()
        }
        console.log(re)
        return re
    } catch (error) {
        if (error.name = 'BadSymbol') {
            console.log("Ni " + symbol + " marketa!!!")
        } else {
            console.log("EEE: ", error);
        }
    }
}
async function wallet() {   //returns JSON of balances and assets
    try {
        let curs, vals
        let balances = {};
        r = await exchange.fetchBalance();
        curs = Object.keys(r);
        vals = Object.values(r.total);
        balances = await parseBalances();
        async function parseBalances() {
            for (i = 0; i < curs.length; i++) {
                if (vals[i] > 0) {
                    balances[curs[i + 1]] = vals[i];
                }
            }
            return balances
        }
        return balances;
    } catch (error) {
        console.log("EEE: ", error);
    }

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

async function checker(orderId, symbol) {
    let count = 0
    let rsts
    async function isOpen(orderId, symbol) {
        console.log("sent checking: " + orderId + " on: " + symbol)
        let r = await orderInfo(orderId, symbol)    // 'open', 'closed', 'canceled'
        const freq = 3000
        const delaySeconds = 3
        let rounds = (ticker * 0.9) / freq
        count++
        if (r.status == "open") {
            console.log("still open")
            if (count > rounds) {
                await cancel(orderId, symbol)
            } else {
                await f.delay(delaySeconds)
                console.log("delay")
                await isOpen(orderId, symbol)
            }
        } else if (r.status == "closed") {
            rsts = r.status
            return rsts
        } else if (r.status == 'canceled') {
            rsts = r.status
            return rsts
        } else {
            console.log("checker failed")
            await f.delay(delaySeconds)
            console.log("delayed")
            await isOpen(orderId, symbol)
        }
        return rsts
    }
    return await isOpen(orderId, symbol)
}
async function buy(symbol, amount, price) { // symbol, amount, bid 
    try {
        //let r = await exchange.createOrder(symbol, 'market', 'buy', amount, price)
        let r = await exchange.createLimitBuyOrder(symbol, amount, price);
        let orderId = await r.id;
        sts = await checker(orderId, symbol)
        return {
            status: await sts,
            orderId: orderId,
            orderType: "bougth",
            price: price,// = orderInfo(orderId)
            symbol: symbol,
            side: "buy",
        }
    } catch (error) {
        console.log("EEE in buy: " + symbol, error)
        return {
            status: "failed",
            orderId: 0,
            orderType: "failed",
            price: price,
            symbol: symbol,
            side: "buy",
        }
    }
}
async function buyMarket(symbol, amountInQuote) { // symbol, amount, bid 
    try {
        let p = await fetchTicker(symbol)
        let cost = amountInQuote / p.close
        let r = await exchange.createMarketBuyOrder(symbol, cost)
        let orderId = await r.id;
        console.log("buy order")
        console.log(orderId)
        console.log("symbol")
        console.log(symbol)
        let sts = await checker(orderId, symbol)
        return {
            status: sts,
            orderId: orderId,
            orderType: "bougth",
            price: await r.price,// = orderInfo(orderId)
            symbol: symbol,
            side: "buy",
        }
    } catch (error) {
        console.log("EEE in buyMarket: " + symbol, error)
        return {
            status: "failed",
            orderId: 0,
            orderType: "failed",
            price: price,
            symbol: symbol,
            side: "buy",
        }
    }
}
async function sell(symbol, amount, price) {// symbol, amount, ask 
    try {
        r = await exchange.createLimitSellOrder(symbol, amount, price);
        let orderId = await r.info.orderId;
        console.log("sent order: " + orderId + " on: " + symbol)
        return {
            status: await checker(orderId, symbol),
            orderId: orderId,
            orderType: "sold",
            price: price,
            symbol: symbol,
            side: "sell",
        }
    } catch (error) {
        console.log("EEE in sell: ", error.name)
        return {
            status: "failed",
            orderId: 0,
            orderType: "canceled",
            price: price,
            symbol: symbol,
            side: "sell",
        }
    }
}
async function sellMarket(symbol, baseAmount) { // symbol, amount, bid 
    try {
        let r = await exchange.createMarketSellOrder(symbol, baseAmount)
        let orderId = await r.id;
        console.log("sell order")
        console.log(orderId)
        console.log("symbol")
        console.log(symbol)
        let sts = await checker(orderId, symbol)
        return {
            status: sts,
            orderId: orderId,
            orderType: "sold",
            price: await r.price,// = orderInfo(orderId)
            symbol: symbol,
            side: "buy",
        }
    } catch (error) {
        console.log("EEE in buyMarket: " + symbol, error)
        return {
            status: "failed",
            orderId: 0,
            orderType: "failed",
            price: price,
            symbol: symbol,
            side: "buy",
        }
    }
}
async function orderInfo(orderId, symbol) {  //only status returns 'open', 'closed', 'canceled'
    try {
        r = await exchange.fetchOrder(orderId, symbol)
        return r
    } catch (error) {
        if (error.name = 'OrderNotFound') {
            console.log("EEE in fetch: ", error.name);
        } else {
            console.log("sent fetch: " + orderId + " on: " + symbol)
            console.log("EEE in fetch: ", error);
        }
        return { status: "failed" }
    }
}
async function cancel(orderId, symbol) {    //cancels order with id
    try {   //order was canceled
        r = await exchange.cancelOrder(orderId, symbol);
        console.log(r)
        return r.status
    } catch (error) {   //could not cancel
        console.log("EEE in cancel: ", error);
        return "failed"
    }
}
async function loadMarkets() {                   //load all available markets on exchange
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

exports.fetchTicker = fetchTicker
exports.loadMarkets = loadMarkets
exports.loadMarketMinAmount = loadMarketMinAmount
exports.fetchCurrencies = fetchCurrencies
exports.fetchOrderBook = fetchOrderBook
exports.wallet = wallet
exports.balance = balance
exports.buy = buy
exports.buyMarket = buyMarket 
exports.sell = sell
exports.sellMarket = sellMarket
exports.orderInfo = orderInfo
exports.loadMarkets = loadMarkets
exports.exInfos = exInfos;
exports.filled = filled;



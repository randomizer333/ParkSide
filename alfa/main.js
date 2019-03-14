//requirements

let a = require("./api.js");
let f = require("./funk.js");
let TI = require("./ti.js");

// init

const tickerMinutes = 1;    //sim 1,5,10
const stopLossF = 88;
const stopLossA = 1;
const altBots = 10;
const portion = 0.99;
const minProfitP = 0.1;        //holding addition //setting
const mainQuoteCurrency = "BTC";    //dev
const enableOrders = true;
const quotes = [    //binance
    mainQuoteCurrency+"/USDT",/*
    "BNB/BTC","BNB/ETH","BNB/USDT","BNB/USDC","BNB/USDS","BNB/PAX",
    "ETH/BTC","ETH/USDT","ETH/USDC","ETH/PAX",
    "BTC/USDT","BTC/USDC","BTC/USDS","BTC/PAX",
    "PAX/USDT","PAX/TUSD", 
    "TUSD/BNB", "TUSD/BTC", "TUSD/ETH","TUSD/USDT", 
    "USDC/USDT","USDC/PAX","USDC/TUSD",
    "USDS/PAX","USDS/USDC","USDS/TUSD","USDS/USDT",*/
];


const ticker = f.minToMs(tickerMinutes);
const numOfBots = altBots + quotes.length;
const delay = (ticker / numOfBots);

let botNo = new Array();
let bestBuy = new Array();

//  main setup
let marketInfo;

let exInfo;
setup();
async function setup() {
    exInfo = await a.exInfos();
    tradingFeeP = exInfo.feeMaker;
    await f.cs(exInfo);
    markets = await a.markets();
    //await f.cs(markets);
    bestBuy = await a.bestbuy(altBots, mainQuoteCurrency);
    f.sendMail("Restart", "RUN! at " + f.getTime() + "\n" +
        JSON.stringify(bestBuy[0]) + "\n" +
        JSON.stringify(bestBuy[1]) + "\n" +
        JSON.stringify(bestBuy[2]) + "\n" +
        JSON.stringify(bestBuy[3]) + "\n" +
        JSON.stringify(bestBuy[4])
    )
    f.csL(bestBuy, altBots);
    await setBots(bestBuy);
}

// set bots
let b;
async function setBots(arr) {
    f.csL(arr, altBots);
    cleared = false;

    let a = 0;
    function count() {
        r = a * delay;
        a++;
        return r;
    }
    let x = -1;
    function cunt() {
        x++;
        return x;
    }
    let x2 = -1;
    function cunt2() {
        x2++;
        return x2;
    }
    let x3 = 0;
    function cunt3() {
        x3++;
        return x3;
    }

    for (i = 0; i < quotes.length; i++) {     //run FIAT bots
        setTimeout(function () { bot(quotes[cunt2()], ticker, "ud", stopLossF, cunt3()) }, count());
    }
    for (i = 0; i < altBots; i++) {     //run ALT bots
        setTimeout(function () { bot(arr[cunt()].market, ticker, "pingPong", stopLossA, cunt3()) }, count());
    }
    
}

// time from last restart than reset


const resetTime = 12;   //reset time in hours
let startTime;
startTime = Date.now();
let durationH = 2;   //hours, miinutes
//durationMS = durationH * 60 * 60 * 1000;// *3600000   //hours
durationMS = durationH * 60 * 1000;// *3600000          //minutes
endTime = startTime + durationMS;
let timerOnce = false;
//timerClear(startTime, durationH);
function timerClear(startTime, durationH) {     //dev
    currentTime = Date.now();

    f.cs(currentTime);
    f.cs(endTime);
    f.cs(endTime - currentTime);
    if (currentTime >= endTime && !timerOnce) {
        f.cs("TimeOut");
        clear();
        startTime = Date.now();
        timerOnce = true;
    }
    return;
}

// clear bots
let cleared = false;
function clear() {
    if (!cleared) {
        f.cs("HALT!!!");
        //clearInterval(botNo[b]);
        for (i = 0; i < altBots + quotes.length; i++) {
            f.cs("Clearing:" + i);
            clearInterval(botNo[i]);    //stopp all bots
        }
        cleared = true;
        setup();    //run again from start
    }
}


// main loop

function bot(symbol, ticker, strategy, stopLossP, botNumber) {

    let amountQuote;    //baseToQuote
    let amountBase;     //amountQuote

    let sale = false;       //selectCurrency
    let purchase = false;   //selectCurrency
    let baseBalanceInQuote; //selectCurrency
    let quoteBalanceInBase; //selectCurrency
    let more = false;       //selectCurrency

    let logAll = new Array();   //loger

    let price;      //balanceChanged
    let bougthPrice = 0;//balanceChanged

    let sellPrice;  //safeSale
    let hold;       //safeSale

    let stopLoss;   //checkStopLoss

    let c = 0;  //sim
    b = botNumber;  //clearInterval(botNo[b])

    let headers;
    let rows;
    function modul() {
        async function clTable(obj) {       //dev
            headers = Object.keys(obj);
            rows = Object.values(obj);

            for (i = 0; i < headers.length; i++) {
                hl = headers[i].length;
                rl = rows[i].length;
                if (hl > rl) {
                    rows[i] += "  ";
                } else if (hl < rl) {
                    headers[i] += "____";
                }
            }
            await f.cs(headers);
            await f.cs(rows);
            return;
        }

        function baseToQuote(amountBase, price) {
            amountQuote = amountBase * price;
            return amountQuote;
        }
        function quoteToBase(amountQuote, price) {
            amountBase = amountQuote / price;
            return amountBase;
        }
        function selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote) {        // check currency from pair that has more funds
            if ((baseBalanceInQuote > quoteBalance) && (baseBalance > minAmount)) {   //can sell
                sale = true;
                return purchase = false;
            } else if ((baseBalanceInQuote < quoteBalance) && (quoteBalanceInBase > minAmount)) {    //can buy
                sale = false;
                more = false;
                return purchase = true;
            } else {
                sale = false;
                return purchase = false;
                //f.cs("Too low!");
            }
        }
        function loger(value, length, array) {        //log FILO to array
            while (array.length >= length) {
                array.pop();
            }
            array.unshift(value);
            return array;
        }
        function balanceChanged(baseBalanceInQuote, quoteBalance, price) {
            if (bougthPrice == 0) {
                bougthPrice = price;
            }
            /*
            if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
                if (!more) {
                    bougthPrice = price;
                    more = true;
                    console.log("Bougth price updated: " + symbol);
                }
            }*/
            return bougthPrice;
        }
        function safeSale(tradingFeeP, bougthPrice, price, minProfitP) {  //returns holding status
            feeDouble = tradingFeeP * 2;
            tradingFeeAbs = f.part(feeDouble, bougthPrice);
            minProfitAbs = f.part(minProfitP, bougthPrice);
            sellPrice = bougthPrice + tradingFeeAbs + minProfitAbs;         //minProfit
            if (sellPrice > price) {      //if bougthPrice is not high enough
                safeSale = true;    	//dont allow sell force holding
            } else {
                safeSale = false;           //allow sale of holding to parked
            }
            return safeSale;
        }
        function checkStopLoss(price, stopLossP, sellPrice) {      //force sale  price, bougthPrice, lossP
            absStopLoss = f.part(stopLossP, sellPrice);
            loss = sellPrice - price;     //default: loss = sellPrice - price;
            if (loss > absStopLoss) {
                stopLoss = true;         //sell ASAP!!!
            } else {
                stopLoss = false;
            }
            return stopLoss;
        }
        function makeOrderFiat(trendMACD, trendUD, purchase, sale, stopLossP, hold, symbol, baseBalance, quoteBalance, price) { //purchase,sale,hold,stopLoss,price,symbol,baseBalance,quoteBalance
            if (purchase && !sale && (trendUD > 0) && !hold && !stopLoss) {    // buy with RSI and MACD (rsi > 0) | (macd >= 0) && (c24h >= 0)
                orderType = "bougth";
                //bougthPrice = price;    //dev
                enableOrders ? a.buy(symbol, quoteBalanceInBase * portion, price) : console.log('buy orders disabled');
            } else if (sale && !hold && !stopLoss && (trendUD < 0) && (trendMACD <= 0)) {         //sell good
                orderType = "sold";
                enableOrders ? a.sell(symbol, baseBalance, price) : console.log('sell orders disabled');
            } else if (sale && hold && stopLoss /*&& (trend2 < 0)*/) {                          //stopLoss sell bad
                orderType = "lossed";
                enableOrders ? a.sell(symbol, baseBalance, price) : console.log('loss sell orders disabled');
            } else if (sale && hold && !stopLoss) {                                  //holding fee NOT covered
                orderType = "holding";
            } else if (sale && !hold && !stopLoss) {                                 //holding fee covered
                orderType = "holding good";
            } else if (purchase) {      // ( change24h > 0 )
                orderType = "parked";
            } else {
                orderType = "still none";
            }
            return orderType;
        }
        function makeOrder(trendMACD, trendRSI, trendUD, trend24hP, purchase, sale, stopLoss, hold, symbol, baseBalance, quoteBalance, price) { //purchase,sale,hold,stopLoss,price,symbol,baseBalance,quoteBalance
            if (purchase && !sale && (trendUD > 0) && (trendMACD > 0) && (trendRSI > 0)) {    // buy with RSI and MACD (rsi > 0) | (macd >= 0) && (c24h >= 0)
                orderType = "bougth";
                //bougthPrice = price;    //dev
                enableOrders ? a.buy(symbol, quoteBalanceInBase * portion, price) : console.log('buy orders disabled');
            } else if (sale && !hold && !stopLoss && (trendUD < 0) && (trendMACD <= 0)) {         //sell good
                orderType = "sold";
                enableOrders ? a.sell(symbol, baseBalance, price) : console.log('sell orders disabled');
            } else if (sale && hold && stopLoss /*&& (trend2 < 0)*/) {//stopLoss sell bad
                orderType = "lossed";
                enableOrders ? a.sell(symbol, baseBalance, price) : console.log('loss sell orders disabled');
            } else if (sale && hold && !stopLoss) { //holding fee NOT covered
                orderType = "holding";
            } else if (sale && !hold && !stopLoss) {    //holding fee covered
                orderType = "holding good";
            } else if (purchase) {      // ( change24h > 0 )
                orderType = "parked";
            } else {
                orderType = "still none";
            }
            return orderType;
        }
        return {
            clTable: clTable,
            makeOrderFiat: makeOrderFiat,
            makeOrder: makeOrder,
            checkStopLoss: checkStopLoss,
            safeSale: safeSale,
            baseToQuote: baseToQuote,
            quoteToBase: quoteToBase,
            selectCurrency: selectCurrency,
            loger: loger,
            balanceChanged: balanceChanged,
        }
    }
    const m = modul();

    loop(symbol, strategy);
    botNo[b] = setInterval(function () { loop(symbol, strategy) }, ticker);
    async function loop(symbol, strategy) {

        minAmount = await a.minAmount(symbol);
        baseCurrency = await f.splitSymbol(symbol, "first");
        quoteCurrency = await f.splitSymbol(symbol, "second");
        baseBalance = await a.balance(baseCurrency);
        quoteBalance = await a.balance(quoteCurrency);
        change24hP = await a.change(symbol);
        wallet = await a.wallet();

        price = await a.price(symbol);
        baseBalanceInQuote = await m.baseToQuote(baseBalance, price);
        quoteBalanceInBase = await m.quoteToBase(quoteBalance, price);
        bougthPrice = await m.balanceChanged(baseBalanceInQuote, quoteBalance, price);
        purchase = await m.selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);

        hold = await m.safeSale(tradingFeeP, bougthPrice, price, minProfitP);
        stopLoss = await m.checkStopLoss(price, stopLossP, sellPrice);

        logAll = await m.loger(price, 100, logAll);
        trendUD = await TI.upDown(logAll);
        trendRSI = await TI.rsi(logAll);
        trendMACD = await TI.macd(logAll);

        if (strategy == "ud") {
            m.makeOrderFiat(trendMACD, trendUD, purchase, sale, stopLoss, hold, symbol, baseBalance, quoteBalance, price);
        } else if (strategy == "pingPong") {
            m.makeOrder(trendMACD, trendRSI, trendUD, change24hP, purchase, sale, stopLoss, hold, symbol, baseBalance, quoteBalance, price);
        }


        //await sim();
        function sim() {    //sim
            c++;
            //f.cs("C:" + c);
            if (c >= 5) {
                f.cs("Stoppping!!!" + b);
                clear();
                //clearInterval(botNo[b]);
            }
        }

        let relativeProfit = await f.percent(price - sellPrice, sellPrice);
        let absoluteProfit = await f.part(relativeProfit, baseBalanceInQuote);

        marketInfo = {
            No: b,
            time: f.getTime(),
            symbol: symbol,
            baseCurrency: baseCurrency,
            quoteCurrency: quoteCurrency,
            baseBalance: baseBalance + " " + baseCurrency,
            quoteBalance: quoteBalance + " " + quoteCurrency,
            price: price.toFixed(8) + " " + symbol,
            change24hP: change24hP + " %",
            baseBalanceInQuote: baseBalanceInQuote.toFixed(8) + " " + quoteCurrency,
            quoteBalanceInBase: quoteBalanceInBase.toFixed(8) + " " + baseCurrency,
            bougthPrice: bougthPrice.toFixed(8) + " " + symbol,
            sellPrice: sellPrice.toFixed(8) + " " + symbol,
            relativeProfit: (relativeProfit + minProfitP).toFixed(3) + " %",
            absoluteProfit: absoluteProfit.toFixed(8) + " " + quoteCurrency,
            sale: sale, //f.boolToInitial(sale),
            purchase: purchase, //f.boolToInitial(purchase),
            more: more, //f.boolToInitial(more),
            hold: hold, //f.boolToInitial(hold),
            stopLoss: stopLoss, //f.boolToInitial(stopLoss),
            stopLossP: stopLossP + " %",
            minAmount: minAmount + " " + baseCurrency,
            logLength: logAll.length,
            trendUD: trendUD,
            trendRSI: trendRSI,
            trendMACD: trendMACD,
            orderType: orderType,
            quoteMarkets: JSON.stringify(quotes),
            wallet: JSON.stringify(wallet),
            bestBuy: JSON.stringify(bestBuy),
        }
        await console.dir(marketInfo);
        if (marketInfo.orderType == "sold") {
            f.sendMail("Sold Info", JSON.stringify(marketInfo));
        }
        return marketInfo;
    }
}

//constants and variables
exports.ticker = ticker;
exports.enableOrders = enableOrders;
exports.marketInfo = marketInfo;
exports.cleared = cleared;

//functions
exports.clear = clear;
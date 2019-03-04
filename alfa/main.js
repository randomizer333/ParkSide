//requirements

let a = require("./api.js");
let f = require("./funk.js");
let TI = require("./ti.js");

// init


const tickerMinutes = 5;
const ticker = f.minToMs(tickerMinutes);
const stopLossF = 88;
const stopLossA = 1;
const altBots = 8;
const portion = 0.99;
const quotes = ["BTC/USDT", "BNB/USDT", "ETH/USDT", "BNB/BTC", "ETH/BTC", "BNB/ETH"];
const enableOrders = true;

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
    f.cs(exInfo);
    f.sendMail("Restart", "RUN! at " + f.getTime())
    bestBuy = await a.bestbuy();
    //f.csL(bestBuy, 10);
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

    //old set
    /*
    setTimeout(function () { bot(quotes[0], ticker, "ud", stopLossF, 1) }, count());
    setTimeout(function () { bot(quotes[1], ticker, "ud", stopLossF, 2) }, count());
    setTimeout(function () { bot(quotes[2], ticker, "ud", stopLossF, 3) }, count());
    setTimeout(function () { bot(quotes[3], ticker, "ud", stopLossF, 4) }, count());
    setTimeout(function () { bot(quotes[4], ticker, "ud", stopLossF, 5) }, count());
    setTimeout(function () { bot(quotes[5], ticker, "ud", stopLossF, 6) }, count());

    setTimeout(function () { bot(arr[0].market, ticker, "pingPong", stopLossP, 7) }, count());
    setTimeout(function () { bot(arr[1].market, ticker, "pingPong", stopLossP, 8) }, count());
    setTimeout(function () { bot(arr[2].market, ticker, "pingPong", stopLossP, 9) }, count());
    setTimeout(function () { bot(arr[3].market, ticker, "pingPong", stopLossP, 10) }, count());
    setTimeout(function () { bot(arr[4].market, ticker, "pingPong", stopLossP, 11) }, count());
*/

    for (i = 0; i < quotes.length; i++) {     //run FIAT bots
        setTimeout(function () { bot(quotes[cunt2()], ticker, "ud", stopLossF, cunt3()) }, count());
    }
    for (i = 0; i < altBots; i++) {     //run ALT bots
        setTimeout(function () { bot(arr[cunt()].market, ticker, "pingPong", stopLossA, cunt3()) }, count());
    }
}


// clear bots
let cleared = false;
function clear() {
    if (!cleared) {
        f.cs("HALT!!!");
        clearInterval(botNo[b]);
        for (i = 0; i < altBots + quotes.length; i++) {
            f.cs("Clearing:" + i);
            clearInterval(botNo[i]);
        }
        cleared = true;
        setup();
    }
}


// main loop

function bot(symbol, ticker, strategy, stopLossP, botNumber) {

    //let strategy;

    let minProfitP = 0.1;        //holding addition //setting

    let amountQuote;    //baseToQuote
    let amountBase;     //amountQuote

    let sale = false;       //selectCurrency
    let purchase = false;   //selectCurrency
    let baseBalanceInQuote; //selectCurrency
    let quoteBalanceInBase; //selectCurrency
    let more = false;       //selectCurrency

    let logUD = new Array();    //loger
    let logMACD = new Array();  //loger
    let logRSI = new Array();   //loger

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
        async function clTable(obj) {
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
            if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
                if (!more) {
                    bougthPrice = price;
                    more = true;
                    console.log("Bougth price updated: " + symbol);
                }
            }
            return bougthPrice;
        }
        function safeSale(tradingFeeP, bougthPrice, price) {  //returns holding status
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
            if (purchase && (trendUD > 0)) {    // buy with RSI and MACD (rsi > 0) | (macd >= 0) && (c24h >= 0)
                orderType = "bougth";
                bougthPrice = price;    //dev
                enableOrders ? a.buy(symbol, quoteBalanceInBase * portion, price) : console.log('buy orders disabled');
            } else if (sale && !hold && !stopLoss && (trendUD < 0) && (trendMACD <= 0)) {         //sell good
                orderType = "sold";
                enableOrders ? a.sell(symbol, baseBalance * portion, price) : console.log('sell orders disabled');
            } else if (sale && hold && stopLoss /*&& (trend2 < 0)*/) {                          //stopLoss sell bad
                orderType = "lossed";
                enableOrders ? a.sell(symbol, baseBalance * portion, price) : console.log('loss sell orders disabled');
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
            if (purchase && (trendUD > 0) && (trendMACD > 0) && (trendRSI > 0)) {    // buy with RSI and MACD (rsi > 0) | (macd >= 0) && (c24h >= 0)
                orderType = "bougth";
                bougthPrice = price;    //dev
                enableOrders ? a.buy(symbol, quoteBalanceInBase * portion, price) : console.log('buy orders disabled');
            } else if (sale && !hold && !stopLoss && (trendUD < 0) && (trendMACD <= 0)) {         //sell good
                orderType = "sold";
                enableOrders ? a.sell(symbol, baseBalance * portion, price) : console.log('sell orders disabled');
            } else if (sale && hold && stopLoss /*&& (trend2 < 0)*/) {                          //stopLoss sell bad
                orderType = "lossed";
                enableOrders ? a.sell(symbol, baseBalance * portion, price) : console.log('loss sell orders disabled');
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

    //test();
    async function test() {
        try {
            await loop(symbol, strategy);
            botNo[b] = setInterval(function () { loop(symbol, strategy) }, ticker);
        } catch (error) {
            console.log('caught', error.message);
        }
    }

    loop(symbol, strategy);
    botNo[b] = setInterval(function () { loop(symbol, strategy) }, ticker);
    async function loop(symbol, strategy) {
        minAmount = await a.minAmount(symbol);
        baseCurrency = await f.splitSymbol(symbol, "first");
        quoteCurrency = await f.splitSymbol(symbol, "second");
        baseBalance = await a.balance(baseCurrency);
        quoteBalance = await a.balance(quoteCurrency);
        change24hP = await a.change(symbol);

        price = await a.price(symbol);
        baseBalanceInQuote = await m.baseToQuote(baseBalance, price);
        quoteBalanceInBase = await m.quoteToBase(quoteBalance, price);
        bougthPrice = await m.balanceChanged(baseBalanceInQuote, quoteBalance, price);
        purchase = await m.selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);

        hold = await m.safeSale(tradingFeeP, bougthPrice, price);
        stopLoss = await m.checkStopLoss(price, stopLossP, sellPrice);

        logUD = await m.loger(price, 5, logUD);
        trendUD = await TI.upDown(price, logUD);
        logRSI = await m.loger(price, 15, logRSI);
        trendRSI = await TI.rsi(logRSI);
        logMACD = await m.loger(price, 77, logMACD);
        trendMACD = await TI.macd(logMACD);

        //orderType = runStrategy(strategy);
        function runStrategy(strategy) {
            switch (strategy) {
                case "ud":
                    m.makeOrderFiat(trendMACD, trendUD, purchase, sale, stopLoss, hold, symbol, baseBalance, quoteBalance, price);
                    break;
                case "pingPong":
                    m.makeOrder(trendMACD, trendRSI, trendUD, change24hP, purchase, sale, stopLoss, hold, symbol, baseBalance, quoteBalance, price);
                    break;
            }
        }

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

        marketInfo = {
            No: b + " ",
            ________time_______: f.getTime(),
            baseCurrency: "    " + baseCurrency + "     ",
            quoteCurrency: "   " + quoteCurrency + "    ",
            baseBalance: baseBalance,
            quoteBalance: quoteBalance,
            price: price.toFixed(8),
            change24hP: change24hP,
            baseBalanceInQuote: baseBalanceInQuote.toFixed(8),
            quoteBalanceInBase: quoteBalanceInBase.toFixed(8),
            bougthPrice: bougthPrice.toFixed(8),
            sellPrice: sellPrice.toFixed(8),
            sale: f.boolToInitial(sale),
            purchase: f.boolToInitial(purchase),
            more: f.boolToInitial(more),
            hold: f.boolToInitial(hold),
            stopLoss: f.boolToInitial(stopLoss),
            stopLossP: stopLossP,
            minAmount: minAmount,
            trendUD: trendUD,
            trendRSI: trendRSI,
            trendMACD: trendMACD,
            orderType: orderType,
        }
        await m.clTable(marketInfo);
        //await f.cs(marketInfo);
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
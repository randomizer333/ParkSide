//requirements

let a = require("./api.js");
let f = require("./funk.js");
let TI = require("./ti.js");

// init

const tickerMinutes = 3;    //1,5,10,60
const stopLossF = 99;   //stoploss for fiat and quote markets
const portion = 0.99;   //part of balance to spend
const minProfitP = 0.1;        //holding addition //setting
const enableOrders = true;  //sim true

const quotes = [
    "ADA/USDT", "BCH/USDT", "BNB/USDT", "BSV/USDT", "BTC/USDT", "DASH/USDT", "EOS/USDT", "ETC/USDT", "ETH/USDT", "IOTA/USDT", "LTC/USDT", "NEO/USDT", "TRX/USDT", "XLM/USDT", "XMR/USDT", "XRP/USDT",/*

    "ADA/BTC", "BCH/BTC", "BNB/BTC", "BSV/BTC", "DASH/BTC", "EOS/BTC", "ETC/BTC", "ETH/BTC", "IOTA/BTC", "LTC/BTC", "NEO/BTC", "TRX/BTC", "XLM/BTC", "XMR/BTC", "XRP/BTC",

    "ADA/ETH", "BNB/ETH", "DASH/ETH", "EOS/ETH", "ETC/ETH", "IOTA/ETH", "LTC/ETH", "NEO/ETH", "TRX/ETH", "XLM/ETH", "XMR/ETH", "XRP/ETH",

    "ADA/BNB", "DASH/BNB", "EOS/BNB", "ETC/BNB", "IOTA/BNB", "LTC/BNB", "NEO/BNB", "TRX/BNB", "XLM/BNB", "XMR/BNB", "XRP/BNB"*/
]

const ticker = f.minToMs(tickerMinutes);
const numOfBots = quotes.length;
const delay = (ticker / numOfBots);

let botNo = new Array();
let bestBuy = new Array();

//  main setup
let marketInfo;
let exInfo;
let wallet;
setup();
async function setup() {
    exInfo = a.exInfos;
    tradingFeeP = exInfo.feeMaker * 100;
    f.cs(exInfo);
    markets = await a.markets();
    //await f.cs(markets);
    wallet = await a.wallet();
    f.sendMail("Restart", "RUN! at " + f.getTime() + "\n")
    await setBots(quotes);
}

// set bots
async function setBots(quotes) {
    cleared = false;

    let a = 0;
    function setStartTime() {
        r = a * delay;
        a++;
        return r;
    }

    for (const cur in quotes) {
        await setTimeout(function () { bot(quotes[cur], ticker, "ud", stopLossF, cur) }, setStartTime());
        //f.cs("Number:"+cur)
    }
}

// main loop

async function bot(symbol, ticker, strategy, stopLossP, botNumber) {

    let amountQuote;    //baseToQuote
    let amountBase;     //amountQuote

    let sale = false;       //selectCurrency
    let purchase = false;   //selectCurrency
    let baseCurrency;       //selectCurrency
    let quoteCurrency;      //selectCurrency
    let baseBalanceInQuote; //selectCurrency
    let quoteBalanceInBase; //selectCurrency
    let more = false;       //selectCurrency

    let logAll = new Array();   //loger
    let log24hP = new Array();   //loger
    let logVol = new Array();   //loger
    let logMacdTrend = new Array(); //loger
    let logUD = new Array();    //loger

    let price;      //balanceChanged
    let bougthPrice = 0;//balanceChanged

    let sellPrice;  //safeSale
    let hold;       //safeSale

    let stopLoss;   //checkStopLoss

    let c = 0;  //sim
    //b = botNumber;  //clearInterval(botNo[b])

    let headers;
    let rows;
    function modul() {
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

        let tradingFeeAbs;
        function safeSale(tradingFeeP, bougthPrice, price, minProfitP) {  //returns holding status
            feeDouble = tradingFeeP * 2;
            //f.cs("FeeDouble:" + feeDouble);
            tradingFeeAbs = f.part(feeDouble, bougthPrice);
            //f.cs("tradingFeeAbs:" + tradingFeeAbs);
            minProfitAbs = f.part(minProfitP, bougthPrice);
            //f.cs("minProfitAbs:" + minProfitAbs);
            sellPrice = bougthPrice + tradingFeeAbs + minProfitAbs;         //minProfit
            //f.cs("sellPrice:" + sellPrice);
            if (sellPrice > price) {      //if bougthPrice is not high enough
                hold = true;    	//dont allow sell force holding
            } else {
                hold = false;           //allow sale of holding to parked
            }
            return hold;
        }
        function checkStopLoss(price, stopLossP, sellPrice) {      //force sale  price, bougthPrice, lossP
            absStopLoss = f.part(stopLossP, sellPrice);
            lossPrice = sellPrice - absStopLoss;
            loss = sellPrice - price;     //default: loss = sellPrice - price;
            relativeLoss = f.percent(loss, sellPrice);
            f.cs("absStopLoss: " + absStopLoss);
            f.cs("relativeLoss: " + relativeLoss.toFixed(2) + " %");
            f.cs("loss: " + loss);
            f.cs("lossPrice: " + lossPrice);
            if (loss > absStopLoss) {
                stopLoss = true;         //sell ASAP!!!
            } else {
                stopLoss = false;
            }
            return stopLoss;
        }

        return {
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
    botNo[botNumber] = setInterval(function () { loop(symbol, strategy) }, ticker);
    async function loop(symbol, strategy) {

        minAmount = await a.minAmount(symbol);
        baseCurrency = await f.splitSymbol(symbol, "first");
        quoteCurrency = await f.splitSymbol(symbol, "second");
        baseBalance = await a.balance(baseCurrency);
        quoteBalance = await a.balance(quoteCurrency);
        price = await a.price(symbol);
        wallet = await a.wallet();
        change24hP = await a.change(symbol);
        volume = await a.volume(symbol);

        baseBalanceInQuote = await m.baseToQuote(baseBalance, price);
        quoteBalanceInBase = await m.quoteToBase(quoteBalance, price);
        bougthPrice = await m.balanceChanged(baseBalanceInQuote, quoteBalance, price);
        purchase = await m.selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);

        //sellPrice;  //safeSale() returns
        hold = await m.safeSale(tradingFeeP, bougthPrice, price, minProfitP);
        stopLoss = await m.checkStopLoss(price, stopLossP, sellPrice);

        logAll = await m.loger(price, 40, logAll);
        log24hP = await m.loger(change24hP, 3, log24hP);
        logVol = await m.loger(volume, 3, logVol);
        logUD = await m.loger(price, 3, logUD);

        trendUD = await TI.upDown(logUD);
        trendRSI = await TI.rsi(logAll);
        trendMACD = await TI.macd(logAll);
        trend24h = await TI.upDown(log24hP);
        trendVol = await TI.upDown(logVol);

        logMacdTrend = await m.loger(trendMACD, 2, logMacdTrend);
        trendMacdTrend = await TI.upDown(logMacdTrend);

        let orderType = false;

        if (strategy == "ud") {

            orderType = makeOrderFiat(trendMACD, trendUD, trendRSI, trend24h, change24hP, trendVol, purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders);

            function makeOrderFiat(trendMACD, trendUD, trendRSI, trend24h, change24hP, trendVol, purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders) { //purchase,sale,hold,stopLoss,price,symbol,baseBalance,quoteBalance
                if (purchase && !sale &&
                    (trendUD > 0) &&
                    (trendMACD >= 0) &&
                    (trendRSI >= 0) &&
                    (trend24h > 0) &&
                    (change24hP > 0) &&
                    (trendVol > 0)
                ) {    // buy 
                    //orderType = "bougth";
                    //bougthPrice = price;            //dev
                    enableOrders ? ret = a.buy(symbol, quoteBalanceInBase * portion, price) : console.log('buy orders disabled');
                    orderType = ret.orderType;
                    bougthPrice = ret.bougthPrice;
                } else if (sale && !hold && !stopLoss && (trendUD < 0)) {   //sell good
                    //orderType = "sold";
                    enableOrders ? ret = a.sell(symbol, baseBalance, price) : console.log('sell orders disabled');
                    orderType = ret.orderType;
                } else if (sale && hold && stopLoss) { //stopLoss sell bad
                    //orderType = "lossed";
                    enableOrders ? ret = a.sell(symbol, baseBalance, price) : console.log('loss sell orders disabled');
                    orderType = ret.orderType;
                } else if (sale && hold && !stopLoss) { //holding fee NOT covered
                    orderType = "holding";
                } else if (sale && !hold && !stopLoss) {//holding fee covered
                    orderType = "holding good";
                } else if (purchase) {      // ( change24h > 0 )
                    orderType = "parked";
                } else {
                    orderType = "still none";
                }
                return orderType;
            }
        } else if (strategy == "pingPong") {}


        let relativeProfit = await f.percent(price - sellPrice, sellPrice);
        let absoluteProfit = await f.part(relativeProfit, baseBalanceInQuote);

        //main console output
        marketInfo = {
            No: botNumber,
            time: f.getTime(),
            ticker: tickerMinutes + " min",
            stopLossP: stopLossP + " %",
            symbol: symbol,
            //baseCurrency: baseCurrency,
            //quoteCurrency: quoteCurrency,
            minAmount: minAmount + " " + baseCurrency,
            baseBalance: baseBalance + " " + baseCurrency,
            quoteBalance: quoteBalance + " " + quoteCurrency,
            baseBalanceInQuote: baseBalanceInQuote.toFixed(8) + " " + quoteCurrency,
            quoteBalanceInBase: quoteBalanceInBase.toFixed(8) + " " + baseCurrency,
            bougthPrice: bougthPrice.toFixed(8) + " " + symbol,
            sellPrice: sellPrice.toFixed(8) + " " + symbol,
            relativeProfit: (relativeProfit + minProfitP).toFixed(3) + " %",
            absoluteProfit: absoluteProfit.toFixed(8) + " " + quoteCurrency,
            price: price.toFixed(8) + " " + symbol,
            //bougthPriceFiat: bougthPriceFiat.toFixed(8) + " " + quotes[0],
            //more: more,
            sellConditions: {
                sale: sale,
                hold: hold,
                stopLoss: stopLoss,
            },
            purchase: purchase,
            logLength: logAll.length,
            buyIndicators: {
                UD: trendUD,
                RSI: trendRSI,
                MACD: trendMACD,
                trendVol: trendVol,
                trend24h: trend24h,
                change24hP: change24hP + " %",
                trendMacdTrend: trendMacdTrend
            },
            orderType: orderType,
            quoteMarkets: JSON.stringify(quotes),
            wallet: JSON.stringify(wallet),
            bestBuy: JSON.stringify(bestBuy),
        }

        //mailer
        if (await orderType == "sold") {
            f.sendMail("Sold Info", JSON.stringify(marketInfo));
        } else if (await orderType == "bougth") {
            f.sendMail("Bougth Info", JSON.stringify(marketInfo));
        } else if (await orderType == "lossed") {
            f.sendMail("Lossed Info", JSON.stringify(marketInfo));
        }

        /*
        if (marketInfo.orderType == "sold") {
            f.sendMail("Sold Info", JSON.stringify(marketInfo));
        }
        */

        await console.dir(marketInfo);
        return await marketInfo;
    }
    return await marketInfo;
}

//constants and variables
exports.ticker = ticker;
exports.enableOrders = enableOrders;
exports.marketInfo = marketInfo;
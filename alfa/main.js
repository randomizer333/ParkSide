/* 
1.crypto to fiat bot
2.intracrypto trading bot
3.highriser catcher bot
*/

// init

const tickerMinutes = 3;    //1,5,10,60
const stopLossP = 2;   //stoploss for fiat and quote markets, 99% for hodlers, 1% for gamblers
const portion = 0.99;   //part of balance to spend
const minProfitP = 0.1; //holding addition
const enableOrders = true;  //sim

const startValue = 50;//value of assets on start in USDT


const quotes = [    //trading portofio
    "ADA/USDT", "BCH/USDT", "BNB/USDT", /*"BTC/USDT", "DASH/USDT", "EOS/USDT", "ETC/USDT", "ETH/USDT", "IOTA/USDT", "LTC/USDT", "NEO/USDT", "TRX/USDT", "XLM/USDT", "XMR/USDT", "XRP/USDT",/*

    "ADA/BTC", "BCH/BTC", "BNB/BTC", "DASH/BTC", "EOS/BTC", "ETC/BTC", "ETH/BTC", "IOTA/BTC", "LTC/BTC", "NEO/BTC", "TRX/BTC", "XLM/BTC", "XMR/BTC", "XRP/BTC",

    "ADA/ETH", "BNB/ETH", "DASH/ETH", "EOS/ETH", "ETC/ETH", "IOTA/ETH", "LTC/ETH", "NEO/ETH", "TRX/ETH", "XLM/ETH", "XMR/ETH", "XRP/ETH",

    "ADA/BNB", "DASH/BNB", "EOS/BNB", "ETC/BNB", "IOTA/BNB", "LTC/BNB", "NEO/BNB", "TRX/BNB", "XLM/BNB", "XMR/BNB", "XRP/BNB"*/
]

//requirements

let a = require("./api.js");
let f = require("./funk.js");
let TI = require("./ti.js");


const ticker = f.minToMs(tickerMinutes);
const numOfBots = quotes.length;
const delay = (ticker / numOfBots);

let botNo = [];
let bestBuy = [];

//  main setup
let exInfo;
let wallet;
setup();
async function setup() {    //runs once at the begining of the program
    exInfo = a.exInfos;
    tradingFeeP = exInfo.feeMaker * 100;
    f.cs(exInfo);
    markets = await a.markets();
    await f.cs(markets);
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
        await setTimeout(function () {bot(quotes[cur], ticker, "ud", stopLossP, cur) }, setStartTime());
        /*runner()
        async function runner() {   //for websocket
            r = await bot(quotes[cur], ticker, "ud", stopLossP, cur)
            if (await r) {
                runner()
            }
        }*/
    }


}

// stop bots

function clear() {
    for (const cur in quotes) {
        clearInterval(quotes[cur]);
        //f.cs("Number:"+cur)
    }
}

// main loop

async function bot(symbol, ticker, strategy, stopLossP, botNumber) {

    let orderType = false;  //loop output
    let marketInfo;         //loop output

    let amountQuote;    //baseToQuote
    let amountBase;     //amountQuote

    //selectCurrency
    let sale = false;
    let purchase = false;
    let baseCurrency;
    let quoteCurrency;
    let baseBalanceInQuote;
    let quoteBalanceInBase;
    let more = false;

    //loger init
    let logAll = [],
        log24hP = [],
        logVol = [],
        logMacd = [],
        logMA3 = [],
        logMA200 = [],
        logVolMACD = [],
        logMA200second = [];

    let price;      //balanceChanged
    let bougthPrice = 0;//balanceChanged

    let sellPrice;  //safeSale
    let hold;       //safeSale

    let stopLoss;   //checkStopLoss


    function modul() {
        async function baseToQuote(amountBase, price) {
            amountQuote = amountBase * price;
            return await amountQuote;
        }
        async function quoteToBase(amountQuote, price) {
            amountBase = amountQuote / price;
            return await amountBase;
        }
        async function selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote) {        // check currency from pair that has more funds
            if ((baseBalanceInQuote > quoteBalance) && (baseBalance > minAmount)) {   //can sell
                sale = true;
                purchase = false;
            } else if ((baseBalanceInQuote < quoteBalance) && (quoteBalanceInBase > minAmount)) {    //can buy
                sale = false;
                more = false;
                purchase = true;
            } else {
                sale = false;
                purchase = false;
                //f.cs("Too low!");
            }
            return await purchase;
        }
        async function loger(value, length, array) {        //log FILO to array
            while (array.length >= length) {
                array.pop();
            }
            array.unshift(value);
            return await array;
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
        async function safeSale(tradingFeeP, bougthPrice, price, minProfitP) {  //returns holding status
            feeDouble = tradingFeeP * 2;
            //f.cs("FeeDouble:" + feeDouble);
            tradingFeeAbs = await f.part(feeDouble, bougthPrice);
            //f.cs("tradingFeeAbs:" + tradingFeeAbs);
            minProfitAbs = await f.part(minProfitP, bougthPrice);
            //f.cs("minProfitAbs:" + minProfitAbs);
            sellPrice = await bougthPrice + tradingFeeAbs + minProfitAbs;         //minProfit
            //f.cs("sellPrice:" + sellPrice);
            if (sellPrice > price) {      //if bougthPrice is not high enough
                r = true;    	//dont allow sell force holding
            } else {
                r = false;           //allow sale of holding to parked
            }
            return await r;
        }
        async function checkStopLoss(price, stopLossP, sellPrice) {      //force sale  price, bougthPrice, lossP
            absStopLoss = f.part(stopLossP, sellPrice);
            lossPrice = sellPrice - absStopLoss;
            loss = sellPrice - price;     //default: loss = sellPrice - price;
            relativeLoss = f.percent(loss, sellPrice);
            /*f.cs("loss       : " + loss);
            f.cs(" > is biger than");
            f.cs("absStopLoss: " + absStopLoss);
            f.cs("relativeLoss: " + relativeLoss.toFixed(2) + " %");
            f.cs("lossPrice: " + lossPrice);*/
            if (loss > absStopLoss) {
                return true;         //sell ASAP!!!
            } else {
                return false;             //hodl
            }
        }

        function mainMarketCap(fiatPrice, fiatVol) {
            let BTCsupply = 17696250;
            let marketCap = fiatPrice * BTCsupply;        //BTC supply 17,696,250 BTC

            return MCapMA;
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
        //wallet = await a.wallet();
        change24hP = await a.change(symbol);
        volume = await a.volume(symbol);

        baseBalanceInQuote = await m.baseToQuote(baseBalance, price);
        quoteBalanceInBase = await m.quoteToBase(quoteBalance, price);
        bougthPrice = await m.balanceChanged(baseBalanceInQuote, quoteBalance, price);
        purchase = await m.selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);

        //sellPrice;  //safeSale() returns
        hold = await m.safeSale(tradingFeeP, bougthPrice, price, minProfitP);
        stopLoss = await m.checkStopLoss(price, stopLossP, sellPrice);

        let indicator = await indicators(price, volume, change24hP)
        async function indicators(price, volume, change24hP) {
            //market data colection
            logAll = await m.loger(price, 105, logAll);
            log24hP = await m.loger(change24hP, 3, log24hP);
            logVol = await m.loger(volume, 5, logVol);
            logMA3 = await m.loger(price, 3, logMA3);
            logMA200 = await m.loger(price, 200, logMA200);


            //technical analysis
            MA = await TI.ma(logMA3);   //MA of last 3 prices

            MA200 = await TI.ma(logMA200);  //MA of last 200 prices

            RSI = await TI.rsi(logAll); //RSI (30,70)

            MACD = await TI.macd(logAll);   //standard MACD
            logMacd = await m.loger(MACD, 3, logMacd);
            MACDMA = await TI.ma(logMacd);  //MA of MACD

            DMACD = await TI.doubleMacd(logAll);    //double length of input MACD
            QMACD = await TI.quadMacd(logAll);      //quadruple MACD

            MA24hP = await TI.ma(log24hP);  //MA3 of 24h price change

            MAVol = await TI.ma(logVol);    //MA of last 5 Volumes
            logVolMACD = await m.loger(volume, 40, logVolMACD);
            MACDVol = await TI.macd(logVolMACD);    //MACD of MA5

            return await {
                MA: MA,
                MA200: MA200,
                MACD: MACD,
                MAVol: MAVol,
                change24hP: change24hP,
                DMACD: DMACD,
                RSI: RSI,
                QMACD: QMACD,
                MA24hP: MA24hP,
                MACDMA: MACDMA,
                MACDVol: MACDVol,
            }
        }
        //await f.cs(indicator);

        let upSignal = await up(indicator);
        function up(indicator) {
            if (        //up signal
                (indicator.MA > 0) &&
                (indicator.MA200 > 0) &&
                (indicator.MACD >= 0) &&
                (indicator.MAVol > 0)
            ) {
                return 1;
            } else {    //no signal
                return 0;
            }
        }

        let downSignal = await down(indicator);
        function down(indicator) {
            if (        //down signal
                (indicator.MA < 0) &&
                (indicator.MA200 < 0)
            ) {
                return 1;
            } else {    //no signal
                return 0;
            }
        }


        // make strategic decision about order type
        orderType = await makeOrder(purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders);
        async function makeOrder(purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders) { //trendMacdTrend, MAVol
            if (purchase && !sale && upSignal) {    // buy 
                enableOrders ? ret = await a.buy(symbol, quoteBalanceInBase * portion, price) : console.log('buy orders disabled');
                enableOrders ? bougthPrice = ret.bougthPrice : bougthPrice = price;
                orderType = ret.orderType;
            } else if (sale && !hold && !stopLoss && downSignal) {    //sell good
                enableOrders ? ret = await a.sell(symbol, baseBalance, price) : console.log('sell orders disabled');
                orderType = ret.orderType;
            } else if (sale && hold && stopLoss && downSignal) {    //stopLoss sell bad
                enableOrders ? ret = await a.sell(symbol, baseBalance, price) : console.log('loss sell orders disabled');
                orderType = "lossed";
            } else if (sale && hold && !stopLoss) { //holding fee NOT covered
                orderType = "holding";
            } else if (sale && !hold && !stopLoss) {//holding fee covered
                orderType = "holding good";
            } else if (purchase) {
                orderType = "parked";
            } else {
                orderType = "still none";
            }
            mailInfo(orderType);
            return orderType;
        }


        // dinamic stoploss
        function dinamicStopLoss(startValue) {
            aProfit = f.part(relativeProfit, startValue);
            return profit;//stopLoss
        }


        let relativeProfit = await f.percent(price - sellPrice, sellPrice);
        let absoluteProfit = await f.part(relativeProfit, quoteBalance);
        let absoluteProfit2 = await f.part(relativeProfit, baseBalanceInQuote);

        //main console output
        marketInfo = await {
            No:botNumber,
            relativeProfit: (relativeProfit + minProfitP).toFixed(3) + " %",
            absoluteProfit: absoluteProfit.toFixed(8) + " " + quoteCurrency,
            absoluteProfit2: absoluteProfit2.toFixed(8) + " " + quoteCurrency,
            minAmount__: minAmount + " " + baseCurrency,
            baseBalance: baseBalance + " " + baseCurrency,
            baseBalanceInQuote: baseBalanceInQuote.toFixed(8) + " " + quoteCurrency,
            quoteBalance: quoteBalance + " " + quoteCurrency,
            quoteBalanceInBase: quoteBalanceInBase.toFixed(8) + " " + baseCurrency,
            time: f.getTime(),
            ticker: tickerMinutes + " min",
            stopLossP: stopLossP + " %",
            symbol: symbol,
            bougthPrice: bougthPrice.toFixed(8) + " " + symbol,
            sellPrice: sellPrice.toFixed(8) + " " + symbol,
            price: price.toFixed(8) + " " + symbol,
            purchase: purchase,
            upSignal: upSignal,
            downSignal: downSignal,
            sellConditions: {
                sale: sale,
                hold: hold,
                stopLoss: stopLoss,
            },
            logLength: logMA200.length,
            indicator: indicator,
            orderType: orderType,
            quoteMarkets: JSON.stringify(quotes),
            wallet: JSON.stringify(wallet),
            //bestBuy: JSON.stringify(bestBuy),
        }
        //mailer
        function mailInfo(orderType) {
            if (orderType == "sold") {
                f.sendMail("Sold Info", JSON.stringify(marketInfo));
                return true;
            } else if (orderType == "bougth") {
                f.sendMail("Bougth Info", JSON.stringify(marketInfo));
                return true;
            } else if (orderType == "lossed") {
                f.sendMail("Lossed Info", JSON.stringify(marketInfo));
                return true;
            } else if (orderType == "canceled") {
                f.sendMail("Canceled Info", JSON.stringify(marketInfo));
                return true;
            } else {
                return false;
            }
        }

        await console.dir(marketInfo);
        return await marketInfo;
    }
    return await marketInfo;
}

//constants and variables
exports.ticker = ticker;
exports.enableOrders = enableOrders;
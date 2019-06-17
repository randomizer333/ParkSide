/* 
1.crypto to fiat bot
2.highrangr catcher bot
3.intracrypto trading bot
*/

//requirements
let s, a, f, TI, fs
req();
async function req() {
    s = await require("../set.json")
    a = await require("./api.js");
    f = await require("./funk.js");
    TI = await require("./ti.js");
    fs = require('fs'); //node.js native
    firstLogToFile()
    return await init()
}

// init
let tickerMinutes,
    stopLossP,
    portion,
    minProfitP,
    enableOrders,
    ticker
async function init() {
    tickerMinutes = await s.tickerMinutes;    //1,3,5, for all 10,60,120
    stopLossP = await s.stopLossP//2;   //stoploss for fiat and quote markets, 99% for hodlers, 1% for gamblers
    portion = await s.portion//0.99;   //part of balance to spend
    minProfitP = await 0.1; //holding addition
    enableOrders = await s.enableOrders//true;  //sim
    ticker = await f.minToMs(tickerMinutes);
    return await setup();
}

let quotes = [    //trading portofio
    "ADA/USDT", "BCH/USDT", "BNB/USDT", "BTC/USDT", /*"DASH/USDT", "EOS/USDT", "ETC/USDT", "ETH/USDT", "IOTA/USDT", "LTC/USDT", "NEO/USDT", "TRX/USDT", "XLM/USDT", "XMR/USDT", "XRP/USDT",*/

    "AGI/BTC","ADA/BTC", "BCH/BTC", "BNB/BTC"/*, "DASH/BTC", "EOS/BTC", "ETC/BTC", "ETH/BTC", "IOTA/BTC", "LTC/BTC", "NEO/BTC", "TRX/BTC", "XLM/BTC", "XMR/BTC", "XRP/BTC",

    "ADA/ETH", "BNB/ETH", "DASH/ETH", "EOS/ETH", "ETC/ETH", "IOTA/ETH", "LTC/ETH", "NEO/ETH", "TRX/ETH", "XLM/ETH", "XMR/ETH", "XRP/ETH",

    "ADA/BNB", "DASH/BNB", "EOS/BNB", "ETC/BNB", "IOTA/BNB", "LTC/BNB", "NEO/BNB", "TRX/BNB", "XLM/BNB", "XMR/BNB", "XRP/BNB"*/
]

let numOfBots
let delay

let botNo = [];
let bestBuy = [];

//  main setup
let exInfo;
let wallet;
//setup();
async function setup() {    //runs once at the begining of the program
    exInfo = a.exInfos;
    tradingFeeP = exInfo.feeMaker * 100;
    await f.cs(exInfo);
    markets = await a.markets();
    await f.cs("Ms: " + markets.length)
    markets = await a.filterAll(markets);
    await f.cs("Ms: " + markets.length)
    await f.cs(markets);
    wallet = await a.wallet();
    await f.cs(wallet);
    f.sendMail("Restart", "RUN! at " + f.getTime() + "\n")
    s.markets == ("all" || "ALL") ? quotes = markets : ""
    await setBots(quotes);
}

// set bots

async function setBots(quotes) {

    numOfBots = await quotes.length;
    //f.cs("numOfBots"+numOfBots)
    delay = await (ticker / numOfBots);
    //f.cs("delay"+delay)

    cleared = false;
    let a = 0;
    function setStartTime() {
        r = a * delay;
        a++;
        return r;
    }

    for (let i in await quotes) {
        await setTimeout(function () { bot(quotes[i], ticker, "ud", stopLossP, i) }, setStartTime());
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

function logToFile(message) {
    fs.appendFile('log.txt', JSON.stringify(message), function (err) {
        if (err) throw err;
        //console.log('Saved!');
    });
}

function firstLogToFile() {
    fs.writeFile('log.txt', "Started log", function (err) {
        if (err) throw err;
        console.log("Started log");
    })
}

// global indicator

let history = []
async function globalRang(value, symbol, botN, awards, change24hP) {
    rang = 0
    history[botN] = await { value, symbol, botN, rang }

    let arr1 = await copyArr(history)
    async function copyArr(toCopy) {//copy array
        let copy = []
        copy = await toCopy.slice().sort();
        return await copy
    }

    let arr2 = await clearAward(arr1)
    async function clearAward(toClear) {
        let cleared = await toClear.slice().sort();
        for (i in toClear) {    //clear rang awards
            cleared[i].rang = 0
        }
        return await cleared
    }

    let arr3 = await sortAward(arr2)
    async function sortAward(toSort) {
        let sorted = await toSort.slice().sort();
        sorted = await toSort.sort(function (a, b) {  //sort array of JSON objects by one of its properties
            return b.value - a.value;   //set attribute to sort by
        })
        return await sorted
    }

    let arr4 = await award(arr3, awards)
    async function award(toAward, N) {
        try {
            let awarded = await toAward.slice().sort();
            if (toAward.length < N) {
                for (i = 0; i < toAward.length; i++) {   //give rangr award
                    if ((toAward[i].value <= 0) && (change24hP >= 0)) {
                        awarded[i].rang = 0
                    } else if (toAward[i].value > 0) {
                        awarded[i].rang = 1
                    }
                }
            } else {
                for (i = 0; i < N; i++) {   //give rangr award
                    if (toAward[i].value <= 0) {
                        awarded[i].rang = 0
                    } else if (toAward[i].value > 0) {
                        awarded[i].rang = 1
                    }
                }
            }
            return await awarded
        } catch (error) {
            f.cs("EEE: " + error)
        }
    }

    for (i = 1; i < 6; i++) {  //display top n
        f.cs(arr4[i])
    }

    ris = await ex(arr4, botN);
    async function ex(arr, n) {
        for (i in arr) {    //extract rang of botN
            if (arr[i].botN == n) {
                /*f.cs("Bot number: " + n)
                f.cs("on position: " + i)
                f.cs("valie of rang: "+arr[i].rang)*/
                return await arr[i].rang
            }
        }
    }
    return await ris
}

let history2 = []
async function globalRang2(value, symbol, botN, awards) {
    rang = 0
    history2[botN] = await { value, symbol, botN, rang }

    let arr1 = await copyArr(history2)
    async function copyArr(toCopy) {//copy array
        let copy = []
        copy = await toCopy.slice().sort();
        return await copy
    }

    let arr2 = await clearAward(arr1)
    async function clearAward(toClear) {
        let cleared = await toClear.slice().sort();
        for (i in toClear) {    //clear rang awards
            cleared[i].rang = 0
        }
        return await cleared
    }

    let arr3 = await sortAward(arr2)
    async function sortAward(toSort) {
        let sorted = await toSort.slice().sort();
        sorted = await toSort.sort(function (a, b) {  //sort array of JSON objects by one of its properties
            return b.value - a.value;   //set attribute to sort by
        })
        return await sorted
    }

    let arr4 = await award(arr3, awards)
    async function award(toAward, N) {
        try {
            let awarded = await toAward.slice().sort();
            if (toAward.length < N) {
                for (i = 0; i < toAward.length; i++) {   //give rangr award
                    if ((toAward[i].value <= 0)) {
                        awarded[i].rang = 0
                    } else if (toAward[i].value > 0) {
                        awarded[i].rang = 1
                    }
                }
            } else {
                for (i = 0; i < N; i++) {   //give rangr award
                    if (toAward[i].value <= 0) {
                        awarded[i].rang = 0
                    } else if (toAward[i].value > 0) {
                        awarded[i].rang = 1
                    }
                }
            }
            return await awarded
        } catch (error) {
            f.cs("EEE: " + error)
        }
    }

    for (i = 1; i < 6; i++) {  //display top n
        f.cs(arr4[i])
    }

    ris = await ex(arr4, botN);
    async function ex(arr, n) {
        for (i in arr) {    //extract rang of botN
            if (arr[i].botN == n) {
                /*f.cs("Bot number: " + n)
                f.cs("on position: " + i)
                f.cs("valie of rang: "+arr[i].rang)*/
                return await arr[i].rang
            }
        }
    }
    return await ris
}

// main loop

async function bot(symbol, ticker, strategy, stopLossP, botNumber) {

    let orderType = false;  //loop output
    let marketInfo;         //loop output

    let amountQuote;    //baseToQuote
    let amountBase;     //amountQuote

    //selectCurrency
    let more = false
    let sale = false
    let purchase = false
    let baseBalance, quoteBalance,
        baseCurrency, quoteCurrency,
        baseBalanceInQuote, quoteBalanceInBase

    //loger init
    let logAll = [],
        log24hP = [],
        logVol = [],
        logMacd = [],
        logMA3 = [],
        logMA200 = [],
        logVolMACD = [],
        logMA200second = [];

    let MA, MA200,
        MACD,
        change1hP, change24hP, change6hP,
        rang,
        RSI, DMACD,
        MA24hP, MAVol,
        MACDMA, MACDVol

    let price;      //balanceChanged
    let bougthPrice = 0;//balanceChanged

    let sellPrice;  //safeSale
    let hold;       //safeSale

    let stopLoss;   //checkStopLoss
    let lossPrice;  //checkStopLoss

    let indicator;  //indicator
    let upSignal;
    let downSignal;

    let dol = 0 //logHistory

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
                sale = await true;
                f.cs("sale is true")
                purchase = await false;
            } else if ((baseBalanceInQuote < quoteBalance) && (quoteBalanceInBase > minAmount)) {    //can buy
                sale = await false;
                f.cs("sale is false")
                more = await false;
                purchase = await true;
            } else {
                f.cs("sale is undef")
                sale = await false;
                purchase = await false;
                //f.cs("Too low!");
            }
            return await purchase;
        }
        async function selectCurrencyNew(baseBalance, quoteBalance, minAmount, baseBalanceInQuote) {        // check currency from pair that has more funds
            if ((baseBalanceInQuote > quoteBalance) && (baseBalance > minAmount)) {   //can sell
                return await {
                    sale: true,
                    more: true,
                    purchase: false
                }
            } else if ((baseBalanceInQuote < quoteBalance) && (quoteBalanceInBase > minAmount)) {    //can buy
                return await {
                    sale: false,
                    more: false,
                    purchase: true
                }
            } else {
                return await {
                    sale: false,
                    more: true,
                    purchase: false
                }
            }
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
            } else if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
                if (!more) {
                    bougthPrice = price;
                    more = true;
                    console.log("Bougth price updated: " + symbol);
                }
            }
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
            absStopLoss = await f.part(stopLossP, sellPrice);
            lossPrice = await sellPrice - absStopLoss;
            loss = await sellPrice - price;     //default: loss = sellPrice - price;
            relativeLoss = await f.percent(loss, sellPrice);
            /*f.cs("loss       : " + loss);
            f.cs(" > is biger than");
            f.cs("absStopLoss: " + absStopLoss);
            f.cs("relativeLoss: " + relativeLoss.toFixed(2) + " %");
            f.cs("lossPrice: " + lossPrice);*/
            if (price <= lossPrice) {
                return await true   //sell ASAP!!!
            } else {
                return await false  //hodl
            }
            /*
            if (loss > absStopLoss) {
                return await true;   //sell ASAP!!!      
            } else {
                return await false;  //hodl
            }*/
        }

        function mainMarketCap(fiatPrice, fiatVol) {
            let BTCsupply = 17696250;
            let marketCap = fiatPrice * BTCsupply;        //BTC supply 17,696,250 BTC

            return MCapMA;
        }

        async function change1h(priceLog, tickerInMs, price, durationInMinutes) {
            /*f.cs("priceLog: "+priceLog)
            f.cs("tickerInMinutes: "+tickerInMs)
            f.cs("price: "+price)
            f.cs("durationInMinutes: "+durationInMinutes)*/
            index1h = await (f.minToMs(durationInMinutes) / tickerInMs) - 1
            price1h = await priceLog[index1h]
            diff = await price - price1h
            ch1h = await f.percent(diff, price1h)
            /*await f.cs(index1h)
            await f.cs(price1h)
            await f.cs(ch1h)*/
            if (await ch1h) {
                return ch1h
            } else {
                return 0
            }
        }

        return {
            checkStopLoss: checkStopLoss,
            safeSale: safeSale,
            baseToQuote: baseToQuote,
            quoteToBase: quoteToBase,
            selectCurrency: selectCurrency,
            loger: loger,
            balanceChanged: balanceChanged,
            change1h: change1h,
            selectCurrencyNew: selectCurrencyNew
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
        price = await a.price(symbol);  //price for analysis
        bid = await a.bid(symbol)   //price for buying
        priceFiat = await a.price(s.fiatMarket)
        wallet = await a.wallet();
        change24hP = await a.change(symbol);
        volume = await a.volume(symbol);

        baseBalanceInQuote = await m.baseToQuote(baseBalance, price);
        quoteBalanceInBase = await m.quoteToBase(quoteBalance, price);
        bougthPrice = await m.balanceChanged(baseBalanceInQuote, quoteBalance, price);
        //purchase = await m.selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);
        let conds = await m.selectCurrencyNew(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);
        purchase = await conds.purchase
        sale = await conds.sale
        more = await conds.more

        //sellPrice;  //safeSale() returns
        hold = await m.safeSale(tradingFeeP, bougthPrice, price, minProfitP);
        stopLoss = await m.checkStopLoss(price, stopLossP, sellPrice);

        indicator = await indicators(price, volume, change24hP)
        async function indicators(price, volume, change24hP) {
            //market data colection
            logAll = await m.loger(price, 105, logAll);
            log24hP = await m.loger(change24hP, 3, log24hP);
            logVol = await m.loger(volume, 3, logVol);
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

            change1hP = await m.change1h(logAll, ticker, price, 60)  //price change percentage in duration
            change6hP = await m.change1h(logAll, ticker, price, 360)  //price change percentage in duration
            MA24hP = await TI.ma(log24hP);  //MA3 of 24h price change

            MAVol = await TI.ma(logVol);    //MA of last 5 Volumes

            //rang = await globalRang(MAVol, symbol, botNumber, 2);
            rang = await globalRang(change1hP, symbol, botNumber, 22, change24hP);
            rang2 = await globalRang2(MAVol, symbol, botNumber, 22)

            logVolMACD = await m.loger(volume, 40, logVolMACD);
            MACDVol = await TI.macd(logVolMACD);    //MACD of MA5

            return await {
                MA: MA,
                MA200: MA200,
                MACD: MACD,
                change1hP: change1hP,
                MAVol: MAVol,
                rang: rang,
                rang2:rang2,
                UPS: "--------------------------------------------------",
                change24hP: change24hP,
                change6hP: change6hP,
                RSI: RSI,
                DMACD: DMACD,
                MA24hP: MA24hP,
                MACDMA: MACDMA,
                MACDVol: MACDVol,
            }
        }

        upSignal = await up(indicator);
        async function up(indicator) {
            if (        //up signal
                (indicator.MA > 0)
                && (indicator.MA200 > 0)
                && (indicator.MACD > 0)
                //&& (indicator.MAVol > 0)
                //&& (indicator.change1hP > 0)
                && (indicator.rang > 0)
                && (indicator.rang2 > 0)
            ) {
                return await 1;
            } else {    //no signal
                return await 0;
            }
        }

        downSignal = await down(indicator);
        async function down(indicator) {
            if (        //down signal
                (indicator.MA < 0)
                //&& (indicator.MA200 <= 0)
            ) {
                return await 1;
            } else {    //no signal
                return await 0;
            }
        }

        // make strategic decision about order type
        orderType = await makeOrder(purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders, upSignal, downSignal);
        async function makeOrder(purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders, upSignal, downSignal) { //trendMacdTrend, MAVol
            if (purchase && !sale && upSignal) {    // buy 
                enableOrders ? ret = await a.buy(symbol, quoteBalanceInBase * portion, bid) : console.log('buy orders disabled');
                enableOrders ? bougthPrice = ret.bougthPrice : bougthPrice = bid;
                orderType = ret.orderType;
            } else if (sale && !hold && !stopLoss && downSignal) {    //sell good
                enableOrders ? ret = await a.sell(symbol, baseBalance, price) : console.log('sell orders disabled');
                orderType = ret.orderType;
            } else if (sale && hold && stopLoss && downSignal) {    //sell bad stopLoss
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
            return await orderType;
        }

        await mailInfo(orderType);

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
            No: botNumber,
            fiatPrice: priceFiat + " " + s.fiatMarket,
            fiatProfit: (absoluteProfit * priceFiat).toFixed(8) + " " + "USDT",
            fiatProfit2: (absoluteProfit2 * priceFiat).toFixed(8) + " " + "USDT",
            relativeProfit_: (relativeProfit + minProfitP).toFixed(3) + " %",
            absoluteProfit_: absoluteProfit.toFixed(8) + " " + quoteCurrency,
            absoluteProfit2: absoluteProfit2.toFixed(8) + " " + quoteCurrency,
            fiatPrice: priceFiat + " " + s.fiatMarket,
            fiatProfit: (absoluteProfit * priceFiat).toFixed(8) + " " + "USDT",
            fiatProfit2: (absoluteProfit2 * priceFiat).toFixed(8) + " " + "USDT",
            minAmount_________: minAmount + " " + baseCurrency,
            baseBalance_______: baseBalance + " " + baseCurrency,
            baseBalanceInQuote: baseBalanceInQuote.toFixed(8) + " " + quoteCurrency,
            quoteBalance______: quoteBalance + " " + quoteCurrency,
            quoteBalanceInBase: quoteBalanceInBase.toFixed(8) + " " + baseCurrency,
            time_____: f.getTime(),
            ticker___: tickerMinutes + " min",
            stopLossP: stopLossP + " %",
            symbol___: symbol,
            sellPrice__: sellPrice.toFixed(8) + " " + symbol,
            price______: price.toFixed(8) + " " + symbol,
            bid________: bid.toFixed(8) + " " + symbol,
            bougthPrice: bougthPrice.toFixed(8) + " " + symbol,
            lossPrice__: lossPrice.toFixed(8) + " " + symbol,
            purchase___: purchase,
            more_______: more,
            upSignal___: upSignal,
            downSignal_: downSignal,
            sellConditions: {
                sale: sale,
                hold: hold,
                stopLoss: stopLoss,
            },
            logLength: logMA200.length,
            orderType: orderType,
            indicator: indicator,
            //quoteMarkets: JSON.stringify(quotes),
            //wallet: JSON.stringify(wallet)
            //bestBuy: JSON.stringify(bestBuy),
        }
        //mailer
        async function mailInfo(orderType) {
            if (await orderType == "sold") {
                f.sendMail("Sold Info", JSON.stringify(marketInfo));
                return await true;
            } else if (await orderType == "bougth") {
                f.sendMail("Bougth Info", JSON.stringify(marketInfo));
                return await true;
            } else if (await orderType == "lossed") {
                f.sendMail("Lossed Info", JSON.stringify(marketInfo));
                return await true;
            } else if (await orderType == "canceled") {
                f.sendMail("Canceled Info", JSON.stringify(marketInfo));
                return await true;
            } else {
                return await false;
            }
        }


        logHistory(marketInfo,10)
        function logHistory(toLog,length) {
            //f.cs(dol)
            if (dol >= length) {
                firstLogToFile()
                logToFile(toLog)
                dol = 0
            } else {
                logToFile(toLog)
                dol++
            }
        }

        await console.dir(marketInfo);
        //await f.cs(marketInfo)
        return await marketInfo;
    }
    return await marketInfo;
}

//constants and variables
exports.ticker = ticker;
exports.enableOrders = enableOrders;
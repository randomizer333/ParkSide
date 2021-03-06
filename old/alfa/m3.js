/* 
1.crypto to fiat trader
2.high ranking catcher trader
3.intracrypto trading trader
4.triple arbitrage
*/

const { isNumber } = require("util");

console.log("runin 333")

//requirements
let s, a, f, TI, fs, db
req();
async function req() {
    s = require("../set.json")
    a = require("./api.js")
    f = require("./funk.js")
    TI = require("./ti.js")
    fs = require('fs') //node.js native
    db = require("./db.json")
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
    minProfitP = await s.minProfitP; //holding addition
    enableOrders = await s.enableOrders//true;  //sim
    ticker = await f.minToMs(tickerMinutes);
    return await setup();
}

let quotes = [    //fiat strategy trading portofio
    //"BTC/USDT",   //in setings
    //cripto base/fiat quote
    /*"BNB/USDT",
    "ETH/USDT",

    "XRP/USDT",
    "LTC/USDT",
    "EOS/USDT",
    "ADA/USDT",
    "XLM/USDT",
    "XMR/USDT",
    "TRX/USDT",

    "BCH/USDT",*/
]

let alts = [    //alt markets 21+3=24
    /*
    valuta1 = "BTC"
    valuta2 = "BNB","ETH"
    valuta3 = "ALTs"

        "XRP/BNB", "XRP/BTC", "XRP/ETH",
        "LTC/BNB", "LTC/BTC", "LTC/ETH",
        "EOS/BNB", "EOS/BTC", "EOS/ETH",
        "ADA/BNB", "ADA/BTC", "ADA/ETH",
        "XLM/BNB", "XLM/BTC", "XLM/ETH",
        "XMR/BNB", "XMR/BTC", "XMR/ETH",
        "TRX/BNB", "TRX/BTC", "TRX/ETH",
            "BNB/BTC",  "ETH/BTC"
        */
    //add old markets

    //crypto/fiat backings
    "BNB/BTC",
    "ETH/BTC",

    "XRP/BTC",
    "LTC/BTC",
    "EOS/BTC",
    "ADA/BTC",
    "XLM/BTC",
    "XMR/BTC",
    "TRX/BTC",

    "BCH/BTC"

    /*
    "XRP/BNB",  
    "LTC/BNB",  
    "EOS/BNB",  
    "ADA/BNB",  
    "XLM/BNB",  
    "XMR/BNB",  
    "TRX/BNB", 

    "XRP/ETH",
    "LTC/ETH",
    "EOS/ETH",
    "ADA/ETH",
    "XLM/ETH",
    "XMR/ETH",
    "TRX/ETH",*/

]


// main setup
let numOfBots
let delay

let botNo = [];
let bestBuy = [];

let exInfo;
let wallet;
async function setup() {    //runs once at the begining of the program
    exInfo = a.exInfos;
    tradingFeeP = exInfo.feeMaker * 100;
    await f.cs(exInfo);
    await f.cs("Exchange: " + s.exchange)
    markets = await a.markets();
    await f.cs(markets);
    await f.cs("Number of markets: " + markets.length)
    markets = await a.filterAll(markets, s.markets);
    await f.cs("Ms: " + markets.length)
    await f.cs(markets);
    wallet = await a.wallet();
    await f.cs("Wallet:");
    await f.cs(wallet);
    enableOrders ? f.sendMail("Restart", "RUN! at " + f.getTime() + "\n") : "";
    s.markets == ("BTC" || "BNB" || "ETH") ? quotes = markets : ""
    firstLogToFile()
    await setBots(quotes);
}

// set bots

async function setBots(quotes) {
    if (s.strategy == "fiat") {
        f.cs("Strategy: " + s.strategy)
        quotes.unshift(s.fiatMarket)
    } else if (s.strategy == "alt") {
        f.cs("Strategy: " + s.strategy)
        quotes.unshift(s.fiatMarket)
        quotes.push(...alts)
    }

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

    //createDB(quotes)

    runBots(quotes)
    async function runBots(quotes) {
        //makeBase(baza)
        /*function makeBase(b){
            for(quotes in b){
                b.[quotes].bougthPrice = 0
                b.[quotes].timeDate = 0
                b.[quotes].quoteBalance = 0
                b.[quotes].baseBalance = 0
            }
        }*/
        f.cs("Runing markets: " + quotes)
        for (let i in await quotes) {
            setTimeout(function () { bot(quotes[i], ticker, stopLossP, i) }, setStartTime());
        }
    }

}

// stop bots

function clear() {
    for (const cur in quotes) {
        clearInterval(quotes[cur]);
        //f.cs("Number:"+cur)
    }
}

//store data

async function shrani(symbol, bougthPrice, quoteBalance, baseBalance) {
    let baza = await readJSON()
    baza[symbol].bougthPrice = await bougthPrice
    baza[symbol].timeDate = await f.getTime()
    baza[symbol].quoteBalance = await quoteBalance
    baza[symbol].baseBalance = await baseBalance

    f.cs("writing " + symbol)
    writeJSON(baza)
}
async function shraniDB(symbol, data) {
    let baza = await readJSON()
    baza[symbol] = await data
    f.cs("saving " + symbol)
    writeJSON(baza)
}

async function createDB(quotes) {
    let baza = await readJSON()
    f.cs("Creating: " + quotes)
    for (let i in await quotes) {
        baza[quotes[i]] = {
            No: 0,
            fiatMarket: "",
            fiatPrice: 0,
            fiatProfit: 0,
            fiatProfit2: 0,
            symbol: "symbol",
            base: "baseCurrency",
            quote: "quoteCurrency",
            relativeProfit: 0,
            absoluteProfit: 0,
            absoluteProfit2: 0,
            DeusGroup: "__________________________________",
            fiatPrice: 0,
            fiatProfit: 0,
            fiatProfit2: 0,
            minAmount: 0,
            baseBalance: 0,
            baseBalanceInQuote: 0,
            quoteBalance: 0,
            quoteBalanceInBase: 0,
            enabled: "",
            time: 0,
            ticker: 0,
            stopLossP: 0,
            MrPrice: "____________________________________",
            sellPrice: 0,
            price: 0,
            bid: 0,
            bougthPrice: 0,
            lossPrice: 0,
            FSociety: "____________________________________",
            purchase: "purchase",
            more: "more",
            upSignal: "upSignal",
            uppers: "indicator.uppers",
            downers: "indicator.downers",
            downSignal: "downSignal",
            //indicators: indicator.all,
            sellConditions: {
                sale: "sale",
                hold: "hold",
                stopLoss: "stopLoss",
            },
            logLength: "logMA200.length",
            orderType: "orderType",
            //quoteMarkets: JSON.stringify(quotes),
            //wallet: JSON.stringify(wallet)
            //bestBuy: JSON.stringify(bestBuy),
        }
        writeJSON(baza)
    }
}


async function read(symbol) {
    let baza = await readJSON();
    bougthPrice = await baza[symbol].bougthPrice
    return await bougthPrice;
}

async function writeJSON(inputJSON) {
    input = JSON.stringify(inputJSON);
    await fs.writeFile("./storage.json", "", function (err) {
        if (err) throw err;
    });
    await fs.writeFile("./storage.json", input, function (err) {
        if (err) throw err;
    });
}
function readJSON() {
    let data = fs.readFileSync("storage.json");
    let json = JSON.parse(data);
    return json
}

function logToFile(message) {   //writes to existing file
    fs.appendFile('../log.txt', JSON.stringify(message), function (err) {
        if (err) throw err;
        //console.log('Saved!');
    });
}
function firstLogToFile() { //creates a file and writes to it
    fs.writeFile('../log.txt', "Started log", function (err) {
        if (err) throw err;
        console.log("Started log");
    })
}

// global indicator

let history = []
async function globalRang(value, symbol, botN, awards) {
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
                    if (toAward[i].value <= 0) {
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
        //f.cs(arr4[i])
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

async function bot(symbol, ticker, stopLossP, botNumber) {

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
        logMA30 = [],
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
    let bid
    let bougthPrice = await read(symbol);//balanceChanged

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
                sale = true;
                f.cs("sale is true")
                purchase = false;
            } else if ((baseBalanceInQuote < quoteBalance) && (quoteBalanceInBase > minAmount)) {    //can buy
                sale = false;
                f.cs("sale is false")
                more = false;     //more funds reset
                purchase = true;
            } else {
                f.cs("sale is undef")
                sale = false;
                purchase = false;
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
        function logHistory(toLog, length) {
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

        async function checkBougthPrice(bougthPrice, price) {  //check if bougthPrice exists
            lastBPrice = await read(symbol)

            f.cs("lastBPrice: " + lastBPrice)
            f.cs("price: " + price)

            if ((bougthPrice == 0) && (price < lastBPrice)) {
                f.cs("BP was 0")
                //await shrani(symbol, price, quoteBalance, baseBalance)
                return await bougthPrice
            } else if (price > lastBPrice) {    //dev  new price is higher so it is the new bougthPrice
                //await shrani(symbol, price, quoteBalance, baseBalance)
                f.cs("BP was updated!")
                return await price
            } else if (price < lastBPrice) {    //dev
                f.cs("BP was NOT updated!")
                return await lastBPrice
            } else {
                f.cs("BP was read")
                return bougthPrice = await read(symbol)
            }
        }

        async function balanceChanged(baseBalanceInQuote, quoteBalance, botNumber) {
            /*if (bougthPrice == 0) {
                f.cs("BP was 0")
                bougthPrice = await price
                await shrani(await symbol, await bougthPrice)
                return await bougthPrice

            } else*/ if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
                if (!more) {
                    //bougthPrice = price;  //!!!Bougth price not updated
                    more = true;
                    bougthPrice = await price
                    await shrani(symbol, bougthPrice, quoteBalance, baseBalance)
                    console.log("Bougth price updated: " + symbol);
                    time = await f.getTime()
                    f.sendMail("Price updated", JSON.stringify("price would be updated at: " + time + " on market: " + symbol));
                }
            }
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

        async function triArb(currency1, currency2, currency3) {
            f.cs("checking:" + currency1 + "/" + currency2 + "/" + currency3)
            price21a = a.ask(f.mergeSymbol(currency2, currency1))  //CW
            price32a = a.ask(f.mergeSymbol(currency3, currency2))  //CW
            price31a = a.ask(f.mergeSymbol(currency3, currency1))  //CCW
            price21b = a.bid(f.mergeSymbol(currency2, currency1))  //CCW
            price32b = a.bid(f.mergeSymbol(currency3, currency2))  //CCW
            price31b = a.bid(f.mergeSymbol(currency3, currency1))  //CW

            //CW
            let value1CW = 100
            let value2CW = value1CW / await price21a
            let value3CW = value2CW / await price32a
            let valueFinalCW = value3CW * await price31b
            profitCW = valueFinalCW - value1CW

            //CCW
            let value1CCW = 100
            let value2CCW = value1CCW / await price21b
            let value3CCW = value2CCW * await price32b
            let valueFinalCCW = value3CCW * await price31a
            profitCCW = valueFinalCCW - value1CCW

            triArbCheck(profitCW, profitCCW)
            function triArbCheck(profitCW, profitCCW) { //r: CW/CCW/none
                if ((profitCW > 0.3) && (profitCW > profitCCW)) {
                    f.cs("profitCW: " + profitCW)
                    f.cs("go clock wise")
                    triArbOrderType = "CW"
                    logHistory(triArbOrderType + " " + currency1 + " " + currency2 + " " + currency3 + " " + (profitCW - 0.3), 100)
                    //triArbOrder(triArbOrderType, currency1, currency2, currency3)
                    return triArbOrderType
                } else if ((profitCCW > 0.3) && (profitCCW > profitCW)) {
                    f.cs("profitCCW: " + profitCCW)
                    f.cs("go counter clock wise")
                    triArbOrderType = "CCW"
                    logHistory(triArbOrderType + " " + currency1 + " " + currency2 + " " + currency3 + " " + (profitCCW - 0.3), 100)
                    //triArbOrder(triArbOrderType, currency1, currency2, currency3)
                    return triArbOrderType
                } else {
                    f.cs("no profit")
                    return triArbOrderType = "none"
                }
            }


            async function triArbOrder(triArbOrderType, currency1, currency2, currency3) {

                // check for balances 

                cur1bal = await a.balance(currency1)
                cur2bal = await a.balance(currency2)
                cur3bal = await a.balance(currency3)
                f.cs(cur1bal + "----------------" + currency1)
                f.cs(cur2bal + "----------------" + currency2)
                f.cs(cur3bal + "----------------" + currency3)
                f.cs("order type:------------ " + triArbOrderType)
                
                                switch (triArbOrderType) {
                                    case "CW":
                
                                
                                        done12a = await a.buy(f.mergeSymbol(currency2, currency1), quoteBalanceInBase * portion, market12a)
                                        if(done12a){
                                            done23a = await a.buy(f.mergeSymbol(currency3, currency2), quoteBalanceInBase * portion, market23a)
                                            if(done23a){
                                                done13b = await a.buy(f.mergeSymbol(currency3, currency1), quoteBalanceInBase * portion, market13b)
                                            }
                                        }
                                        /*
                                        done12a ? done23a = await a.buy(f.mergeSymbol(currency3, currency2), quoteBalanceInBase * portion, market23a) : ""
                
                                        done23a ? done13b = await a.buy(f.mergeSymbol(currency3, currency1), quoteBalanceInBase * portion, market13b) : ""
                                        */
                                        brake;
                                    case "CCW":
                
                                        done13a = await a.buy(f.mergeSymbol(currency2, currency1), quoteBalanceInBase * portion, market13a)
                
                                        done32a ? done32a = await a.buy(f.mergeSymbol(currency3, currency2), quoteBalanceInBase * portion, market32a) : ""
                
                                        done23a ? done13b = await a.buy(f.mergeSymbol(currency3, currency1), quoteBalanceInBase * portion, market13b) : ""
                
                                        brake;
                                    case "none":
                                        f.cs("No TriArb")
                                        brake;
                
                                }
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
            selectCurrencyNew: selectCurrencyNew,
            checkBougthPrice: checkBougthPrice,
            triArb: triArb,
            //triArbOrder: triArbOrder,
            logHistory: logHistory
        }
    }
    const m = modul();

    loop(symbol);
    botNo[botNumber] = setInterval(function () { loop(symbol) }, ticker);
    async function loop(symbol) {

        let orderType = false;  //loop output

        minAmount = await a.minAmount(symbol);
        baseCurrency = await f.splitSymbol(symbol, "first");
        quoteCurrency = await f.splitSymbol(symbol, "second");
        baseBalance = await a.balance(baseCurrency);
        quoteBalance = await a.balance(quoteCurrency);
        price = await a.price(symbol);  //price for analysis
        bid = await a.bid(symbol)   //price for buying
        priceFiat = await a.price(s.fiatMarket)

        //priceAltFiat = await a.price(f.mergeSymbol(baseCurrency, s.quoteCurrency))
        //f.cs(priceAltFiat + " " + f.mergeSymbol(baseCurrency, s.quoteCurrency))

        wallet = await a.wallet();
        change24hP = await a.change(symbol);
        volume = await a.volume(symbol);

        baseBalanceInQuote = await m.baseToQuote(baseBalance, price);
        quoteBalanceInBase = await m.quoteToBase(quoteBalance, price);
        bougthPrice = await m.checkBougthPrice(bougthPrice, price);
        //bougthPrice = await read(symbol)
        //m.balanceChanged(baseBalanceInQuote, quoteBalance, botNumber);
        //purchase = await m.selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);
        let conds = await m.selectCurrencyNew(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);
        purchase = conds.purchase
        sale = conds.sale
        more = conds.more

        //sellPrice;  //safeSale() returns
        hold = await m.safeSale(tradingFeeP, bougthPrice, price, minProfitP);
        stopLoss = await m.checkStopLoss(price, stopLossP, sellPrice);

        indicator = await indicators(price, volume, change24hP)
        async function indicators(price, volume, change24hP) {
            //market data colection
            logAll = await m.loger(price, 555, logAll);
            log24hP = await m.loger(change24hP, 3, log24hP);
            logVol = await m.loger(volume, 10, logVol);
            logMA3 = await m.loger(price, 3, logMA3);
            logMA30 = await m.loger(price, 30, logMA30)

            logMA200 = await m.loger(price, 200, logMA200);

            //technical analysis
            MA3 = await TI.ma(logMA3);   //MA of last 3 prices
            MA30 = await TI.ma(logMA30) //MA of last 30 prices
            MA200 = await TI.ma(logMA200);  //MA of last 200 prices

            RSI = await TI.rsi(logAll); //RSI (30,70)

            MACD = await TI.macd(logAll);   //standard MACD
            logMacd = await m.loger(MACD, 3, logMacd);
            MACDMA = await TI.ma(logMacd);  //MA of MACD

            DMACD = await TI.doubleMacd(logAll);    //double length of input MACD

            change1hP = await m.change1h(logAll, ticker, price, 60)  //price change percentage in duration
            change6hP = await m.change1h(logAll, ticker, price, 360)  //price change percentage in duration
            MA3change24hP = await TI.ma(log24hP);  //MA3 of 24h price change

            MAVol = await TI.ma(logVol);    //MA of last 5 Volumes

            //rang = await globalRang(MAVol, symbol, botNumber, 2);
            //rang = await globalRang(change1hP, symbol, botNumber, 10);
            //rang2 = await globalRang(MAVol, symbol, botNumber, 10)
            rang = await globalRang2(change1hP, symbol, botNumber, 3)

            logVolMACD = await m.loger(volume, 40, logVolMACD);
            MACDVol = await TI.macd(logVolMACD);    //MACD of MA5

            return {
                uppers: {
                    MA3: MA3,
                    MA30: MA30,
                    MACD: MACD,
                    //change1hP: change1hP,
                    //MACDMA: MACDMA,
                    rank: rang,

                },
                downers: {
                    MA3: MA3,
                    //MA200: MA200
                },
                all: {
                    MA3: MA3,
                    MA30: MA30,
                    MA200: MA200,
                    change1hP: change1hP,
                    change6hP: change6hP,
                    change24hP: change24hP,
                    MA3change24hP: MA3change24hP,
                    RSI: RSI,
                    MACD: MACD,
                    MACDMA: MACDMA,
                    DMACD: DMACD,
                    MAVol: MAVol,
                    MACDVol: MACDVol,
                    rank: rang,
                    //rank2: rang2,
                }
            }
        }

        //confirm signals above 0 with AND
        upSignal = await up(indicator.uppers);
        async function up(uppers) {
            conds = Object.values(uppers);
            function condition(currentValue) {
                return currentValue > 0;    //set condition
            }
            return conds.every(condition)
        }

        //confirm signals below 0 with AND
        downSignal = await down(indicator.downers);
        async function down(downers) {
            conds = Object.values(downers);
            function condition(currentValue) {
                return currentValue < 0;    //set condition
            }
            return conds.every(condition)
        }

        let triUSDTBTC,
            triUSDTETH,
            triUSDTBNB,
            triETH,
            triBNB
/*
        setTimeout(function () { triUSDTBTC = m.triArb("USDT", "BTC", baseCurrency) }, 1000)
        setTimeout(function () { triUSDTETH = m.triArb("USDT", "ETH", baseCurrency) }, 3000)
        setTimeout(function () { triUSDTBNB = m.triArb("USDT", "BNB", baseCurrency) }, 5000)
        setTimeout(function () { triETH = m.triArb("BTC", "ETH", baseCurrency) }, 7000)
        setTimeout(function () { triBNB = m.triArb("BTC", "BNB", baseCurrency) }, 9000)*/

        triUSDTBTC = m.triArb("USDT", "BTC", baseCurrency)
        if (triUSDTBTC){
            f.cs("triUSDTBTC___OK "+triUSDTBTC)
            triUSDTETH = m.triArb("USDT", "ETH", baseCurrency)
            if(triUSDTETH){
                f.cs("triUSDTETH____OK")
                triUSDTBNB = m.triArb("USDT", "BNB", baseCurrency)
                if(triUSDTBNB){
                    f.cs("triUSDTBNB____OK")
                    triETH = m.triArb("BTC", "ETH", baseCurrency)
                    if(triETH){
                        f.cs("triETH____OK")
                        triBNB = m.triArb("BTC", "BNB", baseCurrency)
                    }
                }
            }
        }else{
            f.cs("not a number: "+await triUSDTBTC)
        }

        /*
                triUSDTBTC = await m.triArb("USDT", "BTC", baseCurrency)
                triUSDTETH = await m.triArb("USDT", "ETH", baseCurrency)
                triUSDTBNB = await m.triArb("USDT", "BNB", baseCurrency)
                triETH = await m.triArb("BTC", "ETH", baseCurrency)
                triBNB = await m.triArb("BTC", "BNB", baseCurrency)*/


        // make strategic decision about order type
        orderType = await makeOrder(purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders, upSignal, downSignal);
        async function makeOrder(purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders, upSignal, downSignal) { //trendMacdTrend, MAVol
            if (purchase && !sale && upSignal /*&& !hold && !stopLoss*/) {    // buy 
                enableOrders ? ret = await a.buy(symbol, quoteBalanceInBase * portion, price) : console.log('buy orders disabled');
                enableOrders ? bougthPrice = await ret.bougthPrice : console.log('buy orders disabled');;

                //bougthPrice = await m.checkBougthPrice(bougthPrice, price);

                enableOrders ? await shrani(symbol, await ret.bougthPrice) : "";

                enableOrders ? orderType = ret.orderType : orderType = "bougth";
            } else if (sale && !hold && !stopLoss && downSignal) {    //sell good
                enableOrders ? ret = await a.sell(symbol, baseBalance, price) : console.log('sell orders disabled');
                enableOrders ? orderType = await ret.orderType : orderType = "sold";
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
            return orderType;
        }


        // dinamic stoploss dev
        function dinamicStopLoss(startValue) {
            aProfit = f.part(relativeProfit, startValue);
            return profit;//stopLoss
        }

        let relativeProfit = await f.percent(price - sellPrice, sellPrice);
        let absoluteProfit = await f.part(relativeProfit, quoteBalance);
        let absoluteProfit2 = await f.part(relativeProfit, baseBalanceInQuote);

        //main console output
        marketInfo = {
            No: botNumber,
            fiatMarket: s.fiatMarket,
            fiatPrice: priceFiat,
            fiatProfit: (absoluteProfit * priceFiat),
            fiatProfit2: (absoluteProfit2 * priceFiat),
            symbol: symbol,
            base: baseCurrency,
            quote: quoteCurrency,
            relativeProfit: (relativeProfit + minProfitP),
            absoluteProfit: absoluteProfit,
            absoluteProfit2: absoluteProfit2,
            DeusGroup: "__________________________________",
            fiatPrice: priceFiat,
            fiatProfit: (absoluteProfit * priceFiat),
            fiatProfit2: (absoluteProfit2 * priceFiat),
            minAmount: minAmount,
            baseBalance: baseBalance,
            baseBalanceInQuote: baseBalanceInQuote,
            quoteBalance: quoteBalance,
            quoteBalanceInBase: quoteBalanceInBase,
            enabled: enableOrders,
            time: f.getTime(),
            ticker: tickerMinutes,
            stopLossP: stopLossP,
            MrPrice: "____________________________________",
            sellPrice: sellPrice,
            price: price,
            bid: bid,
            bougthPrice: bougthPrice,
            lossPrice: lossPrice,
            FSociety: "____________________________________",
            purchase: purchase,
            more: more,
            triETH: triETH,
            triBNB: triBNB,
            upSignal: upSignal,
            //uppers: indicator.uppers,
            downers: indicator.downers,
            downSignal: downSignal,
            //indicators: indicator.all,
            sellConditions: {
                sale: sale,
                hold: hold,
                stopLoss: stopLoss,
            },
            logLength: logMA200.length,
            orderType: orderType,
            //quoteMarkets: JSON.stringify(quotes),
            //wallet: JSON.stringify(wallet)
            //bestBuy: JSON.stringify(bestBuy),
        }
        //mailer
        await mailInfo(orderType);
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
                //f.sendMail("Canceled Info", JSON.stringify(marketInfo));
                return await true;
            } else {
                return await false;
            }
        }

        await shraniDB(symbol, marketInfo)

        //m.logHistory(marketInfo, 10)
        //console.dir(marketInfo);
        f.cs("NEXT")
        //await f.cs(marketInfo)
        //enableOrders ? "" : await shrani(await symbol, await bougthPrice)  //dev
        return marketInfo;
    }
    return marketInfo;
}

//constants and variables
exports.ticker = ticker;
exports.enableOrders = enableOrders;

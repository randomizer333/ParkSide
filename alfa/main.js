/* 
1.crypto to fiat trader
2.high ranking catcher trader
3.intracrypto trading trader
*/

/*ToDo
-enable pullout in bear
-valet.json
-sell order delay
-implement FCA or DCA
-buy order is market order
*/

//const { db } = require("./dbms");

//requirements
let s, a, f, TI, fs, dbms, em, alts
req();
async function req() {
    s = await require("../set.json")
    a = await require("./api.js")
    f = await require("./funk.js")
    TI = await require("./ti.js")
    dbms = require("./dbms.js")
    em = require("./enabledMarkets.js")

    alts = em.alts()

    fs = await require('fs') //node.js native
    return await init()
}


// init
let tickerMinutes,
    stopLossP,
    portion,
    minProfitP,
    enableOrders,
    ticker,
    qs,
    quo,
    q0, q1, q2, q3

async function init() {
    tickerMinutes = await s.tickerMinutes;    //1,3,5, for all 10,60,120
    stopLossP = await s.stopLossP//2;   //stoploss for fiat and quote markets, 99% for hodlers, 1% for gamblers
    portion = await s.portion//0.99;   //part of balance to spend
    minProfitP = await s.minProfitP; //holding addition
    enableOrders = await s.enableOrders//true;  //sim
    ticker = await f.minToMs(tickerMinutes);
    qs = s.quotes

    q0 = s.fiatCurrency
    q1 = "BTC"
    q2 = "ETH"
    q3 = "BNB"
    quo = [s.fiatCurrency, "BTC", "ETH", "BNB"]

    return await setup();
}


let quotes = []

// main setup
let numOfBots;
let delay;

let botNo = [];

let exInfo;
let wallet;
async function setup() {    //runs once at the begining of the program
    exInfo = a.exInfos;
    tradingFeeP = exInfo.feeMaker * 100;
    await f.cs(exInfo);
    //await f.cs("Exchange: " + s.exchange)
    markets = await a.markets();
    await f.cs(markets);
    await f.cs("Number of markets: " + markets.length)
    markets = await a.filterAll(markets, s.markets);
    await f.cs("Ms: " + alts.length)
    //await f.cs(markets);
    wallet = await a.wallet();
    await f.cs("Wallet:");
    await f.cs(wallet);
    enableOrders ? f.sendMail("Restart", "RUN! at " + f.getTime() + "\n") : "";
    //s.markets == ("BTC" || "BNB" || "ETH") ? quotes = markets : ""
    //await a.cap();
    firstLogToFile()
    //test()//dev
    await setBots(quotes);
}

// set bots

async function setBots(quotes) {
    if (s.strategy == "fiat") {
        f.cs("Strategy: " + s.strategy)
        quotes.unshift(s.fiatMarket)
    } else if (s.strategy == "alt") {
        f.cs("Strategy: " + s.strategy)
        //quotes.unshift(s.fiatMarket)
        quotes.push(...alts)
    }

    numOfBots = await quotes.length;
    //f.cs("numOfBots"+numOfBots)
    delay = (ticker / numOfBots);
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
        f.cs("Runing markets: " + quotes)
        for (let i in await quotes) {
            setTimeout(function () { bot(quotes[i], ticker, stopLossP, i) }, setStartTime());
        }
    }

    //runBots1(quotes)
    async function runBots1(quotes) {
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

//log data

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
        logVwap = [],

        logMA3 = [],
        logMA20 = [],
        logMA30 = [],
        logMA100 = [],
        logMA200 = [],

        logVolMACD = [],
        logDMacd = [],

        logBids = [],
        logAsks = [],

        logRSI = [],
        logRSIMA = []


    let MA, MA2, MA3, MA100, MA200,
        MACD, MACDMA, MACDRev,
        change1hP, change24hP, change6hP,
        rang,
        RSI,
        MA24hP,
        MAVol, MACDVol,
        DMACD, DMACDRev, DMACDMA,
        vwapMA,
        ao

    let price;      //balanceChanged
    let bid, ask
    let bougthPrice

    let sellPrice;  //safeSale
    let hold;       //safeSale

    let stopLoss;   //checkStopLoss
    let lossPrice;  //checkStopLoss

    let indicator;  //indicator
    let upSignal;
    let downSignal;

    let dol = 0 //logHistory

    let lastBPrice  //checkBougthPrice

    let marketType  //determineMarketType

    function modul() {
        async function baseToQuote(amountBase, price) {
            amountQuote = amountBase * price;
            return amountQuote;
        }
        async function quoteToBase(amountQuote, price) {
            amountBase = amountQuote / price;
            return amountBase;
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

        async function selectCurrencyNew(baseBalance, quoteBalance, minAmount, baseBalanceInQuote) {        // check currency from pair that has more funds returns: sale,more,purchase
            if ((baseBalanceInQuote > quoteBalance) && (baseBalance > minAmount)) {   //can sell
                return {
                    sale: true,
                    purchase: false,
                    more: true,
                }
            } else if ((baseBalanceInQuote < quoteBalance) && (quoteBalanceInBase > minAmount)) {    //can buy
                return {
                    sale: false,
                    purchase: true,
                    more: false,
                }
            } else {
                return {
                    sale: false,
                    purchase: false,
                    more: true,
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

        async function checkBougthPrice(symbol, price) {  //check if bougthPrice exists
            lastBPrice = dbms.readBougthPrice(symbol)
            f.cs("lastBPrice: " + await lastBPrice)
            if (!lastBPrice) {  //if value is 0 or bad
                f.cs("bad 0 value of Last Bougth Price!!!")
                return price
            } else {
                return lastBPrice
            }
        }

        async function checkNewBougthPrice(symbol, price) {     //if new bougth price is higher than old one its OK you can update it IF new bougth price is lower you MUST NOT update it

            lastBPrice = await dbms.readBougthPrice(symbol)
            //f.cs("lastBPrice: " + lastBPrice)

            if (lastBPrice > price) {
                f.cs("Last bougth price: " + lastBPrice + " was bigger than current NOT Updated: " + price)
                return lastBPrice;
            } else if (lastBPrice <= price) {
                f.cs("Last bougth price: " + lastBPrice + " was smaller than current IS Updated: " + price)
                return price;
            }
        }

        async function balanceChanged(baseBalanceInQuote, quoteBalance, botNumber) {
            if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
                if (!more) {
                    more = true;
                    bougthPrice = await price
                    console.log("Bougth price updated: " + symbol);
                    time = await f.getTime()
                    f.sendMail("Price updated", JSON.stringify("price would be updated at: " + time + " on market: " + symbol));
                }
            }
        }

        let tradingFeeAbs;
        async function safeSale(tradingFeeP, bougthPrice, price, minProfitP, buysN) {  //returns holding status
            totalFees = tradingFeeP * (buysN + 1);
            //f.cs("totalFees:" + totalFees);
            tradingFeeAbs = await f.part(totalFees, bougthPrice);
            //f.cs("tradingFeeAbs:" + tradingFeeAbs);
            minProfitAbs = await f.part(minProfitP, bougthPrice);
            //f.cs("minProfitAbs:" + minProfitAbs);
            sellPrice = await bougthPrice + tradingFeeAbs + minProfitAbs;         //minProfit
            //f.cs("sellPrice:" + sellPrice);
            if (!bougthPrice) {
                return true
            } else {
                if (sellPrice > price) {      //if bougthPrice is not high enough
                    r = true;    	//dont allow sell force holding
                } else {
                    r = false;           //allow sale of holding to parked
                }
            }
            return await r;
        }

        async function checkStopLoss(price, stopLossP, sellPrice, quoteCurrency) {  //force sale

            stopLossP += s.minProfitP   //stopLoss is calculated from sellPrice wich includes minProfit

            absStopLoss = await f.part(stopLossP, sellPrice);

            lossPrice = await sellPrice - await absStopLoss;
            loss = await sellPrice - price;
            relativeLoss = await f.percent(loss, sellPrice);

            if (lossPrice &&
                (quoteCurrency == s.fiatCurrency) &&    //uses stoploss only on fiat markets
                (price <= lossPrice)) {
                stopLoss = true   //sell ASAP!!!
            } else {
                //f.cs("hodl")
                stopLoss = false  //hodl
            }

            //globalStopLoss = await checkGlobalStopLoss(symbol, stopLoss)
            async function checkGlobalStopLoss(symbol, stopLoss) {
                //make symbols

                b = await f.splitSymbol(symbol, "first");
                q = await f.splitSymbol(symbol, "second");

                //check if all the stoploses are true
                let s = []
                let sls = []
                let stetje = 0
                for (i = 0; i < quo.length; i++) {
                    s[i] = await f.mergeSymbol(b, quo[i])
                    if (dbms.db[s[i]]) {
                        if (q == quo[i]) {   //current market
                            //f.cs("This "+ quo[i] +" is curent" )
                            sls[stetje] = await stopLoss    //fresh stopLoss
                            await dbms.saveStopLoss(symbol, await stopLoss)
                            //f.cs("stoplos for " + s[i] + " is: " + sls[stetje])
                            stetje++
                        } else {
                            sls[stetje] = await dbms.db[s[i]].stopLoss
                            //f.cs("stoplos for " + s[i] + " is: " + sls[stetje])
                            stetje++
                        }
                    } else {
                        //f.cs("No such market or disabled: " + s[i])
                    }
                }

                gsl = await up(sls);
                async function up(uppers) {
                    conds = Object.values(uppers);
                    function condition(currentValue) {
                        return currentValue > 0;    //set condition
                    }
                    return conds.every(condition)
                }
                //f.cs("number of conectors for this market: " + sls.length)
                //f.cs("raw: " + sls)
                return await gsl
            }

            //f.cs("globalStopLoss: " + globalStopLoss)

            //f.cs(stopLoss)
            return stopLoss     //stoploss
        }

        async function change1h(priceLog, tickerInMs, price, durationInMinutes) {
            index1h = await (f.minToMs(durationInMinutes) / tickerInMs) - 1
            price1h = await priceLog[index1h]
            diff = await price - price1h
            ch1h = await f.percent(diff, price1h)
            if (await ch1h) {
                return ch1h
            } else {
                return 0
            }
        }

        async function determinePrice(symbol) {  //bid for purchase //ask for sale
            let r = await dbms.readOrderType(symbol)
            if (r == "parked") {  //ready to buy
                price = await a.bid(symbol) //price for buying
            } else if ((r == "holding") || (r == "holding good")) { //
                price = await a.ask(symbol) //price for selling
            } else {
                price = await a.price(symbol);  //price for analysis
            }
            return price
        }

        //determineMarketType(symbol)
        async function determineMarketType(symbol) {// returns: af, qf, aq, qq

            first = f.splitSymbol(symbol, "first")
            second = f.splitSymbol(symbol, "second")

            function isQuote(cur) {
                let x
                for (var i in qs) {
                    if (cur == qs[i]) {
                        i++
                        x = true
                    }
                }
                !x ? x = false : ""
                return x
            }

            function checkType(cur) {
                if (cur == s.fiatCurrency) {
                    return "f"
                } else {
                    if (isQuote(cur)) {
                        return "q"
                    } else {
                        return "a"
                    }
                }
            }

            return marketType = checkType(first) + checkType(second)
        }

        let b, q
        async function updateAllBougthPrice(symbol) {
            //make symbols

            let bpq = []
            let s = []

            b = await f.splitSymbol(symbol, "first");
            q = await f.splitSymbol(symbol, "second");

            s[0] = await f.mergeSymbol(b, quo[0])   //ALT/USDT
            s[1] = await f.mergeSymbol(b, quo[1])   //ALT/BTC
            s[2] = await f.mergeSymbol(b, quo[2])   //ALT/ETH
            s[3] = await f.mergeSymbol(b, quo[3])   //ALT/BNB

            s[4] = await f.mergeSymbol(quo[1], quo[0])  //BTC/USDT
            s[5] = await f.mergeSymbol(quo[2], quo[0])  //ETH/USDT
            s[6] = await f.mergeSymbol(quo[3], quo[0])  //BNB/USDT

            s[7] = await f.mergeSymbol(quo[2], quo[1])    //ETH/BTC
            s[8] = await f.mergeSymbol(quo[3], quo[1])    //BNB/BTC
            s[9] = await f.mergeSymbol(quo[3], quo[2])    //BNB/ETH

            quo = [s.fiatCurrency, "BTC", "ETH", "BNB"]

            /*
            f.cs("q0: " + q0)
            f.cs("q1: " + q1)
            f.cs("q2: " + q2)
            f.cs("q3: " + q3)*/

            //f.cs("bpq: " + bpq)
            f.cs("quos: " + quo)
            //f.cs("bpq.lengtght: " + bpq.length)
            f.cs("s: " + s)
            //f.cs("s: " + s.length)

            f.cs("Updating all bougth prices except active market!")

            //get prices check and store them
            for (var i = 0; i < s.length; i++) {
                //f.cs("q" + i + ":" + quo[i])
                //f.cs("s" + i + ":" + s[i])

                bpq[i] = await a.price(s[i])    //get market
                if (bpq[i] && !(q == quo[i])) { //dont update on curent market
                    bpq[i] = await m.checkNewBougthPrice(s[i], bpq[i])    //check
                    await dbms.saveBougthPrice(s[i], bpq[i])    //store
                    console.log(await s[i] + ":" + await bpq[i])
                } else {
                    f.cs("fail: " + bpq[i])
                }
            }
        }

        async function resetAllBougthPrice(symbol) {

            quoteCurrency = f.splitSymbol(symbol, "second")
            baseCurrency = f.splitSymbol(symbol, "first")

            s0 = f.mergeSymbol(baseCurrency, q0)
            s1 = f.mergeSymbol(baseCurrency, q1)
            s2 = f.mergeSymbol(baseCurrency, q2)
            s3 = f.mergeSymbol(baseCurrency, q3)

            bpq0 = await a.price(s0)    //only check if market exists
            if (bpq0) {
                await dbms.saveBougthPrice(s0, 0)
                console.log(await s0 + ": bougthPrice reset to 0")
            } else {
                f.cs("no such market: " + bpq0)
            }

            bpq1 = await a.price(s1)
            if (bpq1) {
                await dbms.saveBougthPrice(s1, 0)
                console.log(await s1 + ": bougthPrice reset to 0")
            } else {
                f.cs("no such market: " + bpq1)
            }

            bpq2 = await a.price(s2)
            if (bpq2) {
                await dbms.saveBougthPrice(s2, 0)
                console.log(await s2 + ": bougthPrice reset to 0")
            } else {
                f.cs("no such market: " + bpq2)
            }

            bpq3 = await a.price(s3)
            if (bpq3) {
                await dbms.saveBougthPrice(s3, 0)
                console.log(await s3 + ": bougthPrice reset to 0")
            } else {
                f.cs("no such market: " + bpq3)
            }//*/
        }

        async function updateAllBuys(baseCurrency, write) {
            s0 = f.mergeSymbol(baseCurrency, q0)
            s1 = f.mergeSymbol(baseCurrency, q1)
            s2 = f.mergeSymbol(baseCurrency, q2)
            s3 = f.mergeSymbol(baseCurrency, q3)

            //let write = 0 //replace with this charachter

            //f.cs("reseting Buys for base group: "+baseCurrency)

            if (dbms.db[s0]) {
                await dbms.saveBuys(s0, write)
                f.cs("Buys for " + s0 + " saved")
            } else {
                f.cs("Cannot save buys for: " + s0)
            }

            if (dbms.db[s1]) {
                await dbms.saveBuys(s1, write)
                f.cs("Buys for " + s1 + " saved")
            } else {
                f.cs("Cannot save buys for: " + s1)
            }

            if (dbms.db[s2]) {
                await dbms.saveBuys(s2, write)
                f.cs("Buys for " + s2 + " saved")
            } else {
                f.cs("Cannot save buys for: " + s2)
            }

            if (dbms.db[s3]) {
                await dbms.saveBuys(s3, write)
                f.cs("Buys for " + s3 + " saved")
            } else {
                f.cs("Cannot save buys for: " + s3)
            }

        }

        async function resetAllBuys(baseCurrency) {
            s0 = await f.mergeSymbol(baseCurrency, q0)
            s1 = await f.mergeSymbol(baseCurrency, q1)
            s2 = await f.mergeSymbol(baseCurrency, q2)
            s3 = await f.mergeSymbol(baseCurrency, q3)

            let ch = 0 //replace with this charachter

            //f.cs("reseting Buys for base group: "+baseCurrency)

            if (dbms.db[s0]) {
                await dbms.saveBuys(s0, ch)
                f.cs("Buys for " + s0 + " reset")
            } else {
                f.cs("Cannot save buys for: " + s0)
            }

            if (dbms.db[s1]) {
                await dbms.saveBuys(s1, ch)
                f.cs("Buys for " + s1 + " reset")
            } else {
                f.cs("Cannot save buys for: " + s1)
            }

            if (dbms.db[s2]) {
                await dbms.saveBuys(s2, ch)
                f.cs("Buys for " + s2 + " reset")
            } else {
                f.cs("Cannot save buys for: " + s2)
            }

            if (dbms.db[s3]) {
                await dbms.saveBuys(s3, ch)
                f.cs("Buys for " + s3 + " reset")
            } else {
                f.cs("Cannot save buys for: " + s3)
            }

        }

        async function updateFCA(bougthPrice, buys, amount, symbol) {

            buys++
            DCAprice[buys] = bougthPrice

            DCAamount[buys] = amount

            totalCost
            DCAcost[buys]

            return valueInFiat
        }

        let market21a, market32a, market31a, market21b, market32b, market31b

        async function triArb(currency1, currency2, currency3) {
            market21a = await a.ask(f.mergeSymbol(currency2, currency1))  //CW
            market32a = await a.ask(f.mergeSymbol(currency3, currency2))  //CW
            market31a = await a.ask(f.mergeSymbol(currency3, currency1))  //CCW
            market21b = await a.bid(f.mergeSymbol(currency2, currency1))  //CCW
            market32b = await a.bid(f.mergeSymbol(currency3, currency2))  //CCW
            market31b = await a.bid(f.mergeSymbol(currency3, currency1))  //CW
            /*f.cs("market21a: " + await market21a)
            f.cs("market32a: " + await market32a)
            f.cs("market31a: " + await market31a)
            f.cs("market21b: " + await market21b)
            f.cs("market32b: " + await market32b)
            f.cs("market31b: " + await market31b)//*/

            f.cs("curencies: " + currency1 + " " + currency2 + " " + currency3)

            //CW
            let value1CW = 100
            let value2CW = value1CW / market21a //seling
            let value3CW = value2CW / market32a //seling
            let valueFinalCW = value3CW * market31b //buying
            profitCW = valueFinalCW - value1CW
            /*
                        await f.cs("value1CW: " + value1CW)
                        await f.cs("value2CW: " + value2CW)
                        await f.cs("value3CW: " + value3CW)*/
            await f.cs("valueFinalCW: " + valueFinalCW)


            //CCW
            let value1CCW = 100
            let value2CCW = value1CCW * await market21a //buying
            let value3CCW = value2CCW * await market32b //seling
            let valueFinalCCW = value3CCW / await market31b //seling
            profitCCW = valueFinalCCW - value1CCW
            /*
            await f.cs("value1CCW: " + value1CCW)
            await f.cs("value2CCW: " + value2CCW)
            await f.cs("value3CCW: " + value3CCW)*/
            await f.cs("valueFinalCCW: " + valueFinalCCW)

            minProf = 0.2
            if ((profitCW > minProf) || (profitCCW > minProf)) {
                if (valueFinalCW > valueFinalCCW) {
                    f.cs("profitCW: " + profitCW)
                    f.cs("go clock wise")
                    triArbOrderType = "CW"
                    logHistory(triArbOrderType + " " + currency1 + " " + currency2 + " " + currency3 + " " + (profitCW - minProf), 100)
                    return //triArbOrder(triArbOrderType, currency1, currency2, currency3, market21a, market31a)
                } else {
                    f.cs("profitCCW: " + profitCCW)
                    f.cs("go counter clock wise")
                    triArbOrderType = "CCW"
                    logHistory(triArbOrderType + " " + currency1 + " " + currency2 + " " + currency3 + " " + (profitCCW - minProf), 100)
                    return //triArbOrder(triArbOrderType, currency1, currency2, currency3, market21a, market31a)
                }
            } else {
                f.cs("no profit")
                triArbOrderType = "none"
                return "no profit"
            }
            //triArbOrder(triArbOrderType, currency1, currency2, currency3, market21a, market31a)

        }

        //let bal1, bal2, bal3

        //triArbOrder("CW", "USDT", "BTC", "TRX", market21a, market31a)
        async function triArbOrder(triArbOrderType, currency1, currency2, currency3, m12a, m13a) {

            //f.cs("M1: " + await m12a)
            //f.cs("M2: " + await m13a)
            // check for balances 

            bal1 = await a.balance(currency1)
            bal2 = await a.balance(currency2)
            bal3 = await a.balance(currency3)
            f.cs(bal1 + "----------------" + currency1)
            f.cs(bal2 + "----------------" + currency2)
            f.cs(bal3 + "----------------" + currency3)
            f.cs("order type:------------ " + triArbOrderType)

            let starter = getMax(bal1, bal2, bal3, await m12a, await m13a)
            f.cs("starter: " + starter)
            function getMax(value1, value2, value3, m12a, m13a) {
                f.cs("B1: " + value1)
                f.cs("B2: " + value2)
                f.cs("B3: " + value3)

                value2Q = value2 / m12a
                value3Q = value3 * m13a
                f.cs("VALUE2: " + value2Q)
                f.cs("VALUE3: " + value3Q)


                if (value1 > (value2Q || value3Q)) { // start with first currency
                    r = 1
                } else if (value2Q > (value1 || value3Q)) {
                    r = 2
                } else if (value3Q > (value1 || value2Q)) {
                    r = 3
                }
                return r
            }

            function spin(start) {
                for (x = start; i > 3; i++) {

                }
            }

            switch (triArbOrderType) {
                case "CW":
                    bal2 = await a.balance(currency2)
                    o1 = await a.buy(f.mergeSymbol(currency2, currency1), f.quoteToBase(bal2), market21a)
                    f.cs("o1:")
                    f.cs(o1)
                    if (o1.status = "closed") {

                        bal3 = await a.balance(currency3)
                        o2 = await a.buy(f.mergeSymbol(currency3, currency2), f.quoteToBase(bal3), market32a)
                        f.cs("o2:")
                        f.cs(o2)

                        if (o2.status = "closed") {
                            bal3 = await a.balance(currency3)
                            o3 = await a.sell(f.mergeSymbol(currency3, currency1), bal3, market31b)
                            if (o3.status = "closed") {

                                f.cs("o3:")
                                f.cs(o3)
                            } else {
                                f.cs("order3 not filled in time")
                            }
                        } else {
                            f.cs("order3 not filled in time")
                        }
                    } else {
                        f.cs("order3 not filled in time")
                    }
                    break;
                case "CCW":

                    bal2 = await a.balance(currency2)
                    o1 = await a.buy(f.mergeSymbol(currency2, currency1), f.quoteToBase(bal2), market21a)
                    f.cs("o1:")
                    f.cs(o1)
                    if (o1.status = "closed") {

                        bal3 = await a.balance(currency3)
                        o2 = await a.buy(f.mergeSymbol(currency3, currency2), f.quoteToBase(bal3), market32a)
                        f.cs("o2:")
                        f.cs(o2)

                        if (o2.status = "closed") {
                            bal3 = await a.balance(currency3)
                            o3 = await a.sell(f.mergeSymbol(currency3, currency1), bal3, market31b)
                            if (o3.status = "closed") {

                                f.cs("o3:")
                                f.cs(o3)
                            } else {
                                f.cs("order3 not filled in time")
                            }
                        } else {
                            f.cs("order3 not filled in time")
                        }
                    } else {
                        f.cs("order3 not filled in time")
                    }


                    done12a = await a.buy(f.mergeSymbol(currency2, currency1), quoteBalanceInBase * portion, market21a)
                    if (done12a) {
                        done23a = await a.buy(f.mergeSymbol(currency3, currency2), quoteBalanceInBase * portion, market32a)
                        if (done23a) {
                            done13b = await a.buy(f.mergeSymbol(currency3, currency1), quoteBalanceInBase * portion, market31b)
                        }
                    }

                    done13a = await a.buy(f.mergeSymbol(currency2, currency1), quoteBalanceInBase * portion, market31a)

                    done32a ? done32a = await a.buy(f.mergeSymbol(currency3, currency2), quoteBalanceInBase * portion, market32a) : ""

                    done23a ? done13b = await a.buy(f.mergeSymbol(currency3, currency1), quoteBalanceInBase * portion, market31b) : ""

                    break;
                default:
                    f.cs("No TriArb")
                    break;

            }
            return "OK"
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
            logHistory: logHistory,
            checkNewBougthPrice: checkNewBougthPrice,
            updateAllBougthPrice: updateAllBougthPrice,
            determinePrice: determinePrice,
            resetAllBougthPrice: resetAllBougthPrice,
            resetAllBuys: resetAllBuys,
            updateAllBuys: updateAllBuys,
            determineMarketType: determineMarketType
        }
    }
    const m = modul();

    loop(symbol);
    botNo[botNumber] = setInterval(function () { loop(symbol) }, ticker);
    async function loop(symbol) {

        let orderType = "none";  //loop output

        minAmount = await a.minAmount(symbol);
        baseCurrency = await f.splitSymbol(symbol, "first");
        quoteCurrency = await f.splitSymbol(symbol, "second");
        baseBalance = await a.balance(baseCurrency);
        quoteBalance = await a.balance(quoteCurrency);
        price = await m.determinePrice(symbol)
        ask = await a.ask(symbol)
        bid = await a.bid(symbol)

        priceFiat = await a.price(s.fiatMarket)

        wallet = await a.wallet();
        change24hP = await a.change(symbol);
        volume = await a.volume(symbol);

        baseBalanceInQuote = await m.baseToQuote(baseBalance, price);
        quoteBalanceInBase = await m.quoteToBase(quoteBalance, price);

        let r1 = await m.selectCurrencyNew(baseBalance, quoteBalance, minAmount, baseBalanceInQuote)
        sale = r1.sale
        more = r1.more
        purchase = r1.purchase

        bougthPrice = await dbms.readBougthPrice(symbol)
        marketType = await m.determineMarketType(symbol)

        let buys = await dbms.readBuys(symbol)

        hold = await m.safeSale(tradingFeeP, bougthPrice, price, minProfitP, buys);

        stopLoss = await m.checkStopLoss(price, stopLossP, sellPrice, quoteCurrency);

        indicator = await indicators(price, volume, change24hP, bid, ask)
        async function indicators(price, volume, change24hP, bid, ask) {
            //market data colection
            logAll = await m.loger(price, 555, logAll);
            logBids = await m.loger(bid, 50, logBids)
            logAsks = await m.loger(ask, 50, logAsks);
            log24hP = await m.loger(change24hP, 3, log24hP);
            logVol = await m.loger(volume, 10, logVol);
            //logRSI = await m.loger(volume, 22, logRSI);

            logMA3 = await m.loger(price, 3, logMA3); //for all MAs
            logMA20 = await m.loger(price, 20, logMA20); //for all MAs
            logMA30 = await m.loger(price, 30, logMA30); //for all MAs
            logMA100 = await m.loger(price, 100, logMA100); //for all MAs
            logMA200 = await m.loger(price, 200, logMA200); //for all MAs

            //technical analysis
            MA3 = await TI.ma(logMA3);   //MA of last 3 prices
            MA20 = await TI.ma(logMA20) //MA of last 30 prices
            MA30 = await TI.ma(logMA30) //MA of last 30 prices
            MA100 = await TI.ma(logMA100);  //MA of last 200 prices
            MA200 = await TI.ma(logMA200);  //MA of last 200 prices

            RSI = await TI.rsi(logAll, 16); //RSI (30,70)

            logRSIMA = await m.loger(MA3, 15, logRSIMA)
            RSIMA = await TI.rsi(logRSIMA, 14); //RSI (30,70)

            MACD = await TI.macd(logAll);   //standard MACD
            MACDRev = await TI.macdReverse(logAll);
            logMacd = await m.loger(MACD, 3, logMacd);
            MACDMA = await TI.ma(logMacd);  //MA of MACD

            DMACD = await TI.doubleMacd(logAll);    //double length of input MACD
            DMACDRev = await TI.doubleMacdReverse(logAll);
            logDMacd = await m.loger(DMACD, 3, logDMacd);
            DMACDMA = await TI.ma(logDMacd);  //MA of DMACD


            change1hP = await m.change1h(logAll, ticker, price, 60)  //price change percentage in duration
            change6hP = await m.change1h(logAll, ticker, price, 360)  //price change percentage in duration
            MA3change24hP = await TI.ma(log24hP);  //MA3 of 24h price change

            MAVol = await TI.ma(logVol);    //MA of last 5 Volumes

            //rang = await globalRang(MAVol, symbol, botNumber, 2);
            //rang = await globalRang(change1hP, symbol, botNumber, 10);
            //rang2 = await globalRang(MAVol, symbol, botNumber, 10)
            //rang = await globalRang2(MACDMA, symbol, botNumber, 3)
            rang = await globalRang2(change1hP, symbol, botNumber, 3)

            logVolMACD = await m.loger(volume, 40, logVolMACD);
            MACDVol = await TI.macd(logVolMACD);    //MACD of MA5

            vwap = await a.vwap(symbol)
            vwapS = await simpleVwap(vwap, price)
            async function simpleVwap(vwap, price){
                if(price > vwap){
                    return vwap
                }else{
                    return -1 * vwap
                }
            }

            logVwap = await m.loger(vwap, 3, logVwap);
            vwapMA = await TI.ma(logVwap);    //MA of last 5 Volumes reversed

            return {
                uppers: {
                    MA3: MA3,
                    //MA20: MA20,
                    //MA30: MA30,
                    //MA100: MA100,
                    //MA200: MA200,
                    //MACD: MACD,
                    //MACDMA: MACDMA,
                    //MACDRev: MACDRev,
                    //RSI: RSI,
                    //RSIMA: RSIMA,
                    //ao: ao,
                    //vwap: vwap,
                    vwapS:vwapS,
                    //vwapMA: vwapMA,
                    //DMACD: DMACD,
                    //DMACDMA: DMACDMA,
                    //DMACDRev: DMACDRev,
                    //change1hP: change1hP,
                    //rank: rang,
                },
                downers: {
                    MA3: MA3
                },
                all: {
                    MA3: MA3,
                    MA30: MA30,
                    MA100: MA100,
                    MA200: MA200,
                    change1hP: change1hP,
                    change6hP: change6hP,
                    change24hP: change24hP,
                    MA3change24hP: MA3change24hP,
                    RSI: RSI,
                    MACD: MACD,
                    MACDMA: MACDMA,
                    MAVol: MAVol,
                    MACDVol: MACDVol,
                    MACDRev: MACDRev,
                    DMACD: DMACD,
                    DMACDMA: DMACDMA,
                    DMACDRev: DMACDRev,
                    vwap: vwap,
                    vwapS:vwapS,
                    vwapMA: vwapMA,
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

        //triArbOrderType = await m.triArb(s.fiatCurrency, s.quoteCurrency, baseCurrency)
        //triArbOrder(triArbOrderType, currency1, currency2, currency3)

        let sts = "none";
        let triUSDTBTC,
            triUSDTETH,
            triUSDTBNB,
            triETH,
            triBNB

        //runTri()
        async function runTri() {
            triUSDTBTC = await m.triArb("USDT", "BTC", baseCurrency)
            triUSDTETH = await m.triArb("USDT", "ETH", baseCurrency)
            triUSDTBNB = await m.triArb("USDT", "BNB", baseCurrency)
            triETH = await m.triArb("BTC", "ETH", baseCurrency)
            triBNB = await m.triArb("BTC", "BNB", baseCurrency)
            /*f.cs("triUSDTBTC___OK: " + triUSDTBTC)
            f.cs("triUSDTETH___OK: " + triUSDTETH)
            f.cs("triUSDTBNB___OK: " + triUSDTBNB)
            f.cs("triETH____OK: " + triETH)
            f.cs("triBNB____OK: " + triBNB)//*/
        }

        let pullOut
        if (indicator.all.vwapMA <= 0) {    //bearish indicator
            //pullOut = true  //market goes down disable buy only pulout sale
            pullOut = s.pullOut
        } else {
            pullOut = s.pullOut
        }

        // make strategic decision about order type
        orderType = await makeOrder(purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders, upSignal, downSignal, baseCurrency, buys);
        async function makeOrder(purchase, sale, stopLoss, hold, symbol, baseBalance, price, enableOrders, upSignal, downSignal, baseCurrency, buys) { //trendMacdTrend, MAVol
            if (purchase && !sale && upSignal /*&& !hold && !stopLoss*/) {// buy 
                !pullOut && enableOrders ?
                    ret = await a.buy(symbol, quoteBalanceInBase * portion, price) :    //real
                    ret = await f.fOrder(symbol, quoteBalanceInBase * portion, price)   //sim*/
                sts = await ret.status
                if (sts == "closed") {
                    bougthPrice = await m.checkNewBougthPrice(symbol, await ret.bougthPrice)
                    await dbms.saveBougthPrice(symbol, bougthPrice)
                    orderType = "bougth"
                    await m.updateAllBougthPrice(symbol)

                    buys++                                      //buys
                    await m.updateAllBuys(baseCurrency, buys)   //buys
                    //bougthPrice = await m.updateDCA(bougthPrice, buys, amount)   //dca

                } else {
                    orderType = "parked"
                }
            } else if (sale && !hold && !stopLoss && downSignal) {    //sell good
                enableOrders ?
                    ret = await a.sell(symbol, baseBalance, price) :    //real
                    ret = await f.fOrder(symbol, baseBalance, price);   //sim
                sts = await ret.status
                if (sts == "closed") {
                    bougthPrice = 0
                    //await m.resetAllBougthPrice(symbol)
                    await m.resetAllBuys(baseCurrency)                //buys
                    orderType = "sold"
                } else {
                    orderType = "holding"
                }
            } else if (sale && hold && stopLoss && downSignal) {    //sell bad stopLoss
                enableOrders ? "" :
                    console.log('loss sell orders disabled');
                enableOrders ?
                    //ret = await a.sellMarket(symbol, baseBalance, price) :    //real
                    ret = await a.sell(symbol, baseBalance, price) :    //real
                    ret = await f.fOrder(symbol, baseBalance, price);   //sim
                sts = await ret.status
                if (sts == "closed") {
                    bougthPrice = 0
                    //await m.resetAllBougthPrice(symbol)
                    await m.resetAllBuys(baseCurrency)                //buys
                    orderType = "lossed";
                } else {
                    orderType = "holding"
                }
            } else if (sale && hold && !stopLoss) { //holding fee NOT covered

                /*
                ret = await a.sell(symbol, baseBalance, price * 2) //sim
                sts = await ret.status  //order finished
                f.cs("sts: "+sts)
                if (sts == "closed") {
                    f.cs("order filled")
                    f.cs("bougthPrice: "+await ret.bougthPrice)
                    bougthPrice = 0
                    f.cs("bougthPrice: "+bougthPrice)
                    orderType = "sold"
                } else {
                    f.cs("bougthPrice: "+await ret.bougthPrice)
                    f.cs("order canceled")
                    orderType = "holding"
                }                         
                f.cs("orderType: "+orderType)  
                console.log('sim end')          //sim end*/

                //m.updateAllBougthPrice(symbol)  //dev

                //enableOrders?"":bougthPrice = await m.checkNewBougthPrice(symbol, price)     //dev

                orderType = "holding";
            } else if (sale && !hold && !stopLoss) {//holding fee covered
                //enableOrders?"":bougthPrice = await m.checkNewBougthPrice(symbol, price)     //dev
                orderType = "holding good";
            } else if (purchase) {
                /*
                ret = await a.buy(symbol, quoteBalanceInBase * portion, price / 2) //sim
                sts = await ret.status  //order finished
                f.cs("sts: " + sts)
                if (sts == "closed") {
                    f.cs("order filled")
                    f.cs("bougthPrice: " + await ret.bougthPrice)
                    bougthPrice = await m.checkNewBougthPrice(symbol, await ret.bougthPrice)
                    f.cs("bougthPrice: " + bougthPrice)
                    orderType = "sold"
                } else {
                    f.cs("order canceled")
                    orderType = "holding"
                }
                f.cs("orderType: " + orderType)
                console.log('sim end')          //sim end*/

                //m.resetAllBougthPrice(symbol)   //dev not good
                //m.resetAllBuys(baseCurrency)                //dev buys

                //bougthPrice = 0     //dev
                //await dbms.saveBougthPrice(symbol, bougthPrice)
                //await m.updateAllBougthPrice(symbol)    //dev

                orderType = "parked";
            } else {
                //enableOrders?"":m.resetAllBougthPrice(symbol)
                //bougthPrice = 0   //dev
                orderType = "still none";
            }
            return orderType;
        }

        let relativeProfit = await f.percent(price - sellPrice, sellPrice);
        let absoluteProfit = await f.part(relativeProfit, quoteBalance);
        let absoluteProfit2 = await f.part(relativeProfit, baseBalanceInQuote);

        //main console output
        marketInfo = await makeInfo()
        async function makeInfo() {
            return {
                No: botNumber,
                //fiatMarket: s.fiatMarket,
                fiatPrice: priceFiat,
                //fiatProfit: (absoluteProfit * priceFiat),
                //fiatProfit2: (absoluteProfit2 * priceFiat),
                symbol: symbol,
                time: f.getTime(),
                //base: baseCurrency,
                //quote: quoteCurrency,
                relativeProfit: (relativeProfit + minProfitP),
                //absoluteProfit: absoluteProfit,
                //absoluteProfit2: absoluteProfit2,
                DeusGroup: "___________________________",
                fiatPrice: priceFiat,
                marketType: marketType,
                //fiatProfit: (absoluteProfit * priceFiat),
                //fiatProfit2: (absoluteProfit2 * priceFiat),
                minAmount: minAmount,
                baseBalance: baseBalance,
                baseBalanceInQuote: baseBalanceInQuote,
                quoteBalance: quoteBalance,
                quoteBalanceInBase: quoteBalanceInBase,
                ticker: tickerMinutes,
                minProfit: s.minProfitP,
                stopLossP: stopLossP,
                enabled: enableOrders,
                //pullOut: pullOut,
                vwap: indicator.all.vwap,
                change1hP: indicator.all.change1hP,
                MrPrice: "_____________________________",
                sellPrice: sellPrice,
                price: price,
                bougthPrice: bougthPrice,
                lossPrice: lossPrice,
                buys: buys,
                FSociety: "____________________________",
                purchase: purchase,
                more: more,
                status: sts,
                upSignal: upSignal,
                uppers: indicator.uppers,
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
        }
        //mailer
        await mailInfo(orderType);
        async function mailInfo(orderType) {
            if (await orderType == "sold") {
                f.sendMail("Sold Info", JSON.stringify(marketInfo));
            } else if (await orderType == "bougth") {
                //f.sendMail("Bougth Info", JSON.stringify(marketInfo));
            } else if (await orderType == "lossed") {
                f.sendMail("Lossed Info", JSON.stringify(marketInfo));
            } else if (await orderType == "canceled") {     //never hapens
                f.sendMail("Canceled", JSON.stringify(marketInfo));
            } else if (await orderType == "failed") {
                f.sendMail("failed", JSON.stringify(marketInfo));
            } else if (await orderType == "holding") {
                //f.sendMail("holding", JSON.stringify(marketInfo));
            } else if (await orderType == "holding good") {
                //f.sendMail("holding good", JSON.stringify(marketInfo));
            } else if (await orderType == "parked") {
                //f.sendMail("parked", JSON.stringify(marketInfo));
            } else if (await orderType == "still none" || "none") {
                return 0
            } else {
                f.sendMail("mail error", JSON.stringify(marketInfo));
            }
        }

        await dbms.saveOrderType(symbol, marketInfo.orderType)

        console.dir(marketInfo);
        //await f.cs(marketInfo)
        return marketInfo;
    }
    return marketInfo;
}

//constants and variables
exports.ticker = ticker
exports.enableOrders = enableOrders
exports.alts = alts

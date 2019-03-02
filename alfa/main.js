//requirements

let a = require("./api.js");
let f = require("./funk.js");
let TI = require("./ti.js");

// init

const ticker = 1;
const stopLossP = 2;
const stopLossF = 1;
const altBots = 8;
const quotes = ["BTC/USDT", "BNB/USDT", "ETH/USDT", "BNB/BTC", "ETH/BTC", "BNB/ETH"];

const numOfBots = altBots + quotes.length;
const delay = (ticker / numOfBots) * 60000;
const enableOrders = true;

let botNo = new Array();
let bestBuy = new Array();

//  main setup
let exInfo;
setup();
async function setup() {
    exInfo = a.exInfo();
    tradingFeeP = exInfo.feeMaker;
    f.cs(exInfo);
    f.sendMail("Restarting at: "+f.getTime(),"RUN!")
    bestBuy = await a.bestbuy();
    //f.csL(bestBuy, 10);
    await setBots(bestBuy);
}

// set bots
let b;
function setBots(arr) {
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
    let x1 = 0;
    function cunt1() {
        x1++;
        return x1;
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

    /*
    setTimeout(function () { bot(quotes[0], ticker, "pingPong", stopLossF, 1) }, count());
    setTimeout(function () { bot(quotes[1], ticker, "pingPong", stopLossF, 2) }, count());
    setTimeout(function () { bot(quotes[2], ticker, "pingPong", stopLossF, 3) }, count());
    setTimeout(function () { bot(quotes[3], ticker, "pingPong", stopLossF, 4) }, count());
    setTimeout(function () { bot(quotes[4], ticker, "pingPong", stopLossF, 5) }, count());
    setTimeout(function () { bot(quotes[5], ticker, "pingPong", stopLossF, 6) }, count());
    */

    for (i = 0; i < quotes.length; i++) {     //run Fiat bots
        f.cs("fiating " + x2);
        setTimeout(function () { bot(quotes[cunt2()], ticker, "pingPong", stopLossP, cunt3()) }, count());
    }
    
    for (i = 0; i < altBots; i++) {     //run ALT bots
        f.cs("alting " + x);
        setTimeout(function () { bot(arr[cunt()].market, ticker, "pingPong", stopLossP, quotes.length + cunt1()) }, count());
    }
}

// clear bots
let cleared = false;
function clear() {
    if (!cleared) {
        f.cs("HALT!!!" + b);
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

//bot("EOS/USDT", 0.05, "pingPong", 1, 77);
function bot(symbol, ticker, strategy, stopLossP, botNumber) {

    let minProfitP = 0.1;        //holding addition //setting

    let amountQuote;    //baseToQuote
    let amountBase;     //amountQuote

    let sale = false;       //selectCurrency
    let purchase = false;  //selectCurrency
    let baseBalanceInQuote; //selectCurrency
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
            } else if ((baseBalanceInQuote < quoteBalance) && (baseBalance > minAmount)) {    //can buy
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
            if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
                if (!more) {
                    bougthPrice = price;
                    more = true;
                    //console.log("Bougth price updated: " + more);
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
        function makeOrder(trendMACD, trendRSI, trendUD, trend24hP, purchase, sale, stopLoss, hold, symbol, baseBalance,quoteBalance, price) { //purchase,sale,hold,stopLoss,price,symbol,baseBalance,quoteBalance
            if (purchase && (trendUD > 0) && (trend24hP)) {    // buy with RSI and MACD (rsi > 0) | (macd >= 0) && (c24h >= 0)
                orderType = "bougth";
                bougthPrice = price;    //dev
                enableOrders ? a.buy(symbol, quoteBalance, price) : console.log('buy orders disabled');
            } else if (sale && !hold && !stopLoss && (trendUD < 0) && (trendMACD <= 0)) {         //sell good
                orderType = "sold";
                //bougthPrice = price;    
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
        return {
            makeOrder: makeOrder,
            checkStopLoss: checkStopLoss,
            safeSale: safeSale,
            baseToQuote: baseToQuote,
            quoteToBase: quoteToBase,
            selectCurrency: selectCurrency,
            loger: loger,
            balanceChanged: balanceChanged,
        };
    }
    let m = modul();

    function runStrategy(strategy) {
        switch (strategy) {
            case "pingPong":
                pingPong();
                break;
            case "macdRsi":
                macdRsi();
                break;
            case "macd":
                macd();
                break;
        }
    }

    loop(symbol, ticker, strategy);
    botNo[b] = setInterval(function () { loop(symbol, ticker, strategy) }, f.minToMs(ticker));
    async function loop(symbol, ticker, strategy) {
        minAmount = await a.minAmount(symbol);
        baseCurrency = await f.splitSymbol(symbol, "first");
        quoteCurrency = await f.splitSymbol(symbol, "second");
        baseBalance = await a.balance(baseCurrency);
        quoteBalance = await a.balance(quoteCurrency);
        change24hP = await a.change(symbol);

        price = await a.price(symbol);
        baseBalanceInQuote = await m.baseToQuote(baseBalance, price);
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

        orderType = await m.makeOrder(trendMACD, trendRSI, trendUD, change24hP, purchase, sale, stopLoss, hold, symbol, quoteBalance, price, );

        //await runStrategy(strategy);

        await sim();
        function sim() {
            c++;
            //f.cs("C:" + c);
            if (c >= 5) {
                f.cs("Stoppping!!!" + b);
                clear();
                //clearInterval(botNo[b]);
            }
        }

        let marketInfo = {
            No: b,
            time: f.getTime(),
            baseCurrency: baseCurrency,
            quoteCurrency: quoteCurrency,
            baseBalance: baseBalance,
            quoteBalance: quoteBalance,
            price: price.toFixed(8),
            change24hP: change24hP,
            baseBalanceInQuote: baseBalanceInQuote.toFixed(8),
            bougthPrice: bougthPrice,
            sale: f.boolToInitial(sale),
            purchase: f.boolToInitial(purchase),
            more: f.boolToInitial(more),
            hold: f.boolToInitial(hold),
            stopLoss: f.boolToInitial(stopLoss),
            minAmount: minAmount,
            trendUD: trendUD,
            trendRSI: trendRSI,
            trendMACD: trendMACD,
            orderType: orderType,
        }
        return f.cs(marketInfo);
    }
}


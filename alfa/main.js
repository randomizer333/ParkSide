//requirements

let a = require("./api.js");
let f = require("./funk.js");
let TI = require("./ti.js");

// init

let enableOrders = false;
let botNo = new Array();

//  main setup
let exInfo;
setup();
async function setup() {
    exInfo = a.exInfo();
    tradingFeeP = exInfo.feeMaker;
    f.cs(exInfo);
}

// market selector
function selector() {

}

// main loop

bot("EOS/USDT", 0.05, "pingPong", 1, 77);
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
    let bougthPrice;//balanceChanged

    let sellPrice;  //safeSale
    let hold;       //safeSale

    let stopLoss;   //checkStopLoss

    let c = 0;  //sim
    let b = botNumber;  //clearInterval(botNo[b])

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
        function balanceChanged(baseBalanceInQuote, quoteBalance, bougthPrice, price) {
            if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
                if (!more) {
                    bougthPrice = price;
                    more = true;
                    console.log("Bougth price updated: " + more);
                }
            }

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
        function makeOrder(trendMACD, trendRSI, trendUD, change24hP,purchase,sale,stopLoss,hold,symbol,buyAmount,price) { //purchase,sale,hold,stopLoss,price,symbol,baseBalance,quoteBalance
            if (purchase && (trendUD > 0) && (trend24hP)) {    // buy with RSI and MACD (rsi > 0) | (macd >= 0) && (c24h >= 0)
                orderType = "bougth";
                enableOrders ? order("buy", symbol, buyAmount, price) : console.log('buy orders disabled');
            } else if (sale && !hold && !stopLoss && (trendUD < 0) && (trendMACD <= 0)) {         //sell good
                orderType = "sold";
                enableOrders ? order("sell", symbol, sellAmount, price) : console.log('sell orders disabled');
            } else if (sale && hold && stopLoss /*&& (trend2 < 0)*/) {                          //stopLoss sell bad
                orderType = "lossed";
                enableOrders ? order("sell", symbol, sellAmount, price) : console.log('loss sell orders disabled');
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
            makeOrder:makeOrder,
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
        await m.balanceChanged(baseBalanceInQuote, quoteBalance, more, bougthPrice, price);
        purchase = await m.selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);

        hold = await m.safeSale(tradingFeeP, bougthPrice, price);
        stopLoss = await m.checkStopLoss(price, stopLossP, sellPrice);

        logUD = await m.loger(price, 5, logUD);
        trendUD = await TI.upDown(price, logUD);
        logRSI = await m.loger(price,15,logRSI);
        trendRSI = await TI.rsi(logRSI);
        logMACD = await m.loger(price,77,logMACD);
        trendMACD = await TI.macd(logMACD);

        orderType = await m.makeOrder(trendMACD,trendRSI,trendUD,change24hP,purchase,sale,stopLoss,hold,symbol,quoteBalance,price);

        //await runStrategy(strategy);

        function sim() {
            c++;
            f.cs("C:" + c);
            if (c >= 5) {
                f.cs("Stoppping!!!!!!!!!!!!!!")
                clearInterval(botNo[b]);
            }
        }
        //await sim();
        let marketInfo = {
            time: f.getTime(),
            baseCurrency: baseCurrency,
            quoteCurrency: quoteCurrency,
            baseBalance: baseBalance,
            quoteBalance: quoteBalance,
            price: price,
            change24hP:change24hP,
            baseBalanceInQuote: baseBalanceInQuote,
            sale: f.boolToInitial(sale),
            purchase: f.boolToInitial(purchase),
            more: f.boolToInitial(more),
            hold: f.boolToInitial(hold),
            stopLoss: f.boolToInitial(stopLoss),
            minAmount: minAmount,
            trendUD: trendUD,
            trendRSI: trendRSI,
            trendMACD: trendMACD,
            orderType:orderType,
        }
        return f.cs(marketInfo);
    }
}


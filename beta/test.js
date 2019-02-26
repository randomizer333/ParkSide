//requirements

let a = require("./api.js");
let f = require("./funk.js");

// init

let more = false;       //selectCurrency

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

bot("BTC/USDT", 0.1, "pingPong");
function bot(symbol, ticker, strategy) {

    let minProfitP = 0.1;        //holding addition //setting

    let amountQuote;
    let amountBase;

    let sale = false;       //selectCurrency
    let purchase = false;  //selectCurrency
    let baseBalanceInQuote; //selectCurrency

    let logUD = new Array();    //loger
    let logMACD = new Array();  //loger
    let logRSI = new Array();   //loger

    let price;
    let bougthPrice;

    let sellPrice;  //safeSale
    let hold;       //safeSale
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
                purchase = false;
            } else if ((baseBalanceInQuote < quoteBalance) && (baseBalance > minAmount)) {    //can buy
                purchase = true;
                sale = false;
                more = false;
            } else {
                purchase = false;
                sale = false;
                //f.cs("Too low!");
            }
        }
        function loger(value, length, array) {        //log FILO to array
            let counter;         //d   
            while (array.length >= length) {
                array.pop();
            }
            array.unshift(value);
            counter++;    //d
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
        function stopInterval(loopName) {
            clearInterval(loopName);
        }
        function safeSale(tradingFeeP, bougthPrice, price) {  //returns holding status
            feeDouble = tradingFeeP * 2;
            tradingFeeAbs = f.part(feeDouble, bougthPrice);
            minProfitAbs = f.part(minProfitP, bougthPrice);
            sellPrice = bougthPrice + tradingFeeAbs + minProfitAbs;         //minProfit
            if (sellPrice > price) {      //if bougthPrice is not high enough
                return true;    	//dont allow sell force holding
            } else {
                return false;           //allow sale of holding to parked
            }
        }

        return {
            safeSale: safeSale,
            stopInterval: stopInterval,
            baseToQuote: baseToQuote,
            quoteToBase: quoteToBase,
            selectCurrency: selectCurrency,
            loger: loger,
            balanceChanged: balanceChanged,
        };
    }
    let m = modul();

    let stor = new Array();     //storage for direction

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
    setInterval(function () { loop(symbol, ticker, strategy) }, f.minToMs(ticker));
    async function loop(symbol, ticker, strategy) {
        price = await a.price(symbol);
        minAmount = await a.minAmount(symbol);
        baseCurrency = await f.splitSymbol(symbol, "first");
        quoteCurrency = await f.splitSymbol(symbol, "second");
        baseBalance = await a.balance(baseCurrency);
        quoteBalance = await a.balance(quoteCurrency);
        baseBalanceInQuote = await m.baseToQuote(baseBalance, price);
        //await m.balanceChanged(baseBalanceInQuote, quoteBalance, more, bougthPrice, price);
        await m.selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote);
        hold = await m.safeSale(tradingFeeP, bougthPrice, price);
        logUD = await m.loger(price, 5, logUD);
        //f.cs(await logUD);
        //await runStrategy(strategy);


        let marketInfo = {
            time: f.getTime(),
            baseCurrency: baseCurrency,
            quoteCurrency: quoteCurrency,
            baseBalance: baseBalance,
            quoteBalance: quoteBalance,
            price: price,
            baseBalanceInQuote: baseBalanceInQuote,
            sale: f.boolToInitial(sale),
            purchase: f.boolToInitial(purchase),
            more: f.boolToInitial(more),
            hold: f.boolToInitial(hold),
            minAmount: minAmount,
        }
        return f.cs(marketInfo);
    }
}


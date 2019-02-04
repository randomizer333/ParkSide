//Beta version of cryptocurrency trading bot Parkside

//Architecture of application
/*Architecture:
                init
                functions
                API functions
                runtime
                setup
                loop
*/

//select best currency
//set two bots
//run two bots
//stop bots
//restart

let f = require('./funk.js');           //connect to module functions
//let b = require("./bot2.js");
let ccxt = require('ccxt');             //connect to ccxt node.js module
let keys = require("../keys.json");      //keys file location

//init setup
var fiat = "USDT"; //USDT,EUR
var bougthPrice = 0.00000001;  //set bougth price
var stopLossP = 1;      //if it drops for stopLossP percentage sell ASAP
var stopLossF = 0.5;      //sell if crypto quote goes down 1%,10%,100%
var numOfBots = 1;
let fetchTime = 500;//minimum 100
var ticker = 1;   //ticker time in minutes  //DEV
let enableOrders = true;//false;
let quote;// = ["BTC", "ETH", "BNB"];
var portf = [];         //array of currencies owned
let exS = false;    //existence of fiat symbol
let alt;
let quote;

//main void
console.log("Module CCXT version: " + ccxt.version);
console.log("Available exchanges: " + ccxt.exchanges);

function counter() {       //defines next time delay
    //var delay = 5000 //miliseconds
    //a = 0;
    var r = a * delay;
    a++;
    return r;
}
let delay = (ticker / numOfBots) * 60000;
let a = 0;  //counter

let exchange;
let exchangeName = "binance";
switch (exchangeName) {
    case "bitstamp":
        exchange = new ccxt.bitstamp({
            apiKey: keys.bitstamp.apiKey,
            secret: keys.bitstamp.secret,
            uid: keys.bitstamp.uid
        });
        break;
    case "poloniex":
        exchange = new ccxt.poloniex({
            apiKey: keys.poloniex.apiKey,
            secret: keys.poloniex.secret,
        });
        break;
    case "bittrex":
        exchange = new ccxt.bittrex({
            apiKey: keys.bittrex.apiKey,
            secret: keys.bittrex.secret,
        });
        break;
    case "coinbase":
        exchange = new ccxt.coinbase({
            apiKey: keys.coinbase.apiKey,
            secret: keys.coinbase.secret,
        });
        break;
    case "binance":
        exchange = new ccxt.binance({
            apiKey: keys.binance.apiKey,
            secret: keys.binance.secret,
        });
        break;
    case "hitbtc":
        exchange = new ccxt.hitbtc({
            apiKey: keys.hitbtc.apiKey,
            secret: keys.hitbtc.secret,
        });
        break;
    case "bitmex":
        exchange = new ccxt.bitmex({
            apiKey: keys.bitmex.apiKey,
            secret: keys.bitmex.secret
        })
        break;
}

function fetchBalances() {        //loads ticker of a symbol a currency pair
    exchange.fetchBalance().then((results) => {
        r = results;
        //cs(r);
        curs = Object.keys(r);
        //cs(curs);
        //curs = Object.keys(r.info);     //array of all currencies
        //bals = Object.values(r.LTC);

        vals = Object.values(r.total);
        //cs(vals);

        portfolio();
        function portfolio() {
            var j = 0;
            for (i = 0; i < vals.length; i++) {
                if (vals[i] > 0) {
                    portf[j] = curs[i + 1];
                    bals[j] = vals[i];
                    j++;
                }
            }
            f.cs("Currency(" + portf.length + ")  Balance");
            for (i = 0; i < portf.length; i++) {
                f.cs(portf[i] + "           " + bals[i]);
            }
            return portf, bals;
        }
        return r;
    }).catch((error) => {
        console.error(error);
    })
}
var curs = [];
var vals = [];
var bals = [];
fetchBalances();

function stopLoop(fu) { //stops a setInterval function
    clearInterval(fu);
    f.cs("loop stopped");
    q = 1;
}

var q = 1;
var ff1 = f1();// = setInterval(f1, 1000);
let bestBuy;
//let ff = [setInterval(f1, 500),setInterval(f2, 500),setInterval(f3, 500)]
function f1() {
    function fetch24hs() {
        function loadMarks() {  //loads all available markets
            exchange.loadMarkets().then((results) => {
                var r = exchange.symbols;    //market simbols BTC/USDT
                //f.cs(results);
                syms = r;
                f.cs(syms.length);
                return r;
            }).catch((error) => {
                console.error(error);
            })
        }
        let syms = new Array();
        loadMarks();

        let chs = new Array();
        let stev = 0;
        let maxChange;
        function runFetchTicker() {
            //var bestBuy;
            for (let i = 0; i < syms.length; i++) {
                setTimeout(function timer() {
                    symbol = syms[i];
                    fetchTickers();
                }, i * fetchTime);    //delay
            }
            let w = 0;
            let logChs = new Array();
            function fetchTickers() {       //loads ticker of a symbol a currency pair
                exchange.fetchTicker(symbol).then((results) => {
                    var r = results;    //market simbols BTC/USDT
                    baseVolume = r.baseVolume;
                    quoteVolume = r.quoteVolume;
                    change24h = r.percentage;
                    priceChange = r.change;
                    isNaN(change24h) ? change24h = 0 : "";
                    !change24h ? change24h = 0 : "";
                    chs[stev] = change24h;
                    maxChange = f.getMaxOfArray(chs);
                    if (maxChange == chs[stev] && chs[stev] < 200) {
                        bestBuy = syms[stev];
                        function loger(value, length, array) {        //log FILO to array
                            while (array.length >= length) {
                                array.pop();
                            }
                            array.unshift(value);
                            return array;
                        }
                        loger(bestBuy, 5, logChs);
                        f.cs("BESTBUY: " + stev + " " + logChs + " " + maxChange + " %");
                    }
                    if (stev == syms.length - 2) { //exit condition
                        f.cs("BestBuy: " + bestBuy)
                        function setBots(sym) {
                            exS = false;
                            alt = f.splitSymbol(sym, "first");
                            quote = f.splitSymbol(sym, "second");
                            f.cs("A: " + alt + " Q: " + quote + " F: " + fiat);
                            let fSym = f.mergeSymbol(quote, fiat)
                            for (i = 0; i <= syms.length; i++) {    //checks for symbol existence
                                if (fSym == syms[i]) {
                                    exS = true;
                                    f.cs("Fiat symbol " + fSym + " exist: " + exS);
                                }
                            }
                            if (exS) {
                                runBot(quote, fiat, "PINGPONG", ticker, "binance", stopLossF, bougthPrice);
                            } else {
                                runBot(alt, quote, "PINGPONG", ticker, "binance", stopLossP, bougthPrice)
                                //setTimeout(function () { runBot(alt, quote, "PINGPONG", ticker, "binance", stopLossP, bougthPrice) }, counter());
                            }

                        }
                        //bestBuy = "BTC/USDT"; //dev
                        setBots(bestBuy);   //set and run bots
                        //setBots(logChs[1]);   //set and run 2nd best bots
                    }
                    //f.cs(stev+" "+syms[stev]+" "+chs[stev]+" "+bestBuy);
                    stev++;
                    return r;
                }).catch((error) => {
                    console.error(error);
                })
            }
            var change24h = 0;
            var change24hP = 0;
            var baseVolume;
            var quoteVolume;
            let priceChange;
            //fetchTickers(symbol);
        }
        setTimeout(function () { runFetchTicker() }, 1000);
        return;
    }
    let tickers = new Array();
    fetch24hs(exchange);
    if (q == 1) {   //stop after some time
        //ff2 = setInterval(f2, 1000);
        //setTimeout(function () { stopLoop(ff1) }, f.minToMs(2));
        //stopLoop(ff1);
    } else {
        q++;
    };
    return;
}


function runBot(baseCurrency, quoteCurrency, strategy, ticker, exchangeName, stopLossP, bougthPrice) {
    /*Architecture:
            init
            functions
            API functions
            runtime
            setup
            loop
    */
    /*
    git add .
    git commit -m "comment"
    git push origin master
    git pull origin master
    */

    let f = require("./funk.js");
    var TI = require("technicalindicators");
    let ccxt = require('ccxt');
    var keys = require("../keys.json");  //keys file location
    var exchange;
    switch (exchangeName) {
        case "bitstamp":
            exchange = new ccxt.bitstamp({
                apiKey: keys.bitstamp.apiKey,
                secret: keys.bitstamp.secret,
                uid: keys.bitstamp.uid
            });
            break;
        case "poloniex":
            exchange = new ccxt.poloniex({
                apiKey: keys.poloniex.apiKey,
                secret: keys.poloniex.secret,
            });
            break;
        case "bittrex":
            exchange = new ccxt.bittrex({
                apiKey: keys.bittrex.apiKey,
                secret: keys.bittrex.secret,
            });
            break;
        case "coinbase":
            exchange = new ccxt.coinbase({
                apiKey: keys.coinbase.apiKey,
                secret: keys.coinbase.secret,
            });
            break;
        case "binance":
            exchange = new ccxt.binance({
                apiKey: keys.binance.apiKey,
                secret: keys.binance.secret,
            });
            break;
        case "hitbtc":
            exchange = new ccxt.hitbtc({
                apiKey: keys.hitbtc.apiKey,
                secret: keys.hitbtc.secret,
            });
            break;
        case "bitmex":
            exchange = new ccxt.bitmex({
                apiKey: keys.bitmex.apiKey,
                secret: keys.bitmex.secret
            })
            break;
    }
    var tradingFeeP;// = 0.5;      //default
    exchange.fees.trading.taker ? tradingFeeP = exchange.fees.trading.taker * 100 : tradingFeeP = 0.5;
    //init setup hardcode attributes later to come from GUI

    var round = 0;              //init number of sell orders til stop
    var roundMax = 5;       //disable buying after this count

    //var symbol = "BTC/USDT";        // "BTC/ETH", "ETH/USDT", ...

    let loop;
    //let enableOrders = false;//false;//true;//m.enableOrders;        //DEV
    var symbol = mergeSymbol(baseCurrency, quoteCurrency);
    var fiatCurrency = "USDT";//"USDT"EUR
    exchangeName == "bitstamp" ? fiatCurrency = "EUR" : "";
    let quoteCrypto = "BTC"
    var fiatSymbol = mergeSymbol(quoteCrypto, fiatCurrency);
    var strategy; // = "smaX";          //"emaX", "MMDiff", "upDown", "smaX", "macD"
    var indicator = "MACD"; //"RSI","CGI"
    //var bougthPrice = 0.00000001;    //default:0.00000001 low starting price,reset bot with 0 will couse to sellASAP and then buyASAP 
    var portion = 0.999;        //!!! 0.51 || 0.99 !       part of balance to trade 
    //var stopLossP = 88;      //sell at loss 1,5,10% from bougthprice, 0% for disable, 100% never sell
    var minProfitP = 0.1;        //holding addition
    var timeTicker = f.minToMs(ticker); //!!! 4,8 || 1 !       minutes to milliseconds default: 1 *60000ms = 1min
    var timeStart = f.msToMin(26 * timeTicker);    // default:10080min = 7d, 1440min = 1d
    var msg;
    //var exchangeName;// = "poloniex";      
    var x = 0; //counter for starting mail


    //functions CLI
    var a = 0;
    function count() {       //defines next time delay
        var delay = 1200 //miliseconds
        a++;
        return a * delay;
    }


    function sendMail(subject, message, to) {
        // email account data
        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mrbitja@gmail.com',
                pass: 'mrbitne7777777'
            }
        });

        // mail body
        var subject;
        var message;
        var to;
        var mailOptions = {
            from: 'bb@gmail.com',   //NOT WORK
            to: 'markosmid333@gmail.com',//to, 
            subject: subject, //'You have got mail',
            text: message
        };

        // response
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                //console.log('Email sent: ' + info.response);
                console.log("Email sent at: " + f.getTime() + " To: " + mailOptions.to + " Subject: " + subject);
            }
        });
    }
    //sendMail("Run!","Started at:"+f.getTime());

    function mergeSymbol(base, quote) {
        /*
        if (base == quote){
                base = baseCurrency;
        }*/
        return mergedSymbol = base + "/" + quote;

    }
    function splitSymbol(symbol, selectReturn) {   // BTC/USDT   ,   first | second        base | quote
        var char = symbol.search("/");
        base = symbol.slice(0, char);
        quote = symbol.slice(char + 1, symbol.length);
        switch (selectReturn) {
            case "base":
                return base;
                break;
            case "quote":
                return quote;
                break;
        }
    }

    var sale = false;
    var purchase = false;
    let more;
    var baseBalanceInQuote;
    function selectCurrency() {        // check currency from pair that has more funds
        baseBalanceInQuote = baseToQuote(baseBalance);      //convert to base
        if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
            sale = true;
            purchase = false;
            //price = makeBid(bid, bid2);
            return baseCurrency + " base of pair";
        } else {
            purchase = true;
            sale = false;
            //price = makeAsk(ask, ask2);
            more = false;
            //console.log("more je " + more);
            return quoteCurrency + " quote of pair";
        }
    }

    //functions API
    function fetchTicker() {        //loads ticker of a symbol a currency pair
        exchange.fetchTicker(symbol).then((results) => {
            var r = results;    //market simbols BTC/USDT
            baseVolume = r.baseVolume;
            quoteVolume = r.quoteVolume;
            change24h = r.percentage;
            change24hP = change24h;
            isNaN(change24h) ? change24h = 0 : "";
            /*
            change24h < -1 || change24h > 1 ?
                    change24hP = change24h :
                    change24hP = change24h * 100;
            */
            return r;
        }).catch((error) => {
            console.error(error);
        })
    }
    var change24h = 0;
    var change24hP = 0;
    var baseVolume;
    var quoteVolume;
    var tickerInfo = fetchTicker(symbol);

    function fetchCurrencies() {        //loads all available symbols of currency pairs/markets
        exchange.loadMarkets().then((results) => {
            var r = exchange.currencies;    //market simbols BTC/USDT
            var r1 = JSON.stringify(r);
            //console.log(r1);
            var currencies = Object.keys(r);
            //console.log(JSON.stringify(currencies));
            return r;
        }).catch((error) => {
            console.error(error);
        })
    }
    var curencies;  //all currencies array 
    //fetchCurrencies();

    function loadMarkets() {        //loads all available symbols of currency pairs/markets
        exchange.loadMarkets().then((results) => {
            var r = exchange.symbols;    //market simbols BTC/USDT
            var r1 = JSON.stringify(r);
            console.log(r1);
            return r;
        }).catch((error) => {
            console.error(error);
        })
    }

    function fetchBalances() {    //fetches balance of a currency
        exchange.fetchBalance().then((results) => {
            var r = results;
            baseBalance = r[baseCurrency].total;     //options: free used total
            quoteBalance = r[quoteCurrency].total;     //options: free used total
            isNaN(baseBalance || undefined) ? baseBalance = 0 : "";
            isNaN(quoteBalance || undefined) ? quoteBalance = 0 : "";
            //console.log(JSON.stringify(r));
            return r;
        }).catch((error) => {
            console.error(error);
        })
    }
    var quoteBalance = 0;
    var baseBalance = 0;
    fetchBalances();

    var bid;
    var ask;
    var bid2;
    var ask2;
    function fetchAsksBids(symbol) {        //fetch ticker second order
        exchange.fetchOrderBook(symbol).then((results) => {
            bid = results.bids[0][0];            //options: bids asks
            ask = results.asks[0][0];
            bid2 = results.bids[1][0];            //options: bids asks
            ask2 = results.asks[1][0];
        }).catch((error) => {
            console.error(error);
        })
    }
    var fiatPrice;
    function fetchFiatPrice(fiatSymbol) {        //fetch ticker second order
        exchange.fetchOrderBook(fiatSymbol).then((results) => {
            fiatPrice = results.bids[0][0];
        }).catch((error) => {
            console.error(error);
        })
    }

    var orderId;
    function createLimitSellOrder(symbol, amount, price) {        // symbol, amount, ask 
        exchange.createLimitSellOrder(symbol, amount, price).then((results) => {
            var r = results;
            orderId = r.id;
            orderStatus = r.status;
            //sellPrice = r.price;
            console.log(orderId);
            console.log("Order: " + JSON.stringify(r));
            sendMail("Sold", msg + "\n" + JSON.stringify(r));
            orderType = "sold";
            setTimeout(function () { cancelOrder(orderId) }, timeTicker * 0.9);
            return r;
        }).catch((error) => {
            console.error(error);
        })
    }
    function createLimitBuyOrder(symbol, amount, price) {        // symbol, amount, bid 
        exchange.createLimitBuyOrder(symbol, amount, price).then((results) => {
            var r = results;
            orderId = r.id;
            orderStatus = r.status;
            console.log(orderId);
            console.log("Order: " + JSON.stringify(r));
            sendMail("Bougth", msg + "\n" + JSON.stringify(r));
            orderType = "bougth";
            bougthPrice = r.price;            //safety
            setTimeout(function () { bougthPrice = r.price }, timeTicker * 0.85);
            setTimeout(function () { cancelOrder(orderId) }, timeTicker * 0.9);
            return r;
        }).catch((error) => {
            console.error(error);
        })
    }
    function cancelOrder(id) {
        exchange.cancelOrder(id).then((results) => {
            var r = results;
            console.log("CANCELED ORDER: " + id + " " + r);
            return JSON.stringify(r);
        }).catch((error) => {
            console.error(JSON.stringify(error));
        })
    }

    //logic funk and math junk
    //var history = new Array();
    function logHistory(value, size) {        //log FILO
        var counter;
        while (history.length >= size) {
            history.pop();
        }
        history.unshift(value);
        counter++;
        console.log(history);
    }
    function boolToInitial(bool) {	//returns initial of string|bool
        var bool;
        var a = bool.toString();
        var b = a.charAt(0);
        return b;
    }
    function quoteToBase(amountQuote) {
        var amountQuote;
        var amountBase = amountQuote / bid;
        return amountBase;
    }
    function baseToQuote(amountBase) {
        var amountBase;
        var amountQuote = amountBase * bid;
        return amountQuote;
    }
    function getAvgOfArrayJump(numArray, jump) {     //in: numericArray out: avgValueOfPart
        var numArray;
        var jump;
        var n = numArray.length / jump;
        var sum = 0;
        var avg;
        for (i = 0; i < numArray.length; i += jump) {
            sum += numArray[i];
            avg = sum / n;
        }
        return avg;
    }

    function runStrategy(strategy) {
        switch (strategy) {
            case "PINGPONG":
                PINGPONG();
                break;
            case "MACD":
                MACD();
                break;
            case "RSI":
                RSI();
                break;
            case "upDown":      //"MMDiff"
                upDown()
                break;
        }
    }

    let once = false;
    function selfStop(loopName) {
        if (exS) {      //for Fiat bot
            f.cs("we are fiat");
            clearInterval(loopName);
            if (once == false) {
                f.cs("stopping fiat " + once);
                setTimeout(function () { main() }, count() * 2);
                once = true;
            }
        } else {  	        //for Alt bot
            f.cs("we ar NOT Fiat");
            if (once == false) {
                f.cs("stopping alt " + once);
                clearInterval(loopName);
                once = true;
            }
        }
    }
    let twice = false;
    //selfStop(quoteCurrency,fiatCurrency,loop);
    function selfRun(loopName) {
        if (!exS) {      //for Fiat bot
            f.cs("bougth quote");
            if (twice == false) {
                f.cs("runing alt " + once);
                runBot(alt, quote, "PINGPONG", ticker, "binance", stopLossP, bougthPrice)
                twice = true;
            }
        }
    }



    function order(orderType, symbol, amount, price) {
        var orderId;
        function cancelOrder(id) {
            exchange.cancelOrder(id).then((results) => {
                var r = results;
                console.log("CANCELED ORDER: " + JSON.stringify(r));
                return JSON.stringify(r);
            }).catch((error) => {
                if (id == undefined) {
                    console.log("NO SUCH ORDER!!!")
                } else {
                    console.error(JSON.stringify(error));
                }
            })
        }
        function createLimitSellOrder(symbol, amount, price) {        // symbol, amount, ask 
            exchange.createLimitSellOrder(symbol, amount, price).then((results) => {
                var r = results;
                orderId = r.id;
                orderStatus = r.status;
                console.log(orderId);
                console.log("Order: " + JSON.stringify(r));
                sendMail("Sold", msg + "\n" + JSON.stringify(r));
                orderType = "sold";
                //sellPrice = r.price;
                //sellPrice = price;
                console.log("sold");
                setTimeout(function () { cancelOrder(orderId) }, timeTicker * 0.9);
                selfStop(loop);
                return r;
            }).catch((error) => {
                console.error(error);
                //selfStop(quoteCurrency, fiatCurrency, loop);
            })
        }
        function createLimitBuyOrder(symbol, amount, price) {        // symbol, amount, bid 
            exchange.createLimitBuyOrder(symbol, amount, price).then((results) => {
                var r = results;
                orderId = r.id;
                orderStatus = r.status;
                //console.log(orderId);
                console.log("Order: " + JSON.stringify(r));
                sendMail("Bougth", msg + "\n" + JSON.stringify(r));  //dev
                //orderType = "bougth";
                //bougthPrice = r.price;            //safety
                bougthPrice = price;
                setTimeout(function () { bougthPrice = price }, timeTicker * 0.85);
                console.log("bougth");

                selfRun(loop);
                setTimeout(function () { cancelOrder(orderId) }, timeTicker * 0.9);
                return r;
            }).catch((error) => {
                f.cs("invalid order: " + error)
            })
        }
        switch (orderType) {
            case "buy":
                createLimitBuyOrder(symbol, amount, price);
                console.log("made buy order");
                break;
            case "sell":
                createLimitSellOrder(symbol, amount, price);
                console.log("made sell order");
                break;
            default:
                console.log("Invalid order type!!!");
                break;
        }
    }

    var logMACD = new Array();      //must be global!
    var logRSI = new Array();      //must be global!
    var logUD = new Array();
    var price;
    var stor = new Array();     //storage for direction
    function PINGPONG() {
        function makePrice(high, low) {
            spread = high - low;
            return price = high - (spread / 2);
        }
        price = makePrice(ask, bid);
        //price = bid2;  
        bougthPrice == 0.00000001 ? bougthPrice = price : "";   //init

        function balanceChanged() {
            if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
                if (!more) {
                    bougthPrice = price;
                    more = true;
                    console.log("Bougth price updated: " + more);
                }
            }
        }
        balanceChanged();

        //price loging:
        function loger(value, length, array) {        //log FILO to array
            var counter;         //d   
            while (array.length >= length) {
                array.pop();
            }
            array.unshift(value);
            counter++;    //d
            return array;
        }
        loger(price, 5, logUD);
        loger(price, 77, logMACD);
        loger(price, 15, logRSI);

        var duration = 360;       //duration in minutes 6h=360min
        function timeToTicker(duration) {
            numOfTickers = duration / ticker
            return numOfTickers;
        }
        var numOfTickers = 0;

        //stalling 

        function stalling(longTimePrice, price, div) {
            var ma = f.getAvgOfArray(longTimePrice);
            if (ma + (f.part(div, ma) > price)) {
                stall = true;
            } else if (ma - (f.part(div, ma) < price)) {
                stall = true;
            } else {
                stall = false;
            }
            //console.log("MA5: "+ma);
            //console.log("Stall status: "+stall);
            return stall;
        }
        //var stall = stalling(logUD,price,0.001);

        function bounce(array) {
            f.getMaxOfArray(logMACD) > price;
        }
        var down = bounce(logMACD)

        function safetySale(tradingFeeP, bougthPrice) {  //no sale with loss
            var tradingFeeAbs;
            tradingFeeP = tradingFeeP * 2;
            tradingFeeAbs = f.part(tradingFeeP, bougthPrice);
            minProfitAbs = f.part(minProfitP, bougthPrice);
            //console.log("Fee: "+tradingFeeP+"% "+tradingFeeAbs+" $");
            sellPrice = bougthPrice + tradingFeeAbs + minProfitAbs;         //minProfit
            //return hold = false;     //uncoment to disable
            if (sellPrice > price) {      //if bougthPrice is not high enough
                return hold = true;    	//dont allow sell force holding
            } else {
                return hold = false;           //allow sale of holding to parked
            }
        }
        var sellPrice;
        var hold = safetySale(tradingFeeP, bougthPrice);        //returns bool

        function safetyStopLoss(price, stopLossP, sellPrice) {      //force sale  price, bougthPrice, lossP
            absStopLoss = f.part(stopLossP, sellPrice);
            loss = sellPrice - price;     //default: loss = sellPrice - price;
            //return stopLoss = false;        //uncoment to disable
            if (loss > absStopLoss) {
                return stopLoss = true;         //sell ASAP!!!
            } else {
                return stopLoss = false;
            }
        }
        var stopLoss = safetyStopLoss(price, stopLossP, sellPrice);       //returns boolean

        //get trends,signals,startegy
        function upDown(value) {     //trendUD between curent and last value
            var ma = f.getAvgOfArray(logUD);
            //console.log("ma5:"+ma5);
            if (stor[1] == undefined) {
                stor[1] = value;
                stor[0] = value;
            };
            stor[1] = stor[0];
            stor[0] = value;
            //var direction = stor[0] - stor[1];
            var direction = stor[0] - ma;
            //console.log("direction:"+direction);
            if (direction > 0) {
                trendUD = 1;   //buy coz rising
                trendSign = "+";
            } else {
                trendUD = -1;   //hold or park coz stationary
                trendSign = "-";
            }
        }
        var trendSign;
        var trendUD;
        upDown(price);

        function TI_RSI(values) {
            var RSI = TI.RSI;
            var inputRSI = {
                values: values,
                period: 14   //9
            };
            var r = RSI.calculate(inputRSI);
            var n = r.length - 1;
            var lastRSI = r[n]; //last JSON
            //console.log("RSI:"+lastRSI);
            if (lastRSI > 70) {
                trendRSI = 1;   //buy coz rising
            } else if (lastRSI < 30) {
                trendRSI = -1;  //sell coz falling
            } else {
                trendRSI = 0;   //hold or park coz stationary
                //lastRSI = 0;
            };
            //console.log("trend:"+trendRSI+" RSI:"+lastRSI);
            return trendRSI;
        }
        var trendRSI;
        trendRSI = TI_RSI(logRSI);

        function TI_MACD(values) {     //should be bigger the better starts working when value = slowPeriod + signalPeriod
            var MACD = TI.MACD;
            var macdInput = {
                values: values,   //34,70,140n of inputs - slowPeriod = n of outputs 
                fastPeriod: 24,       //12,24,48
                slowPeriod: 52,       //26,52,104      when this is full it putout
                signalPeriod: 18,        //9,18,36
                SimpleMAOscillator: false,
                SimpleMASignal: false
            };
            var r = MACD.calculate(macdInput);      //array with JSONs
            //console.log(r);
            //console.log("data length: "+values.length);
            var lastMACD;
            r ? lastMACD = r[r.length - 1] : lastMACD = 0; //last JSON
            //lastMACD = r[r.length-1];
            //console.log("Last: "+JSON.stringify(lastMACD));
            macdHistogram = 0;
            if (lastMACD) {
                macdLine = lastMACD.MACD;
                signalLine = lastMACD.signal;
                macdHistogram = lastMACD.histogram;
                //console.log("MLine: "+macdLine);
                //console.log("SLine: "+signalLine);
                //console.log("MHist: "+macdHistogram);    
                if (!isNaN(macdHistogram) && x == 0) {     //isNumber
                    sendMail("Started MACD", msg);
                    x++;
                };
                if (macdHistogram > 0) {
                    trendMACD = 1;   //buy coz rising
                } else if (macdHistogram < 0) {
                    trendMACD = -1;  //sell coz falling
                } else {
                    trendMACD = 0;   //hold or park coz stationary
                };
            } else {
                macdHistogram = trendUD;
                trendMACD = 0;
            }
            //console.log(r);
        }
        var macdLine;
        var signalLine;
        var macdHistogram;      //>1,<1
        var trendMACD;  //-1,0,1
        TI_MACD(logMACD);

        function makeAsk(ask, ask2) {     //makerify prices for orders
            var shiftP = 50;       //percentage of makerPrice shift
            var askSubSpread = ask2 - ask;    //spread between first and second order of asks
            return buyPrice = ask + f.part(shiftP, askSubSpread);
        }
        var buyPrice = price;//makeAsk(ask,ask2);

        function makeBid(bid, bid2) {     //makerify prices for orders
            var shiftP = 50;       //percentage of makerPrice shift
            var bidSubSpread = bid - bid2;    //spread between first and second order of bids
            return salePrice = bid - f.part(shiftP, bidSubSpread);
        }
        var salePrice = price;//makeBid(bid,bid2);

        function makeOrder() { //purchase,sale,hold,stopLoss,price,symbol,baseBalance,quoteBalance
            trend = trendUD;  //short term trend
            trend2 = trendRSI;     //long term trend
            trend3 = trendMACD;     //technical indicator
            trend4 = change24h;     //24h change % 4
            if (purchase && (trend > 0) && (trend2 >= 0) && (trend3 >= 0) ) {                //buy // buy with RSI and MACD (trend2 > 0) | (trend2 >= 0)&& (trend4 >= 0)
                orderType = "bougth";
                round += 1;     //dev
                console.log("No of purchases done: " + round + " of: " + roundMax);
                enableOrders ? order("buy", symbol, buyAmount, buyPrice) : console.log('buy orders disabled');
                //bougthPrice = buyPrice;               //sim
                //selfStop(quoteCurrency, fiatCurrency, loop);
            } else if (sale && !hold && !stopLoss && (trend < 0) && (trend3 <= 0)) {         //sell good

                //selfStop(quoteCurrency, fiatCurrency, loop);
                console.log("No of sales done: " + round + " of: " + roundMax);
                orderType = "sold";
                enableOrders ? order("sell", symbol, sellAmount, salePrice) : console.log('sell orders disabled');
            } else if (sale && hold && stopLoss /*&& (trend2 < 0)*/) {                          //stopLoss sell bad
                orderType = "lossed";
                enableOrders ? order("sell", symbol, sellAmount, salePrice) : console.log('loss sell orders disabled');
            } else if (sale && hold && !stopLoss) {                                  //holding fee NOT covered
                orderType = "holding";
            } else if (sale && !hold && !stopLoss) {                                 //holding fee covered
                orderType = "holding good";
            } else if (purchase) {      // ( change24h > 0 )
                orderType = "parked";
            }
            return print();
        }
        var buyAmount = quoteToBase(quoteBalance) * portion;
        var sellAmount = baseBalance; // * portion;
        var trend; //trend of bids
        var trend2; //trend of asks
        var orderType = "none";
        makeOrder();
        function print() {
            var baseBalanceInQuote = baseToQuote(baseBalance);
            var quoteBalanceInBase = quoteToBase(quoteBalance);
            var balance = baseBalanceInQuote + quoteBalance;
            var fiatValue = balance * fiatPrice;/*
                console.log("fiatValue " + fiatValue);
                console.log("balance " + balance);*/
            var balanceB = quoteBalanceInBase + baseBalance;
            var profit = price - sellPrice;
            var relProfit = f.percent(profit, sellPrice);
            var absProfit = f.part(relProfit, baseBalanceInQuote);
            var absProfitFiat = absProfit * fiatPrice;/*
                console.log("absProfitFiat " + absProfitFiat);
                console.log("absProfit " + absProfit);
                console.log("fiatPrice " + fiatPrice);*/

            var rounds = roundMax - round;
            //var absProfit = profit * baseBalance;
            //var relProfit = f.percent(absProfit, sellPrice);
            var separator = "|";
            msg =   //info msg on ticker time
                f.getTime() + "|" +
                "P:" + price.toFixed(8) + " " + symbol + "|" +
                "aP:" + absProfit.toFixed(8) + " " + quoteCurrency + "|" +
                "aPF:" + absProfitFiat.toFixed(2) + " " + fiatCurrency + "|" +
                "SH:" + rounds + "|" +
                "rP:" + (relProfit + minProfitP).toFixed(2) + " %|" +
                stopLossP + " %" + "|" +
                //"aPF:" + fiatAbsProfit.toFixed(2) + " " + fiatCurrency + "|" +
                "C24h:" + change24hP + " |" +
                //exchangeName + "|" +
                //"B1:"+bid+" "+symbol+"|"+
                //"B2:"+bid2+" "+symbol+"|"+
                "t:" + ticker + "m" + "|" +
                "BP:" + bougthPrice.toFixed(8) + "|" +
                "SP:" + sellPrice.toFixed(8) + "|" +
                baseCurrency + ":" + baseBalance.toFixed(8) + "|" +
                boolToInitial(baseCurrency) + "in" + boolToInitial(quoteCurrency) + ":" + baseBalanceInQuote.toFixed(8) + "|" +
                quoteCurrency + ":" + quoteBalance.toFixed(8) + "|" +
                "T:" + balance.toFixed(8) + "|" +
                "TF:" + fiatValue.toFixed(2) + " " + fiatCurrency + "|" +
                //"FiatPrice:" + fiatPrice.toFixed(8) + " " + fiatSymbol + "|" +
                "O:" + orderType + "|" +
                "P:" + boolToInitial(purchase) + "|" +
                "S:" + boolToInitial(sale) + "|" +
                "H:" + boolToInitial(hold) + "|" +
                "SL:" + boolToInitial(stopLoss) + "|" +
                "UD:" + trendSign + "|" +
                "RSI" + logRSI.length + ":" + trendRSI + "|" +
                "MACD" + logMACD.length + ":" + trendMACD.toFixed(0);

            //logToLog(msg);        // store to log
            console.log(msg);
        }
    }

    var log = "LOG: ";       //prefix
    function logToLog(input) {
        log += input;
        log += "\n";    //new line
        //console.log(log);
    }

    //setup main
    set();
    function set() {
        console.log("Selected exchange: " + exchange.name + " (" + exchange.countries + ")");
        console.log("Maker fee: " + exchange.fees.trading.maker * 100 + " %");
        console.log("Taker fee: " + tradingFeeP + " %");
    }

    //setup main cascade
    setTimeout(function () { setup() }, count());
    function setup() {
        //setTimeout(function(){fetchCurrencies() },count());
        setTimeout(function () { loadMarkets() }, count());
        setTimeout(function () { fetchAsksBids(symbol) }, count());
        setTimeout(function () { fetchBalances() }, count());

        setTimeout(function () {
            console.log("Wallet:" + "\n" +
                baseBalance + " " + baseCurrency + "\n" +
                quoteBalance + " " + quoteCurrency)
        }, count());
        setTimeout(function () { console.log("Selected market: " + baseCurrency + " / " + quoteCurrency) }, count());
        setTimeout(function () { console.log("24h change: " + change24hP.toFixed(2) + " %") }, count());
        setTimeout(function () { console.log("BaseVolume: " + baseVolume + " " + baseCurrency) }, count());
        setTimeout(function () { console.log("QuoteVolume: " + quoteVolume + " " + quoteCurrency) }, count());
        setTimeout(function () { console.log("Currency to sell: " + selectCurrency()) }, count());

        //loop fetches
        setTimeout(function () { loop = setInterval(function () { loopFetches() }, timeTicker) }, count());
        function loopFetches() {
            setTimeout(function () { fetchBalances() }, count());
            setTimeout(function () { fetchTicker() }, count());
            setTimeout(function () { fetchFiatPrice(fiatSymbol) }, count());
            setTimeout(function () { fetchAsksBids(symbol) }, count());
            //loop logic 
            setTimeout(function () { loopLogic() }, count());
            function loopLogic() {
                selectCurrency();
                runStrategy(strategy);
            }
        }
    }
}




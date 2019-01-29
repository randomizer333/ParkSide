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
let b = require("./bot2.js");
let ccxt = require('ccxt');             //connect to ccxt node.js module
let keys = require("../keys.json");      //keys file location
let TI = require("technicalindicators");//technical indicators library

//init setup
var fiat = "USDT"; //USDT,EUR
var bougthPrice = 0.00000001;  //set bouht price
var lossFiat = 1.5333;      //sell if crypto quote goes down 1%,10%,100%
var loss1 = 99;
var numOfBots = 2;
var ticker = 0.2;   //ticker time in minutes
var enableOrders = false;
var stopLossP = 1;      //if it drops for stopLossP percentage sell ASAP
let quote = ["BTC", "ETH", "BNB"];

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


function stopLoop(fu) { //stops a setInterval function
    clearInterval(fu);
    f.cs("loop stopped");
    q = 1;
}

var q = 1;
var ff1 = f1();// = setInterval(f1, 1000);
var ff2 = f2;
var ff3;
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
        let bestBuy;
        function runFetchTicker() {
            //var bestBuy;
            for (let i = 1; i < syms.length; i++) {
                setTimeout(function timer() {
                    symbol = syms[i];
                    //f.cs(chs)
                    //f.cs(symbol);
                    fetchTickers();
                }, i * 100);    //delay
            }
            let w = 0;
            let logChs = new Array();
            function fetchTickers() {       //loads ticker of a symbol a currency pair
                exchange.fetchTicker(symbol).then((results) => {
                    var r = results;    //market simbols BTC/USDT
                    baseVolume = r.baseVolume;
                    quoteVolume = r.quoteVolume;
                    change24h = r.percentage;
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
                        loger(bestBuy, 3, logChs);
                        f.cs("Nova BESTBUY valuta: " + bestBuy + " z vrednostjo " + maxChange+" "+logChs);
                    }
                    //f.cs(syms[stev]+" "+stev+" "+chs[stev]+" "+bestBuy);
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
            //fetchTickers(symbol);
        }
        setTimeout(function () { runFetchTicker() }, 2000);
        f.cs("BESTBUY valuta: " + bestBuy + " z vrednostjo " + maxChange);
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
}

function setBots(symbol) {
    let sym = symbol;
    let alt = f.splitSymbol(sym, "first");
    //let quote = f.splitSymbol(sym, "second");
    f.cs("A: " + alt + " Q: " + quote + " F: " + fiat);
}
//setBots(bestBuy);


function f2() {
    var d = new Date();
    var t = d.toLocaleTimeString();
    f.cs("čas: " + t + " stevec: " + q + " loop f2");
    if (q == 3) {   //stop at condition
        ff3 = setInterval(f3, 1000);
        stopLoop(ff2);
    } else {
        q++;
    }
}

function f3() {
    var d = new Date();
    var t = d.toLocaleTimeString();
    f.cs("čas: " + t + " stevec: " + q + " loop f3");
    if (q == 3) {
        ff1 = setInterval(f1, 1000);
        stopLoop(ff3);
    } else {
        q++;
    }
}


//b.runBot("PAX", "USDT", "PINGPONG", ticker, "binance", stopLossP, bougthPrice);    //D!





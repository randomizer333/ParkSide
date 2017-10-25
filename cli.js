//init setup fake attributes later to come from GUI
var market = "USDT_BTC";
var strategy = "EMAX";
var timeMin = 0.1 *60000; //minutes to milliseconds
var timeBal = 2 *60000; //minutes to milliseconds
var size = 5; //size of ticker to capture
var over = 2.0; //positive percentage
var under = 0.5; // negative percentage
var currency = "USDT";  //BTC , BCH , ETH
var currency1 = "BTC";
var symbol = "BTC/USDT";

//var exchange = "poloniex";
//ccxt API
var ccxt = require ('ccxt')
let exchange = new ccxt.poloniex ({
        apiKey: 'EUJD7ARY-Z67X3XGB-AWI7MIVI-JNLU34L8',
        secret: '8876ca0e7808b3aae83ba5ccb30ad12e0754fc8dde81fe24c4c52d51da7c3861f9ca6f57f6682a342b01983209db2077eb0e19c2a6b10323e9deb89057cc488f',
})

//functions CLI
var a = 0;
function count(){       //defines next time delay
        var delay = 1800 //miliseconds
        a++;
        return a*delay;}
//functions API
function loadMarkets() {        //loads all available symbols of currency pairs/markets
        exchange.loadMarkets().then((results) => { 
                var r = exchange.symbols;    //market simbols BTC/USDT
                var r1 = JSON.stringify(r);
                console.log(r1);
		return r;
        }).catch((error) => {
                console.error(error);
        })}

function loadMarket(i) {        //loads all about one market
        exchange.loadMarkets().then((results) => { 
                var r = exchange.symbols[i];    //market simbols BTC/USDT
                console.log(r);
		return r;
        }).catch((error) => {
                console.error(error);
        })}

function fetchBalance(cur) {    //fetches balance of a currency
        exchange.fetchBalance(cur).then((results) => {
                var r = results[cur].total+" "+cur;     //options: free used total
                var m ="";
                m = "Balance: ";                    //prefixed massage      
                console.log(m + r);
                return r;
        }).catch((error) => {
                console.error(error);
        })}
function fetchAsksBids(symbol) {        //fetch ticker
	exchange.fetchOrderBook(symbol).then((results) => {
                var a = results.asks[0][0];            //options: bids asks
                var b = results.bids[0][0];
                var d = a-b;
                var m = "ask/bid/diff";
                console.log(a+"/"+b+"/"+d);
		//console.log("Last ask: "+results.asks[0][0]);
		return results;
	}).catch((error) => {
		console.error(error);
        })} 

var bid;
function fetchLastBid(symbol) {
	exchange.fetchOrderBook(symbol).then((results) => {
                bid = results.bids[0][0];            //options: bids asks
	}).catch((error) => {
		console.error(error);
        })}

var ask;
function fetchLastAsk(symbol) {
	exchange.fetchOrderBook(symbol).then((results) => {
                ask = results.asks[0][0];            //options: bids asks
	}).catch((error) => {
		console.error(error);
        })}   

//logic funk and math junk
var i = 0;		        //števec iteracij zapisov
var logedPrice = new Array();   //history storage array
function logPrice(value){       //log to array slide FIFO
        if(i >= size){		//jump to 0
		i = 0;
                logedPrice[i] = value;
                var r = logedPrice[i];
                return r;
        }else{				//log to curent index
                logedPrice[i] = value;
                var r = logedPrice[i];
                i++;
                return r;
        }
        var e = "error";
        return e;}
function listArray(array){
	for ( i=0 ; i<array.length; i++ ){
		console.log(array[i]);
	}
}
function celota (delez, procent){	//celota je nekaj delejeno procent
	return delez / (procent/100);
}
function procent (delez, celota){	//default selection
	return ( delez / celota ) * 100;
}
function delez (procent, celota){
	return (procent/100) * celota;
}

//setup main
fetchLastBid(symbol);
fetchLastAsk(symbol);

//setTimeout(function(){console.log("______INIT______");console.log("----IALISING----")                   }, count());
setTimeout(function(){console.log("Available exchanges:"+ccxt.exchanges)                                }, count());
//setTimeout(function(){console.log("Selected exchange:"+exchange.name+" ("+exchange.countries+")")       }, count());
setTimeout(function(){console.log("Available products:")                                                }, count());
setTimeout(function(){loadMarkets()                                                                     }, count());
//setTimeout(function(){console.log("Selected market:")                                                   }, count());
//setTimeout(function(){loadMarket(33)                                                                    }, count());
setTimeout(function(){fetchBalance(currency)                                                            }, count());
setTimeout(function(){fetchBalance(currency1)                                                           }, count());

//loop
//setTimeout(function(){setInterval(function(){var t = fetchAsksBids(market)}, timeMin)}, count());
//setTimeout(function(){setInterval(function(){console.log(ask)}, timeMin)}, count());
//setTimeout(function(){setInterval(function(){console.log(bid)}, timeMin)}, count());
setTimeout(function(){setInterval(function(){fetchLastBid(symbol)}, timeMin)}, count());
setTimeout(function(){setInterval(function(){fetchLastAsk(symbol)}, timeMin)}, count());
setTimeout(function(){setInterval(function(){logPrice(bid)}, timeMin)}, count());
setTimeout(function(){setInterval(function(){console.log(logedPrice)}, timeMin)}, count());
setTimeout(function(){setInterval(function(){fetchBalance(currency)}, timeBal)}, count());
setTimeout(function(){setInterval(function(){fetchBalance(currency1)}, timeBal)}, count());
var ccxt = require ('ccxt')

let poloniex  = new ccxt.poloniex ({ verbose: true });
/*
bitfinex.loadMarkets().then((results) => {
	console.log(results);
}).catch((error) => {
	console.error(error);
});
*/

function callAPI(currency) {
	poloniex.fetchTicker(currency).then((results) => {
		console.log("done calling")
	}).catch((error) => {
		console.error(error)
	})
}

console.log("calling API");
callAPI("BTC/USD");
console.log("after call");

var ccxt = require ('ccxt')

/*
bitfinex.loadMarkets().then((results) => {
	console.log(results);
}).catch((error) => {
	console.error(error);
});

fetchMarkets ()
fetchOrderBook(symbol)
fetchTrades (symbol, [params = {}])
fetchTicker (symbol)

*/

function fetchTicker(symbol) {
	let exchange  = new ccxt.poloniex //({ verbose: true });
	exchange.fetchTicker(symbol).then((results) => {	
		console.log("done __________ calling")
		console.log(results.id)
	}).catch((error) => {
		console.error(error)
	})
}

function callAPI(symbol) {
	let exchange  = new ccxt.poloniex //({ verbose: true });
	exchange.fetchOrderBook(symbol).then((results) => {	
		console.log("done __________ calling")
		console.log("Last bid: "+results.bids[0])
		console.log("Last ask: "+results.asks[0])
		return results.asks;
	}).catch((error) => {
		console.error(error)
	})
}

console.log("calling ________________________________ API");
callAPI("USDT_BTC");
console.log("_______________Done");
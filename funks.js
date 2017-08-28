var ccxt = require ('ccxt')
let exchange  = new ccxt.poloniex //({ verbose: true });


/*poloniex
bitfinex.loadMarkets().then((results) => {
	console.log(results);
}).catch((error) => {
	console.error(error);
});
/*
fetchMarkets ()
loadMarkets ([reload])
fetchOrderBook(symbol)
fetchTrades (symbol, [params = {}])
fetchTicker (symbol)
fetchBalance ()
createOrder (symbol, type, side, amount[, price[, params]])
createMarketBuyOrder
createMarketSellOrder (symbol, amount)
createLimitBuyOrder (symbol, amount, limit)
createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })
*/
function fetchMarkets() {
	exchange.fetchMarkets().then((results) => {	
		console.log("done __________ calling")
		console.log(results);
	}).catch((error) => {
		console.error(error)
	})
}

function fetchTrades (symbol) {
	exchange.fetchTrades().then((results) => {	//"BCH/BTC"  "BTC/USDT"
		console.log("Trades:");
		console.log(results);
	}).catch((error) => {
		console.error(error)
	})}

function loadMarkets (symbol) {
	exchange.loadMarkets().then((results) => {	//"BCH/BTC"  "USDT/BTC"
		console.log("Last price of "+symbol+": ");
		console.log(results[symbol].info.last);
	}).catch((error) => {
		console.error(error)
	})}

function fetchOrderBook(symbol) {
	exchange.fetchOrderBook(symbol).then((results) => {	
		console.log("Last bid: "+results.bids[0])
		console.log("Last ask: "+results.asks[0])
		return results;
	}).catch((error) => {
		console.error(error)
	})}

function fetchTicker(symbol) {
	exchange.fetchTicker(symbol).then((results) => {	
		console.log(results)
	}).catch((error) => {
		console.error(error)	
	})
}

console.log("___________start___________");
//fetchTicker("USDT/BTC");
//loadMarkets ("BTC/USDT");
//setInterval(function(){fetchOrderBook("BTC/USDT")}, 5000);
//setInterval(function(){loadMarkets ("BTC/USDT")}, 3000);
setTimeout(function(){console.log("------------end-----------")}, 5000);

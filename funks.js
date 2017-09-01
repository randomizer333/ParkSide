var ccxt = require ('ccxt')
let exchange = new ccxt.poloniex ({
    apiKey: 'EUJD7ARY-Z67X3XGB-AWI7MIVI-JNLU34L8', 
	secret: '8876ca0e7808b3aae83ba5ccb30ad12e0754fc8dde81fe24c4c52d51da7c3861f9ca6f57f6682a342b01983209db2077eb0e19c2a6b10323e9deb89057cc488f',
})

var symbol = "USDT_BTC";

/*poloniex
bitfinex.loadMarkets().then((results) => {
	console.log(results);
}).catch((error) => {
	console.error(error);
});
/*
fetchMarkets ()
loadMarkets ([reload])
fetchOrderBook (symbol)
fetchTrades (symbol, [params = {}])
fetchTicker (symbol)
fetchBalance ()
createOrder (symbol, type, side, amount[, price[, params]])
createMarketBuyOrder
createMarketSellOrder (symbol, amount)
createLimitBuyOrder (symbol, amount, limit)
createLimitSellOrder ('BTC/USD', 1, 10, { 'type': 'trailing-stop' })
cancelOrder (id)
*/
function fetchMarkets() {
	exchange.fetchMarkets().then((results) => {	
		console.log("done __________ calling")
		console.log(results);
	}).catch((error) => {
		console.error(error)
	})
}

function loadM (symbol) {
	exchange.loadMarkets().then((results) => {
		console.log(results);
	}).catch((error) => {
		console.error(error)
	})}
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
	exchange.fetchOrderBook(symbol).then((results) => {	({})
		console.log("Last bid: "+results.bids[0][0])
		console.log("Last ask: "+results.asks[0][0])
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
function fetchBalance(currency) {	
	exchange.fetchBalance().then((results) => {	
		var r = console.log(results[currency].free);	//free used total
		return r;
	}).catch((error) => {
		console.error(error)	
	})}
function fetchWallet(currency) {	
	exchange.fetchBalance().then((results) => {
		var r = console.log("Free:"+results[currency].free+": Used:"+results[currency].used+": Total:"+results[currency].total+currency);	//free used total
		return r;
	}).catch((error) => {
		console.error(error)	
	})}
function createMarketSellOrder(symbol) {	
	exchange.createMarketSellOrder('BTC/USD', 0.00001).then((results) => {	
		console.log(results);	
		return results;
	}).catch((error) => {
		console.error(error)	
	})
}	
function createLimitSellOrder() {	
	exchange.createLimitSellOrder('BTC/USD', 0.000001, 4900, { 'type': 'trailing-stop' }).then((results) => {	
		console.log(results);	
		return results;
	}).catch((error) => {
		console.error(error)	
	})
}

console.log("___________start___________");
//fetchTicker (symbol);
//loadMarkets (symbol);
//setInterval(function(){fetchOrderBook(symbol)}, 10000);
//setInterval(function(){loadMarkets (symbol)}, 3000);
//fetchBalance("USDT");
fetchWallet("USDT");
console.log (exchange.name)
console.log (ccxt.exchanges[6])
fetchOrderBook(symbol)
createLimitSellOrder();

setTimeout(function(){console.log("------------end-----------")}, 6000);
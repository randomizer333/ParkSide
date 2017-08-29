let ccxt = require ('ccxt')
let exchange = new ccxt.poloniex ({
    apiKey: 'EUJD7ARY-Z67X3XGB-AWI7MIVI-JNLU34L8', 
    secret: '8876ca0e7808b3aae83ba5ccb30ad12e0754fc8dde81fe24c4c52d51da7c3861f9ca6f57f6682a342b01983209db2077eb0e19c2a6b10323e9deb89057cc488f',
})

/* await exchange.loadProducts ()
console.log (exchange.symbols)
let symbol = exchange.symbols[0]
let ticker = await exchange.fetchTicker (symbol)
console.log (symbol, ticker)
let orderbook = await exchange.fetchTicker (symbol)
console.log (symbol, orderbook)*/
let balance = await exchange.fetchBalance ()
console.log ("BTC", balance)
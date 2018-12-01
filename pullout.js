/*START pulout procedure*/
//find crypto currencies with balance larger than 0
//sell all crypto currencies to XRP on trading exchange (binance)
//transfer to banking exchange (bitstamp)
//exchange XRP to EUR
//withdraw to bank account
/*END pulout procedure*/

var currency;   //currency to sell to
pullout("binance", "BTC");       //D!
function cs(object) {    //console log with stringify
        console.log(JSON.stringify(object));
}
function pullout(exchangeName, currency) {
        let ccxt = require('ccxt');
        var keys = require("./keys.json");  //keys file location
        function mergeSymbol(baseCurrency, quoteCurrency) {
                return symbol = baseCurrency + "/" + quoteCurrency;
        }
        var symbol;
        //mergeSymbol( curs[],currency) //triger from function

        var exchange;
        switch (exchangeName) {
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
        }
        function fetchBalance() {        //loads ticker of a symbol a currency pair
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
                                                portf[j] = curs[i];
                                                bals[j] = vals[i];
                                                j++;
                                        }
                                }
                                cs(portf);
                                cs(bals);
                                return portf;
                        }

                        return r;
                }).catch((error) => {
                        console.error(error);
                })
        }
        var curs = [];
        var vals = [];
        var bals = [];
        fetchBalance();

        var portf = [];         //array of currencies owned
        //portfolio();

        function parseVals() {   //not used
                for (i = 0; i < curs.length; i++) {
                        c = curs[i];
                        v = r.c[i].total;//r.info[c].btcValue;      //array of btcValues
                        vals[i] = v;
                        cs(vals);
                }
        }
        //parseVals();

        function order(orderType, symbol, amount, price) {
                var orderId;
                function cancelOrder(id) {
                        exchange.cancelOrder(id).then((results) => {
                                var r = results;
                                console.log("CANCELED ORDER: " + JSON.stringify(r));
                                return JSON.stringify(r);
                        }).catch((error) => {
                                if (id == undefined) {
                                        console.log("NO ORDERS YET!!!")
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
                                //sendMail("Bougth",msg+"\n"+JSON.stringify(r));
                                orderType = "bougth";
                                //bougthPrice = r.price;            //safety
                                bougthPrice = price;
                                //setTimeout(function(){bougthPrice = r.price}, timeTicker*0.85); 
                                console.log("bougth");
                                setTimeout(function () { cancelOrder(orderId) }, timeTicker * 0.9);
                                return r;
                        }).catch((error) => {
                                console.error(error);
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

        function sellAll() {
                k = portf.length;
                cs(k);
                order("sell", symbol[k], amount, price);
                //k--;
        }
        var k = 0;

        //sellAll();
        //setTimeout(function () { sellAll() }, 5000);

}
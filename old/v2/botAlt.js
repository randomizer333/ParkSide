function runBotAlt(baseCurrency, quoteCurrency, strategy, ticker, exchangeName, stopLossP) {
    /*Architecture:
            init
            functions
            API functions
            runtime
            setup
            loop
    */

    let tradingFeeP;// = 0.5;      //default
    exchange.fees.trading.taker ? tradingFeeP = exchange.fees.trading.taker * 100 : tradingFeeP = 0.5;
    //init setup hardcode attributes later to come from GUI


    let bougthPrice = 0.00000001;    //default:0.00000001 low starting price,reset bot with 0 will 
    let round = 0;              //init number of sell orders til stop
    let roundMax = 5;       //disable buying after this count

    //let enableOrders = false;//false;//true;//m.enableOrders;        //DEV
    let symbol = f.mergeSymbol(baseCurrency, quoteCurrency);
    let fiatCurrency = "USDT";//"USDT"EUR
    exchangeName == "bitstamp" ? fiatCurrency = "EUR" : "";
    let quoteCrypto = "BTC"
    let fiatSymbol = f.mergeSymbol(quoteCrypto, fiatCurrency);
    let indicator = "MACD"; //"RSI","CGI"
    let portion = 0.99;        //!!! 0.51 || 0.99 !       part of balance to trade 
    //let stopLossP = 88;      //sell at loss 1,5,10% from bougthprice, 0% for disable, 100% never sell
    let minProfitP = 0.1;        //holding addition
    let timeTicker = f.minToMs(ticker); //!!! 4,8 || 1 !       minutes to milliseconds default: 1 *60000ms = 1min
    let msg;
    let x = 0; //counter for starting mail

    //functions CLI
    //let a = 0;
    function count() {       //defines next time delay
        let delay = 1000 //miliseconds
        a++;
        return a * delay;
    }

    let subject;
    let message;
    let to;
    function sendMail(subject, message, to) {
        // email account data
        let nodemailer = require('nodemailer');
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'mrbitja@gmail.com',
                pass: 'mrbitne7777777'
            }
        });

        // mail body
        let mailOptions = {
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
    sendMail("Run!", "Started at:" + f.getTime() + " Ran bot: " + baseCurrency + "/" + quoteCurrency);

    let sale = false;
    let purchase = false;
    let more;
    let baseBalanceInQuote;
    function selectCurrency() {        // check currency from pair that has more funds
        baseBalanceInQuote = baseToQuote(baseBalance);      //convert to base
        if ((baseBalanceInQuote > quoteBalance) && (baseBalanceInQuote > minAmount)) {   //can sell
            sale = true;
            purchase = false;
        } else if ((baseBalanceInQuote < quoteBalance) && (quoteBalance > minAmount)) {    //can buy
            purchase = true;
            sale = false;
            more = false;
        } else {
            purchase = false;
            sale = false;
            f.cs("Too low!");
        }
    }

    //functions API

    let change24hP = 0;
    let baseVolume;
    let quoteVolume;
    let minAmount;
    fetchTicker(symbol);
    function fetchTicker() {        //loads ticker of a symbol a currency pair
        exchange.fetchTicker(symbol).then((results) => {
            let r = results;    //market simbols BTC/USDT
            minAmount = marketInfo[symbol].limits.amount.min;
            //f.cs("minAmount: "+minAmount+ "for: "+ baseCurrency+"/"+quoteCurrency)
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

    function fetchBalances() {    //fetches balance of a currency
        exchange.fetchBalance().then((results) => {
            let r = results;
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
    let quoteBalance = 0;
    let baseBalance = 0;
    fetchBalances();

    let bid;
    let ask;
    let bid2;
    let ask2;
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

    let fiatPrice;
    function fetchFiatPrice(fiatSymbol) {        //fetch ticker second order
        exchange.fetchOrderBook(fiatSymbol).then((results) => {
            fiatPrice = results.bids[0][0];
        }).catch((error) => {
            console.error(error);
        })
    }

    //logic funk and math junk

    let a;
    let b;
    function boolToInitial(bool) {	//returns initial of string|bool
        bool;
        a = bool.toString();
        b = a.charAt(0);
        return b;
    }
    let amountQuote;
    let amountBase;
    function quoteToBase(amountQuote) {
        amountBase = amountQuote / bid;
        return amountBase;
    }
    function baseToQuote(amountBase) {
        amountQuote = amountBase * bid;
        return amountQuote;
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

    function selfStop() {
        clearInterval(loopAlt);
    }

    function order(orderType, symbol, amount, price) {
        let orderId;
        function cancelOrder(id) {
            exchange.cancelOrder(id).then((results) => {
                let r = results;
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
                let r = results;
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
                //selfStop();
                return r;
            }).catch((error) => {
                console.error(error);
                //selfStop(quoteCurrency, fiatCurrency, loop);
            })
        }
        function createLimitBuyOrder(symbol, amount, price) {        // symbol, amount, bid 
            exchange.createLimitBuyOrder(symbol, amount, price).then((results) => {
                let r = results;
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
                setTimeout(function () { cancelOrder(orderId) }, timeTicker * 0.9);
                return r;
            }).catch((error) => {
                f.cs("invalid order: " + error)
            })
        }
        switch (orderType) {
            case "buy":
                createLimitBuyOrder(symbol, amount, price);
                console.log("made buy order with Symbol: " + symbol + " Amount: " + amount + " Price: " + price);
                break;
            case "sell":
                createLimitSellOrder(symbol, amount, price);
                console.log("made sell order with Symbol: " + symbol + " Amount: " + amount + " Price: " + price);
                break;
            default:
                console.log("Invalid order type!!!");
                break;
        }
    }

    let logMACD = new Array();      //must be global!
    let logRSI = new Array();      //must be global!
    let logUD = new Array();
    let price;
    let stor = new Array();     //storage for direction
    function PINGPONG() {
        price = makePrice(ask, bid);
        function makePrice(high, low) {
            spread = high - low;
            return price = high - (spread / 2);
        }

        bougthPrice == 0.00000001 ? bougthPrice = price : "";   //init

        //balanceChanged();
        function balanceChanged() {
            if (baseBalanceInQuote > quoteBalance) {   //quoteBalance 0.0001 0.001 = 5 EUR
                if (!more) {
                    bougthPrice = price;
                    more = true;
                    console.log("Bougth price updated: " + more);
                }
            }
        }

        //price loging:
        loger(price, 5, logUD);
        loger(price, 77, logMACD);
        loger(price, 15, logRSI);
        function loger(value, length, array) {        //log FILO to array
            let counter;         //d   
            while (array.length >= length) {
                array.pop();
            }
            array.unshift(value);
            counter++;    //d
            return array;
        }

        let sellPrice;
        sellPrice = 0;
        let hold;
        hold = safetySale(tradingFeeP, bougthPrice);        //returns bool
        function safetySale(tradingFeeP, bougthPrice) {  //no sale with loss
            let tradingFeeAbs;
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

        let stopLoss;
        stopLoss = safetyStopLoss(price, stopLossP, sellPrice);       //returns boolean
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

        //get trends,signals,startegy
        let trendSign;
        let trendUD;
        upDown(price);
        function upDown(value) {     //trendUD between curent and last value
            let ma = f.getAvgOfArray(logUD);
            //console.log("ma5:"+ma5);
            if (stor[1] == undefined) {
                stor[1] = value;
                stor[0] = value;
            };
            stor[1] = stor[0];
            stor[0] = value;
            //let direction = stor[0] - stor[1];
            let direction = stor[0] - ma;
            //console.log("direction:"+direction);
            if (direction > 0) {
                trendUD = 1;   //buy coz rising
                trendSign = "+";
            } else {
                trendUD = -1;   //hold or park coz stationary
                trendSign = "-";
            }
        }

        let trendRSI;
        trendRSI = TI_RSI(logRSI);
        function TI_RSI(values) {
            let RSI = TI.RSI;
            let inputRSI = {
                values: values,
                period: 14   //9
            };
            let r = RSI.calculate(inputRSI);
            let n = r.length - 1;
            let lastRSI = r[n]; //last JSON
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

        let macdLine;
        let signalLine;
        let macdHistogram;      //>1,<1
        let trendMACD;  //-1,0,1
        TI_MACD(logMACD);
        function TI_MACD(values) {     //should be bigger the better starts working when value = slowPeriod + signalPeriod
            let MACD = TI.MACD;
            let macdInput = {
                values: values,   //34,70,140n of inputs - slowPeriod = n of outputs 
                fastPeriod: 24,       //12,24,48
                slowPeriod: 52,       //26,52,104      when this is full it putout
                signalPeriod: 18,        //9,18,36
                SimpleMAOscillator: false,
                SimpleMASignal: false
            };
            let r = MACD.calculate(macdInput);      //array with JSONs
            //console.log(r);
            //console.log("data length: "+values.length);
            let lastMACD;
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

        let buyPrice;
        buyPrice = price;//makeAsk(ask,ask2);
        function makeAsk(ask, ask2) {     //makerify prices for orders
            let shiftP = 50;       //percentage of makerPrice shift
            let askSubSpread = ask2 - ask;    //spread between first and second order of asks
            return buyPrice = ask + f.part(shiftP, askSubSpread);
        }

        let salePrice;
        salePrice = price;//makeBid(bid,bid2);
        function makeBid(bid, bid2) {     //makerify prices for orders
            let shiftP = 50;       //percentage of makerPrice shift
            let bidSubSpread = bid - bid2;    //spread between first and second order of bids
            return salePrice = bid - f.part(shiftP, bidSubSpread);
        }

        let sellAmount = baseBalance; // * portion;
        let orderType = "none";
        let buyAmount;
        buyAmount = quoteToBase(quoteBalance) * portion;
        makeOrder();
        function makeOrder() { //purchase,sale,hold,stopLoss,price,symbol,baseBalance,quoteBalance
            if (purchase && (trendUD > 0) && (trendRSI >= 0) && (trendMACD > 0) && (change24h > 0)) {// buy with RSI and MACD (rsi > 0) | (macd > 0) && (c24h > 0)
                orderType = "bougth";
                round += 1;     //dev
                enableOrders ? order("buy", symbol, buyAmount, buyPrice) : console.log('buy orders disabled');
            } else if (sale && !hold && !stopLoss && (trendUD < 0) && (trendMACD <= 0)) {//sell good
                orderType = "sold";
                enableOrders ? order("sell", symbol, sellAmount, salePrice) : console.log('sell orders disabled');
            } else if (sale && hold && stopLoss) {//stopLoss sell bad
                orderType = "lossed";
                enableOrders ? order("sell", symbol, sellAmount, salePrice) : console.log('loss sell orders disabled');
            } else if (sale && hold && !stopLoss) {//holding fee NOT covered
                orderType = "holding";
            } else if (sale && !hold && !stopLoss) {//holding fee covered
                orderType = "holding good";
            } else if (purchase) {      // ( change24h > 0 )
                orderType = "parked";
            } else {
                orderType = "still none";
            }
            return print();
        }
        function print() {
            let baseBalanceInQuote = baseToQuote(baseBalance);
            let quoteBalanceInBase = quoteToBase(quoteBalance);
            let balance = baseBalanceInQuote + quoteBalance;
            let fiatValue = balance * fiatPrice;/*
                console.log("fiatValue " + fiatValue);
                console.log("balance " + balance);*/
            let balanceB = quoteBalanceInBase + baseBalance;
            let profit = price - sellPrice;
            let relProfit = f.percent(profit, sellPrice);
            let absProfit = f.part(relProfit, baseBalanceInQuote);
            let absProfitFiat = absProfit * fiatPrice;/*
                console.log("absProfitFiat " + absProfitFiat);
                console.log("absProfit " + absProfit);
                console.log("fiatPrice " + fiatPrice);*/

            let rounds = roundMax - round;
            //let absProfit = profit * baseBalance;
            //let relProfit = f.percent(absProfit, sellPrice);
            let separator = "|";
            msg =   //info msg on ticker time
                f.getTime() + "|" +
                "P:" + price.toFixed(8) + " " + symbol + "|" +
                "aP:" + absProfit.toFixed(8) + " " + quoteCurrency + "|" +
                "rP:" + (relProfit + minProfitP).toFixed(2) + " %|" +
                "aPF:" + absProfitFiat.toFixed(2) + " " + fiatCurrency + "|" +
                stopLossP + " %" + "|" +
                //"aPF:" + fiatAbsProfit.toFixed(2) + " " + fiatCurrency + "|" +
                "C24h:" + change24hP + "|" +
                "Min:" + minAmount + "|" +
                //"B1:"+bid+" "+symbol+"|"+
                //"B2:"+bid2+" "+symbol+"|"+
                //"t:" + ticker + "m" + "|" +
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

    let log = "LOG: ";       //prefix
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
        //setTimeout(function () { loadMarkets() }, count());
        setTimeout(function () { fetchAsksBids(symbol) }, count());
        setTimeout(function () { fetchBalances() }, count());
        setTimeout(function () { fetchTicker() }, count());

        setTimeout(function () {
            console.log(
                "Wallet:" + "\n" +
                baseBalance + " " + baseCurrency + "\n" +
                quoteBalance + " " + quoteCurrency)
        }, count());
        setTimeout(function () { console.log("Selected market: " + baseCurrency + " / " + quoteCurrency) }, count());
        setTimeout(function () { console.log("24h change: " + change24hP.toFixed(2) + " %") }, count());
        setTimeout(function () { console.log("BaseVolume: " + baseVolume + " " + baseCurrency) }, count());
        setTimeout(function () { console.log("QuoteVolume: " + quoteVolume + " " + quoteCurrency) }, count());
        setTimeout(function () { console.log("Currency to sell: " + selectCurrency()) }, count());

        //loop fetches
        setTimeout(function () { loopAlt = setInterval(function () { loopFetches() }, timeTicker) }, count());
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
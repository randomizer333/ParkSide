//init
const dbms = require("./js/dbms")
//const db = "./json/db.json"    //define database location
const f = require("./js/funk")
const m = require("./js/modul")
const a = require("./js/api")
const t = require("./js/ti")
const s = require("./json/set.json")
const mrkts = require("./js/enabledMarkets")

const enabledMarkets = mrkts.mrkts()
const fiat = s.fiatCurrency
const quotes = s.quotes
const bases = m.extractBases(enabledMarkets)
const tickerTime = f.minToMs(s.tickerMinutes)
const minProfitP = s.minProfitP
const stopLossP = s.stopLossP
const enableOrders = s.enableOrders
const portion = s.portion

const curencies = bases
curencies.push(fiat)

let bot = []

init()
async function init() {
    //scan for markets by alt currencies
    r = await a.loadMarkets()
    console.log({
        "Version": a.exInfos.version,
        "Exchanges": a.exInfos.exchanges.length,
        "Selected": a.exInfos.exchange,
        "Url": a.exInfos.url,
        //"referral": a.exInfos.referral,
        "Markets": r.length,
        "FeeM": a.exInfos.feeMaker,
        "FeeT": a.exInfos.feeTaker,
        "TradingEnabled": s.enableOrders,
        "risk": s.stopLossP,
        "reward": s.minProfitP,
    })
    enableOrders ? f.sendMail("Restart", "RUN! at " + f.getTime() + "\n") : ""
    await setup()
}

async function setup() {//setup runs only once on start
    populateDB()
    async function populateDB() {
        let valet = await a.wallet()
        populateBalances(valet)
        async function populateBalances(valet) {
            let owned = Object.keys(valet)
            console.log(owned)
            for (let i in owned) {
                try {
                    if (dbms.db["Assets"][owned[i]].balance == 0) {
                        console.log(dbms.db["Assets"][owned[i]].balance)
                        dbms.writeToDB("Assets", owned[i], "balance", valet[owned[i]])
                        console.log("Updating balance of " + owned[i])
                    } else if (
                        (valet[owned[i]] != dbms.db["Assets"][owned[i]].balance)
                        && (dbms.db["Assets"][owned[i]].balance != 0)) {
                        console.log(owned[i] + " Corecting")
                        dbms.writeToDB("Assets", owned[i], "balance", valet[owned[i]])
                    } else {
                        //console.log("OK " + owned[i])
                    }
                } catch (error) {
                    //console.log("dissabled " + owned[i])
                }
            }
            return true
        }
        popMarkets(curencies)
        function popMarkets(curencies) {
            //console.log(curencies)
            for (let i in curencies) {
                populateInMarkets(curencies[i], enabledMarkets)
            }
            for (let i in curencies) {
                populateOutMarkets(curencies[i], enabledMarkets)
            }

        }
        function populateInMarkets(currency, enabledMarkets) {
            let markets = []
            let j = 0
            for (let i in enabledMarkets) {
                base = m.splitSymbol(enabledMarkets[i], "first")
                if (base == currency) {
                    markets[j] = enabledMarkets[i]
                    j++
                }
            }
            //console.log(markets)
            dbms.writeToDB("Assets", currency, "inMarkets", markets)
            return markets    //arr
        }
        function populateOutMarkets(currency, enabledMarkets) {
            let markets = []
            let j = 0
            for (let i in enabledMarkets) {
                quote = m.splitSymbol(enabledMarkets[i], "second")
                if (quote == currency) {
                    markets[j] = enabledMarkets[i]
                    j++
                }
            }
            //console.log(markets)
            dbms.writeToDB("Assets", currency, "outMarkets", markets)
            return markets    //arr
        }
    }
    setBots(enabledMarkets, tickerTime)
    async function setBots(enabledMarkets, tickerTime) {
        numOfBots = await enabledMarkets.length;
        delay = (tickerTime / numOfBots);
        let a = 0;
        function setStartTime() {
            r = a * delay;
            a++;
            return r;
        }
        runLoops(enabledMarkets)
        async function runLoops(mks) {
            console.log("Runing markets: " + mks)
            for (let i in await mks) {
                setTimeout(function () { proces(mks[i], tickerTime, i) }, setStartTime());
            }
        }
    }
}

async function proces(symbol, tickerTime, number) {
    //loop  //market
    loop(symbol, number) //run once
    bot[number] = setInterval(function () { loop(symbol, number) }, tickerTime)
    async function loop(symbol, number) {
        //read and set variables and values
        let base = m.splitSymbol(symbol, "first")   //name of base currency
        let quote = m.splitSymbol(symbol, "second") //
        let prices = dbms.db["Markets"][symbol].prices
        let vwaps = dbms.db["Markets"][symbol].vwaps
        let changes = dbms.db["Markets"][symbol].changes
        let volumes = dbms.db["Markets"][symbol].volumes
        let change1h = dbms.db["Markets"][symbol].change1h
        let macds = dbms.db["Markets"][symbol].macds
        let dmacds = dbms.db["Markets"][symbol].dmacds
        let orderType = dbms.db["Markets"][symbol].orderType

        //get values

        let baseFiatMarket = m.mergeSymbol(base, fiat)
        let baseFiatOrderBook = await a.fetchOrderBook(baseFiatMarket)
        let baseFiatPrice = baseFiatOrderBook.price
        //console.log("baseFiatPrice")
        //console.log(baseFiatPrice)

        let quoteFiatMarket = m.mergeSymbol(quote, fiat)
        let quoteFiatOrderBook = await a.fetchOrderBook(quoteFiatMarket)
        let quoteFiatPrice = quoteFiatOrderBook.price
        //console.log("quoteFiatPrice")
        //console.log(quoteFiatPrice)

        let orderBook = await a.fetchOrderBook(symbol)
        let price = orderBook.price
        let ask = orderBook.ask
        let bid = orderBook.bid

        let ticker = await a.fetchTicker(symbol)
        let volume = ticker.baseVolume
        let change = ticker.change
        let vwap = ticker.vwap
        let open = ticker.open
        let high = ticker.high
        let low = ticker.low
        let close = ticker.close

        //update logs
        let logLength = 200
        prices = await f.loger(price, logLength, prices)
        vwaps = await f.loger(vwap, logLength, vwaps)
        changes = await f.loger(change, logLength, changes)
        volumes = await f.loger(volume, logLength, volumes)

        globalAward(enabledMarkets, 3)
        let award = dbms.db["Markets"][symbol].award
        function globalAward(symbols, number) {
            let syms = clearAwards(symbols)
            function clearAwards(toClear) {
                for (let i in toClear) {  //clear awards
                    dbms.db["Markets"][toClear[i]].award = false
                }
                return toClear
            }
            let toAward = colect(syms)
            function colect(symbols) {
                let list = []
                for (let i in symbols) {
                    read = dbms.db["Markets"][symbols[i]].change1h[0]
                    list[i] = {
                        "symbol": symbols[i],
                        "value": read
                    }
                }
                return list
            }
            let sorted = sort(toAward)
            function sort(arr) {
                //arr.sort((a, b) => (a.value > b.value) ? 1 : -1)
                arr.sort(function (a, b) {
                    return b.value - a.value    //-desc +asc
                })
                return arr
            }
            let awards = podium(sorted)
            function podium(arr) {
                let podium = f.cutArray(arr, number)
                for (let i in podium) {
                    if (podium.value > 0) { //not for negative ones
                        dbms.db["Markets"][podium[i].symbol].award = true //write awards
                    }
                }
                return podium
            }
            //console.log(awards)
            return awards
        }

        let signal = await t.signal(prices, vwaps, changes, volumes, macds, dmacds, tickerTime)
        let upSignal = signal.upSignal
        let downSignal = signal.downSignal
        change1h = await f.loger(signal.all.change1hP, logLength, change1h)
        macds = await f.loger(signal.all.MACD, logLength, macds)
        dmacds = await f.loger(signal.all.DMACD, logLength, dmacds)

        //Assets preparation(Private API)-----------------------------------

        let balanceBase = dbms.db["Assets"][base].balance
        let balanceQuote = dbms.db["Assets"][quote].balance
        let balanceBaseInQuote = m.baseToQuote(balanceBase, price)
        let balanceQuoteInBase = m.quoteToBase(balanceQuote, price)
        //let fiatBaseValue = balanceBase * baseFiatPrice
        //let fiatQuoteValue = balanceQuote * quoteFiatPrice
        let minAmount = await a.loadMarketMinAmount(symbol)

        //read FCA
        let FCAValueBase = await dbms.db["Assets"][base].FCAValue
        let FCAPricesBase = await dbms.db["Assets"][base].FCAPrices
        let FCAAmountsBase = await dbms.db["Assets"][base].FCAAmounts

        let FCAValueQuote = await dbms.db["Assets"][quote].FCAValue
        let FCAPricesQuote = await dbms.db["Assets"][quote].FCAPrices
        let FCAAmountsQuote = await dbms.db["Assets"][quote].FCAAmounts

        let stackBase = !FCAPricesBase.length ? 0 : FCAPricesBase.length
        let stackQuote = !FCAPricesQuote.length ? 0 : FCAPricesQuote.length

        let fee = a.exInfos.feeMaker * 100
        //let feeTaker = a.exInfos.feeTaker * 100

        //old
        let conditions = m.selectSide(balanceBase, balanceQuote, minAmount, balanceBaseInQuote, balanceQuoteInBase)
        let purchase = conditions.purchase
        let sale = conditions.sale

        let safeSale = await m.safeSale(fee, FCAValueBase, price, minProfitP, stackBase)
        let hold = safeSale.hold
        let sellPrice = safeSale.sellPrice

        let limitLoss = await m.checkStopLoss(price, stopLossP, sellPrice, quote, fiat, minProfitP)
        let stopLoss = limitLoss.stopLoss
        let lossPrice = limitLoss.lossPrice

        f.delay(5)  //fake delay makeOrder()

        //console.log(purchase, sale, stopLoss, hold, symbol, balanceBase, balanceQuote, portion, award, upSignal, downSignal)

        orderType = await makeOrder(purchase, sale, stopLoss, hold, symbol, balanceBase, balanceQuote, portion, award, upSignal, downSignal)
        async function makeOrder(purchase, sale, stopLoss, hold, symbol, balanceBase, balanceQuote, portion, award, upSignal, downSignal) {
            if (purchase && !sale && upSignal && award) {//buy 
                //order = await a.buy(symbol, quoteBalanceInBase * portion, price) //limit order
                enableOrders ? order = await a.buyMarket(symbol, balanceQuote * portion) : fakeBuy()
                if (order.status == "closed") {
                    await bougth(order)
                    orderType = "bougth"
                } else {
                    orderType = "parked"
                }
            } else if (sale && !hold && !stopLoss && downSignal) {//sell good
                //order = await a.sell(symbol, quoteBalanceInBase * portion, price) //limit order
                enableOrders ? order = await a.sellMarket(symbol, balanceBase * portion) : fakeSell()
                if (order.sts == "closed") {
                    await sold(order)
                    orderType = "sold"
                } else {
                    orderType = "holding"
                }
            } else if (sale && hold && stopLoss && downSignal) {//sell bad stopLoss
                //order = await a.sell(symbol, quoteBalanceInBase * portion, price) //limit order
                enableOrders ? order = await a.sellMarket(symbol, balanceBase * portion) : fakeSell()
                if (order.sts == "closed") {
                    await sold(order)
                    orderType = "lossed"
                } else {
                    orderType = "holding"
                }
            } else if (sale && hold && !stopLoss) { //holding fee NOT covered
                orderType = "holding";
            } else if (sale && !hold && !stopLoss) {//holding fee covered
                orderType = "holding good";
            } else if (purchase) {
                orderType = "parked";
            } else {
                orderType = "still none";
            }
            return orderType
        }

        //post proces after order
        await postProces()
        //await fakeBuy()
        async function fakeBuy() {
            f.delay(10)
            orderR = {  //fake return od makeOrder()
                "orderType": "bougth",
                "price": price,
                "amount": Math.floor((Math.random() * 100) + 1),
            }
            await bougth(orderR, baseFiatMarket, quoteFiatMarket)
        }
        //await fakeSell()
        async function fakeSell() {
            f.delay(10)
            orderR = {  //fake return od makeOrder()
                "orderType": "sold",
                "price": price,
                "amount": Math.floor((Math.random() * 100) + 1),
            }
            sold(orderR, baseFiatMarket, quoteFiatMarket)
        }

        async function bougth(orderR, baseFiatMarket, quoteFiatMarket) {
            //get fresh prices
            let baseFiatOrderBook = await a.fetchOrderBook(baseFiatMarket)
            let baseFiatPrice = baseFiatOrderBook.price
            let quoteFiatOrderBook = await a.fetchOrderBook(quoteFiatMarket)
            let quoteFiatPrice = quoteFiatOrderBook.price
            let amount = orderR.amount
            let price = orderR.price

            //on purchase write and calculate
            //buy base/sell quote sequence
            //base in
            FCAPricesBase.unshift(baseFiatPrice)  //log
            FCAAmountsBase.unshift(amount)   //log
            let FCAI = await m.FCAIn(FCAPricesBase, FCAAmountsBase)   //dca
            FCAValueBase = FCAI.value
            console.log("FCAI")
            console.log(FCAI)

            //quote out
            let FCAO = await m.FCAOut(quoteFiatPrice, amount, FCAAmountsQuote)   //dca
            FCAValueQuote = FCAO.value  //log it 
            FCAPricesQuote = FCAO.price
            FCAAmountsQuote = FCAO.amount
            console.log("FCAO")
            console.log(FCAO)
            await postProces()
        }
        async function sold(orderR, baseFiatMarket, quoteFiatMarket) {
            let baseFiatOrderBook = await a.fetchOrderBook(baseFiatMarket)
            let baseFiatPrice = baseFiatOrderBook.price
            let quoteFiatOrderBook = await a.fetchOrderBook(quoteFiatMarket)
            let quoteFiatPrice = quoteFiatOrderBook.price
            let amount = orderR.amount

            //on sale
            //base out
            let FCAO = await m.FCAOut(baseFiatPrice, amount, FCAAmountsBase)   //dca
            FCAValueBase = FCAO.value  //log it 
            FCAPricesBase = FCAO.price
            FCAAmountsBase = FCAO.amount
            console.log("FCAO")
            console.log(FCAO)

            //quote in
            let FCAI
            if (quoteFiatPrice == 0) {
                console.log("no marketaaasdsd")
                FCAI = {
                    "value": 0,
                    "price": 0,
                    "amount": balanceQuote,
                }
                FCAPricesQuote = [FCAI.price]  //log
                FCAAmountsQuote = [FCAI.amount]   //log
                FCAValueQuote = FCAI.value
                await postProces()
            } else {
                console.log("je market")
                FCAPricesQuote.unshift(quoteFiatPrice)  //log
                FCAAmountsQuote.unshift(amount)   //log
                FCAI = await m.FCAIn(FCAPricesQuote, FCAAmountsQuote)   //dca
                FCAValueQuote = FCAI.value
                await postProces()
            }
            console.log("FCAI")
            console.log(FCAI)
        }

        //update stacks
        stackBase = !FCAPricesBase ? 0 : FCAPricesBase.length
        stackQuote = !FCAPricesQuote ? 0 : FCAPricesQuote.length

        async function postProces() {
            console.log("Writing")
            await dbms.writeJSON(db)    //write
            let info = {    //output
                "number": number,
                "time": f.getTime(),
                "baseFiatPrice": baseFiatPrice + " " + fiat,
                "quoteFiatPrice": quoteFiatPrice + " " + quote,
                "symbol": symbol,
                "price": price,
                "signal": signal,
                "vwap": vwap,
                "change": change,
                "award": award,
                //"volume": volume,
                //"prices": prices,
                "pricesLength": prices.length,
                "orderType": orderType,
                "AllSafe": "______________________________",
                "balanceBase": balanceBase + " " + base,
                "balanceQuote": balanceQuote + " " + quote,
                "purchase": purchase,
                "sale": sale,
                "hold": hold,
                "stopLoss": stopLoss,
                "sellPrice": sellPrice,
                "lossPrice": lossPrice,
                "FCAValueBase": FCAValueBase,
                "FCAPricesBase": FCAPricesBase,
                "FCAAmountsBase": FCAAmountsBase,
                "stackBase": stackBase,
                "Related": "_______________________________",
                "FCAValueQuote": FCAValueQuote,
                "FCAPricesQuote": FCAPricesQuote,
                "FCAAmountsQuote": FCAAmountsQuote,
                "stackQuote": stackQuote,
            }
            await m.sender(info, orderType)
            console.log(info)
        }

        return
    }
}

//initialize entities
//set/get atributes
//proces data
//report results

/*
buying curent base is seling curent quote
    base inMarkets  update
base outMarket  reset
quote inMarkets reset
quote outMarket reset

seling curent base is buying curent quote
base inMarkets reset
base outMarket reset
    quote inMarkets update
quote outMarket reset

on buy give asset a buy point in FCA
on sell give it a sell point
*/
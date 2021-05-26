//init const
const dbms = require("./js/dbms")
//const db = "./json/db.json"    //define database location
const f = require("./js/funk")
const m = require("./js/modul")
const a = require("./js/api")
const t = require("./js/ti")
const s = require("./json/set.json")
const mrkts = require("./js/enabledMarkets")

const enabledMarkets = mrkts.mrkts()
const pullOut = s.pullOut
const fiat = s.fiatCurrency
//const quotes = s.quotes
const bases = m.extractBases(enabledMarkets)
const tickerTime = f.minToMs(s.tickerMinutes)
const minProfitP = s.reward
const stopLossP = s.risk
const enableOrders = s.enableOrders
const portion = s.portion
const sellPortion = s.sellPortion

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
        //"Url": a.exInfos.url,
        //"referral": a.exInfos.referral,
        "Markets": r.length,
        "FeeM": a.exInfos.feeMaker,
        "FeeT": a.exInfos.feeTaker,
        "TradingEnabled": enableOrders,
        "Reward": minProfitP,
        "Risk": stopLossP,
    })
    enableOrders ? f.sendMail("Restart", "RUN! at " + f.getTime() + "\n") : ""
    await setup()
}

async function setup() {//setup runs only once on start
    await populateDB()
    async function populateDB() {
        let valet = await a.wallet()
        await populateBalances(valet)
        async function populateBalances(valet) {
            let owned = Object.keys(valet)
            for (let i in owned) {
                try {
                    if (dbms.db["Assets"][owned[i]].balance == 0) {
                        //console.log(dbms.db["Assets"][owned[i]].balance)
                        dbms.writeToDB("Assets", owned[i], "balance", valet[owned[i]])
                        console.log("Updating balance of " + owned[i])
                        console.log(valet[owned[i]])
                        //update oalso
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

        await popMarkets(curencies)
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
    await setBots(enabledMarkets, tickerTime)
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
    //init-----------------------------------------
    let base = m.splitSymbol(symbol, "first")   //name of base currency
    let quote = m.splitSymbol(symbol, "second")
    let baseFiatMarket = m.mergeSymbol(base, fiat)
    let quoteFiatMarket = m.mergeSymbol(quote, fiat)

    //read and set variables and values
    let prices = dbms.db["Markets"][symbol].prices
    let vwaps = dbms.db["Markets"][symbol].vwaps
    let changes = dbms.db["Markets"][symbol].changes
    let volumes = dbms.db["Markets"][symbol].volumes
    let change1h = dbms.db["Markets"][symbol].change1h
    let macds = dbms.db["Markets"][symbol].macds
    let dmacds = dbms.db["Markets"][symbol].dmacds
    let orderType = dbms.db["Markets"][symbol].orderType

    let award = await dbms.db["Markets"][symbol].award

    //read FCA
    let CAPrice = await dbms.db["Markets"][symbol].CAPrice
    let CACost = await dbms.db["Markets"][symbol].CACost

    let inMarkets = dbms.db["Assets"][base].inMarkets
    let inMarketsQuote = dbms.db["Assets"][quote].inMarkets
    let buys = dbms.db["Assets"][base].buys

    let initCA = await checkCAs()
    async function checkCAs() {
        let balance = await a.balance(base)
        if ((!CAPrice) && (balance !== 0)) { //update 
            console.log(base)
            await dbms.writeToDB("Assets", base, "balance", balance)
            await updateInMarkets(inMarkets)
            async function updateInMarkets(inMarkets) {
                for (let i in inMarkets) {
                    let ticker = await a.fetchTicker(inMarkets[i])
                    let price = ticker.close
                    r = await m.CAIn(price, balance, 0, 0)
                    console.log(r)
                    let CAP = r.CAPrice
                    let CAC = r.CACost
                    await dbms.writeToDB("Markets", inMarkets[i], "CAPrice", CAP)
                    await dbms.writeToDB("Markets", inMarkets[i], "CACost", CAC)
                }
            }
        } else {
            console.log("balance OK")
        }
        return r
    }

    //market
    loop(symbol, number) //run once
    bot[number] = setInterval(function () { loop(symbol, number) }, tickerTime)
    async function loop(symbol, number) {
        //get values

        CAPrice = dbms.db["Markets"][symbol].CAPrice  //second look
        CACost = dbms.db["Markets"][symbol].CACost    //second look

        let balanceQuote = dbms.db["Assets"][quote].balance
        let balanceBase = dbms.db["Assets"][base].balance   //same as CAAmount

        let baseFiatOrderBook = await a.fetchOrderBook(baseFiatMarket)
        let baseFiatPrice = baseFiatOrderBook.price

        let quoteFiatOrderBook = await a.fetchOrderBook(quoteFiatMarket)
        let quoteFiatPrice = quoteFiatOrderBook.price

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

        //console.log(quoteFiatPrice,CACost)
        let FCost
        FCost = await FCA(quoteFiatPrice, CACost)
        async function FCA(quoteFiatPrice, CACost) {
            if (quoteFiatPrice == 0 ) {
                return CACost
            } else {
                return CACost * quoteFiatPrice
            }
        }

        let part = price - CAPrice
        let profitRelative = await f.percent(part, CAPrice)
        profitRelative == Infinity ? profitRelative = 0 : ""
        let ap = await f.part(profitRelative, balanceBase)
        absoluteProfit = ap * baseFiatPrice


        //update logs
        let logLength = 200
        prices = await f.loger(price, logLength, prices)
        vwaps = await f.loger(vwap, logLength, vwaps)
        changes = await f.loger(change, logLength, changes)
        volumes = await f.loger(volume, logLength, volumes)

        globalAward(enabledMarkets, 3)
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
                    if (podium[i].value > 0) { //not for negative ones
                        //console.log("awrdsing")
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
        //console.log("macds")
        //console.log(macds)
        dmacds = await f.loger(signal.all.DMACD, logLength, dmacds)

        //Assets preparation(Private API)-------------------------

        let balanceBaseInQuote = m.baseToQuote(balanceBase, price)
        let balanceQuoteInBase = m.quoteToBase(balanceQuote, price)

        let minAmount = await a.loadMarketMinAmount(symbol)
        let fee = a.exInfos.feeMaker * 100
        let feeTaker = a.exInfos.feeTaker * 100

        /*let conditions = m.selectSide(balanceBase, balanceQuote, minAmount, balanceBaseInQuote, balanceQuoteInBase)
        let purchase = conditions.purchase
        let sale = conditions.sale*/
        let purchase = balanceQuoteInBase > minAmount
        let sale = balanceBase > minAmount

        let safeSale = await m.safeSale(fee, CAPrice, price, minProfitP, buys)
        let hold = safeSale.hold
        let sellPrice = safeSale.sellPrice

        let limitLoss = await m.checkStopLoss(price, stopLossP, sellPrice, quote, fiat, minProfitP)
        let stopLoss = limitLoss.stopLoss
        let lossPrice = limitLoss.lossPrice


        let order = { "status": "still none" }
        orderType = await makeOrder(purchase, sale, stopLoss, hold, symbol, balanceBase, balanceQuote, portion, award, upSignal, downSignal)
        async function makeOrder(purchase, sale, stopLoss, hold, symbol, balanceBase, balanceQuote, portion, award, upSignal, downSignal) {
            if (purchase && upSignal && award) {//buy 
                enableOrders && !pullOut ? order = await a.buyMarket(symbol, balanceQuote * portion) : order = await m.fakeBuy()
                if (order.status == "closed") {//"bougth"
                    await updateCA()
                    orderType = "bougth"
                } else {
                    orderType = "parked"
                }
            } else if (sale && !hold && !stopLoss && downSignal) {//sell good
                enableOrders ? order = await a.sellMarket(symbol, balanceBase * sellPortion) : order = await m.fakeSell()
                if (order.status == "closed") {
                    await updateCA()
                    orderType = "sold"
                } else {
                    orderType = "holding"
                }
            } else if (sale && hold && stopLoss && downSignal) {//sell bad stopLoss
                enableOrders ? order = await a.sellMarket(symbol, balanceBase * sellPortion) : order = await m.fakeSell()
                if (order.status == "closed") {
                    await updateCA()
                    orderType = "lossed"
                } else {
                    orderType = "holding"
                }
            } else if (sale && hold && !stopLoss) { //holding fee NOT covered
                orderType = "holding";
            } else if (sale && !hold && !stopLoss) {//holding fee covered
                orderType = "holding good"
            } else if (purchase) {//waiting signal
                orderType = "parked"
                //order = await m.fakeBuy() //sim
                //orderType = await bougth(order.amount, quote) //sim
            } else {
                orderType = "still none"
            }
            return orderType
        }
        //post proces after order

        //update FCA on local assets base and quote and all inMarkets
        async function updateCA() {
            //base in
            await updateInMarkets(base)
            //quote out, cost of quote falls
            await updateInMarkets(quote)
        }
        //FCA repeat for all inMarkets assets
        //updateInMarkets(base)
        async function updateInMarkets(asset) {
            let inMarkets = await dbms.db["Assets"][asset].inMarkets
            let oldBalance = await dbms.db["Assets"][asset].balance
            let balance = await a.balance(asset)    //negative for sell
            let amount = balance - oldBalance
            if (amount !== 0) {
                for (let i in inMarkets) {
                    let ticker = await a.fetchTicker(inMarkets[i])
                    let price = ticker.close
                    let CAC = dbms.db["Markets"][inMarkets[i]].CACost
                    let r = await m.CAIn(price, amount, CAC, oldBalance)
                    console.log(r)
                    let CAP = r.CAPrice
                    CAC = r.CACost
                    await dbms.writeToDB("Markets", inMarkets[i], "CAPrice", CAP)
                    await dbms.writeToDB("Markets", inMarkets[i], "CACost", CAC)
                }
            } else {
                console.log("no realization")
            }
            await dbms.writeToDB("Assets", asset, "balance", balance)
        }

        await dbms.writeJSON(db)    //write
        await postProces(orderType)
        async function postProces(orderType) {
            let info = {    //output
                "No": number,
                "time": f.getTime(),
                "market": symbol,
                "baseFiatPrice": baseFiatPrice + " " + baseFiatMarket,
                "quoteFiatPrice": quoteFiatPrice + " " + quoteFiatMarket,
                "enabled": enableOrders,
                //"signal": signal,
                "award": award,
                "upSignal": signal.upSignal,
                "uppers": signal.uppers,
                "downers": signal.downers,
                "downSignal": signal.downSignal,
                //"vwap": vwap,
                //"change": change,
                //"volume": volume,
                //"prices": prices,
                "pricesLength": prices.length,
                "orderType": orderType,
                "orderStatus": order.status,
                "AllSafe": "-----------------------------",
                "balanceBase": balanceBase + " " + base,
                "balanceQuote": balanceQuote + " " + quote,
                "sale": sale,
                "purchase": purchase,
                "minAmount": minAmount,
                "hold": hold,
                "buys": buys,
                "stopLoss": stopLoss,
                "sellPrice": sellPrice + " " + symbol,
                "price--": price + " " + symbol,
                "lossPrice": lossPrice + " " + symbol,
                "Market_CA": "---------------------------",
                "CAPrice": CAPrice + " " + symbol,
                "CACost": CACost + " " + quote,
                "QFCost": FCost.toFixed(2) + " " + fiat,
                "AP": absoluteProfit.toFixed(2) + " " + fiat,
                "RP": profitRelative.toFixed(2) + " %",
            }
            await m.sender(info, orderType)
            console.log(info)
        }
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
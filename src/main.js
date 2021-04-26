//init
const dbms = require("./js/dbms")
//const db = "./json/db.json"    //define database location
const a = require("./js/api")
const f = require("./js/funk")
const m = require("./js/modul")
const s = require("./json/set.json")
const mrkts = require("./js/enabledMarkets")

const enabledMarkets = mrkts.mrkts()
const fiatCurrency = s.fiatCurrency
const fiatMarket = s.fiatMarket
const quotes = s.quotes
const bases = m.extractBases(enabledMarkets)
const tickerTime = f.minToMs(s.tickerMinutes)

const curencies = bases
curencies.push(fiatCurrency)

const omniMarkets = s.omniMarkets
let valet
let bot = []

init()
async function init() {
    let ticker = await a.fetchTicker(fiatMarket)
    //let write = await dbms.writeToDB("Assets", "BNB", "balance", "mmm"); //write method
    /*let cur = "EUR"
    let atr = "omniMarkets"
    let cat = "Assets"
    let assets = await dbms.db[cat][cur][atr]*/
    //console.log(await f.safeSale(0.01, 210, 190, 0.1, 55))
}


setup()
async function setup() {
    populateDB()
    async function populateDB() {

        valet = await a.wallet()
        //populateBalances(valet)
        async function populateBalances(valet) {
            let owned = Object.keys(valet)
            console.log(owned)

            for (let i in owned) {
                try {
                    dbms.db["Assets"][owned[i]].balance
                    if (dbms.db["Assets"][owned[i]].balance == 0) {
                        console.log(dbms.db["Assets"][owned[i]].balance)
                        dbms.writeToDB("Assets", owned[i], "balance", valet[owned[i]])
                        console.log("Updating balance of " + owned[i])
                    } else {
                        console.log("Not updating balance of " + owned[i])
                    }
                } catch (error) {
                    console.log("no such entry")
                }

            }
            return true
        }
        //popINMarkets(curencies)
        function popINMarkets(curencies) {
            console.log(curencies)
            for (let i in curencies) {
                populateInMarkets(curencies[i], enabledMarkets)
            }
        }
        function populateInMarkets(currency, enabledMarkets) {
            let inMarkets = []
            let j = 0
            for (let i in enabledMarkets) {
                base = m.splitSymbol(enabledMarkets[i], "first")
                if (base == currency) {
                    inMarkets[j] = enabledMarkets[i]
                    j++
                }
            }
            console.log(inMarkets)
            dbms.writeToDB("Assets", currency, "inMarkets", inMarkets)
            return inMarkets    //arr
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



//proces(symbol, ticker, number)
async function proces(symbol, tickerTime, number) { //proces runs only once on start
    //init only
    let info = {}

    //loop
    loop(symbol, number) //run once
    bot[number] = setInterval(function () { loop(symbol, number) }, tickerTime)
    async function loop(symbol, number) {
        //read and get values
        let orderBook = await a.fetchOrderBook(symbol)
        //let ticker = await a.fetchTicker(symbol)
        let price = orderBook.price
        let prices = dbms.db["Markets"][symbol].prices
        prices = await f.loger(price,10, prices)


        f.delay(5)  //fake delay

        //post proces

        //after buy order calculate FCA cost

        //FCA(100, 0, 2345, "ETH/BNB", symbol, dbms.db["Assets"]["ETH"].inMarkets)
        async function FCA(bougthPrice, buys, amount, symbol, omniMarkets, inMarkets) {
            //calculate FCA cost
            let arrB = [120, 110]
            arrB = await f.loger2(bougthPrice, arrB)
            console.log(arrB)
            base = m.splitSymbol(symbol, "first")
            buys = await dbms.db["Assets"][base].buys
            console.log(buys)
            sum = f.getAvgOfArray(dbms.db["Assets"][base].FCAAmounts)
            console.log(sum)

            //update inMarkets prices on asset
            //update omni markets prices on asset
            return //fiatCost
        }

        dbms.writeToDB("Markets", symbol, "prices", prices)
        let info = {
            "number": number,
            "time": f.getTime(),
            "symbol": symbol,
            "price": price,
            "prices":prices

        }
        return console.log(info)
    }
}

function postProces(symbol) {

    //read values

}


function report(info,symbol) {

    console.log(info)
}
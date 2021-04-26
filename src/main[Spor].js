//init
const dbms = require("./js/dbms")
const a = require("./js/api")
const f = require("./js/funk")
const s = require("./json/set.json")

init()
async function init() {
    //let ret = await a.fetchTicker(s.fiatMarket)
    
    //console.log(dbms.writeToDB("Assets","BNB","balance","fulllllllllll"))
    //console.log(await f.safeSale(0.01, 210, 190, 0.1, 55))
}


function setup(markets) {

    async function populateDB() {
        for (let i in enabledMarkets) {
            dbms.db.Assets[i] = api
        }

        return true
    }
}

function loop(symbol, marketType, currencyType) {

}

function report(info) {

}
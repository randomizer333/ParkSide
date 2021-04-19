//init
const dbms = require("./js/dbms")
const a = require("./js/api")
const f = require("./js/modul")

init()
function init() {
}

console.log(f.baseToQuote(100,2))


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
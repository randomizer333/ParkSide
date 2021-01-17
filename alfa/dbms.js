let fs = require("fs")      //node.js native
let dataBase = "../db.json"  //define database location
let db = require(dataBase)

let f = require("./funk.js")
f.cs("DBMS Loaded")

let alts = [    //alt markets 

    "BTC/USDT", "ETH/USDT", "BNB/USDT",//*/
    "XRP/USDT",
    "LTC/USDT",
    "EOS/USDT",
    "ADA/USDT",
    "XLM/USDT",
    "XMR/USDT",
    "TRX/USDT",
    "BCH/USDT",
    "LINK/USDT",
    "XTZ/USDT",
    "QTUM/USDT",
    "YFI/USDT",     //DeFi
    "DOT/USDT",
    "COMP/USDT",
    "DAI/USDT",
    "UMA/USDT",
    "LEND/USDT",
    "MKR/USDT",

    "ETH/BTC", "BNB/BTC",
    "XRP/BTC", "XRP/ETH", "XRP/BNB",
    "LTC/BTC", "LTC/ETH", "LTC/BNB",
    "EOS/BTC", "EOS/ETH", "EOS/BNB",
    "ADA/BTC", "ADA/ETH", "ADA/BNB",
    "XLM/BTC", "XLM/ETH", "XLM/BNB",
    "XMR/BTC", "XMR/ETH", "XMR/BNB",
    "TRX/BTC", "TRX/ETH", "TRX/BNB",
    "BCH/BTC", "BCH/BNB",
    "LINK/BTC", "LINK/ETH",
    "XTZ/BTC", "XTZ/BNB",
    "QTUM/BTC", "QTUM/ETH",
    "YFI/BTC",                          //DeFi 
    "DOT/BTC", "DOT/BNB",
    "COMP/BTC", "COMP/BNB",
    "DAI/BTC", "DAI/BNB",
    "UMA/BTC",
    "LEND/BTC", "LEND/ETH",
    "MKR/BTC", "MKR/BNB",
    "WBTC/BTC", "WBTC/ETH",

    //database format*/

    //"BSV/BTC","BSV/USDT",
]

//create or add database,table,row

//createDB(alts)
async function createDB(data) {   //done   
    let baza = {}
    console.log("Creating DB: " + data)
    f.cs("hey")
    for (let i in await data) {     //format json in db
        baza[data[i]] = {
            "timedate": f.getTime(),
            "bougthPrice": 0,
            "orderType": "none"
        }
        f.cs("working");
    }
    f.cs(baza);
    await writeJSON(baza)
}
async function addTable() {

}
async function writeJSON(inputJSON) {   //done
    input = JSON.stringify(inputJSON);
    fs.writeFile(dataBase, "", function (err) {   //clear file
        if (err) throw err;
    });
    fs.writeFile(dataBase, input, function (err) {    //save data
        if (err) throw err;
    });
}

//update data
async function saveTable(symbol, data) {    //dev
    let baza = db
    if (await baza) {
        baza[symbol] = await data
        writeJSON(await baza)
        //f.cs("writen")
    } else {
        f.cs("baza corupted")
    }
}
async function saveBougthPrice(symbol, write) {
    //console.log("data:")
    //console.log(write)
    if (db && (write || write === 0)) {
        write == db[symbol].bougthPrice?"":db[symbol].timedate = f.getTime()    //dont update time if price hasnt changed
        db[symbol].bougthPrice = await write
        saveTable(symbol, await db[symbol])
    } else {
        console.log("NO DATA BP")
    }
}
async function saveOrderType(symbol, write) {
    if (write) {
        let baza1 = db
        if (baza1) {
            //baza1[symbol].timedate = f.getTime()
            baza1[symbol].orderType = await write
            saveTable(symbol, await baza1[symbol])
        } else {
            console.log("NO DATA OT")
        }
    }
}
async function saveBuys(symbol, write) {
    if (db && (write || write === 0)) {
        db[symbol].buys = await write
        saveTable(symbol, await db[symbol])
    } else {
        console.log("NO DATA BP")
    }
}

//read data
async function readJSON() { //done
    let data = fs.readFileSync("./db.json");
    try {
        json = await JSON.parse(data);
    } catch (error) {
        console.log(error)
        json = false
    }
    return await json
}

async function readBougthPrice(symbol) {
    return db[symbol].bougthPrice
}
async function readOrderType(symbol) {
    return db[symbol].orderType
}
async function readBuys(symbol) {
    return db[symbol].buys
}



//exports
exports.db = db
exports.createDB = createDB
exports.saveBougthPrice = saveBougthPrice
exports.saveOrderType = saveOrderType
exports.readBougthPrice = readBougthPrice
exports.readOrderType = readOrderType
exports.readBuys = readBuys
exports.saveBuys = saveBuys


//init
let fs, templateDB, tdb, f, enabledMarkets

req()
function req() {
    fs = require("fs")      //node.js native
    db = require("../json/db.json")
    exports.db = db
    templateDB = require("../json/dbModel.json")
    tdb = require("../json/dbModel.json")//define database location
    f = require("./funk.js")
    m = require("./modul.js")
    enabledMarkets = require("./enabledMarkets.js").mrkts()
    fiatCurrency = "EUR"
}

createDB(enabledMarkets)
async function createDB(enabledMarkets) {   //done   
    let baza = {}
    console.dir("Creating DB:")
    for (let i in await tdb.db) {     //create top level table names
        baza[tdb.db[i]] = {
        }
    }
    for (let i in await enabledMarkets) {     //create table1
        baza[tdb.db.table1][enabledMarkets[i]] = tdb[tdb.db.table1]
    }
    console.log(enabledMarkets)

    let currencies = await m.extractBases(enabledMarkets)
    currencies[currencies.length] = fiatCurrency    //add fiat currency
    console.log(currencies)
    for (let i in await currencies) {     //create table2
        baza[tdb.db.table2][currencies[i]] = tdb[tdb.db.table2]
    }
    writeJSON(baza)
}

exports.writeJSON = writeJSON
async function writeJSON(inputJSON) {   //done
    let input = await JSON.stringify(inputJSON)
    let dbURL = "./json/db.json"   //define database location
    //console.log("writing")
    //console.log(inputJSON)
    /*await fs.writeFile(dbURL, "{}", function (err) {    //save data
        if (err) throw err;
    });*/
    await fs.writeFile(dbURL, input, function (err) {    //save data
        if (err) throw err;
    });
}

exports.writeToDB = writeToDB
async function writeToDB(tableName, rowPK, column, data) {  //done
    try {
        if (db && data) {
            db[tableName][rowPK][column] = data   //select and set
            db[tableName][rowPK]["time"] = f.getTime()   //select and set
            //console.log(f.getTime())
            writeJSON(db)
            return data
        } else {
            console.log("EEE: no input data")
            return false
        }
    } catch (error) {
        console.log("EEE: no such path in db")
        return false
    }
}

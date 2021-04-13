const fs = require("fs")      //node.js native
let database = "../json/db.json"    //define database location
let db = require(database)  

//let f = require("./funk.js")
console.log("DBMS Loaded")


//create or add database,table,row
enabledMarkets = require("./enabledMarkets.js").alts()
//console.log(enabledMarkets)
//alts = em.alts()

//createDB(alts)
async function createDB(data) {   //done   
    f.cs(data)
    let baza = {}
    console.log("Creating DB: " + data)
    f.cs("hey")
    for (let i in await data) {     //format json in db
        baza[data[i]] = {
            "timedate": f.getTime(),
            "bougthPrice": 0,
            "orderType": "none",
            "buys": 0,
            "stopLoss": false
        }
        f.cs("working");
    }
    f.cs(baza);
    await writeJSON(baza)
}

async function writeJSON(inputJSON) {   //done
    input = await JSON.stringify(inputJSON)
    console.log("writing")
    fs.writeFile(database, "", function (err) {   //clear file
        if (err) throw err;
    });
    fs.writeFile(database, input, function (err) {    //save data
        if (err) throw err;
    });
}


//console.log(db)
writeToDB("assets", "EUR", "balance", 56376)
async function writeToDB(tableName, rowPK, column, data) {
    try {
        if (db && data) {
            db[tableName][rowPK][column] = data   //select and set
            console.log(db)
            writeJSON(db)
        } else {
            console.log("EEE: no input data")
        }
    } catch (error) {
        console.log("EEE: bad keys")
    }
}

exports.writeToDB = writeToDB
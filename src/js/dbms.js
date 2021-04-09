let fs = require("fs")      //node.js native
let dataBase = "../json/db.json"  //define database location
let db = require(dataBase)

//let f = require("./funk.js")
console.log("DBMS Loaded")

//em = require("./enabledMarkets.js")
//alts = em.alts()

//create or add database,table,row

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
    input = JSON.stringify(inputJSON);
    console.log("writing")
    await fs.writeFile(dataBase, "", function (err) {   //clear file
        if (err) throw err;
    });
    await fs.writeFile(dataBase, input, function (err) {    //save data
        if (err) throw err;
    });
}

//console.log(db)
writeToDB("table","rowPK","col","teeeessst")
async function writeToDB(table, key, column, write) {

    //db[table].key.column
    //console.log(db[table].key.col)



    /*if (db && (write || write === 0)) {
        write == db[key].bougthPrice?"":db[symbol].timedate = f.getTime()    //dont update time if price hasnt changed
        db[key].bougthPrice = await write
        saveTable(key, await db[key])
    } else {
        console.log("NO DATA BP")
    }*/
    console.log(db["table"]["rowPK"]["col"])
    //console.log(db)
    writeJSON(db)
}

exports.writeToDB = writeToDB
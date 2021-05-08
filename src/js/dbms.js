//init
let fs, templateDB, tdb, f, enabledMarkets

req()
function req() {
    fs = require("fs")      //node.js native
    db = require("../json/db.json")
    exports.db = db
    templateDB = require("../json/dbModel.json")
    tdb = require("../json/dbModel.json")//define database location
    f = require("../js/funk.js")
    m = require("../js/modul.js")
    enabledMarkets = require("./enabledMarkets.js").mrkts()
    fiatCurrency = "EUR"
}

//createDB(enabledMarkets)
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
    let input = JSON.stringify(inputJSON)
    let dbURL = "./json/db.json"   //define database location
    //console.log("!")
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
        if (db /*&& data*/) {
            db[tableName][rowPK][column] = data   //select and set
            db[tableName][rowPK]["time"] = f.getTime()   //select and set
            //console.log(f.getTime())
            writeJSON(db)
            return data
        } else {
            console.log("EEE: no input data to writeToDB")
            return false
        }
    } catch (error) {
        console.log("EEE: no such path in db")
        return false
    }
}

//createNewTable("new")
async function createNewTable(tableName) {
    try {
        if (db) {
            db[tableName] = {}
            writeJSON(db)
            console.log("Added new table named: " + tableName)
        } else {
            console.log("no db! cant create!")
        }
    } catch (error) {
        console.log("EEE: cant create Table")
    }
}

//createNewRow("new","new")
async function createNewRow(tableName, rowPK) {
    try {
        if (db) {
            db[tableName][rowPK] = {}
            writeJSON(db)
            console.log("Added new Row named: " + rowPK)
        } else {
            console.log("no db! cant create!")
        }
    } catch (error) {
        console.log("EEE: cant create Row")
    }
}

//createNewColumn("new","new","new")
async function createNewColumn(tableName, rowPK, column) {
    try {
        if (db) {
            db[tableName][rowPK][column] = {}
            writeJSON(db)
            console.log("Added new Column named: " + column)
        } else {
            console.log("no db! cant create!")
        }
    } catch (error) {
        console.log("EEE: cant create Column")
    }
}

//createNew("tabela", "ključ", "stolpec")
async function createNew(tableName, rowPK, column) {
    try {
        if (db) {
            db[tableName] = {}
            db[tableName][rowPK] = {}
            db[tableName][rowPK][column] = "data"
            writeJSON(db)
            //console.log("new column")
            console.log("Added new : " + tableName + " " + rowPK + " " + column)
        } else {
            console.log("no db! cant create!")
        }
    } catch (error) {
        console.log("EEE: cant create ")
    }
}

async function createNew1(tableName, rowPK, column) {
    try {
        //comp = JSON.parse(db[tableName])

        //check doubling
        tab = tableName

        row0 = Object.keys(db[tableName])
        col0 = Object.keys(db[tableName][rowPK])

        row = JSON.parse(row0)
        col = JSON.parse(col0)
        data = db[tableName][rowPK][column]


        if (tableName === db[tableName] &&
            rowPK === db[tableName][rowPK] &&
            column === db[tableName][rowPK][column]) {
            console.log("alredy exists")



        } else {
            console.log("go")
            console.log(row)
            console.log(col)
            console.log(data)
        }
        if (db) {
            if (tableName && !rowPK) {
                db[tableName] = {}
                writeJSON(db)
                console.log("new tableName")
            } else if (tableName && rowPK && !column) {
                db[tableName] = {}
                db[tableName][rowPK] = {}
                writeJSON(db)
                console.log("new rowPK")
            } else if (tableName && rowPK && column) {
                db[tableName] = {}
                db[tableName][rowPK] = {}
                db[tableName][rowPK][column] = "data"
                writeJSON(db)
                console.log("new column")
            }
            console.log("Added new : " + tableName + " " + rowPK + " " + column)
        } else {
            console.log("no db! cant create!")
        }
    } catch (error) {
        console.log("EEE: cant create ")
    }
}

//console.log("dbms loaded")

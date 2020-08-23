const f = require("./funk.js");           //common functions
const keys = require("../keys.json");     //keys file location
const ccxt = require('ccxt');             //api module
const set = require("../set.json");


//run()
async function run() {
    t1 = f.getTime()
    console.log("časzačetka: " + t1)
    r = await sell()
    console.log("časkonca: " + await r)
    console.dir(r)
}

async function sell() {
    return new Promise(resolve => {
        setTimeout(
            () => {
                resolve(cancl()
                );
            }, 1000);
    });
}

function cancl() {
    try {   //return true
        return new Promise(resolve => {
            setTimeout(
                () => {
                    resolve(
                        ret = {
                            filled: "filled",
                            status: "done"
                        },console.log("done")
                    );
                }, 3000);
        });
    } catch {   //return false
        return new Promise(resolve => {
            setTimeout(
                () => {
                    resolve("eror"
                    );
                }, 3000);
        });
    }
}


check(1)
async function check(inport) {// false: 0
    try {
        console.log("Input: "+inport)
        if (inport) {
            console.log("input is true")
        } else {
            console.log("input is false")
        }
    } catch (error) {
        console.log("EEE in sell: ", error);
    }
}
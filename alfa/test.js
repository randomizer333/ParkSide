const f = require("./funk.js");           //common functions
const keys = require("../keys.json");     //keys file location
const ccxt = require('ccxt');             //api module
const set = require("../set.json");


run()
async function run() {
    t1 = f.getTime()
    console.log("časzačetka: " + t1)
    r = await resolv()
    console.log("časkonca: " + await r)
}

function resolv() {
    try {
        return new Promise(resolve => {
            setTimeout(
                () => {
                    resolve(f.getTime()
                    );
                }, 3000);
        });
    } catch {
        return new Promise(resolve => {
            setTimeout(
                () => {
                    resolve("eror"
                    );
                }, 3000);
        });
    }
}

function real() {
    try {
        return orderback = await sell("LTC/BTC", 0.3, 0.007)
    } catch {
        return new Promise(resolve => {
            setTimeout(
                () => {
                    resolve("eror"
                    );
                }, 3000);
        });
    }
}

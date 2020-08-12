const f = require("./funk.js");           //common functions
const keys = require("../keys.json");     //keys file location
const ccxt = require('ccxt');             //api module
const set = require("../set.json");


run()
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

/* old
async function cancel(orderId, symbol) {    //cancels order with id
    try {//order was NOT filled
        r = await exchange.cancelOrder(orderId, symbol);
        filled = false;
        f.sendMail("Canceled", JSON.stringify(r));
        return false;
    } catch (error) {//order was filled
        filled = true;
        console.log("EEE: ", error);
        return true;
    }
}



async function sell(symbol, amount, price) {// symbol, amount, ask 
    try {
        r = await exchange.createLimitSellOrder(symbol, amount, price);
        orderId = r.id;
        console.log("sent order!!!")

        let filled
        setTimeout(function () { cancel(orderId, symbol); }, ticker * 0.9);

        if (filled) {
            //order was filled
            f.sendMail("filled and sold", JSON.stringify(r));
            filled = true;
            orderType = "sold";
        } else {
            //order was canceled
            orderType = "canceled";
            //filled = false;
        }
        ret = {
            orderId: await r.id,
            orderStatus: r.status,
            orderType: orderType,
            filled: filled,
            bougthPrice: price,
        }
        return await ret;
    } catch (error) {
        console.log("EEE in sell: ", error);
    }
}  
old    */ 
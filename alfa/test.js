const f = require("./funk.js");           //common functions
const keys = require("../keys.json");     //keys file location
const ccxt = require('ccxt');             //api module
const set = require("../set.json");


run()
async function run() {
    t1 = f.getTime()
    console.log("časzačetka: " + t1)
    r = await sell("btc")
    console.log("časkonca: " + await r)
    console.dir(await r)
}

async function sell(sym) {
    return new Promise(resolve => {
        setTimeout(
            async () => {
                resolve(
                    {
                        res: await cancl("132"),
                        symbol: sym

                    }
                );
            }, 1000);
    });
}

function cancl(inp) {
    try {   //return true
        is = !isNaN(inp)
        console.log(is)
        if(is){
            sta = "is a number"
        }else{
            sta = "not a numbere"
        }
        return new Promise(resolve => {
            setTimeout(
                () => {
                    resolve(sta, console.log("done")
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


//check(1)
async function check(inport) {// false: 0
    try {
        console.log("Input: " + inport)
        if (inport) {
            console.log("input is true")
        } else {
            console.log("input is false")
        }
    } catch (error) {
        console.log("EEE in sell: ", error);
    }
}

function delayProcess(delay, callback) {
    result = logic;
    setTimeout(function () {
        callback(result);
    });
}


orderReturn = {
    info: {
        symbol: 'ADABTC',
        orderId: 199186198,
        orderListId: -1,
        clientOrderId: '7sqIa7kYiqTXtCTMKrZZCL',
        transactTime: 1598483483560,
        price: '0.00002007',
        origQty: '41.00000000',
        executedQty: '0.00000000',
        cummulativeQuoteQty: '0.00000000',
        status: 'NEW',
        timeInForce: 'GTC',
        type: 'LIMIT',
        side: 'SELL'
    },
    id: '199186198',
    clientOrderId: '7sqIa7kYiqTXtCTMKrZZCL',
    timestamp: 1598483483560,
    datetime: '2020-08-26T23:11:23.560Z',
    lastTradeTimestamp: undefined,
    symbol: 'ADA/BTC',
    type: 'limit',
    side: 'sell',
    price: 0.00002007,
    amount: 41,
    cost: 0,
    average: undefined,
    filled: 0,
    remaining: 41,
    status: 'open',
    fee: undefined,
    trades: undefined
}


cancelReturn = {
    info: {
      symbol: 'ETHBTC',
      origClientOrderId: 'RQfHoJyAlu28aQvocwVKAo',
      orderId: 885815454,
      orderListId: -1,
      clientOrderId: 'lEhUstxBMR0azzafhXOkSe',
      price: '0.06741000',
      origQty: '0.09500000',
      executedQty: '0.00000000',
      cummulativeQuoteQty: '0.00000000',
      status: 'CANCELED',
      timeInForce: 'GTC',
      type: 'LIMIT',
      side: 'SELL'
    },
    id: '885815454',
    clientOrderId: 'lEhUstxBMR0azzafhXOkSe',
    timestamp: undefined,
    datetime: undefined,
    lastTradeTimestamp: undefined,
    symbol: 'ETH/BTC',
    type: 'limit',
    side: 'sell',
    price: 0.06741,
    amount: 0.095,
    cost: 0,
    average: undefined,
    filled: 0,
    remaining: 0.095,
    status: 'canceled',
    fee: undefined,
    trades: undefined
  }
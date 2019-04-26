let a = require("./api2.js");

let symbol = "LTC/USDT"
let res;

setInterval(function () { loop(symbol) }, 20000);

function loop(){
    ret = a.sell(symbol, 0.1, 200)
}
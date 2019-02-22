let a = require("./api.js");
let f = require("./funk.js");

//  main setup
//setup();
async function setup(){
    await a.change();
    let balance = await a.balance();
    await a.strategy(balance);
}

//  main loop

//setInterval(function(){loop()},f.minToMs(ticker));
let symbol = "BCH/BTC";
loop(symbol);
async function loop(symbol) {
    f.cs(a.exInfo());
    f.cs(await a.balance("ETH"));
    f.cs(await a.bid(symbol));
    f.cs(await a.ask(symbol));
    f.cs(await a.change(symbol));
    f.cs(await a.minAmount(symbol));
    return;
}

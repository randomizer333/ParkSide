let a = require("./api.js");
let f = require("./funk.js");

//mainCascade();
async function mainCascade(){
    await a.change();
    let balance = await a.balance();
    await a.strategy(balance);
}

setInterval(function(){getPercentage()},f.minToMs(0.2));
async function getPercentage() {
    f.cs(await a.change("BCPT/BTC"));
    f.cs(await a.change("ENG/BTC"));
    f.cs(await a.change("ICX/BTC"));
    return await a.change("BTT/BTC");
}
//s();
async function s(){
    f.cs(await getPercentage());
}

//let a = require("./api2.js");
let f = require("./funk.js");

async function compute() {
    setTimeout(function(){
        return result = input * 2;
    }, 6000);
    //return await result;
}

let result;
let input = 2;
async function cb() {
    result = await compute();
    await f.cs(result);
    return result;
}

let fetch;
fetch = cb();
//f.cs(fetch);
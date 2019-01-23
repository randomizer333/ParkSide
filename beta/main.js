//Beta version of cryptocurrency trading bot Parkside

//Architecture of application
/*Architecture:
                init
                functions
                API functions
                runtime
                setup
                loop
*/

//select best currency
//set two bots
//run two bots
//stop bots
//restart

let f = require('./funk.js');           //connect to module functions
let ccxt = require('ccxt');             //connect to ccxt node.js module
let keys = require("./keys.json");      //keys file location
var TI = require("technicalindicators");//technical indicators library

function stop(funk) {
    clearInterval(funk);
    stevc = 0;
}
let loper = setInterval(function () { tester(3) }, 1000);
let stevc = 0;

function run1 (){
    let run = setInterval(function () { runner(stevc) }, 1000);
}

function tester(max) {
    f.cs("runing function 1 tester");
    stevc++;
    console.log(stevc);
    if (stevc >= max) {
        stop(tester);
        run1();
        //let run = setInterval(function () { runner(stevc) }, 1000);
    }
}

function runner(valuta){
    f.cs("runing function 2 runner with "+valuta);
    stevc++
    if(stevc > 5 ){
        stop(run);
    }
}




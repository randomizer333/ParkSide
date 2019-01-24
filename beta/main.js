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
let keys = require("../keys.json");      //keys file location
var TI = require("technicalindicators");//technical indicators library

function myStopFunction(fu) {
    clearInterval(fu);
    f.cs("stopped");
    q = 0;
}

var myVar = setInterval(myTimer, 1000);
var q = 0;
function myTimer() {
    var d = new Date();
    var t = d.toLocaleTimeString();
    f.cs(t);
    q++;
    f.cs(q);
    if (q == 3) {
        myVar2 = setInterval(myTimer2, 1000);
    }
    q == 3 ? myStopFunction(myVar) : "";
}

var myVar2
//var myVar2 = setInterval(myTimer2, 1000);
var q = 0;
function myTimer2() {
    var d = new Date();
    var t = d.toLocaleTimeString();
    f.cs("druga: " + t);
    q++;
    f.cs(q);
    q == 5 ? myStopFunction(myVar2) : "";
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

function runner(valuta) {
    f.cs("runing function 2 runner with " + valuta);
    stevc++
    if (stevc > 5) {
        stop(run);
    }
}




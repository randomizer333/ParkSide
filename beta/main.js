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
let TI = require("technicalindicators");//technical indicators library

function myStopFunction(fu) {
    clearInterval(fu);
    f.cs("stopped");
    q = 1;
}

var q = 1;
var ff1 = setInterval(f1, 1000);
var ff2;
var ff3;
//let ff = [setInterval(f1, 500),setInterval(f2, 500),setInterval(f3, 500)]
function f1() {
    var d = new Date();
    var t = d.toLocaleTimeString();
    f.cs("čas: "+t+" stevec: "+q+" loop f1");
    if (q == 3) {
        ff2 = setInterval(f2, 1000);
        myStopFunction(ff1);
    }else{
        q++;
    };
}

function f2() {
    var d = new Date();
    var t = d.toLocaleTimeString();
    f.cs("čas: "+t+" stevec: "+q+" loop f2");
    if (q == 3) {
        ff3 = setInterval(f3, 1000);
        myStopFunction(ff2);
    }else{
        q++;
    }
    //q == 3 ? myStopFunction(ff1) : "";
}

function f3() {
    var d = new Date();
    var t = d.toLocaleTimeString();
    f.cs("čas: "+t+" stevec: "+q+" loop f3");
    if (q == 3) {
        ff1 = setInterval(f1, 1000);
        myStopFunction(ff3);
    }else{
        q++;
    }
    //q == 3 ? myStopFunction(ff1) : "";
}






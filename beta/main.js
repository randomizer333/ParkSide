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
/*
select best currency
set two bots
run two bots
stop bots
restart
*/

let f = require('./funk.js');   //connect to module functions

function stop() {
    clearInterval(loper);
    stevc = 0;
}
let loper = setInterval(function () { tester(3) }, 1000);
let stevc = 0;

function tester(max) {
    stevc++;
    console.log(stevc);
    if (stevc >= max) {
        stop();
    }
}



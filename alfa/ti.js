//this file contain agregations of a node.js module technicalindicators

let TI = require("technicalindicators");
let f = require("./funk.js");


let stor = new Array();     //storage for direction
function upDown(logMA) {     //trendUD between curent and last value
    let value = logMA[0];
    let ma = f.getAvgOfArray(logMA);
    if (stor[1] == undefined) {
        stor[1] = value;
        stor[0] = value;
    };
    stor[1] = stor[0];
    stor[0] = value;
    let direction = stor[0] - ma;
    if (direction > 0) {
        trendSign = "+";
        trendUD = 1;   //buy coz rising
    } else {
        trendSign = "-";
        trendUD = -1;   //hold or park coz stationary
    }
    return trendUD;
}

function rsi(values) {  //returns trndRSI   log15
    let RSI = TI.RSI;
    let inputRSI = {
        values: values,
        period: 14   //9
    };
    let r = RSI.calculate(inputRSI);
    let n = r.length - 1;
    let lastRSI = r[n]; //last JSON
    if (lastRSI > 70) {
        trendRSI = 1;   //buy coz rising
    } else if (lastRSI < 30) {
        trendRSI = -1;  //sell coz falling
    } else {
        trendRSI = 0;   //hold or park coz stationary
    };
    return trendRSI;
}

function macd(values) {     //log 70 should be bigger the better starts working when value = slowPeriod + signalPeriod
    let MACD = TI.MACD;
    let macdInput = {
        values: values,   //34,70,140n of inputs - slowPeriod = n of outputs 
        fastPeriod: 12,       //12,24,48
        slowPeriod: 26,       //26,52,104      when this is full it putout
        signalPeriod: 9,        //9,18,36
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };
    let r = MACD.calculate(macdInput);      //array with JSONs
    let lastMACD;
    r ? lastMACD = r[r.length - 1] : lastMACD = 0; //last JSON
    let macdHistogram = 0;
    if (lastMACD) {
        macdLine = lastMACD.MACD;
        signalLine = lastMACD.signal;
        macdHistogram = lastMACD.histogram;
        if (!isNaN(macdHistogram)) {     //isNumber
            //sendMail("Started MACD", msg);
            trendMACD = 0;
        };
        if (macdHistogram > 0) {
            trendMACD = 1;   //buy coz rising
        } else if (macdHistogram < 0) {
            trendMACD = -1;  //sell coz falling
        } else {
            trendMACD = 0;   //hold or park coz stationary
        };
    } else {
        trendMACD = 0;
    }
    return trendMACD;
}

exports.upDown = upDown;
exports.rsi = rsi;
exports.macd = macd;

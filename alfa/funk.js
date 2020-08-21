/*
funk.js
is a js module for generic comonly used simple functions that should be aplicable to any data 
*/

const set = require("../set.json");     //only for fOrder
ticker = minToMs(set.tickerMinutes);    //only for fOrder

function sendMail(subject, message, to) {

        // email account data
        let nodemailer = require('nodemailer');
        let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                        user: 'mrbitja@gmail.com',
                        pass: 'mrbitne7777777'
                }
        });

        // mail body
        let mailOptions = {
                from: 'bb@gmail.com',   //NOT WORK
                to: 'markosmid333@gmail.com',//to, 
                subject: subject, //'You have got mail',
                text: message
        };

        // response
        transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                        console.log(error);
                } else {
                        //console.log('Email sent: ' + info.response);
                        console.log("Email sent at: " + getTime() + " To: " + mailOptions.to + " Subject: " + subject);
                }
        });
}


async function loger(value, length, array) {        //log FIFO to array, newest in oldest out
        while (array.length >= length) {
                array.pop();
        }
        array.unshift(value);
        return await array;
}

function cs(object) {    //console logs with json.stringify for console wraping
        console.log(JSON.stringify(object));
}

function csD(object) {
        text = JSON.stringify(object)
        console.log(JSON.stringify(text + " :" + object));
}
function csL(object, length) {
        for (i = 0; i <= length; i++) {  //display top 5
                cs(object[i]);
        }
}
function getTime() {     //returns time in EU format
        let timestamp = Date.now();     // Get current time in UNIX EPOC format
        let d = new Date(timestamp),	// Convert the passed timestamp to milliseconds
                yyyy = d.getFullYear(),
                mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
                dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
                hh = d.getHours(),
                h = hh,
                min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
                ss = ('0' + d.getSeconds()).slice(-2),
                ms = ("0" + d.getMilliseconds()).slice(-3),
                ampm = 'AM',
                time;
        /*if (hh > 12) {
                h = hh - 12;
                ampm = 'PM';
        } else if (hh === 12) {
                h = 12;
                ampm = 'PM';
        } else if (hh == 0) {
                h = 12;
        }*/
        //var d = new Date();
        //var t = d.toLocaleTimeString();
        // ie: 2013-02-18, 8:35 AM	
        //time = yyyy h + ':' + min + ampm + '-' + mm + '-' + dd + '. ' +  ' ' +;
        time = yyyy + '.' + mm + '.' + dd + " " + h + ':' + min + ':' + ss + "." + ms;
        return time;
}
function hToMs(timeInHours) {    //return time in ms if inputed in h
        let r = timeInHours * 3600000;
        return r;
}
function minToMs(timeInMinutes) {
        let r = timeInMinutes * 60000;
        return r;
}
function msToMin(timeInMiliseconds) {
        var r = (timeInMiliseconds / 1000) / 60;
        return r;
}
async function whole(part, percent) {  //whole is part divided by percentage
        return await part / (percent / 100);
}
async function percent(part, whole) {  //percent is part divided by whole
        return (part / whole) * 100;
}
async function part(percent, whole) {  //part is percent multiplied by whole
        return (percent / 100) * whole;
}
function cutArray(arr, num) {     //cuts array to length
        let result = new Array();
        for (i = 0; i < num; i++) {
                result[i] = arr[i];
        }
        return result;
}
function getMinOfArray(numArray) {	//in: numericArray out: minValue
        return Math.min.apply(null, numArray);
}
function getMaxOfArray(numArray) {	//in: numericArray out: maxValue
        return Math.max.apply(null, numArray);
}
function getAvgOfArray(numArray) {	//in: numericArray out: avgValue
        var numArray;
        var n = numArray.length;
        var sum = 0;
        var avg;
        for (i = 0; i < n; i++) {
                sum += numArray[i];
                avg = sum / n;
        }
        return avg;
}

function cleanArray(arr) {   // Will remove all falsy values: undefined, null, 0, false, NaN and "" (empty string)
        var newArray = []
        for (var i = 0; i < arr.length; i++) {
                if (arr[i]) {
                        newArray.push(arr[i]);
                }
        }
        return newArray;
}

function mergeSymbol(base, quote) {
        return mergedSymbol = base + "/" + quote;

}
function splitSymbol(symbol, selectReturn) {   // BTC/USDT   ,   first | second    base | quote
        let char = symbol.search("/");
        first = symbol.slice(0, char);
        second = symbol.slice(char + 1, symbol.length);
        switch (selectReturn) {
                case "first":
                        return first;
                        break;
                case "second":
                        return second;
                        break;
        }
}

function boolToInitial(bool) {	//returns initial of string|bool
        var bool;
        var a = bool.toString();
        var b = a.charAt(0);
        return b;
}

function jsonToArray(json, attribute) {
        for (i = 0; i < length; i++) {
                arr[i] = json.attribute
        }
        return arr;
}

async function fOrder(symbol, amount, price) {


        return new Promise(resolve => {
            setTimeout(
                () => {
                    resolve(
                        {
                            orderId: 1235342,
                            orderStatus: "done",
                            orderType: "canceled",
                            side: "fake side",
                            filled: true,
                            bougthPrice: price,
                            symbol: symbol,
                        }
                    );
                }, 2000);//ticker * 0.9);
        });
}


exports.loger = loger;
exports.cleanArray = cleanArray;
exports.sendMail = sendMail;
exports.csL = csL;
exports.cs = cs;
exports.getTime = getTime;
exports.hToMs = hToMs;
exports.minToMs = minToMs
exports.msToMin = msToMin;
exports.whole = whole;
exports.percent = percent;
exports.part = part;
exports.cutArray = cutArray;
exports.getMinOfArray = getMinOfArray;
exports.getMaxOfArray = getMaxOfArray;
exports.getAvgOfArray = getAvgOfArray;
exports.mergeSymbol = mergeSymbol;
exports.splitSymbol = splitSymbol;
exports.boolToInitial = boolToInitial;
exports.csD = csD;
exports.fOrder = fOrder;

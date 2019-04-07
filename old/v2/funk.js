/*
funk.js
is a js module for generic comonly used simple functions that should be aplicable to any data 
*/

function cs(object) {    //console logs with json.stringify for console wraping
        console.log(JSON.stringify(object));
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
        time = h + ':' + min + ':' + ss + ' ' + dd + '.' + mm + '.' + yyyy;
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
function whole(part, percent) {  //whole is part divided by percentage
        return part / (percent / 100);
}
function percent(part, whole) {  //percent is part divided by whole
        return (part / whole) * 100;
}
function part(percent, whole) {  //part is percent multiplied by whole
        return (percent / 100) * whole;
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
function mergeSymbol(base, quote) {
        return mergedSymbol = base + "/" + quote;

}
function splitSymbol(symbol, selectReturn) {   // BTC/USDT   ,   first | second    base | quote
        var char = symbol.search("/");
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
function sort(numArray) {
        var numArray = new Array();
        numArray.sort(function (a, b) { return a - b });  //descending
        return numArray;
}

exports.cs = cs;
exports.getTime = getTime;
exports.hToMs = hToMs;
exports.minToMs = minToMs
exports.msToMin = msToMin;
exports.whole = whole;
exports.percent = percent;
exports.part = part;
exports.getMinOfArray = getMinOfArray;
exports.getMaxOfArray = getMaxOfArray;
exports.getAvgOfArray = getAvgOfArray;
exports.mergeSymbol = mergeSymbol;
exports.splitSymbol = splitSymbol;
exports.boolToInitial = boolToInitial;

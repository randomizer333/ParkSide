/*
funk.js
is a js module for generic comonly used simple functions that should be aplicable to any data 
*/

exports.cs = function (object) {    //console logs with json.stringify for console wraping
    console.log(JSON.stringify(object));
}
exports.getTime = function () {     //returns time in EU format
    let timestamp = Date.now();     // Get current time in UNIX EPOC format
    let d = new Date(timestamp),	// Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
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
    // ie: 2013-02-18, 8:35 AM	
    //time = yyyy h + ':' + min + ampm + '-' + mm + '-' + dd + '. ' +  ' ' +;
    time = h + ':' + min + ' ' + dd + '.' + mm + '.' + yyyy;
    return time;
}
exports.hToMs = function (timeInHours) {    //return time in ms if inputed in h
    let r = timeInHours * 3600000;
    return r;
}
exports.minToMs = function (timeInMinutes) {
    let r = timeInMinutes * 60000;
    return r;
}
exports.msToMin = function (timeInMiliseconds) {
    var r = (timeInMiliseconds / 1000) / 60;
    return r;
}
exports.whole = function (part, percent) {  //whole is part divided by percentage
    return part / (percent / 100);
}
exports.percent = function (part, whole) {  //percent is part divided by whole
    return (part / whole) * 100;
}
exports.part = function (percent, whole) {  //part is percent multiplied by whole
    return (percent / 100) * whole;
}
exports.getMinOfArray = function (numArray) {	//in: numericArray out: minValue
    return Math.min.apply(null, numArray);
}
exports.getMaxOfArray = function (numArray) {	//in: numericArray out: maxValue
    return Math.max.apply(null, numArray);
}
exports.getAvgOfArray = function (numArray) {	//in: numericArray out: avgValue
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
exports.mergeSymbol = function (base, quote) {
    /*
    if (base == quote){
            base = baseCurrency;
    }*/
    return mergedSymbol = base + "/" + quote;

}
exports.splitSymbol = function (symbol, selectReturn) {   // BTC/USDT   ,   first | second    base | quote
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
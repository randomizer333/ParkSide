/*
funk.js
is a node.js module for generic comonly used simple functions that should be aplicable to any data 
*/

//common functions

exports.sendMail = sendMail
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
exports.loger = loger
async function loger(value, length, array) {    //log FIFO to array, newest in oldest out
	let val = value
	let arr = array
	//console.log("value")
	//console.log(val)
	if (val == 0) {
		//dont write
		//console.log("value is zero not loging")
		return 0
	} else if (arr.length >= length) {
		//console.log("array is at length")
		while (array.length >= length) {
			//console.log("poping")
			array.pop();
		}
		//arr.pop()     //delete last value
		await arr.unshift(val);   //add first value
	} else if (arr.length <= length) {
		//console.log("loging")
		await arr.unshift(val);   //add first value
	}
	return await arr;
}
exports.loger2 = loger2
async function loger2(value, array) {    //log FI to array, newest first in oldest shift
	while (array.length >= length) {
		array.pop();
	}
	array.unshift(value);
	return await array;
}
exports.getTime = getTime
function getTime() {    //returns time in EU format
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
exports.hToMs = hToMs
function hToMs(timeInHours) {   //return time in ms if inputed in h
	let r = timeInHours * 3600000;
	return r;
}
exports.minToMs = minToMs
function minToMs(timeInMinutes) {
	let r = timeInMinutes * 60000;
	return r;
}
exports.msToMin = msToMin
function msToMin(timeInMiliseconds) {
	var r = (timeInMiliseconds / 1000) / 60;
	return r;
}
exports.whole = whole
async function whole(part, percent) {  //whole is part divided by percentage
	return await part / (await percent / 100);
}
exports.percent = percent
async function percent(part, whole) {  //percent is part divided by whole
	return (await part / await whole) * 100;
}
exports.part = part
async function part(percent, whole) {  //part is percent multiplied by whole
	return (await percent / 100) * await whole;
}
exports.cutArray = cutArray
function cutArray(arr, num) {   //cuts array to length
	let result = new Array();
	for (i = 0; i < num; i++) {
		result[i] = arr[i];
	}
	return result;
}
exports.getMinOfArray = getMinOfArray
function getMinOfArray(numArray) {      //in: numericArray out: minValue
	return Math.min.apply(null, numArray);
}
exports.getMaxOfArray = getMaxOfArray
function getMaxOfArray(numArray) {      //in: numericArray out: maxValue
	return Math.max.apply(null, numArray);
}
exports.getAvgOfArray = getAvgOfArray
function getAvgOfArray(numArray) {      //in: numericArray out: avgValue
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
exports.sumOfArray = sumOfArray
function sumOfArray(arr) {
	let sum = 0
	for (let i in arr) {
		sum += arr[i]
	}
	/*if (arr.length > 1) {
		for (let i in arr) {
		}
	} else {
		sum = arr
	}*/
	return sum
}
exports.cleanArray = cleanArray
function cleanArray(arr) {      // Will remove all falsy values: undefined, null, 0, false, NaN and "" (empty string)
	var newArray = []
	for (var i = 0; i < arr.length; i++) {
		if (arr[i]) {
			newArray.push(arr[i]);
		}
	}
	return newArray;
}
exports.boolToInitial = boolToInitial
function boolToInitial(bool) {  //returns initial of string|bool
	var bool;
	var a = bool.toString();
	var b = a.charAt(0);
	return b;
}
exports.jsonToArray = jsonToArray
function jsonToArray(json, attribute) {
	for (i = 0; i < length; i++) {
		arr[i] = json[attribute]
	}
	return arr;
}
exports.delay = delay
async function delay(durationInSeconds) {
	timeMS = await durationInSeconds * 1000
	console.log("----------------Delay--------------------")
	return new Promise(resolve => {
		setTimeout(
			async () => {
				resolve(
					true
				);
			}, timeMS);
	});
}


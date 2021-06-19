
const f = require("./funk")

//crypto related

exports.mergeSymbol = mergeSymbol
function mergeSymbol(base, quote) {
	return mergedSymbol = base + "/" + quote;

}
exports.splitSymbol = splitSymbol
function splitSymbol(symbol, selectReturn) {   // BTC/USDT   ,   first | second    base | quote
	let char = symbol.search("/");
	first = symbol.slice(0, char);
	second = symbol.slice(char + 1, symbol.length);
	switch (selectReturn) {
		case "first":
			return first;
		case "second":
			return second;
	}
}
exports.extractBases = extractBases
function extractBases(markets) {
	let bases = []
	for (let i in markets) {
		bases[i] = splitSymbol(markets[i], "first")
	}
	return bases
}
exports.baseToQuote = baseToQuote
function baseToQuote(amountBase, price) {
	amountQuote = amountBase * price;
	return amountQuote;
}
exports.quoteToBase = quoteToBase
function quoteToBase(amountQuote, price) {
	amountBase = amountQuote / price;
	return amountBase;
}
exports.selectSide = selectSide
function selectSide(baseBalance, quoteBalance, minAmount, baseBalanceInQuote, quoteBalanceInBase) {        // check currency from pair that has more funds returns: sale,purchase
	if ((baseBalance > minAmount) || (quoteBalanceInBase > minAmount)) {
		if (baseBalanceInQuote > quoteBalance) {
			//console.log("base is larger")
			return {
				sale: true,
				purchase: false,
			}
		} else if (baseBalanceInQuote < quoteBalance) {
			//console.log("quote is larger")
			return {
				sale: false,
				purchase: true,
			}
		}
	} else {
		//console.log("min amount not reached")
		return {
			sale: false,
			purchase: false,
		}
	}

	/*if ((baseBalanceInQuote > quoteBalance) && (baseBalance > minAmount)) {   //can sell
		return {
			sale: true,
			purchase: false,
		}
	} else if ((baseBalanceInQuote < quoteBalance) && (quoteBalanceInBase > minAmount)) {    //can buy
		return {
			sale: false,
			purchase: true,
		}
	} else { //no order posible
		return {
			sale: false,
			purchase: false,
		}
	}*/
}
//exports.checkNewBougthPrice = checkNewBougthPrice
function checkNewBougthPrice(price, lastBPrice) {     //if new bougth price is higher than old one its OK you can update it IF new bougth price is lower you MUST NOT update it
	if (lastBPrice > price) {
		f.cs("Last bougth price: " + lastBPrice + " was bigger than current NOT Updated: " + price)
		return lastBPrice;
	} else if (lastBPrice <= price) {
		f.cs("Last bougth price: " + lastBPrice + " was smaller than current IS Updated: " + price)
		return price;
	}
}
exports.safeSale = safeSale
async function safeSale(tradingFeeP, bougthPrice, price, minProfitP, buysN) {  //returns holding status
	totalFees = tradingFeeP * (buysN + 1)
	tradingFeeAbs = await f.part(totalFees, bougthPrice)
	minProfitAbs = await f.part(minProfitP, bougthPrice)
	sellPrice = bougthPrice + tradingFeeAbs + minProfitAbs
	/*console.log(totalFees)
	console.log(buysN)
	console.log(tradingFeeAbs)
	console.log(bougthPrice)
	console.log(minProfitP)
	console.log(minProfitAbs)
	console.log(sellPrice)*/
	if (!bougthPrice) {
		hold = false
	} else {
		if (sellPrice > price) {      //set holdin zone
			hold = true;    	//dont allow sell force holding
		} else {
			hold = false;           //allow sale of holding to parked
		}
	}
	return {
		"hold": hold,
		"sellPrice": sellPrice,
		"tradingFeeAbs": tradingFeeAbs
	}
}
exports.checkStopLoss = checkStopLoss
async function checkStopLoss(price, stopLossP, sellPrice, quoteCurrency, fiatCurrency, minProfitP) {  //force sale
	stopLossP += minProfitP   //stopLoss is calculated from sellPrice wich includes minProfit
	//console.log(stopLossP)
	//console.log(sellPrice)
	absStopLoss = await f.part(stopLossP, sellPrice);
	//console.log(absStopLoss)
	lossPrice = await sellPrice - await absStopLoss;
	//console.log(lossPrice)
	loss = await sellPrice - price;
	//console.log(loss)
	relativeLoss = await f.percent(loss, sellPrice);
	//console.log(relativeLoss)
	if (lossPrice &&
		(quoteCurrency == fiatCurrency) &&    //uses stoploss only on fiat markets
		(price <= lossPrice)) {
		return {//sell ASAP!!!
			"stopLoss": true,
			"lossPrice": lossPrice,
		}
	} else {
		return {//hodl
			"stopLoss": false,
			"lossPrice": lossPrice,
		}
	}
}

//determineMarketType(symbol)
exports.determineMarketType = determineMarketType;
async function determineMarketType(symbol, fiatCurrency, quotes) {// returns: af, qf, aq, qq

	first = f.splitSymbol(symbol, "first")
	second = f.splitSymbol(symbol, "second")

	function isQuote(cur) {
		let x
		for (var i in quotes) {
			if (cur == quotes[i]) {
				i++
				x = true
			}
		}
		!x ? x = false : ""
		return x
	}

	function checkType(cur) {
		if (cur == fiatCurrency) {
			return "f"
		} else {
			if (isQuote(cur)) {
				return "q"
			} else {
				return "a"
			}
		}
	}

	return marketType = checkType(first) + checkType(second)
}

exports.determineAssetType = determineAssetType;
async function determineAssetType(currency, quotes, fiatCurrency) {// returns: alt, quote, fiat
	function isQuote(cur) {
		let x
		for (var i in quotes) {
			if (cur == quotes[i]) {
				i++
				x = true
			}
		}
		!x ? x = false : ""
		return x
	}

	function checkType(cur) {
		if (cur == fiatCurrency) {
			return "fiat"
		} else {
			if (isQuote(cur)) {
				return "quote"
			} else {
				return "alt"
			}
		}
	}
	return checkType(currency)
}

exports.sender = sender
async function sender(info, order) {
	if (info) {
		switch (order) {
			case "bougth":
				//console.log("bougth")
				f.sendMail("Bougth Info", JSON.stringify(info))
				break;
			case "sold":
				//console.log("sold")
				f.sendMail("Sold Info", JSON.stringify(info))
				break;
			case "lossed":
				//console.log("sold")
				f.sendMail("Lossed Info", JSON.stringify(info))
				break;
			default:
			//console.log("park or hodl")
		}
	}
}

//CAIn(3, -1, 4, 2)
exports.CAIn = CAIn
async function CAIn(price, amount, costs, ownedAmount) {//4in 3out 2return
	console.log("Moved: " + amount + " at: " + price)
	console.log("Owned cost: " + costs + " Old amount: " + ownedAmount)
	let ownedPrice = costs / ownedAmount
	ownedPrice ? "" : ownedPrice = 0
	let CAprices = [price, ownedPrice]
	let CAAmounts = [amount, ownedAmount]
	console.log("CAprices " + CAprices)
	console.log("CAAmounts " + CAAmounts)
	let CACosts = [0]   //cost = price * amount
	for (let i in CAprices) {
		CACosts[i] = CAprices[i] * CAAmounts[i]
		console.log(CACosts)
	}
	let costsSum = f.sumOfArray(CACosts)
	let amountsSum = f.sumOfArray(CAAmounts)
	//parseInt(amountsSum)
	console.log("costsSum " + costsSum)
	console.log("amountsSum " + amountsSum)
	let CAPrice = costsSum / amountsSum	//nothing is free
	CAPrice ? "" : CAPrice = 0
	//return
	r = {
		"CAPrice": CAPrice,
		"CACost": costsSum,
		//"CAAmount": amountsSum,	//total actual balance of base asset
	}
	console.log(r)
	return r		//primary output
}

//CAOut(0.018, 100, 4.2, 300)
exports.CAOut = CAOut
async function CAOut(price, amount, costs, ownedAmount) {//4in 3out 2return
	console.log("CAOut: Bougth: " + amount + " at: " + price)
	console.log("CAOut: Cost:" + costs + " Old amount: " + ownedAmount)
	let cost = costs / ownedAmount
	let CAprices = [price, cost]
	let CAAmounts = [-amount, ownedAmount]	//deduct
	let CACosts = [0]   //cost = price * amount
	for (let i in CAprices) {
		CACosts[i] = CAprices[i] * CAAmounts[i]
	}
	let costsSum = f.sumOfArray(CACosts)
	let amountsSum = f.sumOfArray(CAAmounts)
	let CAPrice = costsSum / amountsSum	//nothing is free
	!CAPrice ? CAPrice = 0 : ""
	//return
	r = {
		"CAPrice": CAPrice,	//avgPrice
		"CACost": costsSum,	//total payed for owned
		"CAAmount": amountsSum,	//total actual balance of base asset
	}
	console.log(r)
	return r		//primary output
}

exports.FCAIn = FCAIn
async function FCAIn(FCAPrices, FCAAmounts) {
	console.log("FCAPrices")
	console.log(FCAPrices)
	console.log("FCAAmounts")
	console.log(FCAAmounts)
	let FCACosts = []   //cost = price * amount
	if (FCAPrices.length > 1) {
		console.log("arraying")
		for (let i in FCAPrices) {
			FCACosts[i] = FCAPrices[i] * FCAAmounts[i]
		}
	} else {
		console.log("varing")
		return FCAPrices
	}

	let costsSum = f.sumOfArray(FCACosts)
	let amountsSum = f.sumOfArray(FCAAmounts)
	let avgPrice = costsSum / amountsSum	//nothing is free
	console.log(amountsSum)
	console.log(costsSum)
	console.log(realPrice)
	return avgPrice		//primary output of total value
}

exports.FCAOut = FCAOut
async function FCAOut(price, amount, FCAAmounts) {	//clear logs to one amount and price
	//let FCANewAmounts = []
	let amountsSum = f.sumOfArray(FCAAmounts)
	//console.log(amountsSum)
	let FCANewAmounts = amountsSum - amount	//leftovers
	if (FCANewAmounts < 0) {
		return {
			"value": 0,
			"price": [0],
			"amount": [0],
		}
	} else {
		return {	//proper return
			"value": price,
			"price": [price],
			"amount": [FCANewAmounts],
		}
	}

}


exports.FCA = FCA
async function FCA(FCAPrices, FCAAmounts) {
	let FCACosts = []   //cost = price * amount
	for (let i in FCAPrices) {
		FCACosts[i] = FCAPrices[i] * FCAAmounts[i]
	}
	let amountsSum = f.sumOfArray(FCAAmounts)
	let costsSum = f.sumOfArray(FCACosts)
	let avgPrice = costsSum / amountsSum

	if ((avgPrice == 0) || !avgPrice) {
		return "no data"
	} else {
		return avgPrice
	}
}
exports.fakeBuy = fakeBuy
async function fakeBuy() {
	await f.delay(5)
	orderR = {  //fake return od makeOrder()
		"status": "closed",
		"price": price,
		"amount": Math.floor((Math.random() * 100) + 1),
	}
	return orderR
}
exports.fakeSell = fakeSell
async function fakeSell() {
	await f.delay(5)
	orderR = {  //fake return od makeOrder()
		"status": "closed",
		"price": price,
		"amount": Math.floor((Math.random() * 100) + 1),
	}
	return orderR
}



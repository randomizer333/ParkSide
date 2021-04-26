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
exports.selectCurrency = selectCurrency
function selectCurrency(baseBalance, quoteBalance, minAmount, baseBalanceInQuote) {        // check currency from pair that has more funds returns: sale,more,purchase
        if ((baseBalanceInQuote > quoteBalance) && (baseBalance > minAmount)) {   //can sell
                return {
                        sale: true,
                        purchase: false,
                        more: true,
                }
        } else if ((baseBalanceInQuote < quoteBalance) && (quoteBalanceInBase > minAmount)) {    //can buy
                return {
                        sale: false,
                        purchase: true,
                        more: false,
                }
        } else {
                return {
                        sale: false,
                        purchase: false,
                        more: true,
                }
        }
}
exports.checkNewBougthPrice = checkNewBougthPrice
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
        totalFees = tradingFeeP * (buysN + 1);
        tradingFeeAbs = await part(totalFees, bougthPrice);
        minProfitAbs = await part(minProfitP, bougthPrice);
        sellPrice = await bougthPrice + tradingFeeAbs + minProfitAbs;
        if (!bougthPrice) {
                r = true
        } else {
                if (sellPrice > price) {      //if bougthPrice is not high enough
                        r = true;    	//dont allow sell force holding
                } else {
                        r = false;           //allow sale of holding to parked
                }
        }
        return {
                "condition": r,
                "sellPrice": sellPrice
        }
}
exports.checkStopLoss = checkStopLoss
async function checkStopLoss(price, stopLossP, sellPrice, quoteCurrency,fiatCurrency,minProfitP) {  //force sale
        stopLossP += minProfitP   //stopLoss is calculated from sellPrice wich includes minProfit
        absStopLoss = await part(stopLossP, sellPrice);
        lossPrice = await sellPrice - await absStopLoss;
        loss = await sellPrice - price;
        relativeLoss = await percent(loss, sellPrice);
        if (lossPrice &&
                (quoteCurrency == fiatCurrency) &&    //uses stoploss only on fiat markets
                (price <= lossPrice)) {
                stopLoss = true   //sell ASAP!!!
        } else {
                //f.cs("hodl")
                stopLoss = false  //hodl
        }
}

//determineMarketType(symbol)
exports.determineMarketType = determineMarketType;
async function determineMarketType(symbol,fiatCurrency) {// returns: af, qf, aq, qq

    first = f.splitSymbol(symbol, "first")
    second = f.splitSymbol(symbol, "second")

    function isQuote(cur) {
        let x
        for (var i in qs) {
            if (cur == qs[i]) {
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

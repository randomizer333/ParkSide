/*
funk.js
is a js module for generic comonly used simple functions that should be aplicable to any data
*/

exports.baseToQuote = baseToQuote
function baseToQuote(amountBase, price) {
    amountQuote = amountBase * price;
    return amountQuote;
} 
function quoteToBase(amountQuote, price) {
    amountBase = amountQuote / price;
    return amountBase;
}
exports.quoteToBase = quoteToBase

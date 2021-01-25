let re = []
function alts (){
    re = [    //alt markets 

        "BTC/USDT", "ETH/USDT", "BNB/USDT",//intra quote*/
        /*"DOT/USDT",
        "XRP/USDT",
        "ADA/USDT",
        "LTC/USDT",
        "BCH/USDT",
        "LINK/USDT",
        "XLM/USDT",*/
    
        //"ETH/BTC","BNB/BTC",      //intra quote
        "DOT/BTC",
        "XRP/BTC",
        "ADA/BTC",
        "LTC/BTC",
        "BCH/BTC",
        "LINK/BTC",
        "XLM/BTC",
    
        /*"BNB/ETH",   //intra quote
        "DOT/ETH",
        "XRP/ETH",
        "ADA/ETH",
        "LTC/ETH",
        "BCH/ETH",
        "LINK/ETH",
        "XLM/ETH",
    
        "DOT/BNB",
        "XRP/BNB",
        "ADA/BNB",
        "LTC/BNB",
        "BCH/BNB",
        "LINK/BNB",
        "XLM/BNB",
    
        //*/
    ]
    return re
}

//console.log(alts())

exports.alts = alts;

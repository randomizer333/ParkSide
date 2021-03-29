let re = []
function alts (){
    re = [    //alt markets 

        "BTC/EUR", "ETH/EUR", "BNB/EUR",//intra quote
        "DOT/EUR",
        "XRP/EUR",
        "ADA/EUR",
        "LTC/EUR",
        "BCH/EUR",
        "LINK/EUR",
        "XLM/EUR",
        //"UNI/EUR",    no market
        "DOGE/EUR",
    
        "ETH/BTC","BNB/BTC",      //intra quote
        "DOT/BTC",         
        "XRP/BTC",
        "ADA/BTC",
        "LTC/BTC",
        "BCH/BTC",
        "LINK/BTC",
        "XLM/BTC",
        "UNI/BTC",
        "DOGE/BTC",/*
    
        "BNB/ETH",   //intra quote
        //"DOT/ETH",    no market
        "XRP/ETH",
        "ADA/ETH",
        "LTC/ETH",
        //"BCH/ETH",    no market
        "LINK/ETH",
        "XLM/ETH",
        //"UNI/ETH",    no market
    
        "DOT/BNB",
        "XRP/BNB",
        "ADA/BNB",
        "LTC/BNB",
        "BCH/BNB",
        //"LINK/BNB",   no market
        "XLM/BNB",
        "UNI/BNB",

        /*"BTC/USDT", "ETH/USDT", "BNB/USDT",//intra quote
        "DOT/USDT",
        "XRP/USDT",
        "ADA/USDT",
        "LTC/USDT",
        "BCH/USDT",
        "LINK/USDT",
        "XLM/USDT",
        "UNI/USDT",
        "DOGE/USDT",*/
        
        //*/
    ]
    return re
}
exports.alts = alts;

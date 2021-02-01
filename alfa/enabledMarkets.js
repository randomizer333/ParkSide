let re = []
function alts (){
    re = [    //alt markets 

        //"BTC/USDT", /*"ETH/USDT", "BNB/USDT",//intra quote*/
        /*"DOT/USDT",
        "XRP/USDT",
        "ADA/USDT",
        "LTC/USDT",
        "BCH/USDT",
        "LINK/USDT",
        "XLM/USDT",
        "UNI/USDT",*/
    
        "ETH/BTC","BNB/BTC",      //intra quote
        "DOT/BTC",          //
        "XRP/BTC",
        "ADA/BTC",
        "LTC/BTC",
        "BCH/BTC",
        "LINK/BTC",
        "XLM/BTC",
        "UNI/BTC",
    
        /*"BNB/ETH",   //intra quote
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
    
        //*/
    ]
    return re
}
exports.alts = alts;

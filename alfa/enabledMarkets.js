function alts (){
    let re = [    //alt markets 

        "BTC/USDT",/* "ETH/USDT", "BNB/USDT",//intra quote*/
        /*"XRP/USDT",
        "LTC/USDT",
        "EOS/USDT",
        "ADA/USDT",
        "XLM/USDT",
        "XMR/USDT",
        "TRX/USDT",
        "BCH/USDT",
        "LINK/USDT",
        "XTZ/USDT",
        "YFI/USDT",     //DeFi
        "DOT/USDT",
        /*"QTUM/USDT",
        "COMP/USDT",
        "DAI/USDT",
        "UMA/USDT",
        "LEND/USDT",
        "MKR/USDT",
        "UNI/USDT",*/
    
        "ETH/BTC","BNB/BTC",      //intra quote
        "XRP/BTC",
        "LTC/BTC",
        "EOS/BTC",
        "ADA/BTC",
        "XLM/BTC",
        "XMR/BTC",
        "TRX/BTC",
        "BCH/BTC",
        "XTZ/BTC",
        "LINK/BTC",//DeFi 
        "DOT/BTC",
        "YFI/BTC",
        /*"UNI/BTC",
        "QTUM/BTC",
        /*"COMP/BTC",
        //"DAI/BTC", 
        "UMA/BTC",
        "LEND/BTC",
        "MKR/BTC",
        "WBTC/BTC",*/
    
        /*"XRP/BNB",
        "LTC/BNB",
        "EOS/BNB",
        "ADA/BNB",
        "XLM/BNB",
        "XMR/BNB",
        "TRX/BNB",
        "BCH/BNB",
        "XTZ/BNB",
        "DOT/BNB",
        /*"COMP/BNB",
        "DAI/BNB",
        "MKR/BNB",
        "UNI/BNB",//*/
    
        /*"BNB/ETH",   //intra quote
        "XRP/ETH",
        "LTC/ETH",
        "EOS/ETH",
        "ADA/ETH",
        "XLM/ETH",
        "XMR/ETH",
        "TRX/ETH",
        "LINK/ETH",
        //"QTUM/ETH",
        //"LEND/ETH",
        //"WBTC/ETH",
    
        /*database format
    
        "BSV/USDT",
        "BSV/BTC",
        
        //*/
    ]
    return re
}

//console.log(alts())

exports.alts = alts;

//this file contains agregations of a node.js module technicalindicators

let TI = require("technicalindicators");
let f = require("./funk.js");

exports.ma = ma;
async function ma(arr) {     //trendMA between curent and avarage
    if (arr == undefined || arr[0] == 0 || arr[1] == 0) {
        f.cs("no valid input yet for MA")
        return 0
    }
    let ma = await f.getAvgOfArray(arr);    //ma is avg of arr

    //f.cs("arr: " + arr)
    let direction = await arr[0] - ma;  //absolute trend
    //f.cs("direction: " + direction)
    let trendMA = await f.percent(direction, arr[0]);    //relative trend
    //f.cs("trendMA: " + trendMA)

    if (trendMA > 0) {//goin UP buy coz rising
        return trendMA //trendMA
    } else if (trendMA < 0) {//going DOWN hold or park coz stationary
        return trendMA //trendMA
    } else {    //all input data is the same
        return 0
    }
}

exports.ao = ao;
async function ao(lowsArr, highsArr) {
    let AO = TI.AwesomeOscillator;
    //f.cs(TI)
    f.cs(AO)
    let inputAO = {
        high: highsArr,
        low: lowsArr,
        fastPeriod: 5,
        slowPeriod: 34
    }

    f.cs(inputAO)
    let r = AO.calculate(inputAO);
    f.cs(r)
    r ? lastAO = r[r.length - 1] : lastAO = 0; //last JSON
    f.cs(lastAO)
    if (lastAO) {
        if (!isNaN(lastAO)) {     //isNumber
            return await lastAO;
        } else {
            return 0;
        }
    } else {
        return await lastAO;
    }
}

exports.vwap = vwap;
async function vwap(opens, highs, lows, closes, volumes) {
    let VWAP = TI.VWAP;
    let inputVWAP = {
        open: opens,
        high: highs,
        low: lows,
        close: closes,
        volume: volumes,
    }
    f.cs("dolžina opens: " + opens.length)
    f.cs("dolžina high: " + high.length)
    f.cs("dolžina lows: " + lows.length)
    f.cs("dolžina volumes: " + volumes.length)
    let r = await VWAP.calculate(inputVWAP);
    f.cs(r)
    return await r;
}

exports.rsi = rsi;
async function rsi(values, period) {  //returns trndRSI   log15
    let RSI = TI.RSI;
    let inputRSI = {
        values: values,
        period: period   //14
    };
    let r = await RSI.calculate(inputRSI);
    //f.cs(r)
    let lastRSI = r[r.length - 1]; //last JSON
    //f.cs("RSI:")
    //f.cs(lastRSI)
    if (lastRSI > 70) {
        trendRSI = lastRSI * (-1);  //sell coz falling 
    } else if (lastRSI < 30) {
        trendRSI = lastRSI;  //buy coz rising
    } else {
        trendRSI = 0;   //hold or park coz stationary
    };
    //f.cs(trendRSI)
    return await trendRSI
}

exports.macd = macd;
async function macd(values) {     //log 70 should be bigger the better starts working when value = slowPeriod + signalPeriod
    let MACD = TI.MACD;
    let macdInput = {
        values: values,   //34,70,140n of inputs - slowPeriod = n of outputs 
        fastPeriod: 12,       //12,24,48
        slowPeriod: 26,       //26,52,104      when this is full it putout
        signalPeriod: 9,        //9,18,36
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };
    let r = await MACD.calculate(macdInput);      //array with JSONs
    let lastMACD;
    r ? lastMACD = r[r.length - 1] : lastMACD = 0; //last JSON
    let macdHistogram = 0;
    if (lastMACD) {
        macdLine = lastMACD.MACD;
        signalLine = lastMACD.signal;
        macdHistogram = lastMACD.histogram;
        //f.cs("macdLine"+": "+macdLine)
        //f.cs("signalLine"+": "+signalLine)
        //f.cs("macdHistogram"+": "+macdHistogram)
        if (!isNaN(macdHistogram)) {     //isNumber
            //f.sendMail("Started MACD", r);
            return await macdHistogram;
        } else {
            return 0;
        }
    } else {
        return 0    //await macdHistogram;
    }
}

exports.macdReverse = macdReverse;
async function macdReverse(values) {     //log 70 should be bigger the better starts working when value = slowPeriod + signalPeriod
    let MACD = TI.MACD;
    let macdInput = {
        values: values,   //34,70,140n of inputs - slowPeriod = n of outputs 
        fastPeriod: 12,       //12,24,48
        slowPeriod: 26,       //26,52,104      when this is full it putout
        signalPeriod: 9,        //9,18,36
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };
    let r = await MACD.calculate(macdInput);      //array with JSONs
    let lastMACD;
    r ? lastMACD = r[r.length - 1] : lastMACD = 0; //last JSON
    let macdHistogram = 0;
    if (lastMACD) {
        macdLine = lastMACD.MACD;
        signalLine = lastMACD.signal;
        macdHistogram = lastMACD.histogram * (-1);  //reverse addition  * (-1)
        //f.cs("macdLine"+": "+macdLine)
        //f.cs("signalLine"+": "+signalLine)
        //f.cs("macdHistogram"+": "+macdHistogram)
        if (!isNaN(macdHistogram)) {     //isNumber
            //f.sendMail("Started MACD", r);
            return await macdHistogram;
        } else {
            return 0;
        }
    } else {
        return 0    //await macdHistogram;
    }
}

exports.doubleMacd = doubleMacd;
async function doubleMacd(values) {     //log 70 should be bigger the better starts working when value = slowPeriod + signalPeriod
    let MACD = TI.MACD;
    let macdInput = {   // n of values = fastPeriod + slow period
        values: values,   //38,76,152 n of inputs - slowPeriod = n of outputs 
        fastPeriod: 24,       //12,24,48
        slowPeriod: 52,       //26,52,104      when this is full it putout
        signalPeriod: 18,        //9,18,36
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };
    let r = await MACD.calculate(macdInput);      //array with JSONs
    let lastMACD;
    r ? lastMACD = r[r.length - 1] : lastMACD = 0; //last JSON
    let macdHistogram = 0;
    if (lastMACD) {
        macdLine = lastMACD.MACD;
        signalLine = lastMACD.signal;
        macdHistogram = lastMACD.histogram;
        if (!isNaN(macdHistogram)) {     //isNumber
            //f.sendMail("Started MACD", r);
            return await macdHistogram;
        } else {
            return 0;
        }
    } else {
        return 0    //await macdHistogram;
    }
}

exports.doubleMacdReverse = doubleMacdReverse;
async function doubleMacdReverse(values) {     //log 70 should be bigger the better starts working when value = slowPeriod + signalPeriod
    let MACD = TI.MACD;
    let macdInput = {   // n of values = fastPeriod + slow period
        values: values,   //38,76,152 n of inputs - slowPeriod = n of outputs 
        fastPeriod: 24,       //12,24,48
        slowPeriod: 52,       //26,52,104      when this is full it putout
        signalPeriod: 18,        //9,18,36
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };
    let r = await MACD.calculate(macdInput);      //array with JSONs
    let lastMACD;
    r ? lastMACD = r[r.length - 1] : lastMACD = 0; //last JSON
    let macdHistogram = 0;
    if (lastMACD) {
        macdLine = lastMACD.MACD;
        signalLine = lastMACD.signal;
        macdHistogram = lastMACD.histogram * (-1);  //reverse addition  * (-1)
        if (!isNaN(macdHistogram)) {     //isNumber
            //f.sendMail("Started MACD", r);
            return await macdHistogram;
        } else {
            return 0;
        }
    } else {
        return 0    //await macdHistogram;
    }
}

exports.quadMacd = quadMacd;
async function quadMacd(values) {     //log 70 should be bigger the better starts working when value = slowPeriod + signalPeriod
    let MACD = TI.MACD;
    let macdInput = {
        values: values,   //34,70,140n of inputs - slowPeriod = n of outputs 
        fastPeriod: 48,       //12,24,48
        slowPeriod: 104,       //26,52,104      when this is full it putout
        signalPeriod: 36,        //9,18,36
        SimpleMAOscillator: false,
        SimpleMASignal: false
    };
    let r = await MACD.calculate(macdInput);      //array with JSONs
    let lastMACD;
    //f.cs(lastMACD)
    r ? lastMACD = r[r.length - 1] : lastMACD = 0; //last JSON
    let macdHistogram = 0;
    if (lastMACD) {
        macdLine = lastMACD.MACD;
        signalLine = lastMACD.signal;
        macdHistogram = lastMACD.histogram;
        if (!isNaN(macdHistogram)) {     //isNumber
            //f.sendMail("Started MACD", r);
            return await macdHistogram;
        } else {
            return 0;
        }
    } else {
        return 0    //await macdHistogram;
    }
}


exports.change1h = change1h;
async function change1h(priceLog, tickerInMs, price, durationInMinutes) {
    index1h = await (f.minToMs(durationInMinutes) / tickerInMs) - 1
    //console.log(index1h)
    price1h = await priceLog[index1h]
    diff = await price - price1h
    //console.log(price)
    //console.log(price1h)
    ch1h = await f.percent(diff, price1h)
    //console.log(ch1h)
    if (await ch1h) {
        return ch1h
    } else {
        return 0
    }
}

indicator = await indicators(price, volume, change24hP, bid, ask)
        async function indicators(price, volume, change24hP, bid, ask) {
            //market data colection
            /*logAll = await m.loger(price, 555, logAll);
            logBids = await m.loger(bid, 50, logBids)
            logAsks = await m.loger(ask, 50, logAsks);
            log24hP = await m.loger(change24hP, 3, log24hP);
            logVol = await m.loger(volume, 10, logVol);
            //logRSI = await m.loger(volume, 22, logRSI);

            logMA3 = await m.loger(price, 3, logMA3); //for all MAs
            logMA20 = await m.loger(price, 20, logMA20); //for all MAs
            logMA30 = await m.loger(price, 30, logMA30); //for all MAs
            logMA100 = await m.loger(price, 100, logMA100); //for all MAs
            logMA200 = await m.loger(price, 200, logMA200); //for all MAs*/

            //technical analysis
            MA3 = await TI.ma(logMA3);   //MA of last 3 prices
            MA20 = await TI.ma(logMA20) //MA of last 30 prices
            MA30 = await TI.ma(logMA30) //MA of last 30 prices
            MA100 = await TI.ma(logMA100);  //MA of last 200 prices
            MA200 = await TI.ma(logMA200);  //MA of last 200 prices

            RSI = await TI.rsi(logAll, 16); //RSI (30,70)

            logRSIMA = await m.loger(MA3, 15, logRSIMA)
            RSIMA = await TI.rsi(logRSIMA, 14); //RSI (30,70)

            MACD = await TI.macd(logAll);   //standard MACD
            MACDRev = await TI.macdReverse(logAll);
            logMacd = await m.loger(MACD, 3, logMacd);
            MACDMA = await TI.ma(logMacd);  //MA of MACD

            DMACD = await TI.doubleMacd(logAll);    //double length of input MACD
            DMACDRev = await TI.doubleMacdReverse(logAll);
            logDMacd = await m.loger(DMACD, 3, logDMacd);
            DMACDMA = await TI.ma(logDMacd);  //MA of DMACD


            change1hP = await m.change1h(logAll, ticker, price, 60)  //price change percentage in duration
            change6hP = await m.change1h(logAll, ticker, price, 360)  //price change percentage in duration
            MA3change24hP = await TI.ma(log24hP);  //MA3 of 24h price change

            MAVol = await TI.ma(logVol);    //MA of last 5 Volumes

            //rang = await globalRang(MAVol, symbol, botNumber, 2);
            //rang = await globalRang(change1hP, symbol, botNumber, 10);
            //rang2 = await globalRang(MAVol, symbol, botNumber, 10)
            //rang = await globalRang2(MACDMA, symbol, botNumber, 3)
            rang = await globalRang2(change1hP, symbol, botNumber, 3)

            logVolMACD = await m.loger(volume, 40, logVolMACD);
            MACDVol = await TI.macd(logVolMACD);    //MACD of MA5

            vwap = await a.vwap(symbol)
            vwapS = await simpleVwap(vwap, price)
            async function simpleVwap(vwap, price) {
                if (price > vwap) {
                    return vwap
                } else {
                    return -1 * vwap
                }
            }

            logVwap = await m.loger(vwap, 3, logVwap);
            vwapMA = await TI.ma(logVwap);    //MA of last 5 Volumes reversed

            return {
                uppers: {
                    //MA3: MA3,
                    //MA20: MA20,
                    //MA30: MA30,
                    //MA100: MA100,
                    //MA200: MA200,
                    //MACD: MACD,
                    MACDRev: MACDRev,
                    MACDMA: MACDMA,
                    //RSI: RSI,
                    //RSIMA: RSIMA,
                    //ao: ao,
                    //vwap: vwap,
                    vwapS: vwapS,
                    //vwapMA: vwapMA,
                    //DMACD: DMACD,
                    //DMACDMA: DMACDMA,
                    //DMACDRev: DMACDRev,
                    change1hP: change1hP,
                    rank: rang,
                },
                downers: {
                    MA3: MA3
                },
                all: {
                    MA3: MA3,
                    MA30: MA30,
                    MA100: MA100,
                    MA200: MA200,
                    change1hP: change1hP,
                    change6hP: change6hP,
                    change24hP: change24hP,
                    MA3change24hP: MA3change24hP,
                    RSI: RSI,
                    MACD: MACD,
                    MACDMA: MACDMA,
                    MAVol: MAVol,
                    MACDVol: MACDVol,
                    MACDRev: MACDRev,
                    DMACD: DMACD,
                    DMACDMA: DMACDMA,
                    DMACDRev: DMACDRev,
                    vwap: vwap,
                    vwapS: vwapS,
                    vwapMA: vwapMA,
                    rank: rang,
                    //rank2: rang2,
                }
            }
        }

        
        upSignal = await up(indicator.uppers);
        async function up(uppers) {     //confirm signals above 0 with AND
            conds = Object.values(uppers);
            function condition(currentValue) {
                return currentValue > 0;    //set condition
            }
            return conds.every(condition)
        }

        
        downSignal = await down(indicator.downers);
        async function down(downers) {  //confirm signals below 0 with AND
            conds = Object.values(downers);
            function condition(currentValue) {
                return currentValue < 0;    //set condition
            }
            return conds.every(condition)
        }


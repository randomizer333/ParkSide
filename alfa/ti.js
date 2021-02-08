//this file contains agregations of a node.js module technicalindicators

let TI = require("technicalindicators");
let f = require("./funk.js");

let stor = [];     //storage for direction
async function ma(arr) {     //trendMA between curent and last value
    let value = arr[0];
    let ma = await f.getAvgOfArray(arr);
    if (stor[1] == undefined) {
        stor[1] = value;
        stor[0] = value;
    };
    stor[1] = stor[0];
    stor[0] = value;
    let direction = await stor[0] - ma;
    let trendMA = await f.percent(direction,value);
    
    if (trendMA > 0) {//goin UP buy coz rising
        return trendMA
    } else if(trendMA < 0){//going DOWN hold or park coz stationary
        return trendMA
    } else {    //all input data is the same
        return trendMA = 0
    }
}

async function rsi(values) {  //returns trndRSI   log15
    let RSI = TI.RSI;
    let inputRSI = {
        values: values,
        period: 14   //9
    };
    let r = await RSI.calculate(inputRSI);
    let n = r.length - 1;
    let lastRSI = r[n]; //last JSON
    if (lastRSI > 70) {
        trendRSI = 1;   //buy coz rising
    } else if (lastRSI < 30) {
        trendRSI = -1;  //sell coz falling
    } else {
        trendRSI = 0;   //hold or park coz stationary
    };
    return await trendRSI;
}

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
        }else{
            return 0;
        }
    } else {
        return await macdHistogram;
    }
}

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
        macdHistogram = lastMACD.histogram * (-1);
        //f.cs("macdLine"+": "+macdLine)
        //f.cs("signalLine"+": "+signalLine)
        //f.cs("macdHistogram"+": "+macdHistogram)
        if (!isNaN(macdHistogram)) {     //isNumber
            //f.sendMail("Started MACD", r);
            return await macdHistogram;
        }else{
            return 0;
        }
    } else {
        return await macdHistogram;
    }
}

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
        }else{
            return 0;
        }
    } else {
        return await macdHistogram;
    }
}

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
        }else{
            return 0;
        }
    } else {
        return await macdHistogram;
    }
}

//ic();
function ic(values){  //ichimokuCloud(conversionLinePeriods, baseLinePeriods, leadingSpanPeriods, laggingSpanPeriods)
    let IC = IchimokuCloud;
    let inputIC = {
        high  : [130,135.475005,134.699995,147.899995,153.199995,155,151.875,150.600005,151,151,168.875,180.925005,212.350005,255,248.949995,255,291.399995,302.95001,310,300,325,316.524995,229.125,245.25,277.5,259.875,300,293.5,273.95001,275,298.899995,300.399995,288.45001,277.875,337.5,355.95001,399.5,420,404.95001,432.92499,450.42499,468,362.17499,404,525,592.2,532,550,569.95,598.4,620,657.975,652.5,714,722.2,691.9,813.3,898.9,900,974.25,982.9,1207.5,1427.225,1464,1494,1649,1321,1214.19995,1359,1354.5,1222,1169.225,1188,1112.5,981.5,752.6,703.5,695,707.05,791.7,920,1267.5,1189.5,1091.5,1062.5,1119.94995,1141.65,1112.94995,1120,1149.9,1056.35,1111,1149.7,1093.4,1093.95,1094.45,1031,1048.5,1110,1124.9,1075,1091.4,1009.4,1055,1065.9,986.79999,967,907,838.90002,859,904,905,844.59998,827.90002,864.70001,830,762.90002,751.40002,742.95001,746.09998,824.90002,881.59998,862,814.90002,849.79999,955,901,869.40002,826.59998,855,873,927.90002,882.84998,901,918,926.54999,909,898.25,829.79999,939.79999,988.75,1145.25,1133,1043.3,1023,1041.3,1003.7,1017.35,991.95001,934.5,943.79999,909.65002,944.29999,915.40002,1014.1,1067.85,1013.85,899.5,974.79999,992.5,1019.7,1089.75,1041.8,1056,1069.9,994.95001],
        low   : [117.15,126,109.025,125.875,141.100005,131.649995,138.274995,137.050005,132.375,128.574995,145.625,161.625,171.800005,196,211.25,223.100005,217.5,263.625,269.5,252.625,261.100005,190.850005,204.574995,200,224.25,234.300005,256.125,243.5,236.050005,245,264.32501,269.54999,256,257.79999,264.274995,304.649995,341.54999,359.5,367.5,367.5,413.5,290.04999,341.75,351.04999,400.5,420,403.5,470.75,476,536.55,569.25,610.05,588.175,632.05,652.55,624.1,652.625,765.625,823.55,838.05,841.6,960.625,1098.85,1288.5,1325.775,1060,1117.5,1060,1121.75,1195.125,978.125,960,1026.4,882.5,465,516.05,512.5,532.5,600.675,557.65,748.675,918,950,858.55,933.8,961.65,961,901.125,990,1018.1,959.15002,979.40002,1012,976,995.09998,1007.25,915,921,990,958.29999,978.75,902,885.09998,964,970,898.34998,828.09998,823.15002,712,747.54999,761.75,751,689,687.15002,765.34998,718,723.70001,673.04999,673.40002,706.65002,730.54999,760.04999,791.70001,761.09998,789.75,836.25,805.75,764.40002,764.15002,779.20001,775.29999,839,763.90002,819.09998,817.70001,835.25,836.75,822.20001,793.09998,797.15002,929.09998,925,1000,958.5,971,917.29999,911.54999,963.40002,859.70001,831.20001,836.59998,796.45001,813.09998,857.20001,873.65002,983.15002,818,825.09998,858.59998,909.95001,912.84998,976.70001,888.09998,964.65002,978.84998,966.35],
        conversionPeriod: 9,
        basePeriod: 26,
        spanPeriod: 52,
        displacement: 26
      }
    let r = IC.calculate(input);
    f.cs(r);
    return r;
}


exports.ma = ma;
exports.rsi = rsi;
exports.macd = macd;
exports.macdReverse = macdReverse;
exports.doubleMacd = doubleMacd;
exports.quadMacd = quadMacd;

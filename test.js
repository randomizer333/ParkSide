var TI = require("technicalindicators");
var x = 0;

var logMACD = [456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,45,456,456,465,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456,456];

console.log(logMACD.length);

function TI_MACD( values ){     //should be bigger the better starts working when value = slowPeriod + signalPeriod
        var MACD = TI.MACD;
        var macdInput = {
          values            : values,   //n of inputs - slowPeriod = n of outputs 
          fastPeriod        : 12,       //12,24,48
          slowPeriod        : 26,       //26,52,104      when this is full it putout
          signalPeriod      : 9,        //9,18,36
          SimpleMAOscillator: false,
          SimpleMASignal    : false
        };
        var r = MACD.calculate(macdInput);      //array with JSONs
        var n = values.length-macdInput.slowPeriod;
        //console.log("data length: "+values.length);
        var lastMACD = r[n]; //last JSON
        //console.log("Last: "+JSON.stringify(lastMACD));
        if (lastMACD){
                macdLine = lastMACD.MACD;
                signalLine = lastMACD.signal;
                macdHistogram = lastMACD.histogram; 
                //console.log("MLine: "+macdLine);
                //console.log("SLine: "+signalLine);
                //console.log("MHist: "+macdHistogram);    
                if(macdHistogram == (undefined || "")){
                        macdHistogram = "loading...";
                }
                else if ( !isNaN(macdHistogram) && x == 0){     //isNumber
                        //sendMail( "Started", msg );
                        x++;
                };
                if (macdHistogram > 1){
                        trendMACD = 1;   //buy coz rising
                }else if(macdHistogram < -1){
                        trendMACD = -1;  //sell coz falling
                }else{
                        trendMACD = 0;   //hold or park coz stationary
                };
                console.log(trendMACD+"macd"+macdHistogram);
        }
        console.log(JSON.stringify(r));
        return r;
}
var macdLine;
var signalLine;
var macdHistogram;// = 0;
var trendMACD;
TI_MACD(logMACD);
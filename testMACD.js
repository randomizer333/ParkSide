

var delay = 5000 //miliseconds
a = 0;

function counter() {       //defines next time delay
        var r = a * delay;
        a++;
        return r;
}

var input = 2;

function test (x){
        var modIn;
        modIn = x + 1;
        console.log(modIn);
}

setTimeout(function () { test(input) }, counter());
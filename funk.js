function functions(){
    function hToMs(timeInHours) {
        var r = timeInHours * 3600000;
        return r;
    }
}


function hToMs(timeInHours) {
    var r = timeInHours * 3600000;
    return r;
}

let t = functions(hToMs(10));
console.log(t)
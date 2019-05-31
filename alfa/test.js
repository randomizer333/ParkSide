

test(0)
function test(ins) {
    if (ins) {
        console.log("true")
    } else {
        console.log("false")
    }
    return {
        prvi:"pru rezultat",
        drugi:"drug rezulatta",
        tretji:"tret reezeultatr"
    }
}

let res= test(1);
let res1 = res.prvi;
let res2 = res.drugi;
let res3 = res.tretji;

console.log(res1+" "+res2+" "+res3)
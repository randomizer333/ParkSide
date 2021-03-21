
var delayTime = 1000;

delayCount(delayTime)
async function delayCount(time) {
    //send1 = await delay(time)
    send1 = await countDown(delayTime)
    let dbms = require("./dbms.js")
    //console.log(await send1)
    //console.log(await countSeconds())
    return await send1
}


async function delay(durationInSeconds) {
    timeMS = await durationInSeconds * 1000
    return new Promise(resolve => {
        setTimeout(
            async () => {
                resolve(
                    true
                );
            }, timeMS);   //set frequenci
    });
}

//let i = 0
async function countDown(to) {
    for (i = 0; i < to; i++) {
        console.log("T- " + (to - i))
        await delay(1)
    }
}

async function countSeconds() {
    let c = 1
    return new Promise(resolve => {
        setInterval(
            async () => {
                resolve(
                    console.log("T- " + await c++),
                    //console.dir("jo")
                );
            }, 1000);   //set frequenci
    });
}

function name(input1, input2) {
    //do proces
    //call other functions
    return {
        output1: output1,
        output2: output2
    }
}
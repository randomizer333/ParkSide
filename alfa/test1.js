
var delayTime = 1000;

//delayCount(delayTime)
async function delayCount(time) {
    //send1 = await delay(time)
    console.log(await te(Math.random(100),3))
    console.log(await te(100,1))
    //nameR = await name(2,3).out1
    //console.log(await nameR)   
    //send1 = await countDown(delayTime)
    //let dbms = require("./dbms.js")
    //console.log(await send1)
    //console.log(await countSeconds())
    return// await send1
}


async function delay(durationInSeconds) {
    timeMS = await durationInSeconds * 1000
    console.log()
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

    console.log("done")
}

let globalVariable = 0  //define global variable
async function te(input1, input2) {
    //do proces
    out1 = input1 + input2
    //call other functions
    await delay(2)
    out2 = input1 - input2
    globalVariable += out1
    //return objects
    return {
        out1: out1,
        out2: out2,
        storage:globalVariable
    }
}


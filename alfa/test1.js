
var send1 = 1;
var send2 = 2;

let ret = console.log(test(send1))
async function test(send1, send2){
    console.log(countSeconds())
    send1 = await delay(5)
    console.log(send1)
    return send1 + send2
}


async function delay(durationInSeconds){
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

async function countSeconds(){
    let c = 1
    return new Promise(resolve => {
        setInterval(
            async () => {
                resolve(
                    console.log(c++),
                    console.dir("jo")
                );
            }, 1000);   //set frequenci
    });
}
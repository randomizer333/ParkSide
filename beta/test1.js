function main() {
    //init

}

async function test() {
    for (var i = 0; i < 5; i++) {
        try {
            result1 = await Presolve();
            console.log("Result 1 ", result1);
            result2 = await Preject();
            console.log("Result 2 ", result2);
        } catch (e) {
            console.log("Error", e);
        } finally {
            console.log("This is done");
        }
    }
}
test();

function Q(input) {
    let startTime = date.now;
    console.log(startTime)
    function timer() {

    }
    setTimeout(timer)
    return output = "rezultat";
}


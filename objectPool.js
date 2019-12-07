class Demo {
    constructor(counter) {
        this.counter = counter;
    }

    setMe() {
        this.counter.count += 1;
    }
}

function createAndDestroy() {
    function test() {
        const objs = [];
        const counter = {
            count: 0
        }
        
        for (let i = 0; i < 1000; i++) {
            for (let boom = 0; boom < 1000; boom++) {
                const currBoom = objs[objs.push(new Demo(counter)) - 1];
                currBoom.setMe();
            }
        }

        console.log(`Counter is: ${counter.count}`);
    }

    repeat(test, 10, 'Create and Destroy');
}

function repeat(cb, repeats, testName) {
    console.log(`%c Started ${testName} test`, 'color: red');
    const start = performance.now();

    for (let i = 0; i < repeats; i++) {
        cb();
    }

    const end = performance.now();
    console.log(`%c Finished ${testName} test run in ${((end - start) / 1000).toFixed(4)} seconds`, 'color: red');
    return end - start;

}
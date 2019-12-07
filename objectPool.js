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
        const counter = {
            count: 0
        }
        
        const pool = new Pool(() => new Demo(counter),
            (item) => {},
            1000);

        for (let i = 0; i < 1000; i++) {
            for (let demo = 0; demo < 1000; demo++) {
                const currDemo = pool.getFree();
                currDemo.data.setMe();
            }
            // release all booms
            pool.releaseAll();
        }

        console.log(`Counter is: ${counter.count}`);
    }

    repeat(test, 10, 'Create and Destroy');
}

class PoolObject {
    constructor(data) {
        this.data = data;
        this.nextFree = null;
        this.previousFree = null;
    }
}

class Pool {
    constructor(objCreator, objReseter, initialSize = 5000) {
        this._pool = [];
        this.objCreator = objCreator;
        this.objReseter = objReseter;
        for (let i = 0; i < initialSize; i++) {
            this.addNewObject(this.newPoolObject());
        }
    }

    addNewObject(obj) {
        this._pool.push(obj);
        this.release(obj);
        return obj;
    }

    release(poolObject) {
        // flag as free
        poolObject.free = true;

        // set in the dequeue
        poolObject.nextFree = null;
        poolObject.previousFree = this.lastFree;

        // if we had a last free, set the last free's next as the new poolObject
        // otherwise, this is the first free!
        if (poolObject.previousFree) {
            this.lastFree.nextFree = poolObject;
        } else {
            this.nextFree = poolObject;
        }

        // set the new object as the last in the dequeue
        this.lastFree = poolObject;

        // reset the object if needed
        this.objReseter(poolObject);
    }

    getFree() {
        // if we have a free one, get it - otherwise create it
        const freeObject = this.nextFree ? this.nextFree : this.addNewObject(this.newPoolObject());

        // flag as used
        freeObject.free = false;

        // the next free is the object's next free
        this.nextFree = freeObject.nextFree;

        // if there's nothing afterwards, the lastFree is null as well
        if (!this.nextFree) this.lastFree = null;

        // return the now not free object
        return freeObject;
    }

    newPoolObject() {
        const data = this.objCreator();
        return new PoolObject(data, this.lastFree, this.nextFree);
    }

    releaseAll() {
        this._pool.forEach(item => this.release(item));
    }
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
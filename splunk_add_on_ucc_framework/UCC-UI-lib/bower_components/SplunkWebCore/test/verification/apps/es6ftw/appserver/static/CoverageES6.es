// Support component for the test_coverage test

export function helloSayerArrow() {
    return name => `Hello ${name}`;
}

export function helloSayerArrowDefault() {
    return (name = 'world') => `Hello ${name}`;
}

export function additionDestructuring(pair) {
    const [a, b] = pair;
    return a + b;
}

export function stringFunction(str) {
    return str.endsWith('ar');
}

export class X {
    constructor(y) {
        this.y = y;
    }

    get yy() { // property
        return this.y * this.y;
    }

    xy(x) { // method
        return x * this.y;
    }

    static xx() { // static method
        return 42;
    }
}

export class Y extends X {
    xy(x) {
        return super.xy(x) * super.xy(x);
    }
}
// Support component for the test_coverage test

function helloSayer(name) {
    return function (name) {
        return 'Hello ' + name;
    };
}

function addition(pair) {
    var a = pair[0], b = pair[1];
    return a + b;
};

module.exports = {
    helloSayer: helloSayer,
    addition: addition
}
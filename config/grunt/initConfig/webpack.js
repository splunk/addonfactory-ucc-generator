var base = require('../../webpack/base');
var dev = require('../../webpack/devConfig');
var build = require('../../webpack/buildConfig');

module.exports = function(grunt) {
    return {
        options: base,
        dev: dev,
        build: build
    };
};

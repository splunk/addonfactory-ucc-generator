var _ = require('lodash');
var grunt = require('grunt');
var junit = require('../grunt_tasks/helpers/junit');
var splunk = require('../grunt_tasks/helpers/splunk').init(grunt);

var prefix = 'jshint';
var corePath = splunk.source('web', 'search_mrsparkle', 'exposed', 'js');
var dmcPath = splunk.source('cfg', 'bundles', 'splunk_monitoring_console', 'appserver', 'static');

var generateTestCaseName = function (filepath) {
    if (_.includes(filepath, corePath)) {
        filepath = filepath.replace(corePath + '/', '').replace('search_mrsparkle/exposed/js/', '');
        return prefix + '_' + 'core' + '.' + filepath.replace(/\./g, '_');
    } else if (_.includes(filepath, dmcPath)) {
        filepath = filepath.replace(dmcPath + '/', '');
        return prefix + '_' + 'dmc' + '.' + filepath.replace(/\./g, '_');
    }
    return filepath;
};

exports.reporter = function(results, data) {
    try {
        results = results || [];
        data = data || [];

        var doc = new junit.JUnitXMLDocument(),
            suiteName = 'jshint';

        doc.addTestSuite(suiteName);

        data.forEach(function(test) {
            doc.reportTestCase(suiteName, { name: generateTestCaseName(test.file) });
        });

        results.forEach(function(result) {
            var testCaseName = generateTestCaseName(result.file),
                failureAttrs = {
                    text: '"' + testCaseName + '"' + ' line ' + result.error.line,
                    message: result.error.reason
                };

            if (typeof result.error.evidence === 'string') {
                failureAttrs.text += ':  `' + result.error.evidence.trim() + '`';
            }

            doc.reportTestCase(suiteName, { name: testCaseName }, failureAttrs);
        });
        var out = doc.toString();
        process.stdout.write(out);
        return out;
    } catch(e) {
        process.stderr.write('\r\n\r\nError in jshint-junit-reporter: \r\n');
        process.stderr.write(e.message + '\r\n');
        process.stderr.write(e.stack + '\r\n\r\n');
        process.exit(1);
    }
};
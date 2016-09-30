var junit = require('../grunt_tasks/helpers/junit'),
    SOLN_ROOT = process.env.SOLN_ROOT;

var generateTestCaseName = function(filepath) {
    return filepath.replace(SOLN_ROOT + '/TA-opseclea/mainline/package/appserver/static/js/', '');
};

exports.reporter = function(results, data) {
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
                text: '"' + testCaseName + '"' + ' line ' + result.error.line + ':  `' + result.error.evidence.trim() + '`',
                message: result.error.reason
            };

        doc.reportTestCase(suiteName, { name: testCaseName }, failureAttrs);
    });
    var out = doc.toString();
    process.stdout.write(out);
    return out;
};

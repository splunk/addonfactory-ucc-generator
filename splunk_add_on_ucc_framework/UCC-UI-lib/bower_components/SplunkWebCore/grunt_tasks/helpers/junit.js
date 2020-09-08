var Cheerio = require('cheerio'),
    _ = require('lodash');

var JUnitXMLDocument = function(options) {
    options = options || {};
    this.header = options.header || '<?xml version="1.0" encoding="utf-8"?>';
    this.$testSuites = Cheerio('testsuites', '<testsuites></testsuites>');

};

JUnitXMLDocument.prototype = {

    addTestSuite: function(name) {
        this.$testSuites.append(
            Cheerio('testsuite', '<testsuite></testsuite>').attr({
                name: name,
                tests: 0,
                failures: 0,
                errors: 0,
                skipped: 0,
                time: 0
            })
        );
    },

    increaseSuiteAttrs: function($suite, increaseAmounts) {
        _.each(increaseAmounts, function(amount, attrName) {
            var existing = parseFloat($suite.attr(attrName)) || 0;
            $suite.attr(attrName, existing + parseFloat(amount) || 0);
        });
    },

    getTestSuiteByName: function(suiteName) {
        return this.$testSuites.find('testsuite[name="' + suiteName + '"]');
    },

    getTestCaseByName: function($testSuite, caseName) {
        return $testSuite.find('testcase[name="' + caseName + '"]');
    },

    reportTestCase: function(suiteName, caseAttrs, failureAttrs) {
        var $testSuite = this.getTestSuiteByName(suiteName),
            caseName = caseAttrs.name,
            $testCase = this.getTestCaseByName($testSuite, caseName),
            testCaseCreated = false;

        _.defaults(caseAttrs, { classname: caseName, time: 0 });
        if($testCase.length === 0) {
            testCaseCreated = true;
            $testCase = Cheerio('testcase', '<testcase></testcase>').attr(caseAttrs);
            $testSuite.append($testCase);
        }

        if(failureAttrs) {
            $testCase.append(
                Cheerio('failure', '<failure></failure>').text(failureAttrs.text).attr(_.omit(failureAttrs, 'text'))
            );
        }
        this.increaseSuiteAttrs($testSuite, {
            tests: testCaseCreated ? 1 : 0,
            failures: !!failureAttrs ? 1 : 0
        });
    },
    
    removeSystemOutErr: function () {
        this.$testSuites.find('system-out').remove();
        this.$testSuites.find('system-err').remove();
    },

    mergeInXML: function(incoming) {
        // remove the xml header so jQuery will parse the string correctly
        incoming = incoming.replace(/<\?xml[^?>]*\?>/, '');
        var $incoming = Cheerio.load(incoming, {xmlMode: true}).root(),
            $incomingTestSuites = $incoming.is('testsuite') ? $incoming : $incoming.find('testsuite');

        $incomingTestSuites.each(function(index, incomingTestSuite) {
            var $incomingTestSuite = Cheerio(incomingTestSuite),
                incomingName = $incomingTestSuite.attr('name'),
                $existingTestSuite = this.getTestSuiteByName(incomingName);

            // if there is not already a testsuite with a matching name, just append the new one
            if ($existingTestSuite.length === 0) {
                this.$testSuites.append($incomingTestSuite);
                return;
            }

            var incrementAttribute = function(attrName) {
                var existingValue = parseInt($existingTestSuite.attr(attrName), 10) || 0,
                    incomingValue = parseInt($incomingTestSuite.attr(attrName), 10) || 0;

                $existingTestSuite.attr(attrName, existingValue + incomingValue);
            };
            incrementAttribute('tests');
            incrementAttribute('failures');
            incrementAttribute('errors');
            incrementAttribute('skipped');
            incrementAttribute('time');

            $existingTestSuite.append($incomingTestSuite.find('testcase'));
        }.bind(this));
    },

    getStatistics: function() {
        var $suites = this.$testSuites.children(),
            statistics = {
                numTests: $suites.length,
                numPasses: 0,
                numFailures: 0,
                failedTestNames: []
            };

        $suites.each(function(i, suite) {
            var $suite = Cheerio(suite);
            if (parseInt($suite.attr('failures'), 10) > 0 || parseInt($suite.attr('errors'), 10) > 0) {
                statistics.numFailures++;
                statistics.failedTestNames.push($suite.attr('name'));
            } else {
                statistics.numPasses++;
            }
        });

        return statistics;
    },

    toString: function() {
        return this.header + (this.$testSuites.children().length > 1 ? this.$testSuites.toString() :
                    this.$testSuites.find('testsuite').first().toString());
    }
};

exports.JUnitXMLDocument = JUnitXMLDocument;
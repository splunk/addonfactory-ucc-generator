//DZ
var jsdom = require("jsdom");
var window = jsdom.jsdom().createWindow();
var $ = require('jquery/dist/jquery')(window);

//DZ var $ = require('jquery'),
var _ = require('lodash');

var JUnitXMLDocument = function(options) {
    options = options || {};
    this.header = options.header || '<?xml version="1.0" encoding="utf-8"?>';
    this.$wrapper = $('<wrapper></wrapper>');
    this.$testSuites = $('<testsuites></testsuites>').appendTo(this.$wrapper);
};

JUnitXMLDocument.prototype = {

    addTestSuite: function(name) {
        $('<testsuite></testsuite>')
            .attr({
                name: name,
                tests: 0,
                failures: 0,
                errors: 0,
                skipped: 0,
                time: 0
            })
            .appendTo(this.$testSuites);
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
            $testCase = $('<testcase></testcase>')
                .attr(caseAttrs)
                .appendTo($testSuite);
        }

        if(failureAttrs) {
            $('<failure></failure>').text(failureAttrs.text)
                .attr(_.omit(failureAttrs, 'text'))
                .appendTo($testCase);
        }
        this.increaseSuiteAttrs($testSuite, {
            tests: testCaseCreated ? 1 : 0,
            failures: !!failureAttrs ? 1 : 0
        });
    },

    mergeInXML: function(incoming) {
        // remove the xml header so jQuery will parse the string correctly
        incoming = incoming.replace(/<\?xml[^?>]*\?>/, '');
        var $incoming = $(incoming),
            // TODO don't assume that incoming contains only a single <testsuite> tag...
            $incomingTestSuite = $incoming.is('testsuite') ? $incoming.first() : $incoming.find('testsuite').first(),
            incomingName = $incomingTestSuite.attr('name');

        // if there is not already a testsuite with a matching name, just append the new one
        if(this.$testSuites.find('testsuite[name="' + incomingName + '"]').length === 0) {
            this.$testSuites.append($incomingTestSuite);
            return;
        }

        var $existingTestSuite = this.$testSuites.find('testsuite').first();

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

        // TODO handle testcase collisions...
        $incomingTestSuite.find('testcase').appendTo($existingTestSuite);
    },

    toString: function() {
        return this.header + (this.$testSuites.children().length > 1 ? this.$wrapper.html() : this.$testSuites.html());
    }
};

exports.JUnitXMLDocument = JUnitXMLDocument;

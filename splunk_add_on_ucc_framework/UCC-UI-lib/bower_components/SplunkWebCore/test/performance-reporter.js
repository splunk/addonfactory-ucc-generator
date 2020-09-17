var _ = require('lodash');
var Table = require('cli-table');
var colors = require('colors/safe');

var PerformanceReporter = function () {
    var log = require('karma/lib/logger').create('performance-report');
    log.info('Performance output is enabled');

    this.onBrowserStart = function (browser) {
        browser.existingOnInfo = browser.onInfo;
        browser.onInfo = function () {

            var info = _.first(arguments);
            if (_.has(info, 'splunk') && info.splunk == 'timings') {

                var durations = _(info.timings).flatMapDeep(_.values).orderBy().value();
                var idx = Math.floor(durations.length / 2);
                var median = durations.length % 2 ? durations[idx] : ((durations[idx - 1] + durations[idx]) / 2);

                var table = new Table({
                    head: _.map(['App', 'File', 'Time (ms)', 'Time (% of med.)'], _.unary(colors.black.bold.underline))
                });
                table.push.apply(table, _(info.timings)
                    .flatMap(function (fileDurations, app) {
                        return _.map(fileDurations, function (duration, file) {
                            return [app, file, duration, Math.round((duration / median) * 100)];
                        });
                    })
                    .orderBy([3, 1], ['desc', 'asc']).value());
                log.info('\n' + table.toString() + '\n');
            } else {
                browser.existingOnInfo.apply(browser, arguments);
            }
        };
    };

    this.onBrowserComplete = function (browser) {
        browser.onInfo = browser.existingOnInfo;
    };
};

module.exports = {
    'reporter:performance': ['type', PerformanceReporter]
};


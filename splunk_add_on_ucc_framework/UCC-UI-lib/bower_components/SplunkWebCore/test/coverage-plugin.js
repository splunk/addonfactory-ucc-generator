var _ = require('lodash');
var fs = require('fs');
var istanbul = require('istanbul');
var path = require('path');
var Table = require('cli-table');
var colors = require('colors/safe');

function CoverageReportPlugin(basePath, reporters, emitter) {

    var self = this;
    self.config = {appPaths: {}}; //updated at runtime by webpack-plugin
    var log = require('karma/lib/logger').create('coverage-report');
    var watermarks = [[50, 'red'], [70, 'yellow'], [100, 'green']]; //min values for color

    //safety (there is no way for us to override this, command line arguments always take preference
    if (!_.includes(reporters, 'coverage')) {
        log.error('If --coverage is used, \'coverage\' must be included in reporters');
        process.exit(3);
    }

    emitter.on('coverage_complete', function (browser, coverage) {
        if (!_.isEmpty(coverage)) {
            var table = new Table({
                head: _.map(['App', 'File', 'Covered/Total.', 'Coverage (%)'], _.unary(colors.black.bold.underline))
            });

            table.push.apply(table, _(coverage)
                .mapValues(istanbul.utils.summarizeFileCoverage).mapValues('statements')
                .transform(function (result, fileCoverage, file) {
                    var app = _.defaultTo(_.findKey(self.config.appPaths, function (appPath) {
                        return file.startsWith(appPath);
                    }), 'core');
                    var appBasePath = (app == 'core') ? path.join(basePath, 'web', 'search_mrsparkle', 'exposed', 'js') :
                        path.join(self.config.appPaths[app], 'static');
                    result.push([app, path.relative(appBasePath, file), fileCoverage]);
                }, [])
                .sortBy([0, 1]) //by app, filename
                .tap(function (coverage) {
                    var apps = _(coverage).map(0).uniq().value();
                    if (apps.length == 1 && apps[0] == 'core') {
                        table.options.head.shift();
                    }
                })
                .map(function (fileCoverage) {
                    var stmts = _.last(fileCoverage);
                    var color = _.find(watermarks, function (mark) {
                        return stmts.pct <= mark[0];
                    })[1];

                    var result = (table.options.head.length == 4) ? [colors[color](fileCoverage[0])] : [];
                    return result.concat([colors[color].bold(fileCoverage[1]),
                        colors[color](stmts.covered + '/' + stmts.total),
                        colors[color].bold(stmts.pct.toString())]);
                }).value());
            log.info('\n' + table.toString());
        }
    });
}

function createCoveragePatterns() {
    var log = require('karma/lib/logger').create('coverage-patterns');
    var patterns;

    function loadPatterns(appPaths) {
        log.debug('Loading coverage patterns');

        return _.reduce(appPaths, function (patterns, appPath, app) {
            var patternsPath = path.join(appPath, 'test', 'support', 'coverage-patterns.json');
            if (!fs.existsSync(patternsPath)) {
                log.warn('No coverage patterns file for application:', app);
                patterns[app] = {};
            } else {
                try {
                    patterns[app] = require(patternsPath);
                } catch (e) {
                    log.warn('Unable to load coverage patterns file for application', app, '- syntax error?');
                    patterns[app] = {};
                }
            }
            return patterns;
        }, {});
    }

    return function (appPaths, tests) {
        if (_.isUndefined(patterns)) {
            patterns = loadPatterns(appPaths);
        }

        var testPatterns = _(tests)
            .map(function (test) {
                return _.get(patterns[test.app], test.path, false);
            })
            .compact().value();

        if (_.isEmpty(testPatterns)) {
            log.warn('No coverage patterns defined for this test set');
        } else {
            log.debug('Using coverage patterns', testPatterns);
        }

        return testPatterns;
    };
}

CoverageReportPlugin.$inject = ['config.basePath', 'config.reporters', 'emitter'];
module.exports = {
    'framework:coverage-report': ['type', CoverageReportPlugin],
    'custom:coverage-patterns': ['factory', createCoveragePatterns]
};

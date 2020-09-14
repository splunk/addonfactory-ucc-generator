define(function(require){
    var _ = require('underscore');
    var mvc = require('../../../mvc');
    var DashboardElement = require('./base');
    var TableView = require('../../tableview');
    var console = require('util/console');
    var Mapper = require('../mapper');
    var SplunkUtil = require('splunk.util');
    var Drilldown = require('../../drilldown');

    var formatPrefix = 'display.statistics.format.';
    var statisticsPrefix = 'display.statistics.';

    var TableMapper = Mapper.extend({
        tagName: 'table',
        map: function(report, result, options) {
            _(report.toJSON(options)).each(function(value, key){
                if (key.substring(0, formatPrefix.length) === formatPrefix) {
                    result.options[key.substring(statisticsPrefix.length)] = report.get(key, options);
                }
            });

            result.options.wrap = String(SplunkUtil.normalizeBoolean(report.get('display.statistics.wrap', options)));
            result.options.rowNumbers = String(SplunkUtil.normalizeBoolean(report.get('display.statistics.rowNumbers', options)));
            result.options.dataOverlayMode = report.get('display.statistics.overlay', options);
            result.options.totalsRow = String(SplunkUtil.normalizeBoolean(report.get('display.statistics.totalsRow', options)));
            result.options.percentagesRow = String(SplunkUtil.normalizeBoolean(report.get('display.statistics.percentagesRow', options)));
            result.options.drilldown = Drilldown.getNormalizedDrilldownType(
                report.get('display.statistics.drilldown', options),
                { validValues: ['cell','row','none'], 'default': 'row', aliasMap: { all: 'cell', off: 'none' } });
            result.options.count = report.get('display.prefs.statistics.count', options);

            result.options.labelField = null;
            result.options.valueField = null;

            var fields = report.get('display.statistics.fields', options);
            result.tags.fields = _.isArray(fields) ?
                    (_.isEmpty(fields) ? null : JSON.stringify(fields)) :
                    (fields === '[]' ? null : fields);

            result.sparkline = report.get('display.statistics.sparkline.format', options);
        }
    });
    Mapper.register('statistics', TableMapper);

    var TableVisualization = TableView.extend({
        panelClassName: 'table',
        prefix: 'display.statistics.',
        reportDefaults: {
            'display.general.type': 'statistics',
            'display.prefs.statistics.count' : 10,
            'display.statistics.drilldown': 'cell'
        }
    });
    DashboardElement.registerVisualization('statistics', TableVisualization);

    var TableElement = DashboardElement.extend({
        initialVisualization: 'statistics'
    });
    
    return TableElement;
});
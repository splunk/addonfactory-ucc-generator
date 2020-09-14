define(function(require){
    var _ = require('underscore'), $ = require('jquery'), Backbone = require('backbone');
    var mvc = require('../../../mvc');
    var DashboardElement = require('./base');
    var ChartView = require('../../chartview');
    var Mapper = require('../mapper');
    var console = require('util/console');
    var Drilldown = require('../../drilldown');

    var chartingPrefix = 'display.visualizations.charting.', vizPrefix = 'display.visualizations.';
    Mapper.register('visualizations:charting', Mapper.extend({
        tagName: 'chart',
        map: function(report, result, options) {
            _(report.toJSON(options)).each(function(value, key){
                if(key.substring(0, chartingPrefix.length) === chartingPrefix) {
                    result.options[key.substring(vizPrefix.length)] = report.get(key, options);
                }
            });
            options['charting.drilldown'] = Drilldown.getNormalizedDrilldownType(
                options['charting.drilldown'] || options.drilldown,
                { allowBoolean: true });
            delete options.drilldown;
            result.removeOptions = ['drilldown'];
        }
    }));

    var ChartViz = ChartView.extend({
        panelClassName: 'chart',
        reportDefaults: {
            "display.visualizations.show": true,
            "display.visualizations.type": "charting",
            "display.general.type": "visualizations"
        },
        options: _.defaults({
            resizable: true
        }, ChartView.prototype.options)
    });
    DashboardElement.registerVisualization('visualizations:charting', ChartViz);
    DashboardElement.registerVisualization('visualizations', ChartViz);

    var ChartElement = DashboardElement.extend({
        initialVisualization: 'visualizations:charting'
    });

    return ChartElement;
});
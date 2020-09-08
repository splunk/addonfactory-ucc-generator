define(function(require) {
    var _ = require('underscore');
    var DashboardElement = require('./base');
    var SingleView = require('../../singleview');
    var Mapper = require('../mapper');
    var console = require('util/console');
    var Drilldown = require('../../drilldown');

    Mapper.register('visualizations:singlevalue', Mapper.extend({
        tagName: 'single',
        map: function(report, result, options) {
            var prefix = 'display.visualizations.singlevalue.';
            console.log(report.toJSON(options));
            _(report.toJSON(options)).each(function(v, k) {
                if(k.substring(0, prefix.length) === prefix) {
                    result.options[k.substring(prefix.length)] = v;
                }
            });
            console.log('single export options: ', result.options);
            result.options.drilldown = Drilldown.getNormalizedDrilldownType(result.options.drilldown, { 'default': 'none' });
        }
    }));

    var SingleViz = SingleView.extend({
        panelClassName: 'single',
        reportDefaults: {
            "display.visualizations.show": true,
            "display.visualizations.type": "singlevalue",
            "display.general.type": "visualizations"
        },
        options: _.defaults({
            resizable: true
        }, SingleView.prototype.options)
    });
    DashboardElement.registerVisualization('visualizations:singlevalue', SingleViz);

    var SingleElement = DashboardElement.extend({
        initialVisualization: 'visualizations:singlevalue'
    });
    
    return SingleElement;
});
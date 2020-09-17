define(function(require){
    var _ = require('underscore');
    var mvc = require('../../../mvc');
    var DashboardElement = require('./base');
    var VisualizationView = require('../../visualizationview');
    var Mapper = require('../mapper');

    Mapper.register('visualizations:custom', Mapper.extend({
        tagName: 'viz',
        map: function(report, result, options) {
            var type = report.get('display.visualizations.custom.type');
            var prefix = 'display.visualizations.custom.';
            var namespace = prefix + type + '.';
            _(report.toJSON(options)).each(function(value, key){
                if(key.substring(0, namespace.length) === namespace) {
                    result.options[key.substring(prefix.length)] = report.get(key, options);
                }
            });
            result.attributes = _.extend({ type: type }, result.attributes);
        }
    }));

    var Viz = VisualizationView.extend({
        panelClassName: 'viz',
        reportDefaults: {
            'display.visualizations.show': true,
            'display.visualizations.type': 'custom',
            'display.general.type': 'visualizations'
        },
        options: _.defaults({
            resizable: true
        }, VisualizationView.prototype.options)
    });
    DashboardElement.registerVisualization('visualizations:custom', Viz);

    var VisualizationElement = DashboardElement.extend({
        initialVisualization: 'visualizations:custom'
    });

    return VisualizationElement;
});
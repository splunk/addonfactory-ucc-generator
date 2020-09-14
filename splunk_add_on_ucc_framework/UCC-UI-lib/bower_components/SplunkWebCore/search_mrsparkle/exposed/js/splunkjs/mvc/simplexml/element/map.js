define(function(require){
    var _ = require('underscore'), $ = require('jquery'), Backbone = require('backbone');
    var mvc = require('../../../mvc');
    var DashboardElement = require('./base');
    var SplunkMapView = require('../../splunkmapview');
    var Mapper = require('../mapper');
    var console = require('util/console');
    var Drilldown = require('../../drilldown');

    var mappingPrefix = 'display.visualizations.mapping.', vizPrefix = 'display.visualizations.';
    Mapper.register('visualizations:mapping', Mapper.extend({
        tagName: 'map',
        map: function(report, result, options) {
            _(report.toJSON()).each(function(value, key){
                if (key.indexOf(mappingPrefix) === 0) {
                    result.options[key.substring(vizPrefix.length)] = report.get(key, options);
                }
            });
            if (!(options || {}).pdf) {
                // Excluding 'mapping.data.bounds' when we don't generate XML for pdfgen
                delete result.options['mapping.data.bounds'];
            }
            if (result.options['mapping.drilldown']) {
                result.options.drilldown = Drilldown.getNormalizedDrilldownType(
                    result.options['mapping.drilldown'],
                    { allowBoolean: true }
                );
                delete result.options['mapping.drilldown'];
            }
        }
    }));

    var MapViz = SplunkMapView.extend({
        panelClassName: 'map',
        options: _.defaults({
            resizable: true
        }, SplunkMapView.prototype.options),
        reportDefaults: {
            "display.visualizations.show": true,
            "display.visualizations.type": "mapping",
            "display.general.type": "visualizations"
        }
    });
    DashboardElement.registerVisualization('visualizations:mapping', MapViz);

    var MapElement = DashboardElement.extend({
        initialVisualization: 'visualizations:mapping'
    });
    
    return MapElement;
});
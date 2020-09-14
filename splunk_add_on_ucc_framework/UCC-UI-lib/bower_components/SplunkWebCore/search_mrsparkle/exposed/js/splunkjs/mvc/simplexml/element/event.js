define(function(require){
    var _ = require('underscore'), $ = require('jquery'), Backbone = require('backbone');
    var mvc = require('../../../mvc');
    var DashboardElement = require('./base');
    var EventsViewer = require('../../eventsviewerview');
    var Mapper = require('../mapper');
    var console = require('util/console');
    var SplunkUtil = require("splunk.util");

    var eventsPrefix = 'display.events.';

    var EventMapper = Mapper.extend({
        tagName: 'event',
        map: function(report, result, options) {
            result.options.count = report.get('display.prefs.events.count', options);
            _(report.toJSON(options)).each(function(v, key){
                if(key.indexOf(eventsPrefix) === 0) {
                    var value = report.get(key, options);
                    if(_.isArray(value)) {
                        value = JSON.stringify(value);
                    }
                    result.options[key.substring(eventsPrefix.length)] = (value != null) ? String(value) : null;
                }
            });
            if(result.options['table.drilldown']) {
                result.options['table.drilldown'] =
                    SplunkUtil.normalizeBoolean(result.options['table.drilldown']) ? 'all' : 'none';
            }
            result.removeOptions = ['drilldown', 'segmentation'];
        }
    });
    Mapper.register('events', EventMapper);
    Mapper.register('events:raw', EventMapper);
    Mapper.register('events:list', EventMapper);
    Mapper.register('events:table', EventMapper);

    var EventsVisualization = EventsViewer.extend({
        panelClassName: 'event',
        reportDefaults: {
            'display.general.type': 'events',
            'display.prefs.events.count' : 10
        }
    });
    DashboardElement.registerVisualization('events', EventsVisualization);
    DashboardElement.registerVisualization('events:raw', EventsVisualization);
    DashboardElement.registerVisualization('events:list', EventsVisualization);
    DashboardElement.registerVisualization('events:table', EventsVisualization);

    var EventElement = DashboardElement.extend({
        initialVisualization: 'events'
    });
    
    return EventElement;
});
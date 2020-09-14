define(function(require){
    var _ = require('underscore'), $ = require('jquery'), Backbone = require('backbone');
    var mvc = require('../../../mvc');
    var DashboardElement = require('./base');
    var console = require('util/console');

    var ListElement = DashboardElement.extend({
        initialVisualization: 'statistics',
        constructor: function(options) {
            _.extend(options, {
                displayRowNumbers: false,
                fields: [ options.labelField || '', options.valueField || '' ],
                sortKey: options.initialSort || options.labelField,
                sortDirection: options.initialSortDir || 'asc'
            });

            console.log('[%o] Creating table with options: %o', options.id, options);
            return DashboardElement.prototype.constructor.call(this, options);
        }
    });
    
    return ListElement;
});

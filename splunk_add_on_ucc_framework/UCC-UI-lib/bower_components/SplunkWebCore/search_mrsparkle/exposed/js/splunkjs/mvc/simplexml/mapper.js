define(function(require){
    var _ = require('underscore');
    var Backbone = require('backbone');
    var console = require('util/console');

    var Mapper = function() {};
    _.extend(Mapper.prototype, {
        tagName: '#abstract',
        map: function() {
            // tbd in concrete implementation
        },
        getSearch: function(report, options) {
            var result;

            // take care error case first
            if (report.error.has('details')) {
                var details = report.error.get('details');
                // SPL-89844, handle not existing savedsearch
                if (details.status == 404 && details.type == 'saved') {
                    result = {
                        type: 'saved',
                        name: details.searchname
                    };
                    return result;
                }
            }

            if(report.entry.get('name', options)) {
                result = {
                    type: 'saved',
                    name: report.entry.get('name', options)
                };
		        console.log('Mapped Saved Search', result);
            } else if (report.entry.content.get('search', options)) {
                result = {
                    type: report.entry.content.get('display.general.search.type', options) || 'inline',
                    search: report.entry.content.get('search', options),
                    earliest_time: report.entry.content.get('dispatch.earliest_time', options), 
                    latest_time: report.entry.content.get('dispatch.latest_time', options),
                    base: report.entry.content.get('display.general.search.base', options)
                };

                var sampleRatio = report.entry.content.get('dispatch.sample_ratio');
                if (sampleRatio != null && sampleRatio != '1') {
                    result.sample_ratio = sampleRatio;
                }

                // When sending flattened XML to pdfgen, swap out postProcess with a full inline search
                if (options.flatten && result.type === 'postprocess') {
                    result.type = 'inline';
                    result.search = report.entry.content.get('display.general.search.fullSearch', options);
                }
                console.log('Mapped Inline Search', result); 
            }
            return result; 
        },
        toXML: function(report, options) {
            options = options || { tokens: true };
            var result = {
                type: this.tagName,
                title: report.entry.content.get('display.general.title', options),
                search: this.getSearch(report, options),
                tokenDependencies: report.entry.content.get('display.general.tokenDependencies'),
                options: {},
                tags: {}
            };
            this.map(report.entry.content, result, options);
            if (result.options.fields){
                if(!result.tags.fields) {
                    result.tags.fields = result.options.fields;
                }
                result.options['fields'] = null;
            }
            return result;
        }
    });

    var MAPPERS = {};

    Mapper.register = function(type, cls) {
        MAPPERS[type] = cls;
    };

    Mapper.get = function(type) {
        var MapperClass = MAPPERS[type];
        if(!MapperClass) {
            throw new Error('No mapper for type ' + type);
        }
        return new MapperClass();
    };

    // copy the Backbone extend method
    Mapper.extend = Backbone.Model.extend;

    return Mapper;
});
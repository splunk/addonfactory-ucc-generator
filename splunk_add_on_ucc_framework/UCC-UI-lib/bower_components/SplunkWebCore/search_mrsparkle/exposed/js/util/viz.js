define(['underscore'], function(_) {

    var CHART_CONFIG = {
            'display.general.type': 'visualizations',
            'display.visualizations.type': 'charting'
        },
        SINGLE_CONFIG = {
            'display.general.type': 'visualizations',
            'display.visualizations.type': 'singlevalue'
        },
        MAP_CONFIG = {
            'display.general.type': 'visualizations',
            'display.visualizations.type': 'mapping'
        },
        TABLE_CONFIG = {
            'display.general.type': 'statistics'
        };
    
    var vizUtil = {};

    /**
     * A shared utility to get the initial parameters when fetching data for a given report.
     *
     * @param reportContent {Model} the content model for the report
     * @param generalTypeOverride {String} a general type to override the value in the report content,
     *          if not specified the value in the report content will be used.  Used to support visualizing
     *          one report in multiple ways (e.g. as a chart and a table)
     * @returns {Object} initial parameters to use when fetching data
     */
    vizUtil.getInitialFetchParams = function(reportContent, generalTypeOverride) {
        var reportJson = reportContent.toJSON();
        if (generalTypeOverride) {
            reportJson['display.general.type'] = generalTypeOverride;
        }
        if (_.matches(CHART_CONFIG)(reportJson)) {
            return ({
                output_mode: 'json_cols',
                show_metadata: true,
                show_empty_fields: 'True',
                offset: 0,
                count: 1000
            });
        }
        if (_.matches(SINGLE_CONFIG)(reportJson)) {
            return ({
                output_mode: 'json_cols',
                show_metadata: true,
                show_empty_fields: 'True',
                offset: 0,
                count: 1000 // TODO: Try increasing to 10,000 if performant; if not, must show error message.
            });
        }
        if (_.matches(MAP_CONFIG)(reportJson)) {
            return ({
                output_mode: 'json_cols',
                show_metadata: false,
                show_empty_fields: 'True',
                offset: 0,
                count: 1
            });
        }
        if (_.matches(TABLE_CONFIG)(reportJson)) {
            return ({
                show_metadata: true,
                output_mode: "json_rows",
                show_empty_fields: "True",
                sortKey: reportJson['display.statistics.sortColumn'],
                sortDirection: reportJson['display.statistics.sortDirection']
            });
        }
    };

    vizUtil.GENERAL_TYPES = {
        VISUALIZATIONS: 'visualizations',
        STATISTICS: 'statistics',
        EVENTS: 'events'
    };
            
    return vizUtil;
    
});
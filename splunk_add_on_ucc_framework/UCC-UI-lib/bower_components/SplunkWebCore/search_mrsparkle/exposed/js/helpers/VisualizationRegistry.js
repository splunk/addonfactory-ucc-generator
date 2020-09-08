/*
 * This file represents the central manifest for the "internal modular visualization framework".  It defines
 * a list of built-in visualizations as well as an API for additional visualizations to be registered at runtime.
 *
 * For more details on this project, see: https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD
 *
 * The structure for each entry in the registry should have the following structure:
 *
 * {
 *     id: <String> a unique id for the viz
 *     label: <String> a user-visible label for the viz
 *     icon: <String> the suffix to use for the CSS class of the icon
 *     recommendFor: <Array <String> > a list of search commands that the viz should be recommended for
 *     factory: <View> the view to instantiate when rendering the viz
 *     editorSchema: the schema for the editor controls associated with the viz, a full description
 *         of this schema can be found here:  https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-VisualizationEditorSchema
 *     pivotSchema: the schema for integrating the viz with the pivot page, a full description of this
 *         schema can be found here:  https://confluence.splunk.com/display/PROD/Internal+Mod+Viz+ERD#InternalModVizERD-PivotEditorSchema
 *     matchConfig: <Object> a dictionary of report attribute key-value pairs, these are used to decide which viz to
 *         use for a given report, as well as what to set on the report when the viz is selected
 *     size: <Object> {
 *         resizable: <Boolean> whether the viz should allow the user to resize it via the UI
 *         minHeight: <Integer> minimum height for the viz
 *         maxHeight: <Integer> maximum height for the viz
 *         heightAttribute: <String> the report attribute name that control's the viz height, this attribute
 *             will be used to calculate the initial height, and will be updated if the viz is resized
 *     }
 * }
 */

define([
            'jquery',
            'underscore',
            'views/shared/LazyView',
            'views/shared/viz/WrappedExternalVisualization',
            'views/shared/jschart/Master',
            'views/shared/map/LazyMap',
            'views/shared/singlevalue/LazySingleValue',
            'views/shared/results_table/LazyResultsTable',
            'views/shared/jschart/vizeditorschemas/line_chart',
            'views/shared/jschart/vizeditorschemas/area_chart',
            'views/shared/jschart/vizeditorschemas/column_chart',
            'views/shared/jschart/vizeditorschemas/bar_chart',
            'views/shared/jschart/vizeditorschemas/pie_chart',
            'views/shared/jschart/vizeditorschemas/scatter_chart',
            'views/shared/jschart/vizeditorschemas/bubble_chart',
            'views/shared/singlevalue/viz_editor_schema',
            'views/shared/jschart/vizeditorschemas/gauge',
            'views/shared/map/vizeditorschemas/marker_map',
            'views/shared/map/vizeditorschemas/choropleth_map',
            'views/shared/results_table/viz_editor_schema',
            'views/shared/eventsviewer/viz_editor_schema',
            'views/shared/jschart/pivot_schemas',
            'views/shared/singlevalue/pivot_schema',
            'splunk.util',
            'util/console',
            'requirejs',
            'uri/route'
        ],
        function(
            $,
            _,
            LazyView,
            WrappedExternalVisualization,
            JSChart,
            LazyMap,
            LazySingleValue,
            LazyResultsTable,
            lineChartSchema,
            areaChartSchema,
            columnChartSchema,
            barChartSchema,
            pieChartSchema,
            scatterChartSchema,
            bubbleChartSchema,
            singleValueSchema,
            gaugeSchema,
            markerMapSchema,
            choroplethMapSchema,
            resultsTableSchema,
            eventsViewerSchema,
            chartPivotSchemas,
            singleValuePivotSchema,
            splunkUtils,
            console,
            requirejs,
            route
        ) {

    var chartSizeConfig = {
        resizable: true,
        minHeight: 100,
        maxHeight: 1000,
        heightAttribute: 'display.visualizations.chartHeight'
    };

    var mapSizeConfig = {
        resizable: true,
        minHeight: 200,
        maxHeight: 1000,
        heightAttribute: 'display.visualizations.mapHeight'
    };

    var BUILTIN_VISUALIZATIONS = [
        {
            id: 'line',
            label: _('Line Chart').t(),
            icon: 'chart-line',
            preview: 'line.png',
            description: _('Track values and trends over time.').t(),
            searchHint: '| timechart count [by comparison_category]',
            recommendFor: ['timechart', 'predict'],
            factory: JSChart,
            editorSchema: lineChartSchema,
            pivotSchema: chartPivotSchemas.LINE,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'line'
            },
            size: chartSizeConfig
        },
        {
            id: 'area',
            label: _('Area Chart').t(),
            icon: 'chart-area',
            preview: 'area.png',
            description: _('Track changes in aggregated values over time.').t(),
            searchHint: '| timechart count [by comparison_category]',
            recommendFor: ['timechart'],
            factory: JSChart,
            pivotSchema: chartPivotSchemas.AREA,
            editorSchema: areaChartSchema,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'area'
            },
            size: chartSizeConfig
        },
        {
            id: 'column',
            label: _('Column Chart').t(),
            icon: 'chart-column',
            preview: 'column.png',
            description: _('Compare values or fields.').t(),
            searchHint: '| stats count by comparison_category',
            recommendFor: ['timechart', 'top', 'rare'],
            factory: JSChart,
            pivotSchema: chartPivotSchemas.COLUMN,
            editorSchema: columnChartSchema,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'column'
            },
            size: chartSizeConfig
        },
        {
            id: 'bar',
            label: _('Bar Chart').t(),
            icon: 'chart-bar',
            preview: 'bar.png',
            description: _('Compare values or fields.').t(),
            searchHint: '| stats count by comparison_category',
            recommendFor: ['top', 'rare'],
            factory: JSChart,
            pivotSchema: chartPivotSchemas.BAR,
            editorSchema: barChartSchema,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'bar'
            },
            size: chartSizeConfig
        },
        {
            id: 'pie',
            label: _('Pie Chart').t(),
            icon: 'chart-pie',
            preview: 'pie.png',
            description: _('Compare categories in a dataset.').t(),
            searchHint: '| stats count by comparison_category',
            recommendFor: ['top', 'rare'],
            factory: JSChart,
            editorSchema: pieChartSchema,
            pivotSchema: chartPivotSchemas.PIE,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'pie'
            },
            size: chartSizeConfig
        },
        {
            id: 'scatter',
            label: _('Scatter Chart').t(),
            icon: 'chart-scatter',
            preview: 'scatter.png',
            description: _('Show relationships between discrete values in two dimensions.').t(),
            searchHint: '| stats x_value_aggregation y_value_aggregation by name_category [comparison_category]',
            factory: JSChart,
            editorSchema: scatterChartSchema,
            pivotSchema: chartPivotSchemas.SCATTER,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'scatter'
            },
            size: chartSizeConfig
        },
        {
            id: 'bubble',
            label: _('Bubble Chart').t(),
            icon: 'chart-bubble',
            preview: 'bubble.png',
            description: _('Show relationships between discrete values in three dimensions.').t(),
            searchHint: '| stats x_value_aggregation y_value_aggregation size_aggregation by name_category [comparison_category]',
            factory: JSChart,
            editorSchema: bubbleChartSchema,
            pivotSchema: chartPivotSchemas.BUBBLE,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'bubble'
            },
            size: chartSizeConfig
        },
        {
            id: 'singlevalue',
            label: _('Single Value').t(),
            icon: 'single-value',
            preview: 'singlevalue.png',
            description: _('Track a metric with context and trends.').t(),
            searchHint: '| timechart count',
            recommendFor: ['timechart'],
            factory: LazySingleValue,
            pivotSchema: singleValuePivotSchema,
            editorSchema: singleValueSchema,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'singlevalue'
            },
            size: {
                resizable: true,
                minHeight: 50,
                maxHeight: 1000,
                heightAttribute: 'display.visualizations.singlevalueHeight'
            }
        },
        {
            id: 'radialGauge',
            label: _('Radial Gauge').t(),
            icon: 'gauge-radial',
            preview: 'radialGauge.png',
            description: _('Show a single value in relation to customized ranges.').t(),
            searchHint: '| stats count',
            factory: JSChart,
            pivotSchema: chartPivotSchemas.GAUGE,
            editorSchema: gaugeSchema,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'radialGauge'
            },
            size: chartSizeConfig
        },
        {
            id: 'fillerGauge',
            label: _('Filler Gauge').t(),
            icon: 'gauge-filler',
            preview: 'fillerGauge.png',
            description: _('Show a single value and its current range.').t(),
            searchHint: '| stats count',
            factory: JSChart,
            pivotSchema: chartPivotSchemas.GAUGE,
            editorSchema: gaugeSchema,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'fillerGauge'
            },
            size: chartSizeConfig
        },
        {
            id: 'markerGauge',
            label: _('Marker Gauge').t(),
            icon: 'gauge-marker',
            preview: 'markerGauge.png',
            description: _('Show a single value in relation to customized ranges.').t(),
            searchHint: '| stats count',
            factory: JSChart,
            editorSchema: gaugeSchema,
            pivotSchema: chartPivotSchemas.GAUGE,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'charting',
                'display.visualizations.charting.chart': 'markerGauge'
            },
            size: chartSizeConfig
        },
        {
            id: 'mapping',
            label: _('Cluster Map').t(),
            icon: 'location',
            preview: 'mapping.png',
            description: _('Show aggregated values in a geographic region.').t(),
            searchHint: '| geostats count [by category] latfield=lat longfield=lon',
            recommendFor: ['geostats'],
            factory: LazyMap,
            editorSchema: markerMapSchema,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'mapping',
                'display.visualizations.mapping.type': 'marker'
            },
            size: mapSizeConfig
        },
        {
            id: 'choropleth',
            label: _('Choropleth Map').t(),
            icon: 'choropleth-map',
            preview: 'choropleth.png',
            description: _('Show how values vary over a geographic region.').t(),
            searchHint: '| stats count by featureId | geom geo_countries featureIdField=featureId',
            recommendFor: ['geom'],
            factory: LazyMap,
            editorSchema: choroplethMapSchema,
            matchConfig: {
                'display.general.type': 'visualizations',
                'display.visualizations.type': 'mapping',
                'display.visualizations.mapping.type': 'choropleth'
            },
            size: mapSizeConfig
        },
        {
            id: 'statistics',
            label: _('Statistics Table').t(),
            icon: 'table',
            preview: 'statistics.png',
            description: _('Show results organized in rows and columns.').t(),
            recommendFor: ['timechart', 'top', 'rare', 'predict'],
            factory: LazyResultsTable,
            editorSchema: resultsTableSchema,
            matchConfig: {
                'display.general.type': 'statistics'
            }
        },
        // The registry contains an entry for the events viewer, even though the
        // rendering system doesn't support it.  By doing it this way, we can abstract
        // details away from the configuration views that consume the registry, and
        // leave ourselves open to adding events viewer rendering support later.
        {
            id: 'events',
            label: _('Events').t(),
            icon: 'list',
            preview: 'events.png',
            description: _('List events from search results.').t(),
            factory: function() {
                throw new Error('The events viewer is not supported as a mod viz renderer');
            },
            editorSchema: eventsViewerSchema,
            matchConfig: {
                'display.general.type': 'events'
            }
        }
    ];

    var registered = [];
            
    var ExternalVisualizationWrapper = LazyView.extend({
        className: (LazyView.prototype.className || '') + ' lazy-custom-visualization',
        vizName: null,
        appName: null,

        loadModule: function() {
            var deferred = $.Deferred();
            var deps = [
                this.jsPath,
                this.cssPath
            ];
            requirejs(deps,
                function() {
                    // The LazyView expects the first argument to be the view constructor itself,
                    // followed by any additional dependencies.
                    var resolvedDeps = [WrappedExternalVisualization].concat(_(arguments).toArray());
                    deferred.resolve.apply(deferred, resolvedDeps);
                },
                function(err) {
                    console.error('Error dynamically loading module: ', err);
                    deferred.reject(err);
                }
            );
            return deferred;
        },

        _getWrappedViewOptions: function(vizConstructor) {
            return _.extend({}, LazyView.prototype._getWrappedViewOptions.apply(this, arguments), {
                vizName: this.vizName,
                appName: this.appName,
                vizConstructor: vizConstructor
            });
        }
    });

    var VisualizationRegistry = {

        register: function(vizConfig) {
            if (!vizConfig.id) {
                vizConfig = _.extend({ id: _.uniqueId('registered_viz_') }, vizConfig);
            }
            var duplicateConfig = _(registered).find(function(existingConfig) {
                return _.isEqual(existingConfig.matchConfig, vizConfig.matchConfig);
            });
            if (duplicateConfig) {
                registered = _(registered).without(duplicateConfig);
            }
            registered.unshift(vizConfig);
            return vizConfig;
        },
        
        registerExternalVisualization: function(registrationData) {
            var appBuildNumber = registrationData.appBuildNumber;
            var appName = registrationData.appName;
            var vizName = registrationData.vizName;
            var vizBasePath = this.getExternalVizBasePath(appBuildNumber, appName, vizName);

            var vizId = appName + '.' + vizName;
            var formatterHtml = registrationData.formatterHtml;
            var vizSourcePath =  vizBasePath + 'visualization';
            var cssPath = 'css!' + vizBasePath + 'visualization.css';

            var factory = ExternalVisualizationWrapper.extend({
                vizName: vizName,
                appName: appName,
                jsPath: vizSourcePath,
                cssPath: cssPath
            });
            
            return this.register({
                appBuildNumber: appBuildNumber,
                id: vizId,
                appName: appName,
                vizName: vizName,
                label: registrationData.label,
                description: registrationData.description,
                searchHint: registrationData.searchHint,
                icon: registrationData.icon || 'external-viz',
                preview: registrationData.preview || 'preview.png',
                isSelectable: !!registrationData.isSelectable,
                factory: factory,
                categories: _.union(['external'], registrationData.categories || []),
                matchConfig: {
                    'display.general.type': 'visualizations',
                    'display.visualizations.type': 'custom',
                    'display.visualizations.custom.type': vizId
                },
                size: {
                    resizable: true,
                    minHeight: 0,
                    maxHeight: 1000,
                    defaultHeight: registrationData.defaultHeight || 250,
                    heightAttribute: 'display.visualizations.custom.height'
                },
                formatterHtml: formatterHtml
            });
        },

        findVisualizationForConfig: function(configJson, generalTypeOverride, customOverride) {
            configJson = _.extend(
                {},
                configJson,
                generalTypeOverride ? { 'display.general.type': generalTypeOverride } : {},
                customOverride
            );
            return _(registered).find(function(vizConfig) {
                return _.matches(vizConfig.matchConfig)(configJson);
            });
        },

        getAllVisualizations: function(generalTypeWhitelist) {
            var matches = registered;
            if (generalTypeWhitelist) {
                matches = _(matches).filter(function(vizConfig) {
                    return _(generalTypeWhitelist).contains(vizConfig.matchConfig['display.general.type']);
                });
            }

            // Sort the visualizations such that all built-in ones come first and retain the order they were
            // registered in, and the external ones come after sorted by their label.
            return _(matches).sortBy(function(vizConfig) {
                if (_(vizConfig.categories).contains('external')) {
                    return 'b' + vizConfig.label;
                }
                return 'a'; // underscore.js sortBy is stable
            });
        },

        getVisualizationById: function(id) {
            return _(registered).findWhere({ id: id });
        },

        getReportSettingsForId: function(id) {
            var config = this.getVisualizationById(id);
            return config ? config.matchConfig : null;
        },

        // Base path maps to the directory where all of the viz components live. The form is
        // ../../<splunk build number>-<app build number>/app/<app name>/visualizations/<viz name>/
        getExternalVizBasePath: function(appBuildNumber, appName, vizName){
            return '../../' 
                + route.getSplunkVersion() 
                + encodeURIComponent(appBuildNumber ? '-' + appBuildNumber : '')
                + '/app/' 
                + encodeURIComponent(appName) 
                + '/visualizations/' 
                + encodeURIComponent(vizName) 
                + '/';
        }
    };

    _(BUILTIN_VISUALIZATIONS.slice().reverse()).each(function(vizConfig) {
        VisualizationRegistry.register(
            _.extend({ isSelectable: true }, vizConfig)
        );
    });

    return VisualizationRegistry;

});
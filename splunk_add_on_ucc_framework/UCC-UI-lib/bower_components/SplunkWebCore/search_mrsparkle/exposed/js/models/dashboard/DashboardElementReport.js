define([
    'underscore',
    'jquery',
    'backbone',
    'models/search/Report',
    'models/MeltingPot',
    'util/readonly',
    'splunkjs/mvc/utils'
], function(_, $, Backbone, Report, MeltingPot, ReadOnly, Utils) {

    var DashboardElementReportContent = MeltingPot.extend({
        initialize: function() {
            MeltingPot.prototype.initialize.apply(this, arguments);
            this.transientProps = new Backbone.Model();
        },
        set: function(key, val, options) {
            if (key == null) {
                return this;
            }
            if (typeof key === 'object') {
                options = val;
            }

            if (options && options['transient'] && this.transientProps) {
                this.transientProps.set.apply(this.transientProps, arguments);
                return this;
            } else {
                return MeltingPot.prototype.set.apply(this, arguments);
            }
        },
        toJSON: function(options) {
            var result;
            if (options && options.omitNonSavedSearchesDefaults) {
                result = MeltingPot.mergeModels(_(this._delegates).without(DashboardElementReport.NON_SAVEDSEARCHES_DEFAULTS), options);
            } else {
                result = MeltingPot.prototype.toJSON.apply(this, arguments);
            }
            return options && options.onlyDisplayProperties ? DashboardElementReport.getDisplayProperties(result) : result;
        },
        save: function() {
            this.trigger('save');
            return $.Deferred().resolve();
        }
    });

    var DashboardElementReport = Report.extend({
        initialize: function(options) {
            Report.prototype.initialize.call(this);
            if (options && options.delegate) {
                this.entry.content.addDelegate(options.delegate);
            }
            this.entry.content.addDelegate(this.entry.content.transientProps);
            this.typeModel = new Backbone.Model();
            this.entry.content.addDelegate(this.typeModel);
            this.editStateDelegate = new Backbone.Model();
            this.entry.content.addDelegate(this.editStateDelegate);
            this.entry.content.addDelegate(DashboardElementReport.NON_SAVEDSEARCHES_DEFAULTS);
            this.viewModeSink = new Backbone.Model();
            this.setEditable(options.editable);
            var typeChangeEvents = _(DashboardElementReport.getVizTypeReportProperties()).map(function(prop) { return 'change:' + prop; });
            this.listenTo(this.entry.content, typeChangeEvents.join(' '), this.updateTypeModel);
            this.listenTo(this.entry.content, 'save', this.save);
            this.updateTypeModel();
        },
        setEditable: function(editable) {
            this.entry.content.removeDelegate(this.viewModeSink);
            this.viewModeSink.clear();
            if (!editable) {
                this.entry.content.addDelegate(this.viewModeSink, {index: 0});
            }
            this.editStateDelegate.set('dashboard.element.edit', !!editable);
        },
        setDefaults: function(model) {
            this.entry.content.addDelegate(model.entry.content);
        },
        updateTypeModel: function() {
            this.typeModel.set('dashboard.element.viz.type', DashboardElementReport.getVizType(this));
        },
        fetch: function() {
            throw new Error('Cannot fetch DashboardElementReport');
        },
        initializeAssociated: function() {
            Report.prototype.initializeAssociated.apply(this, arguments);
            this.entry.content = new DashboardElementReportContent({delegates: []});
            this.entry.acl = new MeltingPot({ delegates: [] });
        },
        setReportDelegate: function(report) {
            this.entry.set('name', report.entry.get('name'));
            this.entry.acl.removeDelegates();
            this.entry.acl.addDelegate(report.entry.acl);
        },
        clearReportDelegate: function() {
            this.entry.unset('name');
            this.entry.acl.removeDelegates();
        },
        isNew: function() {
            return this.entry.get('name') == null || this.entry.get('name') == '_new';
        },
        save: function() {
            this.trigger('save');
            return $.Deferred().resolve();
        }
    }, {
        VIZ_TYPES: ['table', 'chart', 'event', 'single', 'list', 'map', 'html', 'viz'],
        NON_SAVEDSEARCHES_DEFAULTS: ReadOnly.readOnlyModel(new Backbone.Model({
            'display.prefs.statistics.count': '10',
            'display.prefs.events.count': '10',
            'display.visualizations.chartHeight': '250',
            'display.visualizations.singlevalueHeight': '115',
            'display.visualizations.singlevalue.linkView': 'search',
            'display.events.showPager': '1',
            'display.events.histogram': '0',
            'display.events.fields': '["host", "source", "sourcetype"]',
            'display.events.table.sortDirection': 'asc',
            'display.visualizations.resizable': true,
            'display.visualizations.custom.resizable': true,
            'display.visualizations.singlevalue.resizable': true,
            'dashboard.element.refresh.display': 'progressbar'
        })),
        getVizType: function(report) {
            return DashboardElementReport.getVizTypeFromReportContent(report.entry.content.toJSON());
        },
        getVizTypeFromReportContent: function(content) {
            var type = null;
            switch (content['display.general.type']) {
                case 'visualizations':
                    switch (content['display.visualizations.type']) {
                        case 'charting':
                            type = 'chart';
                            break;
                        case 'singlevalue':
                            type = 'single';
                            break;
                        case 'mapping':
                            type = 'map';
                            break;
                        case 'custom':
                            type = 'viz';
                            break;
                    }
                    break;
                case 'events':
                    type = 'event';
                    break;
                case 'statistics':
                    type = 'table';
                    break;
            }
            return type;
        },
        getVizTypeReportProperties: function() {
            return ['display.general.type', 'display.visualizations.type'];
        },
        getDisplayProperties: function(reportContent) {
            var generalType = reportContent['display.general.type'];
            var prefix, properties = {};
            switch (generalType) {
                case 'visualizations':
                    switch (reportContent['display.visualizations.type']) {
                        case 'charting':
                            prefix = 'display.visualizations.charting';
                            break;
                        case 'singlevalue':
                            prefix = 'display.visualizations.singlevalue';
                            break;
                        case 'mapping':
                            prefix = 'display.visualizations.mapping';
                            break;
                        case 'custom':
                            prefix = 'display.visualizations.custom';
                            break;
                    }
                    break;
                case 'events':
                    prefix = 'display.events';
                    break;
                case 'statistics':
                    prefix = 'display.statistics';
                    break;
            }
            if (prefix) {
                _.each(reportContent, function(v, k) {
                    if (_.isString(k) && k.indexOf(prefix) === 0) {
                        properties[k] = v;
                    }
                }, this);
            }
            return properties;
        }
    });

    return DashboardElementReport;
});

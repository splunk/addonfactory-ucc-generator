define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/dashboard/Base',
    'views/dashboard/element/Header',
    'views/dashboard/element/Body',
    'views/dashboard/element/Footer',
    'views/dashboard/element/ElementAutoRefresh',
    'models/search/Report',
    'models/dashboard/DashboardElementReport',
    'models/dashboard/DashboardElementModel',
    'splunkjs/mvc',
    'splunkjs/mvc/savedsearchmanager',
    'splunkjs/mvc/postprocessmanager',
    'splunkjs/mvc/simplexml/dashboard/tokendeps',
    'splunkjs/mvc/utils',
    'util/Profiler'
], function($,
            _,
            Backbone,
            module,
            BaseDashboardView,
            Header,
            Body,
            Footer,
            ElementAutoRefresh,
            Report,
            DashboardElementReport,
            DashboardElementModel,
            mvc,
            SavedSearchManager,
            PostProcessSearchManager,
            TokenDependenciesMixin,
            Utils,
            Profiler) {

    var DashboardElement = BaseDashboardView.extend(_.extend({}, TokenDependenciesMixin, {
        moduleId: module.id,
        _isDashboardElement: true,
        className: 'dashboard-element',
        omitFromSettings: ['reportContent'],
        constructor: function(options, settingsOptions) {
            options = options || {};
            settingsOptions = _.extend({tokens: true, tokenNamespace: 'submitted'}, settingsOptions);
            options.id = options.reportContent['dashboard.element.id'] || options.id;
            return BaseDashboardView.prototype.constructor.call(this, options, settingsOptions);
        },
        initialize: function(options) {
            BaseDashboardView.prototype.initialize.apply(this, arguments);

            this.model = _.extend({}, options.model);
            this.collection = _.extend({}, options.collection);
            this.deferreds = _.extend({}, options.deferreds);

            this.model.elementState = new Backbone.Model();

            // Virtual properties "display.general.search.*"
            this.model.managerReportContent = new Backbone.Model();

            this.deferreds.vizCreated = $.Deferred();
            this._setupReportModel();
            this.bindToComponentSetting('managerid', this._applyManagerSettings, this);

            this.listenTo(this.model.report.entry.content, 'change:dashboard.element.viz.type', this._updateVizTypeClass);
            this.listenTo(this.model.report.entry.content, 'change:dashboard.element.viz.type', function() {
                this.deferreds.vizCreated = $.Deferred();
            });

            this.children.header = new Header({
                model: this.model,
                collection: this.collection,
                settings: this.settings,
                deferreds: this.deferreds,
                id: _.uniqueId(this.id + '-header-')
            });
            this.children.body = new Body({
                model: this.model,
                collection: this.collection,
                settings: this.settings,
                deferreds: this.deferreds,
                id: _.uniqueId(this.id + '-body-')
            });
            this.children.footer = new Footer({
                model: this.model,
                collection: this.collection,
                settings: this.settings,
                deferreds: this.deferreds,
                id: _.uniqueId(this.id + '-footer-')
            });

            this.listenTo(this.children.body, 'all', this.trigger);
            this.listenTo(this.model.state, 'change:mode', this.onModeChange);
            this.setupTokenDependencies();
            this.setupProfiler();
        },
        setupProfiler: function() {
            if (Profiler.isEnabled()) {
                var profiler = Profiler.get('Dashboard').module(module.id, {element_id: this.id});
                profiler.profileFunctions(this,
                    '_setupReportModel',
                    '_applyManagerSettings',
                    'render');
                var readyTimer = profiler.newTimer();
                this.componentReady().then(function() {
                    profiler.log({
                        'type': this.getVisualizationType() || 'unknown',
                        'function': 'componentReady',
                        'duration': readyTimer.fromNow()
                    });
                }.bind(this));
            }
        },
        _setupReportModel: function() {
            // Contains report properties coming from XML options
            this.model.elementReport = new DashboardElementModel({}, {
                tokenNamespace: 'submitted',
                state: this.model.state
            });
            this.model.elementReport.set(this.options.reportContent, {tokens: true});

            this._settingsSync = Utils.syncModels(this.settings, this.model.elementReport, {
                auto: true,
                prefix: 'dashboard.element.'
            });

            // Our runtime report model instance
            this.model.report = new DashboardElementReport({delegate: this.model.elementReport});

            // Actual saved-search instance, for saved-search bound elements
            this.model.savedReport = new Report();

            this.deferreds.reportReady = $.Deferred();

            if (!this.settings.has('managerid')) {
                this._applyReportDefaults();
            }
        },
        _setupAutoRefresh: function(manager) {
            if (this._autoRefresh) {
                this._autoRefresh.dispose();
            }
            if (manager) {
                this._autoRefresh = new ElementAutoRefresh(this.settings, manager);
            }
        },
        _applyManagerSettings: function(components, manager) {
            this.manager = manager;
            this._setupAutoRefresh(manager);
            var reportReady = this.deferreds.reportReady;

            var defaultsModel;
            var reportModel;
            var defaultsDfd;

            if (manager) {
                if (manager instanceof SavedSearchManager) {
                    var savedReport = this.model.savedReport;
                    var name = manager.get('searchname');
                    savedReport.id = ['', 'servicesNS',
                        encodeURIComponent(this.model.application.get('owner')),
                        encodeURIComponent(this.model.application.get('app')),
                        'saved', 'searches',
                        encodeURIComponent(name)
                    ].join('/');
                    reportModel = savedReport;
                    defaultsModel = savedReport.entry.content;
                    defaultsDfd = savedReport.fetch();
                } else {
                    reportModel = this.model.reportDefaults;
                    defaultsModel = this.model.reportDefaults.entry.content;
                    defaultsDfd = this.deferreds.reportDefaults;
                }
            } else {
                this.model.report.clearReportDelegate();
                return;
            }
            defaultsDfd.then(function() {
                this._applyManagerReportProperties(manager);
                this.model.report.setReportDelegate(reportModel);
                var reportContent = this.model.report.entry.content;
                reportContent.removeDelegate(this.model.reportDefaults.entry.content, {silent: true});
                reportContent.removeDelegate(this.model.savedReport.entry.content, {silent: true});
                reportContent.addDelegate(defaultsModel);
                reportReady.resolve();
            }.bind(this), this._applyReportDefaults.bind(this));
        },
        _applyReportDefaults: function() {
            this.deferreds.reportDefaults.then(function() {
                this.model.report.setReportDelegate(this.model.reportDefaults);
                var reportContent = this.model.report.entry.content;
                reportContent.addDelegate(this.model.reportDefaults.entry.content);
                this.deferreds.reportReady.resolve();
            }.bind(this));
        },
        _applyManagerReportProperties: function(manager) {
            this.model.report.entry.content.removeDelegate(this.model.managerReportContent, {silent: true});
            this.model.managerReportContent.clear();
            var props = {};
            // Populate transient report properties containing information about the bound search type
            // and postprocess, so the eventsviewer can act on this information appropriately
            if (manager instanceof SavedSearchManager) {
                props['display.general.search.type'] = 'saved';
                _.extend(props, {
                    "search": manager.settings.resolve({tokens: true})
                });
            } else {
                if (manager instanceof PostProcessSearchManager) {
                    props['display.general.search.type'] = 'postprocess';
                    props['display.general.search.postProcessSearch'] = manager.settings.postProcessResolve({tokens: true});
                } else {
                    props['display.general.search.type'] = manager.has('metadata') && manager.get('metadata').global ? 'global' : 'inline';
                }
                _.extend(props, {
                    "search": manager.settings.resolve({tokens: true}),
                    "dispatch.earliest_time": manager.get('earliest_time', {tokens: true}),
                    "dispatch.latest_time": manager.get('latest_time', {tokens: true})
                });
            }
            this.model.managerReportContent.set(props);
            this.model.report.entry.content.addDelegate(this.model.managerReportContent, {silent: true});
        },
        _updateVizTypeClass: function() {
            var classes = this.className + ' ' + (this.getVisualizationType() || 'unknown');
            this.$el.hasClass('hidden') && (classes += ' hidden');
            this.$el.attr('class', classes);
        },
        render: function() {
            this.children.header.render().$el.appendTo(this.$el);
            this.children.body.render().$el.appendTo(this.$el);
            this.children.footer.render().$el.appendTo(this.$el);
            this._updateVizTypeClass();
            this.onModeChange();
            return this;
        },
        onModeChange: function() {
            this.$el.trigger('elementVisibilityChanged');
            var mode = this.model.state.get('mode');
            this.model.report.setEditable(mode === 'edit');
            switch (mode) {
                case 'edit':
                    this.listenTo(this.model.report, 'save', function() {
                        this.model.controller.trigger('edit:element', {elementId: this.model.elementReport.get('dashboard.element.id')});
                    });
                    break;
                default:
                    this.stopListening(this.model.report, 'save');
                    break;
            }
        },
        getVisualizationType: function() {
            return this.model.report.entry.content.get('dashboard.element.viz.type');
        },
        getVisualization: function(cb) {
            var dfd = this.deferreds.vizCreated;
            if (cb) {
                dfd.done(cb);
            }
            return dfd;
        },
        componentReady: function() {
            return $.when(this.deferreds.reportReady, this.deferreds.vizCreated);
        },
        remove: function() {
            if (this._autoRefresh) {
                this._autoRefresh.dispose();
            }
            this.stopListeningToTokenDependencyChange();
            BaseDashboardView.prototype.remove.apply(this, arguments);
        },
        show: function() {
            BaseDashboardView.prototype.show.apply(this, arguments);
            if (this.children.body.viz) {
                //Force viz to re-render, otherwise SingleValue will break
                this.children.body.viz.render();
            }
        }
    }));

    return DashboardElement;
});
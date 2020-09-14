define(function(require){
    var _ = require('underscore');
    var $ = require('jquery');
    var Backbone = require('backbone');
    var BaseSplunkView = require('../../basesplunkview');
    var mvc = require('../../../mvc');
    var utils = require('../../utils');
    var Dashboard = require('../controller');
    var ReportModel = require('models/dashboards/DashboardReport');
    var console = require('util/console');
    var ProgressBarView = require('../../progressbarview');
    var RefreshTimeView = require("../../refreshtimeindicatorview");
    var ResultsLinkView = require("../../resultslinkview");
    var PanelElementEditor = require('../paneleditor');
    var SavedSearchManager = require('../../savedsearchmanager');
    var PostProcessSearchManager = require('../../postprocessmanager');
    var Messages = require("../../messages");
    var GeneralUtils = require("util/general_utils");
    var TitleEditor = require('../dashboard/titleeditor');
    var TokenDependenciesMixin = require('../dashboard/tokendeps');
    var ExternalVisualizationCollection = require('collections/services/configs/Visualizations');
    var ExternalVisualizationModel = require('models/services/configs/Visualization');
    var sharedModels = require('../../../mvc/sharedmodels');


    // Enable to warn whenever a SimpleXML element or visualization
    // is created without the tokens=true option.
    // 
    // All product code should be using the option.
    // Only custom JS code from the user may omit it.
    var WARN_ON_MISSING_TOKENS_TRUE = false;

    var ELEMENT_TYPES = {};

    var REPORT_DEFAULTS_LOADED = new ReportModel().fetch();

    // Dashboards should load all enabled external visualizations.  Even if they are
    // not user selectable they should still render in dashbaords.
    var EXTERNAL_VIZ_LOADED = function(){
        var vizCollectionDfd = $.Deferred();
        var vizCollection = new ExternalVisualizationCollection();

        var appLocalsCollection = sharedModels.get('appLocals');

        $.when(appLocalsCollection.dfd).done(function(){ 
            vizCollection.fetch({
                appLocalsCollection: appLocalsCollection,
                data: _.extend(
                    { 
                        search: ExternalVisualizationModel.ENABLED_FILTER,
                        count: 0
                    },
                    sharedModels.get('app').pick('app', 'owner')
                )
            }).then(
                function(){
                    vizCollectionDfd.resolve();
                },
                function(){
                    vizCollectionDfd.reject();
                }
            );
        });

        return vizCollectionDfd;
    }();

    var PanelElementHead = Backbone.View.extend({
        className: 'panel-head',
        initialize: function(options){
            Backbone.View.prototype.initialize.apply(this, arguments);
            this.parent = options.parent;
        },
        remove: function(){
            this.parent = null;
            return Backbone.View.prototype.remove.apply(this, arguments);
        }
    });
    
    var ViewModePanelHead = PanelElementHead.extend({
        editMode: false,
        initialize: function(options) {
            PanelElementHead.prototype.initialize.apply(this, arguments);
            this.listenTo(this.parent.settings, 'change:title', this.updateTitle);
        },
        updateTitle: function () {
            var h3 = this.$el.children('h3');
            var title = $.trim(this.parent.settings.get('title'));
            if (title) {
                if(!h3.length) {
                    h3 = $('<h3 />').appendTo(this.$el);
                }
                h3.text(title);
            } else {
                h3.remove();
            }
        },
        render: function() {
            if (!this.progressBar) {
                this.progressBar = new ProgressBarView({
                    id: _.uniqueId(this.parent.id + "-progressbar"),
                    manager: this.parent.settings.get('managerid'),
                    el: $('<div class="progress-container pull-right"></div>')
                }).render().$el.appendTo(this.$el);
            }
            this.updateTitle();
            return this;
        },
        remove: function() {
            if (this.progressBar) {
                this.progressBar.remove();
                this.progressBar = null;
            }
            PanelElementHead.prototype.remove.call(this);
        }
    });
    
    var EditModelPanelHead = PanelElementHead.extend({
        editMode: true,
        initialize: function(){
            PanelElementHead.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model, 'editTitle', this.focusTitleEditor);
        },
        render: function(){
            if (!this.progressBar) {
                this.progressBar = new ProgressBarView({
                    id: _.uniqueId(this.parent.id + "-progressbar"),
                    manager: this.parent.settings.get('managerid'),
                    el: $('<div class="progress-container pull-right"></div>')
                }).render().$el.appendTo(this.$el);
            }
            this.createPanelElementEditor();
            this.createTitleEditor();
            return this;
        },
        createPanelElementEditor: function() {
            this.removePanelElementEditor();
            this.panelEditor = new PanelElementEditor({ 
                manager: this.parent.managerid, 
                model: { report: this.model } 
            });
            this.$el.prepend(this.panelEditor.render().el);
        },
        removePanelElementEditor: function () {
            if (this.panelEditor) {
                this.panelEditor.remove();
                this.panelEditor = null;
            }
        }, 
        createTitleEditor: function(){
            this.removeTitleEditor();
            this._titleEditor = new TitleEditor({
                model: this.model.entry.content,
                attribute: 'display.general.title'
            });
            this.listenTo(this._titleEditor, 'update', this.saveTitle);
            var h3 = this.$('h3');
            if(!h3.length) {
                h3 = $('<h3 />').appendTo(this.$el);
            }
            this._titleEditor.render().$el.appendTo(h3);
        },
        focusTitleEditor: function() {
            this._titleEditor.focus();
        },
        removeTitleEditor: function() {
            if(this._titleEditor) {
                this.stopListening(this._titleEditor);
                this._titleEditor.remove();
                this._titleEditor = null;
            }
        },
        saveTitle: function() {
            this.model.saveXML();
        },
        remove: function(){
            if (this.progressBar) {
                this.progressBar.remove();
                this.progressBar = null;
            }
            this.removeTitleEditor();
            this.removePanelElementEditor();
            PanelElementHead.prototype.remove.call(this);
        }
    });
    
    var DashboardElement = BaseSplunkView.extend(_.extend({}, TokenDependenciesMixin, {
        initialVisualization: '#abstract',
        configure: function() {
            this.options.settingsOptions = _.extend({
                retainUnmatchedTokens: true
            }, this.options.settingsOptions || {});

            // Augment the options with the extra information we need
            this.options = _.defaults(this.options, {
                id: this.id,
                // NOTE: Aliasing 'managerid' to the deprecated 'manager'
                //       setting since old code may still be depending on it.
                //       However any such code will behave oddly if the manager
                //       is changed after initialization.
                manager: this.options.managerid,
                title: this.$el.children('.panel-head:first').children('h3').text().trim(),
                editable: true
            });

            if (WARN_ON_MISSING_TOKENS_TRUE &&
                this.options.settingsOptions.tokens !== true)
            {
                console.warn('element created without tokens=true: ' + this.id);
            }

            BaseSplunkView.prototype.configure.apply(this, arguments);
        },
        initialize: function () {
            this.configure();
            this.visualization = null;
            this.model = new ReportModel();
            this.managerid = this.options.managerid;

            this.settings._sync = utils.syncModels(this.settings, this.model.entry.content, {
                auto: true,
                prefix: 'display.general.',
                include: ['id', 'title', 'manager', 'managerid', 'tokenDependencies']
            });

            // JIRA: Not using bindToComponentSetting('managerid', ...) here
            //       because this view inconsistently uses *both* the 'manager'
            //       and 'managerid' options. Thus it is not presently possible
            //       to dynamically change the 'managerid' option for SimpleXML
            //       elements, although you can for MVC components.
            //
            //       If usage of the 'manager' property can be eliminated and
            //       any assumptions about a constant manager at initialization
            //       time can be eliminated, this code can be safely
            //       transitioned. (SPL-72466)
            this.bindToComponent(this.managerid, this.onManagerChange, this);

            var typeModel = this.typeModel = new Backbone.Model({
                type: this.initialVisualization
            });

            // Deferred object is resolved once the report model is fully loaded
            this.reportReady = $.Deferred();

            this.listenTo(this.typeModel, 'change', this.createVisualization, this);
            if (!this.options.noEdit) {
                this.listenTo(Dashboard.getStateModel(), 'change:edit', this.onEditModeChange, this);
                this.listenTo(this.settings, 'change:editable', this.onEditModeChange, this);
            }
            this.reportReady.done(_.bind(function(){
                this.listenTo(this.model.entry.content, 'change:display.general.type change:display.visualizations.type change:display.events.type', function (m) {
                    var general = m.get('display.general.type'), subName = ['display', general, 'type'].join('.'), sub = m.get(subName),
                        qualifiedType = sub ? [general, sub].join(':') : general;
                    typeModel.set('type', ELEMENT_TYPES.hasOwnProperty(qualifiedType) ? qualifiedType : general);
                }, this);
                this.listenTo(this.model, 'removedPanel', this.remove, this);
            },this));
            this.setupTokenDependencies();
        },
        remove: function() {
            this.removeRefreshTimeIndicator();
            this._removeVisualization();
            this.removePanelHead();
            this.stopListeningToTokenDependencyChange();
            if(this.settings) {
                if(this.settings._sync) {
                    this.settings._sync.destroy();
                }
            }
            var $parent = this.$el.parent();
            BaseSplunkView.prototype.remove.call(this);
            $parent.trigger('elementRemoved');
        },
        onManagerChange: function(managers, manager) {
            var that = this;
            if(manager instanceof SavedSearchManager) {
                var name = manager.get('searchname'),
                        appModel = Dashboard.getStateModel().app,
                        initial = !this.model.entry.content.has('display.general.type');
                this.model.id = ['','servicesNS',encodeURIComponent(appModel.get('owner')),encodeURIComponent(appModel.get('app')),'saved','searches', encodeURIComponent(name)].join('/');
                this.model.fetch({ tokens: false }).done(function(){
                    if (initial) {
                        that.model.entry.content.set(that._initialVisualizationToAttributes());
                    }
                    that.reportReady.resolve(that.model);
                }).fail(function(xhr){
                            console.error('Failed to load saved search', arguments);
                            if(xhr.status === 404) {
                                that.showErrorMessage(_("Warning: saved search not found: ").t() + "\"" + _.escape(name) + "\"");
                            }
                        });
            } else if(manager) {
                REPORT_DEFAULTS_LOADED.done(function(response){
                    // Apply the report defaults (from the _new entity) to our report model before applying specific settings
                    if (!that.model.entry.content.has('display.general.type')) {
                        // Apply defaults and initial visualization attributes if they aren't set yet
                        that.model.entry.content.set(response.entry[0].content, { tokens: false });
                        if(that.initialVisualization !== '#abstract') {
                            that.model.entry.content.set(that._initialVisualizationToAttributes());
                        }
                    }
                    var searchType = 'inline';
                    if (manager instanceof PostProcessSearchManager) {
                        searchType = 'postprocess';
                        that.model.entry.content.set('display.general.search.fullSearch', manager.settings.resolve({ tokens: true }), { tokens: true });
                        that.model.entry.content.set('display.general.search.base', manager.settings.get('managerid'));
                        that.model.entry.content.set('display.general.search.postProcessSearch', manager.settings.postProcessResolve({ tokens: true }), { tokens: true });
                    } else if (manager.has('metadata') && manager.get('metadata').global) {
                        searchType = 'global';
                    }
                    that.model.entry.content.set('display.general.search.type', searchType);
                    that.model.entry.content.set({
                        search: manager.get('search', {tokens: true}),
                        "dispatch.earliest_time": manager.get('earliest_time', {tokens: true}),
                        "dispatch.latest_time": manager.get('latest_time', {tokens: true})
                    }, {tokens: true});
                    var sampleRatio = manager.get('sample_ratio', {tokens: true});
                    if (sampleRatio != null && sampleRatio != 1) {
                        that.model.entry.content.set('dispatch.sample_ratio', sampleRatio, {tokens: true});
                    }
                    that.reportReady.resolve(that.model);
                });
            } else {
                REPORT_DEFAULTS_LOADED.done(function(response){
                    // Apply the report defaults (from the _new entity) to our report model
                    if (!that.model.entry.content.has('display.general.type')) {
                        // Apply defaults and initial visualization attributes if they aren't set yet
                        that.model.entry.content.set(response.entry[0].content, { tokens: false });
                        if(that.initialVisualization !== '#abstract') {
                            that.model.entry.content.set(that._initialVisualizationToAttributes());
                        }
                    }
                    that.reportReady.resolve(that.model);
                });
            }
        },
        showErrorMessage: function(message) {
            this._removeInitialPlaceholder();
            var el = this.$('.panel-body>.msg');
            if(!el.length) {
                el = $('<div class="msg"></div>').appendTo(this.$('.panel-body'));
            }
            Messages.render({
                level: "error",
                icon: "warning-sign",
                message: message
            }, el);
        },
        _initialVisualizationToAttributes: function() {
            var type = this.initialVisualization.split(':'),
                attr = {
                    'display.general.type': type[0]
                };
            if (type.length > 1) {
                attr[['display', type[0], 'type'].join('.')] = type[1];
            }
            return attr;
        },
        onEditModeChange: function (model) {
            var handler = this._debouncedOnEditModeChange;
            if(!handler) {
                handler = this._debouncedOnEditModeChange = _.debounce(_.bind(this._onEditModeChange, this), 0);
            }
            this.reportReady.done(function(){
                handler(model);
            });
        },
        removePanelHead: function(){
            if(this.panelHead) {
                this.panelHead.remove();
                this.panelHead = null;
            }
            this.$el.children('.panel-head').remove();
        },
        isEditMode: function(){
            return Dashboard.isEditMode() && this.settings.get('editable');
        },
        _onEditModeChange: function () {
            this.updatePanelHead();
            
            if (this.isEditMode()) {
                if(this.$el.is('.hidden')) {
                    this.$el.show().parents('.dashboard-panel').trigger('elementVisibilityChanged');
                }
            } else {
                if(this.$el.is('.hidden')) {
                    this.$el.hide().parents('.dashboard-panel').trigger('elementVisibilityChanged');
                }
                this._resizeVisualization();
            }
        },
        _resizeVisualization: function() {
            this.getVisualization(function(viz) {
                if (typeof viz.resizeChart === "function") {
                    viz.resizeChart();
                }
            });
        },
        updatePanelHead: function() {
            var editMode = this.isEditMode();
            if (!this.panelHead || this.panelHead.editMode !== editMode) {
                this.removePanelHead();
                var PanelElementHeadType = editMode ? EditModelPanelHead : ViewModePanelHead;
                this.panelHead = new PanelElementHeadType({ parent: this, model: this.model, settings: this.settings });
                this.panelHead.render().$el.prependTo(this.$el);
            }
        },
        hide: function() {
            if (!this.$el.is('.hidden')) {
                if(!this.isEditMode()) {
                    this.$el.hide();
                }
                this.$el.addClass('hidden').parents('.dashboard-panel').trigger('elementVisibilityChanged');
            }
        },
        show: function() {
            if (this.$el.is('.hidden')) {
                this.$el.show().removeClass('hidden').parents('.dashboard-panel').trigger('elementVisibilityChanged');
                if(this.visualization) {
                    // Force viz to re-render
                    this.visualization.render();
                }
            }
        },
        createRefreshTimeIndicator: function () {
            this.removeRefreshTimeIndicator();
            var refreshTimeVisible = this.settings.get('refresh.time.visible');
            var showRefreshTime = (refreshTimeVisible === undefined || GeneralUtils.normalizeBoolean(refreshTimeVisible, {'default': false}));
            var refreshTimeInterval = this.settings.get('refresh.auto.interval');
            if (!this.refreshTime && (showRefreshTime || refreshTimeInterval)) {
                this.refreshTime = new RefreshTimeView({
                    id: _.uniqueId(this.id + '-refreshtime'),
                    el: $('<div class="refresh-time-indicator pull-right"></div>'),
                    manager: this.managerid,
                    "refresh.auto.interval": this.settings.get('refresh.auto.interval'),
                    "refresh.time.visible": this.settings.get('refresh.time.visible')
                }).render().$el.appendTo(this.$('.panel-footer'));
            }
        },
        removeRefreshTimeIndicator: function(){
            if (this.refreshTime) {
                this.refreshTime.remove();
            }
        },
        createVisualization: function (applyOptions) {
            var createFn = this._debouncedCreateViz;
            if(!createFn) {
                createFn = this._debouncedCreateViz = _.debounce(_.bind(this._createVisualization, this), 0);
            }
            $.when(this.reportReady, EXTERNAL_VIZ_LOADED).then(function(){
                createFn(applyOptions === true);
            });
        },
        _removeVisualization: function() {
            if (this.visualization) {
                if (this.visualization.panelClassName) {
                    this.$el.removeClass(this.visualization.panelClassName);
                }
                this.visualization.off();
                // Remove will revoke it from the registry
                this.visualization.remove();
                this.visualization = null;
            }
            if (this.resultsLink) {
                this.resultsLink.off();
                // Remove will revoke it from the registry
                this.resultsLink.remove();
                this.resultsLink = null;
            }
        },
        _removeInitialPlaceholder: function(){
            this.$('.panel-body > .msg, .panel-body > .initial-placeholder').remove();
        },
        _createVisualization: function (applyOptions) {
            var initial = !this.visualization;
            this._removeInitialPlaceholder();
            this._removeVisualization();
            var type = this.typeModel.get('type'),
                Element = ELEMENT_TYPES[type];

            if (!Element) {
                this.showErrorMessage(_("Unsupported visualization type: ").t() + JSON.stringify(type));
                return;
            }
            var options = {
                el: $('<div></div>').appendTo(this.$('.panel-body')),
                reportModel: this.model.entry.content,
                managerid: this.settings.get('manager'),
                id: _.uniqueId(this.id + '-viz-'),
                forceNormalizeSettings: true
            };
            if (initial || applyOptions) {
                // Only pass the component options down when the initial visualization is created
                options = _.extend({}, this.options, options);
            }
            if (options.settingsOptions) {
                // Do not pass through retainUnmatchedTokens=true to visualization
                options.settingsOptions.retainUnmatchedTokens = false;
            }
            if (WARN_ON_MISSING_TOKENS_TRUE &&
                (options.settingsOptions || {}).tokens !== true)
            {
                console.warn('viz created without tokens=true: ' + options.id);
            }
            this.visualization = new Element(options).render();

            if (this.visualization.panelClassName) {
                this.$el.addClass(this.visualization.panelClassName);
            }

            // If we are switching this visualization to the events visualization,
            // then we need to set any search manager to have status_buckets > 0
            if (type.indexOf("events") === 0) {
                var manager = mvc.Components.getInstance(this.settings.get('manager'));
                manager.settings.set('status_buckets', 300);
            }

            this.trigger('create:visualization', this.visualization);

            if (initial) {
                this.model.entry.content.set(_.defaults(this.model.entry.content.toJSON({ tokens: true }), this.visualization.reportDefaults));
            }
            this.resultsLink = new ResultsLinkView(_.extend({}, this.options, {
                id: _.uniqueId(this.id + '-resultslink'),
                el: $('<div class="view-results pull-left"></div>').appendTo(this.$('.panel-footer')),
                manager: this.managerid,
                model: this.model
            })).render();

            this.visualization.on('all', this.trigger, this);
        },
        getVisualizationType: function(){
            return this.typeModel.get('type');
        },
        getVisualization: function(callback) {
            var dfd = $.Deferred();
            if(callback) {
                dfd.done(callback);
            }
            if(this.visualization) {
                dfd.resolve(this.visualization);
            } else {
                this.once('create:visualization', dfd.resolve, dfd);
            }
            return dfd.promise();
        },
        render: function () {
            this.createPanelStructure();

            this.createRefreshTimeIndicator();
            this.createVisualization();
            if (!this.options.noEdit) {
                this.onEditModeChange(Dashboard.getStateModel());
            }
            return this;
        },
        createPanelStructure: function () {
            var $panelBody = this.$el.children('.panel-body');
            if (!$panelBody.length) {
                $panelBody = $('<div class="panel-body"></div>').appendTo(this.$el);
            }
            var el = $('<div class="initial-placeholder"></div>').addClass('placeholder-' + this.initialVisualization.replace(/\W+/,'-'));
            el.appendTo($panelBody);
            if (!this.$el.children('.panel-footer').length) {
                $('<div class="panel-footer"></div>').appendTo(this.$el);
            }
        },
        getExportParams: function(prefix) {
            var manager = mvc.Components.get(this.managerid), result = {};
            if(manager &&
                !(manager instanceof PostProcessSearchManager) &&
                manager.hasJob()) {
                    result[prefix] = manager.getSid();
            }
            return result;
        },
        componentReady: function() {
            // A dashboard element is ready once it's attached to it's search manager, the report model is loaded and
            // the visualization view is created
            var reportReady = this.settings.get('managerid') == null ? $.Deferred().resolve() : this.reportReady;
            var visualizationReady = this.getVisualization();
            return $.when(reportReady, visualizationReady);
        }
    }), {
        registerVisualization: function (name, clazz) {
            ELEMENT_TYPES[name] = clazz;
        },
        getVisualization: function(name) {
            var viz = ELEMENT_TYPES[name];
            if(!viz) {
                viz = ELEMENT_TYPES[name.split(':')[0]];
            }
            return viz;
        }
    });

    return DashboardElement;
});

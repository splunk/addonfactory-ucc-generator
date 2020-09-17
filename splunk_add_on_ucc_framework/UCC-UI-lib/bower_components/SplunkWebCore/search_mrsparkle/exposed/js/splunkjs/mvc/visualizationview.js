define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var mvc = require('./mvc');
    var BaseSplunkView = require('./basesplunkview');
    var TokenAwareModel = require('./tokenawaremodel');
    var SharedModels = require('./sharedmodels');
    var ReportVisualizer = require('views/shared/ReportVisualizer');
    var PaginatorView = require("./paginatorview");
    var Messages = require('./messages');
    var Drilldown = require('./drilldown');
    var Utils = require('./utils');
    var GeneralUtils = require('util/general_utils');
    var DEFAULT_PAGE_SIZE = 10;
    var MAX_PAGE_SIZE = 100;

    var VisualizationView = BaseSplunkView.extend(/** @lends splunkjs.mvc.VisualizationView.prototype */{

        omitFromSettings: ['el', 'reportModel'],

        // The "height" option is intentionally left undefined here, so that
        // each visualization can define its own.  For built-in visualizations
        // that subclass this view, the default height is directly added to the
        // `options` object.  For external visualizations, the ReportVisualizer
        // will read the default height from visualizations.conf.
        options: {
            drilldownRedirect: true,
            data: 'preview',
            resizable: false,
            /**
             * Defines behavior when refreshing the underlying search of the viz
             * Possible values are
             *  - "preview" (show messages and preview data when refreshing)
             *  - "none" (wait until refresh search finishes and then swap out data)
             */
            refreshDisplay: 'preview',
            /**
             * Location where the pager is displayed relative to the viz.
             * Can be 'bottom' (default) or 'top'.
             */
            pagerPosition: 'bottom',
            pageSize: DEFAULT_PAGE_SIZE
        },

        initialize: function() {
            BaseSplunkView.prototype.initialize.apply(this, arguments);
            this.configure();
            this.model = this.options.reportModel || TokenAwareModel._createReportModel();
            this.syncSettingsAndReportModel(this.settings, this.model);
            this.syncGenericVizSettings(this.settings, this.model);
            if (!this.options.reportModel || this.options.forceNormalizeSettings) {
                this.normalizeSettings(this.settings, this.options);
            }
            this.$el.css({ overflow: 'hidden', position: 'relative' });
            this.$msg = $('<div class="splunk-viz-msg" />');
            this.$viz = $('<div/>').appendTo(this.el);

            var reportVisualizerOptions = $.extend(true,
                {},
                {
                    el: this.$viz,
                    allowResize: this.canEnableResize() && this.settings.get('resizable'),
                    saveOnResize: this.options.saveOnResize,
                    autoHideResizeBar: false,
                    model: {
                        config: this.model,
                        application: SharedModels.get('app')
                    },
                    enableEditingReportProperty: this.options.enableEditingReportProperty,
                    saveOnApply: this.options.saveOnApply
                },
                this.getVisualizationRendererOptions()
            );
            this.viz = new ReportVisualizer(reportVisualizerOptions);
            this.listenTo(this.viz, 'drilldown', this._emitDrilldownEvent);
            this.listenTo(this.viz, 'searchDataModelsChange', this._bindSearchDataModels);
            this.listenTo(this.viz, 'rendered', this.trigger.bind(this, 'rendered', this));
            // If the visualization broadcasts that it has displayed a message, hide any
            // external messages.
            this.listenTo(this.viz, 'message', this.hideMessages);
            this.viz.load();

            // Setup resizing
            if (this.canEnableResize()) {
                this.listenTo(this.settings, 'change:resizable', function(model, value, options) {
                    this.viz.setAllowResize(value);
                });
            }

            // Setup pager
            if (this.canEnablePagination()) {
                this._onShowPagerChanged();
                this.listenTo(this.settings, 'change:showPager', this._onShowPagerChanged);
                this.listenTo(this.settings, 'change:pagerPosition', this._onPaginatorPositionChange);
            }

            this._bindSearchDataModels();
            this.bindToComponentSetting('managerid', this._onManagerChange, this);
            // If we don't have a manager by this point, then we're going to
            // kick the manager change machinery so that it does whatever is
            // necessary when no manager is present.
            if (!this.manager) {
                this._onManagerChange(mvc.Components, null);
            }
        },

        syncGenericVizSettings: function(settings, reportModel) {
            var settingsToSync = {};
            if ('refreshDisplayReportProperty' in this.options) {
                settingsToSync['refreshDisplay'] = this.options['refreshDisplayReportProperty'];
            }
            if (_.size(settingsToSync)) {
                this._genericSettingsSync = Utils.syncModels(settings, reportModel, {
                    auto: true,
                    alias: settingsToSync,
                    include: _.keys(settingsToSync)
                });
            }
        },

        configure: function() {
            if (this.options.normalizeSettings === false) {
                this.omitFromSettings = (this.omitFromSettings || []).concat(
                    _(this.options).chain().omit('id', 'managerid', 'data', 'resizable', 'drilldownRedirect', 'pagerPosition').keys().value());
            }
            return BaseSplunkView.prototype.configure.apply(this, arguments);
        },

        render: function() {
            this.viz.render();
            if(this.paginator) {
                this.paginator.render();
            }
            return this;
        },

        show: function() {
            this.$el.css('display', '');
        },

        hide: function() {
            this.$el.css('display', 'none');
        },

        remove: function() {
            this.viz.remove();
            if (this._genericSettingsSync) {
                this._genericSettingsSync.destroy();
            }
            if (this._customPropSync) {
                this._customPropSync.destroy();
            }
            if (this._settingsSync) {
                this._settingsSync.destroy();
            }
            if (this.paginator) {
                this.paginator.remove();
            }
            return BaseSplunkView.prototype.remove.call(this);
        },

        /* Protected Methods */

        /*
         * Returns whether or not the current job is done.  Returns false if no job is currently running,
         * and also returns false if the job has failed/errored out.
         */
        isJobDone: function() {
            return !!this._isJobDone;
        },

        /*
         * Hides any messages and shows the visualization.
         */
        hideMessages: function() {
            this.$msg.detach();
            this.showVisualization();
            if (this.paginator) {
                this.paginator.$el.show();
            }
        },

        /*
         * To be overridden by sub-classes.  This method should set up synchronization between
         * the settings model and the report model.  This is left up to the subclass because the
         * relationship between keys in those models is use-case specific.
         *
         * @param settings {Model} the settings model
         * @param report {Model} the report model
         */
        syncSettingsAndReportModel: function(settings, report) {
            this._customPropSync = Utils.syncModels(settings, report, {
                auto: true,
                prefix: 'display.visualizations.custom.',
                include: ['type', 'height']
            });
            // No need to exclude any options for this sync, the external viz wrapper will filter the
            // properties as they are passed to the viz code and allow only options in the correct namespace.
            this._settingsSync = Utils.syncModels(settings, report, {
                auto: true,
                prefix: 'display.visualizations.custom.'
            });
        },

        /*
         * To be extended by sub-classes.  This method provides a normalization routine for the
         * settings model (after it has been merged with the report model) to handle dynamic
         * default values and type coercions.
         *
         * @param settings {Model} the settings model
         * @param options {Object} the constructor options
         */
        normalizeSettings: function(settings, options) {
            if(settings.has('count')) {
                var count = parseInt(options.count, 10) || DEFAULT_PAGE_SIZE;
                settings.set('pageSize', (count > MAX_PAGE_SIZE || count < 1) ? DEFAULT_PAGE_SIZE : count);
            }
            settings.set({ height: parseInt(settings.get('height'), 10) || 0 });
        },

        /*
         * To be optionally overridden by sub-classes.  This method can be used to define custom
         * options to be passed in when instantiating the visualization renderer.  The custom
         * options will be recursively merged with the default options.
         */
        getVisualizationRendererOptions: function() {
            return ({
                generalTypeOverride: ReportVisualizer.GENERAL_TYPES.VISUALIZATIONS,
                customConfigOverride: {
                    'display.visualizations.type': 'custom'
                }
            });
        },

        /*
         * To be optionally implemented by sub-classes.  This method will be called each time a data
         * update is received from the manager, allowing custom pre-processing logic before the data
         * is passed along to the visualization.
         *
         * @param data {Object} the raw data payload from the manager
         */
        formatData: function(data) {
            return data;
        },

        /*
         * An optional override for sub-classes.  This method is called whenever the visualization should
         * be replaced by a message.
         *
         * @param info {Object | String} message rendering info, can be any valid input to Messages.render()
         */
        message: function(info) {
            // If the viz has a suppressExternalMessage function, call it to determine if
            // the external messages should be ignored.
            if (this.viz && _.result(this.viz, 'suppressExternalMessage', false)) {
                return;
            }
            this.$msg.detach();
            Messages.render(info, this.$msg);
            this.updateMessageHeight();
            this.$msg.prependTo(this.$el);
            this.hideVisualization();
            if (this.paginator) {
                this.paginator.$el.hide();
            }
        },

        updateMessageHeight: function() {
            this.$msg.height(this.settings.get('height'));
        },

        /*
         * The hideVisualization/showVisualization methods are optional overrides for sub-classes
         * that need to customize how a visualization is hidden/shown when a message is visible in its place.
         */

        hideVisualization: function() {
            this.viz.hide();
        },

        showVisualization: function() {
            this.viz.show();
        },

        /*
         * An optional override point for sub-classes that need to disable resize-ability behavior.
         */
        canEnableResize: function() {
            return true;
        },

        /*
         * An optional override point for sub-classes that want to enable pagination behavior.
         */
        canEnablePagination: function() {
            return false;
        },

        /*
         * An optional extension or override point for sub-classes.  The method will be called
         * to extract drilldown data from the original event object that was received from
         * the visualization.
         */
        getDrilldownData: function(e) {
            return Drilldown.normalizeDrilldownEventData(e, {
                manager: this.manager,
                contextProperty: 'rowContext',
                jobTimeOnly: _.result(this, 'drilldownWithJobTimeOnly', false)
            });
        },

        /*
         * An optional extension point for sub-classes.  This method will be called when responding to a
         * drilldown event from a visualization, providing event info and the active drilldown payload.
         * A sub-class can broadcast customized events and allow consumers to prevent the default action.
         *
         * @param e {Object} the drilldown event object from the visualization
         * @param payload {Event} the event payload used for broadcasting to consumers
         */
        onDrilldown: function(e, payload) {},

        /* Private Methods */

        _bindSearchDataModels: function() {
            this._unbindSearchDataModels();
            if (!this.viz) {
                return;
            }
            this.searchData = this.viz.getSearchDataModel();
            this.searchDataParams = this.viz.getSearchDataParamsModel();
            if (!this.manager || !this.searchData || !this.searchDataParams) {
                return;
            }
            var managerDataParams = this.searchDataParams.toJSON();
            if (this.canEnablePagination()) {
                managerDataParams.count = Math.min(this.settings.get('pageSize') || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
            }
            this.resultsModel = this.manager.data(this.settings.get('data'), managerDataParams);
            this.listenTo(this.resultsModel, 'data', this._onDataChanged, this);
            this.listenTo(this.resultsModel, 'error', this._onSearchError, this);
            this.listenTo(this.searchDataParams, 'change', this._onDataParamsChange, this);
        },

        _onDataParamsChange: function() {
            if (this.resultsModel) {
                this.resultsModel.set(this.searchDataParams.toJSON());
            }
        },

        _unbindSearchDataModels: function() {
            if (this.resultsModel) {
                this.stopListening(this.resultsModel);
                this.resultsModel.destroy();
                this.resultsModel = null;
            }
            if (this.searchDataParams) {
                this.stopListening(this.searchDataParams);
                this.searchDataParams = null;
            }
        },

        _onManagerChange: function(managers, manager) {
            if (this.manager) {
                this.stopListening(this.manager);
                this.manager = null;
            }
            this._unbindSearchDataModels();

            if (!manager) {
                this.message('no-search');
                return;
            }
            // Clear the visualization and any messages, since we have a new manager.
            this._clearResults();
            this.message('empty');

            this.manager = manager;
            this.listenTo(manager, 'search:start', this._onSearchStart);
            this.listenTo(manager, 'search:progress search:done', this._onSearchProgress);
            this.listenTo(manager, 'search:done', this._onSearchDone);
            this.listenTo(manager, 'search:cancelled', this._onSearchCancelled);
            this.listenTo(manager, 'search:refresh', this._onSearchRefresh);
            this.listenTo(manager, 'search:fail', this._onSearchFail);
            this.listenTo(manager, 'search:error', this._onSearchError);
            this._bindSearchDataModels();
            manager.replayLastSearchEvent(this);
        },

        _onDataChanged: function() {
            if (!this.resultsModel.hasData() && this.isJobDone()) {
                this.message('no-results');
                return;
            }
            var data = this.formatData($.extend(true, {
                meta: {
                    done: this.isJobDone()
                }
            }, this.resultsModel.data()));
            if (data && data.fields && data.fields.length > 0) {
                this.searchData.set(data);
                this.hideMessages();
            }
        },

        _isSilentRefreshEnabled: function() {
            return this.settings.get('refreshDisplay') !== 'preview';
        },

        _onSearchStart: function() {
            if (this._isSilentRefreshEnabled() && this.manager.isRefresh()) {
                this._unbindSearchDataModels();
                return;
            }
            if (this.paginator) {
                this.paginator.settings.set('page', 0);
            }
            this._isJobDone = false;
            this._clearResults();
            this.message('waiting');
        },

        _onSearchDone: function(properties) {
            if (this._isSilentRefreshEnabled() && this.manager.isRefresh()) {
                this._bindSearchDataModels();
            }
        },

        _onSearchProgress: function(properties) {
            properties = properties || {};
            var content = properties.content || {};
            var previewCount = content.resultPreviewCount || 0;
            var isJobDone = this._isJobDone = content.isDone || false;

            if (this._isSilentRefreshEnabled() && this.manager.isRefresh() && !isJobDone) {
                return;
            }
            if (content.dispatchState === 'QUEUED') {
                this.message('waiting-queued');
            } else if (previewCount === 0) {
                this.message(isJobDone ? 'no-results' : 'waiting');
            }
            if (this.paginator && previewCount > 0) {
                this.paginator.settings.set('itemCount', previewCount);
            }
        },

        _onSearchError: function(message, err) {
            this._isJobDone = false;
            var msg = Messages.getSearchErrorMessage(err) || message;
            this.message({
                level: 'error',
                icon: 'warning-sign',
                message: msg
            });
        },

        _onSearchFail: function(state) {
            this._isJobDone = false;
            var msg = Messages.getSearchFailureMessage(state);
            this.message({
                level: 'error',
                icon: 'warning-sign',
                message: msg
            });
        },

        _onSearchCancelled: function() {
            this._isJobDone = false;
            this.message('cancelled');
        },

        _onSearchRefresh: function() {
            this._isJobDone = false;
            if (this._isSilentRefreshEnabled()) {
                return;
            }
            this.message('refresh');
        },

        _clearResults: function() {
            this.viz.clear();
            if(this.paginator) {
                this.paginator.settings.set('itemCount', 0);
            }
        },

        _emitDrilldownEvent: function(e) {
            var drilldownData = this.getDrilldownData(e);
            var drilldownEvent = {
                field: e.name2 || e.name || drilldownData['click.name'],
                data: drilldownData,
                event: e
            };
            var payload = Drilldown.createEventPayload(
                drilldownEvent,
                _.bind(Drilldown.autoDrilldown, null, e, this.manager)
            );

            this.trigger('drilldown click', payload, this);
            this.onDrilldown(e, payload);

            var drilldownEnabled = this.settings.get('drilldown') !== 'none'
                    && this.settings.get("drilldownRedirect");
            if (drilldownEnabled && !payload.defaultPrevented()) {
                payload.drilldown();
            }
        },

        _onShowPagerChanged: function() {
            var showPager = GeneralUtils.normalizeBoolean(this.settings.get('showPager'), {'default': true});
            if (showPager !== false) {
                // Create and show pager
                if (!this.paginator) {
                    this.paginator = new PaginatorView({
                        id: _.uniqueId(this.id+'-paginator'),
                        el: $('<div></div>'),
                        pageSize: this.settings.get('pageSize')
                    });

                    this.listenTo(this.settings, 'change:pageSize', this._onPageSizeChanged);

                    this.listenTo(this.paginator.settings, 'change:page', function() {
                        var count = this.settings.get('pageSize');
                        var page = this.paginator.settings.get('page');
                        this.settings.set('offset', count * page);
                    }, this);

                    this._onPaginatorPositionChange();
                }
            } else {
                // Hide and destroy pager
                if (this.paginator) {
                    this.stopListening(this.settings, 'change:pageSize', this._onPageSizeChanged);
                    this.stopListening(this.paginator.settings, 'change:page');
                    this.paginator.remove();
                    this.paginator = null;
                }
            }
        },

        _onPageSizeChanged: function() {
            this.paginator.settings.set('pageSize', this.settings.get('pageSize'));
        },

        _onPaginatorPositionChange: function() {
            var action = (this.settings.get('pagerPosition') === 'bottom')
                ? 'appendTo'
                : 'prependTo';

            if (this.paginator) {
                this.paginator.$el.detach();
                this.paginator.$el[action](this.$el);
            }
        }

    });

    return VisualizationView;
});

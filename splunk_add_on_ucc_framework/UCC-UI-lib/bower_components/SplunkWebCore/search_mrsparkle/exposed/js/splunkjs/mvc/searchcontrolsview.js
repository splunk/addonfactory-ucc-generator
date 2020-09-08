define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require("underscore");
    var Backbone = require("backbone");
    var mvc = require('./mvc');
    var BaseSplunkView = require("./basesplunkview");
    var JobStatus = require('views/shared/jobstatus/Master');
    var ACLReadOnlyModel = require('models/ACLReadOnly');
    var ApplicationModel = require('models/shared/Application');
    var utils = require('./utils');
    var time_utils = require('util/time');
    var sharedModels = require('./sharedmodels');
    var splunkUtil = require('splunk.util');
    var splunkdUtil = require('util/splunkd_utils');

    var JobModel = Backbone.Model.extend({
        constructor: function() {
            this.control = new Backbone.Model();
            this.error = new Backbone.Model();
            this.entry = new Backbone.Model();
            this.entry.content = new Backbone.Model();
            this.entry.content.custom = new Backbone.Model();
            this.entry.acl = new ACLReadOnlyModel();

            Backbone.Model.prototype.constructor.apply(this, arguments);
        },

        initialize: function() {
            this._isNew = true;
        },

        set: function() {
            Backbone.Model.prototype.set.apply(this, arguments);
            Backbone.Model.prototype.set.apply(this.entry.content, arguments);
        },

        isNew: function() {
            return this._isNew;
        },

        fetch: function() {
            return this;
        },

        clear: function() {
            this.entry.clear();
            this.entry.content.clear();
            this.entry.content.custom.clear();

            this._isNew = true;
        },

        destroy: function(options) {
            this.cancel();

            if (options.success) {
                options.success();
            }
        },

        pause: function(options) {
            if (this.manager) {
                this.manager.pause();
            }
        },

        unpause: function(options) {
            if (this.manager) {
                this.manager.unpause();
            }
        },

        finalize: function(options) {
            if (this.manager) {
                this.manager.finalize();
            }
        },

        cancel: function(options) {
            if (this.manager) {
                this.manager.cancel();
            }
        },

        touch: function(options) {
            if (this.manager) {
                this.manager.touch();
            }
        },

        saveIsBackground: function(options) {
            this.entry.content.custom.set("isBackground", "1");
        },

        isBackground: function() {
            return splunkUtil.normalizeBoolean(this.entry.content.custom.get("isBackground"));
        },

        resultCountSafe: function() {
            return (this.entry.content.get('isPreviewEnabled') && !this.entry.content.get('isDone')) ? this.entry.content.get('resultPreviewCount') : this.entry.content.get('resultCount');
        },

        eventAvailableCountSafe: function() {
            return (this.entry.content.get('statusBuckets') == 0) ? this.resultCountSafe() : this.entry.content.get('eventAvailableCount');
        },


        // a job can be dispatched without a latest time, in which case return the published time
        latestTimeSafe: function() {
            var entry = this.entry;
            return entry.content.get('latestTime') || entry.get('published');
        },

        isQueued: function() {
            return this.checkUppercaseValue('dispatchState', JobModel.QUEUED);
        },

        isParsing: function() {
            return this.checkUppercaseValue('dispatchState', JobModel.PARSING);
        },

        isFinalizing: function() {
            return this.checkUppercaseValue('dispatchState', JobModel.FINALIZING);
        },

        isDone: function() {
            return splunkUtil.normalizeBoolean(this.entry.content.get('isDone'));
        },

        isPreparing: function() {
            return this.isQueued() || this.isParsing();
        },

        isRunning: function() {
            return !this.isNew() && !this.entry.content.get('isPaused') && !this.entry.content.get('isDone') && !this.isPreparing() && !this.isFinalizing();
        },

        isAdHocLevelFast: function() {
            return this.checkUppercaseValue('adhoc_search_level', "FAST");
        },

        isReportSearch: function() {
            return (this.entry.content.get('reportSearch') ? true : false);
        },

        // returns true if the job was dispatched over all time, returns false for all-time real-time
        isOverAllTime: function() {
            var request = this.entry.content.request;
            return request ? (!request.get('earliest_time') && !request.get('latest_time')) : false;
        },

        isRealtime: function() {
            var request = this.entry.content.request;
            return request && (
                time_utils.isRealtime(request.get('earliest_time')) &&
                time_utils.isRealtime(request.get('latest_time'))
            );
        },

        isUsingSampling: function() {
            return this.entry.content.get('sampleRatio') > '1';
        },

        getMessages: function() {
            return splunkdUtil.parseMessagesObject(this.entry.content.get('messages'));
        },

        checkUppercaseValue: function(key, uc_value) {
            var value = this.entry.content.get(key);
            if (!value) {
                return false;
            }
            return (value.toUpperCase() === uc_value);
        }
    }, {
        // constants for the dispatch states
        QUEUED: 'QUEUED',
        PARSING: 'PARSING',
        RUNNING: 'RUNNING',
        PAUSED: 'PAUSED',
        FINALIZING: 'FINALIZING',
        FAILED: 'FAILED',
        DONE: 'DONE'
    });

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name SearchControlsView
     * @description The **SearchControls** view manages the controls for a search.
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options
     * @param {String} options.id - The unique ID for this control.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind
     * this control to.
     * @param {Object} [options.settings] - The properties of the view.
     *
     * @example
     * require([
     *     "splunkjs/mvc/searchcontrolsview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(SearchControlsView) {
     *
     *     // Instantiate components
     *     new SearchControlsView({
     *         id: "example-searchcontrols",
     *         managerid: "example-search",
     *         el: $("#mysearchcontrolsview")
     *     }).render();
     *
     * });
     */
    var SearchControlsView = BaseSplunkView.extend(/** @lends splunkjs.mvc.SearchControlsView.prototype */
        // Instance
        {
            moduleId: module.id,

            className: "splunk-searchcontrols",

            options: {
                managerid: null
            },

            initialize: function() {
                this.configure();

                this._searchJob = new JobModel();
                this._state = new Backbone.Model({
                    "display.page.search.mode": "smart"
                });

                // Get the shared models
                var appModel = sharedModels.get("app");
                var appLocalModel = sharedModels.get("appLocal");

                var that = this;
                this._statusDfd = $.when(appLocalModel.dfd).done(function() {
                    that.jobStatus = new JobStatus({
                        model: {
                            searchJob: that._searchJob,
                            state: that._state,
                            application: appModel,
                            appLocal: appLocalModel
                        },
                        collection: {
                            limits: new Backbone.Collection()
                        },
                        enableSearchMode: true,
                        showAutoPause: false,
                        showJobButtons: false
                    });
                });

                this.bindToComponentSetting('managerid', this.onManagerChange, this);

                this._state.on("change", this._onSearchModeChange, this);
            },

            onManagerChange: function(managers, manager) {
                if (this.manager) {
                    this.manager.off(null, null, this);
                    this.manager.settings.off(null, null, this);
                }

                this.manager = manager;

                if (manager) {
                    this._searchJob.manager = manager;

                    manager.on("search:start", this._onSearchStart, this);
                    manager.on("search:cancelled", this._onSearchCancelled, this);
                    manager.on("search:failed", this._onSearchFailed, this);
                    manager.on("search:progress", this._onSearchProgress, this);

                    if (this.manager.settings.get("adhoc_search_level")) {
                        this._state.set("display.page.search.mode", this.manager.settings.get("adhoc_search_level"));
                    }
                    else {
                        this._onSearchModeChange();
                    }
                }
            },

            /**
             * Draws the view to the screen. Called only when you create the view manually.
             */
            render: function() {
                // We can't use the job status until it is created
                var that = this;
                $.when(this._statusDfd).done(function() {
                    that.$el.append(that.jobStatus.render().el);
                });
                return this;
            },

            _onSearchModeChange: function() {
                var searchMode = this._state.get("display.page.search.mode");
                if (searchMode && this.manager) {
                    this.manager.settings.set("adhoc_search_level", searchMode);
                }
            },

            _onSearchStart: function(properties) {
                this._searchJob._isNew = true;
                this._searchJob.clear();
            },

            _onSearchCancelled: function(properties) {
                this._searchJob._isNew = true;
                this._searchJob.clear();
            },

            _onSearchFailed: function(properties) {
                this._searchJob._isNew = true;
                this._searchJob.clear();
            },

            _onSearchProgress: function(properties) {
                this._searchJob._isNew = false;
                this._searchJob.entry.set(properties);
                this._searchJob.entry.content.set(properties.content);
                this._searchJob.entry.acl.set(properties.acl);
                this._searchJob.trigger("jobProgress");

                if (properties.content && properties.content.sid) {
                    this._searchJob.id = properties.content.sid;
                }

                // We can't use the job status until it is created
                var that = this;
                $.when(this._statusDfd).done(function() {
                    // Re-render items in the leftmost and rightmost menus
                    _.each(that.jobStatus.children.controls.children.menu.children, function(child) {
                        child.render();
                    });
                    // Re-render button controls
                    that.jobStatus.children.controls.render();
                });
            }
        }
    );

    return SearchControlsView;
});

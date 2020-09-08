define(function(require, exports, module) {
    var _ = require("underscore");
    var Backbone = require("backbone");
    var mvc = require('./mvc');
    var BaseSplunkView = require("./basesplunkview");
    var CanvasTimeline = require("views/shared/CanvasTimeline");
    var DateTime = require("splunk/time/DateTime");
    var JobModel = require("models/search/Job");
    var SimpleTimeZone = require("splunk/time/SimpleTimeZone");

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name TimelineView
     * @description The **Timeline** view displays an event timeline of a given
     * search and allows interactive modification of the search time range. This
     * view is modified by its search manager.
     *
     * &nbsp;&nbsp;&nbsp;&nbsp;**Note**  To allow the **Timeline** view to
     * modify its search manager, you must set up a change handler.
     *
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options
     * @param {String} options.id - The unique ID for this control.
     * @param {String} [options.data="timeline"] - The type of data to retrieve from the
     * search results </br>(`results | preview | events | summary | timeline`).
     * @param {String} [options.managerid=null] - The ID of the search manager to bind
     * this control to.
     * @param {Boolean} [options.minimize=false] - Indicates whether to display the
     * timeline in "mini" form, requiring less vertical space.
     * @param {Object} [options.settings] - The properties of the view.
     *
     * @example
     * require([
     *     "splunkjs/mvc/searchmanager",
     *     "splunkjs/mvc/timelineview",
     *     "splunkjs/mvc/simplexml/ready!"
     * ], function(SearchManager, TimelineView) {
     *
     *     // Instantiate components
     *     var mysearch = new SearchManager({
     *         id: "example-search",
     *         preview: true,
     *         search: "index=_internal | head 50",
     *         status_buckets: 300,
     *         required_field_list: "*"
     *     });
     *     var mytimeline = new TimelineView({
     *         id: "example-timeline",
     *         managerid: "example-search",
     *         el: $("#mytimelineview")
     *     }).render();
     *
     *     // Update the search manager when the timeline changes
     *     mytimeline.on("change", function() {
     *         mysearch.settings.set(mytimeline.val());
     *     });
     *
     * });
     */
     var TimelineView = BaseSplunkView.extend(/** @lends splunkjs.mvc.TimelineView.prototype */
        // Instance
        {
            moduleId: module.id,

            className: "splunk-timeline",

            options: {
                managerid: null,
                data: "timeline",
                minimize: false,
                // Updated whenever the user selects a new time range
                // and presses "Zoom to selection" or "Zoom out".
                // External changes to this property are ignored.
                value: undefined,
                // What the 'value' setting is initialized to.
                'default': undefined
            },

            initialize: function() {
                var that = this;

                this.configure();
                this.settings.enablePush("value");

                var model = this._model = {
                    searchJob: new JobModel(),
                    report: new Backbone.Model()
                };

                // HACK: Should be setting this state through API...
                model.searchJob.entry = { content: new Backbone.Model() };
                model.report.entry = { content: new Backbone.Model() };
                this._state = model.report.entry.content;
                model.searchJob.isNew = function() { return false; };

                this.timeline = new CanvasTimeline({model: model});
                this.timeline.update = function() {};

                this._onDefaultChange();

                this.bindToComponentSetting('managerid', this.onManagerChange, this);

                this.settings.on("change:minimize", this._onMinimizeChange, this);

                this.settings.on('change:value', this._onValueChange, this);
                this.settings.on('change:default', this._onDefaultChange, this);
                this._state.on(
                    "change:display.events.timelineEarliestTime change:display.events.timelineLatestTime",
                    _.debounce(this._onTimeRangeChange),
                    this
                );
            },

            _onDefaultChange: function(model, value, options) {
                // Initialize value with default, if provided
                var oldDefaultValue = this.settings.previous("default");
                var defaultValue = this.settings.get("default");
                var currentValue = this.settings.get('value');

                if (defaultValue !== undefined &&
                    (_.isEqual(currentValue, oldDefaultValue) || currentValue === undefined))
                {
                    this.val(defaultValue);
                }
            },

            onManagerChange: function(managers, manager) {
                if (this.manager) {
                    this.manager.off(null, null, this);
                    this.manager = null;
                }
                if (this.resultsModel) {
                    this.resultsModel.off(null, null, this);
                    this.resultsModel.destroy();
                    this.resultsModel = null;
                }

                if (!manager) {
                    return;
                }

                this.manager = manager;
                this.resultsModel = this.manager.data(this.settings.get("data"), {
                    condition: function(manager) {
                        var content = manager.get("data");

                        if (!content) {
                            return false;
                        }

                        var statusBuckets = content.statusBuckets;
                        var eventCount = content.eventCount;

                        return (statusBuckets > 0) && (eventCount > 0);
                    }
                });
                manager.on("search:start", this._onSearchStart, this);
                manager.on("search:cancelled", this._onSearchCancelled, this);
                this.resultsModel.on("data", this._onDataChanged, this);

                manager.replayLastSearchEvent(this);
            },

            /**
             * Draws the view to the screen. Called only when you create the view manually.
             */
            render: function() {
                this.$el.append(this.timeline.render().el);

                // We must defer updating the minimized state, as the DOM is not
                // ready immediately (there is an internal defer in CanvasTimeline)
                var that = this;
                _.defer(function() {
                    that._onMinimizeChange();
                });

                return this;
            },

            clearTimeline: function() {
                this.timeline.resetUI();

                var internalTimeline = this.timeline._timeline._timeline;
                internalTimeline._updateTimelineData({buckets:[], event_count: 0, cursor_time: 0});
            },

            _onValueChange: function(model, value) {
                this.trigger("change", value, this);

                var oldValue = this.settings.get('value');
                if (_.isEqual(oldValue, value)) {
                    return;
                }

                if (value !== undefined) {
                    this.timeline.setSelectionRange(value.earliest_time, value.latest_time, true);
                }
            },

            _onMinimizeChange: function() {
                if (this.settings.get("minimize")) {
                    this.timeline.maximizeCompact(false);
                }
                else {
                    this.timeline.maximizeFull(false);
                }
            },

            _onDataChanged: function() {
                var timelineData = this.resultsModel.data();

                var data = {
                  buckets: [],
                  cursorTime: new DateTime(timelineData.cursor_time),
                  eventCount: timelineData.event_count,
                  earliestOffset: timelineData.earliestOffset || 0
                };

                if (data.cursorTime) {
                  data.cursorTime = data.cursorTime.toTimeZone(new SimpleTimeZone(data.earliestOffset));
                }

                for(var i = 0; i < timelineData.buckets.length; i++) {
                  var oldBucket = timelineData.buckets[i];
                  var newBucket = {
                    earliestTime: new DateTime(oldBucket.earliest_time),
                    duration: oldBucket.duration,
                    eventCount: oldBucket.total_count,
                    eventAvailableCount: oldBucket.available_count,
                    isComplete: oldBucket.is_finalized,
                    buckets: []
                  };

                  if (isNaN(newBucket.duration)) {
                    newBucket.duration = 0;
                  }
                  if (isNaN(newBucket.earliestOffset)) {
                    newBucket.earliestOffset = 0;
                  }
                  if (isNaN(newBucket.latestOffset)) {
                    newBucket.latestOffset = 0;
                  }

                  if (newBucket.earliestTime) {
                    newBucket.latestTime = new DateTime(newBucket.earliestTime.getTime() + newBucket.duration);
                  }

                  if (newBucket.earliestTime) {
                    newBucket.earliestTime = newBucket.earliestTime.toTimeZone(new SimpleTimeZone(oldBucket.earliest_time_offset));
                  }
                  if (newBucket.latestTime) {
                    newBucket.latestTime = newBucket.latestTime.toTimeZone(new SimpleTimeZone(oldBucket.latest_time_offset));
                  }

                  data.buckets.push(newBucket);
                }

                var internalTimeline = this.timeline._timeline._timeline;
                internalTimeline._updateTimelineData(data);
                this.timeline.onDataUpdated({
                    updateCount: Number.MAX_VALUE
                });
            },

            _onSearchStart: function() {
                this.clearTimeline();
            },

            _onSearchCancelled: function() {
                this.clearTimeline();
            },

            _onTimeRangeChange: function(model, value, options) {
                if (!options || (options && !options._self)) {
                    this.settings.set('value', this._getTimeRange());
                }
            },

            /**
             * Gets the view's value if passed no parameters.
             * Sets the view's value if passed a single parameter.
             * @param {String} value - The value to set.
             * @returns {String}
             */
            val: function(value) {
                if (arguments.length === 0) {
                    return this.settings.get('value');
                }
                if (value !== this.settings.get('value')) {
                    return this._setTimeRange(value);
                }
                return value;
            },

            _setTimeRange: function(value) {
                this.settings.set('value', value);
                return value;
            },

            _getTimeRange: function() {
                return {
                    "earliest_time": this._state.get("display.events.timelineEarliestTime"),
                    "latest_time": this._state.get("display.events.timelineLatestTime")
                };
            }
        }
    );

    return TimelineView;
});

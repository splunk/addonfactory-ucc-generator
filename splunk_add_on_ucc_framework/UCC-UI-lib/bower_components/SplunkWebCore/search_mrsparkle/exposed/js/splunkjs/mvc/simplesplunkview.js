define(function(require, exports, module) {
    var _ = require('underscore');
    var mvc = require('./mvc');
    var BaseSplunkView = require("./basesplunkview");
    var Messages = require("./messages");
    
    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name SimpleSplunkView
     * @description The **SimpleSplunk** view is an abstract base class for 
     * custom views that displays content
     * from one associated search manager and one results model.
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {String} [className=null] - The name of the CSS class applied to 
     * the &lt;`div`&gt; element associated with this custom view.
     * @param {Number} [offset=0] - A number that specifies the index of the 
     * first item to return.
     * @param {Object} [options={data: "preview"}] - A dictionary of options for
     * the view, including the results model data that this view displays. 
     * Possible values for "`data`" are:</br>(`preview | results | searchlog | summary | timeline`).
     * @param {String} [outputMode="json_rows"] - The output format of the 
     * search results ("`json`", "`json_rows`", "`json_cols`").
     * @param {Object} [resultOptions={ }] - A dictionary of options to pass
     * to the results model. For example, `{output_time_format:&nbsp;"%s.%Q"}` 
     * returns `_time` in epoch milliseconds format.
     * @param {Number} [returnCount=0] - A number that indicates the maximum 
     * number of entries to return. A value of 0 means all entries are returned.
     * @param {Object} [settings] - The properties of the view. 
     *
     */
    var SimpleSplunkView = BaseSplunkView.extend(/** @lends splunkjs.mvc.SimpleSplunkView.prototype */{
        moduleId: module.id,
        
        className: null,

        // Format of the data received from Splunk.
        outputMode: 'json_rows',
        returnCount: 0,
        offset: 0,
        
        // Any option you want passed into the results model. For example,
        // a subclass can set:
        //      resultOptions: { output_time_format: "%s.%Q" }
        // which will mean _time will be returned in epoch milliseconds format.
        resultOptions: {},
        
        data_types: {
            'json_rows': 'rows',
            'json_cols': 'columns',
            'json': 'results'
        },
        
        options: {
            // The name of the results model that this view displays.
            // Required.  'preview' is almost always correct when
            // interpreting data from Splunk.  Valid values for
            // Splunk: "preview", "results", "searchlog", "summary",
            // "timeline"
            data: "preview"
        },

        /**
         * Constructor.
         */
        initialize: function() {
            this.configure();
            
            this._viz = null;
            this._data = null;
            this.bindToComponentSetting('managerid', this._onManagerChange, this);
            
            // If we don't have a manager by this point, then we're going to
            // kick the manager change machinery so that it does whatever is
            // necessary when no manager is present.
            if (!this.manager) {
                this._onManagerChange(mvc.Components, null);
            }
        },

        // Override the next three methods to implement the
        // association between a visualization library and a Splunk
        // results model.

        //Override this method to configure the visualization
        //library.  Must return a handle to the visualization instance.
        /** 
         * Configures the custom visualization and returns a handle to it, which
         * is then passed to the **updateView** method as the first argument. 
         * This method is called once.
         */
        createView: function() {
            throw new Error("Not implemented error.");
        },

        /*
         * Deprecated, use formatResults instead.
         */
        onDataChanged: function() {
            return this.formatResults.apply(this, arguments);
        },

         // Override this method if your view needs access to more
         // than just the dataset array.  Overriding this method
         // supersedes overriding formatData().  Return formatted data
         // understood by the visualization library.
        /**
         * Same as **formatData**, except that it allows you to format the entire
         * results model object (rather than just the data portion).
         * @param {object} resultsModel - The results model object.
         */
        formatResults: function(resultsModel) {
            if (!resultsModel) { return []; }
            // First try the legacy one, and if it isn't there, use the real one.
            var outputMode = this.output_mode || this.outputMode;
            var data_type = this.data_types[outputMode];
            var data = resultsModel.data();
            return this.formatData(data[data_type]);
        },

        // Override this method if your visualization library needs
        // the returned data formatted in a specific way.  Otherwise,
        // the visualization will receive the data in the format
        // specified according to outputMode.
        /**
         * Formats results data from Splunk and returns a handle to the data, 
         * which is then passed to the **updateView** method as the second argument. 
         * When you don't override this method, data is passed in the output 
         * format that is specified by the `output_mode` property 
         * (such as `json`, `json_rows`, or `json_cols`).
         * @param {Object} data - The data object.
         * @returns {Object} A handle to the data object.
         */
        formatData: function(data) {
            return data;
        },

        // Override this method to render the visualization.  It will
        // receive the visualization object returned by
        // createView() and the data object formatted by
        // formatData().
        /**
         * Puts Splunk data (returned by the **formatData** method) into the 
         * view (returned by the **createView** method) and renders it. This 
         * method is called automatically whenever Splunk data changes, for 
         * example when a search is run again.
         * @param {Object} viz - The view.
         * @param {Object} formattedData - The formatted data.
         */
        updateView: function(viz, formattedData) {
            throw new Error("Not implemented error.");
        },

        // Override to clear the view element yourself. Defaults 
        // to resetting the visualization and clearing the component's DOM 
        /**
         * Resets rendering.
         */
        clearView: function() {
            this.$el.empty();
            this._viz = false; 
        },
        
        // Override this method if your view needs to render messages in a 
        // custom way.
        /**
         * Allows you to render messages in a custom way.
         */
        displayMessage: function(info) {
            this._viz = null;
            Messages.render(info, this.$el);
            
            return this;
        },

        _checkManagerState: function() {
            // A splunk search job that has ended with no valid result
            // will not generate the events necessary to display
            // failure messages.  Check for that here.
            var manager = this.manager;
            if (!manager) {
                return;
            }

             if ((!manager.hasJob()) && (manager.lastError)) {
                this._onSearchError(manager.lastError);
                return;
            }

            if (!manager.hasJob()) {
                return;
            }

            var jobResponse = manager.getJobResponse();
            var state = jobResponse && jobResponse.entry[0];

            if (state && state.content && ((state.content.isDone) || (state.content.isFailed))) {
                this._onSearchProgress(state);
                return;
            }
        },

        _onManagerChange: function(managers, manager) {
            // Called when our associated manager changes.  Updates
            // listeners on the new manager and its associated
            // results model.

            if (this.manager) {
                this.manager.off(null, null, this);
                this.manager = null;
            }
            if (this.resultsModel) {
                this.resultsModel.off(null, null, this);
                this.resultsModel.destroy();
                this.resultsModel = null;
            }

            this.manager = manager;
            if (!manager) {
                this._displayMessage('no-search');
                return;
            }
            
            // Clear any messages, since we have a new manager.
            this._displayMessage("empty");

            // First try the legacy one, and if it isn't there, use the real one.
            var outputMode = this.output_mode || this.outputMode;
            this.resultsModel = this.manager.data(this.settings.get("data") || "preview", _.extend({
                output_mode: outputMode,
                count: this.returnCount,
                offset: this.offset
            }, this.resultOptions));

            manager.on("search:start", this._onSearchStart, this);
            manager.on("search:progress", this._onSearchProgress, this);
            manager.on("search:cancelled", this._onSearchCancelled, this);
            manager.on("search:error", this._onSearchError, this);
            manager.on("search:fail", this._onSearchFailed, this);
            this.resultsModel.on("data", this._onDataChanged, this);
            this.resultsModel.on("error", this._onSearchError, this);
            this._checkManagerState();
            
            manager.replayLastSearchEvent(this);
        },

        _displayMessage: function(info) {
            return this.displayMessage(info);
        },
        
        // Call this function if you want to (re-)render a view, including 
        // going through a full data formatting step and view updating.
        /**
         * Creates the initial view and draws it on the screen. On subsequent 
         * calls, runs a full update cycle by calling **formatResults**, 
         * **formatData**, then **updateView**.
         */
        render: function() {
            // Creates the view if it hasn't been created
            // before.  
            this._createView(this._data);
            
            // If we have a results model, we can go through a data
            // change cycle.
            if (this.resultsModel) {
                this._onDataChanged();
            }
            
            return this;
        },

        _createView: function(data) {
            if (!data) {
                return; // No data to display
            }

            if (!this._viz) {
                this._viz = this.createView();
            }
        },

        _updateView: function() {
            if ((!this._data) || (_.isEmpty(this._data))) {
                return;
            }

            var data = this._data;
 
            if (!this._viz) {
                this._createView(data); 
            }

            if (!this._viz) {
                return; // Couldn't create the visualization
            }

            this.updateView(this._viz, this._data);
        },

        _onDataChanged: function() {
            if (!this.resultsModel.hasData()) {
                if (this._isJobDone) {
                    this._displayMessage('no-results');
                }
                return; 
            }

            this._data = this.onDataChanged(this.resultsModel);
            this._updateView();
        },

        _onSearchProgress: function(properties) {
            properties = properties || {};
            var content = properties.content || {};
            var previewCount = content.resultPreviewCount || 0;
            var isJobDone = this._isJobDone = content.isDone || false;
            
            if (previewCount === 0) {
                this._displayMessage(isJobDone ? 'no-results' : 'waiting');
                return;
            }
        },
        
        _onSearchStart: function() { 
            this._isJobDone = false;
            this._displayMessage('waiting');
        },
        
        _onSearchCancelled: function() { 
            this._isJobDone = false;
            this._displayMessage('cancelled');
        },
            
        _onSearchError: function(message, err) {
            this._isJobDone = false;
            var msg = Messages.getSearchErrorMessage(err) || message;
            this._displayMessage({
                level: "error",
                icon: "warning-sign",
                message: msg
            });
        },

        _onSearchFailed: function(state, job) {
            var msg = Messages.getSearchFailureMessage(state);
            this._displayMessage({
                level: "error",
                icon: "warning-sign",
                message: msg
            });
        }

    });

    return SimpleSplunkView;
});

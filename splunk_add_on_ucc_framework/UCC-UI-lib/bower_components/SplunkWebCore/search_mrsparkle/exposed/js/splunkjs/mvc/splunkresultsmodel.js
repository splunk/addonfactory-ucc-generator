define(function(require, exports, module) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var urlUtil = require('util/url');
    var splunkDUtils = require('util/splunkd_utils');

    var defaultCondition = function(manager) {
        var content = manager.get("data") || {};
        var previewCount = content.resultPreviewCount || 0;
        var isRealTimeSearch = content.isRealTimeSearch;
        
        if (previewCount === 0 && isRealTimeSearch) {
            return true;
        }

        return previewCount > 0;
    };
    
    var identityCondition = function() {
        return true;
    };

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name SplunkResultsModel
     * @description The **SplunkResultsModel** object contains the results of a search,
     * and is returned by the {@link SearchManager.data} method. For details about 
     * working with the results model, see 
     * <a href="http://dev.splunk.com/view/SP-CAAAEU6" target="_blank">Search results model</a>
     * on the Splunk Developer Portal.
     * @extends splunkjs.mvc.{Backbone.Model}
     * @example
     *
     *    require([
     *        "splunkjs/mvc",
     *        "splunkjs/mvc/searchmanager",
     *        "splunkjs/mvc/tableview",
     *        "splunkjs/mvc/dropdownview",
     *        "splunkjs/mvc/simplexml/ready!"
     *    ], function(
     *        mvc,
     *        SearchManager,
     *        TableView,
     *        DropdownView
     *    ) {
     *    
     *        // Create the search manager and views
     *        var mainSearch = new SearchManager({
     *            id: "mysearch",
     *            search: "index=_internal | head 5",
     *            data: mvc.tokenSafe("$datamod$"),
     *            status_buckets: 300,
     *            preview: true,
     *            cache: false
     *        });
     *    
     *        var table1 = new TableView({
     *            id:"table",
     *            managerid: "mysearch",
     *            el: $("#mytable")
     *        }).render();
     *    
     *        var mydropdown = new DropdownView({
     *            id: "selData",
     *            showClearButton: false,
     *            value: mvc.tokenSafe("$datamod$"),
     *            el: $("#mydropdown")
     *        }).render();
     *    
     *        // Set the dropdown list choices
     *        var choices = [
     *            {label: "events",  value: "events" },
     *            {label: "preview", value: "preview"},
     *            {label: "results", value: "results"},
     *            {label: "summary", value: "summary"}
     *        ];
     *        mydropdown.settings.set("choices", choices);
     *    
     *        // Display the type of selected results model in the console
     *        var myChoice = "results";
     *        mydropdown.on("change", function(){
     *            myChoice = mydropdown.settings.get("value");
     *            var myResults = mainSearch.data(myChoice);
     *            myResults.on("data", function() {
     *                console.log("Type: ", myChoice);
     *                console.log("Has data? ", myResults.hasData());
     *                console.log("Data (rows): ", myResults.data().rows);
     *                console.log("Backbone collection: (rows) ", myResults.collection().raw.rows);
     *            });
     *        });
     *    
     *    });
     */
    var ResultsModel = Backbone.Model.extend(/** @lends splunkjs.mvc.SplunkResultsModel.prototype */{
        defaults: {
            // The manager this results model is tied to
            manager: null,
            
            // A function that accepts the manager and search job
            // and returns whether a fetch should happen
            condition: defaultCondition,
            
            // The source on the manager/job to use (e.g. preview/events/results)
            source: "",
            
            // Whether to autofetch on every "data" event from the manager
            autofetch: true,
            
            // Whether to serially execute requests, and keep only a single
            // pending request at a time.
            serialfetch: true,

            output_mode: "json_rows"
        },
        
        initialize: function() {   
            // Handle whenever the autofetch parameter changes.
            this.on("change:autofetch", this.handleAutofetch, this);
                 
            this.handleAutofetch();
            if (this.get("autofetch")) {
                this._fetch();
            }
        },
        
        handleAutofetch: function() {
            if (this.get("autofetch")) {
                // Bind to changes on ourselves and the manager
                this.on("change", this._fetch, this);
                this.get("manager").on("change:data", this._fetch, this);
            }  
            else {
                // Unbind to changes on ourselves and the manager
                this.off("change", null, this);
                this.get("manager").off("change:data", null, this);
            }
        },
        
        sync: function() {
            return false;
        },
        
        destroy: function() {
            this.off();
            this.get("manager").off(null, null, this);  
        },
        
        _fetch: function() {
            // We use this method so that the real fetch() method doesn't
            // have unnecessary arguments.
            this.fetch({autofetch: true});  
        },

        /**
         * Requests data for the associated source and manager of this model
         * @param  {Object} [options] Any additional options to send with this request. These will
         * override instance attributes. See the splunk search job rest api for the source specified
         * in this model for acceptable values here.
         */
        fetch: function(options) {
            options = options || {};

            // Extract whether we were called as part of an autofetch
            var isAutofetch = !!options.autofetch;

            // Extract the error/success functions 
            var _success = options.success;
            var _error = options.error;
            
            // Prepare the options dictionary to be reused for fetching the job.
            options = _.omit(options, ['error', 'success', 'autofetch']);
            
            var error = function(options, err) {
                if (_error) {
                    _error(this, err, options);
                }
                return this;
            };

            var manager = this.get("manager");
            if (!manager) {
                return error(options, _("No manager").t());
            }            
            
            var jobData = manager.getJobResponse();
            if (!jobData) {
                return error(options, _("No job").t());
            }
            var links = jobData.entry[0].links;

            var condition = this.get("condition") || defaultCondition;
            
            // We only execute the fetch if it meets our condition, but
            // if we don't have autofetch, we will skip this (as fetch was
            // called manually).
            if (isAutofetch && !condition(manager)) {
                this.trigger('nodata', this);
                return;
            }

            var fetchOptions = this._requestOptions(options);

            var url = this._getUrl(links, fetchOptions.source, fetchOptions);

            // If a request is in flight and we're in serial fetch mode, store
            // the fetch options and wait for the in-flight request to return
            if (this._isFetching && this.get("serialfetch")) {
                // Since we are making it pending - we need to make sure
                // we have the original success/error callbacks in there
                this._pendingFetchOptions = fetchOptions;
                this._pendingFetchOptions.success = _success;
                this._pendingFetchOptions.error = _error;
                return;
            }

            this._isFetching = true;
            
            var model = this;
            delete fetchOptions.source;
            Backbone.ajax({
                url: url,
                error: function(response) {
                    model._pendingFetchOptions = null;
                    model._isFetching = false;

                    var err = splunkDUtils.convertToSDKResponse(response);
                    error(options, err);

                    var message = null;
                    if (err.data && err.data.messages && err.data.messages.length) {
                        message = err.data.messages[0];
                    }
                    var text = message ? message.text : "An error occurred while fetching data.";
                    model.trigger("error", text, err);
                },
                success: function(data, status, res) {
                    var pendingFetchOptions = model._pendingFetchOptions;
                    model._pendingFetchOptions = null;
                    model._isFetching = false;
                    model._data = data;

                    if (_success) {
                        _success(this, data, options);
                    }
                    model.trigger('data', model, data);

                    // Issue another fetch if needed and able
                    if (pendingFetchOptions && !model._isFetching) {
                        var manager = model.get('manager');
                        if (manager && manager.hasJob()) {
                            model.fetch(pendingFetchOptions);
                        }
                    }
                }
            });
        },

        _requestOptions: function(options) {
            // Get the request options and delete everything we don't need.
            var requestOptions = this.toJSON();
            requestOptions = _.omit(requestOptions, [
                'data',
                'manager',
                'autofetch',
                'serialfetch',
                'condition'
            ]);
            
            // We need to take into account whatever the user passed in 
            // for this specific request
            return _.extend(requestOptions, options);
        },

        /**
         * Returns a full url for retrieving data
         * @param {Object} links A map of Job actions to their corresponding endpoints
         * @param {String} source A valid entry in the links map
         * @param {Object} params Params to encode and append to the url
         * @throws {Error} If source is not a valid entry in the job links hash
         * @return {String} url
         */
        _getUrl: function(links, source, params) {
            // For backward compatibility, we accept 'preview', but the endpoint is actually
            // 'results_preview'
            var endpoint = (source === 'preview') ? links['results_preview'] : links[source];

            if (!endpoint) {
                throw new Error('Cannot get a results model, this manager does not support the' +
                                'specified source: ' + source);
            }

            var encodedParams = urlUtil.encode(_.omit(params, 'source'));
            var fullpath = splunkDUtils.fullpath(endpoint);
            return fullpath + '?' + encodedParams;
        },
        
        /**
         * Returns an array of rows containing data.
         * @returns {Object[]} An array of rows.
         */
        data: function() {
            return this._data;
        },
        
        model: function() {
            var model = new Backbone.Model(this.data());
            model.raw = this.data();
            return model;
        },
        
        /**
         * Returns a Backbone collection containing an array of rows of data.
         * @returns {Backbone.Collection} A Backbone collection.
         */
        collection: function() {
            var i, j;
            var data = this.data();
            
            if (!data) {
                return new Backbone.Collection();
            }
            
            var fields = data.fields || [];
            var items = [];
            
            if (data.results) {
                items = data.results;
            }
            else if (data.columns) {
                var columns = data.columns || [];
                
                for(i = 0; i < columns.length; i++) {
                    items.push({
                        field: fields[i],
                        values: columns[i]
                    });
                }
            }
            else if (data.rows) {
                var rows = data.rows || [];
                
                for(i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var item = {};
                    for(j = 0; j < fields.length; j++) {
                        item[fields[j]] = row[j];
                    }
                    items.push(item);
                }
            }
            
            var collection = new Backbone.Collection(items);
            collection.raw = data;
            
            return collection;
        },
        
        /**
         * Indicates whether the object contains data.
         * @returns {Boolean}
         */
        hasData: function() {
            if (this.data()) {
                // In the case of output_mode=json in Splunk 5 --> [{count:0}]
                if (_.isArray(this._data) && this._data.length === 1 && this._data[0].count === 0) {
                    return false;
                }
                
                // In the case of output_mode=json in Splunk 6 --> { results: [], ... }
                if (this._data.results && this._data.results.length === 0) {
                    return false;
                }
                
                // In the case of output_mode=json_{rows|cols} --> { fields: [], ... }
                if (this._data.fields && this._data.fields.length === 0) {
                    return false;
                }
                
                return true;
            }
            
            return false;
        }
    },{
        defaultCondition: defaultCondition,
        identityCondition: identityCondition
    });
    
    return ResultsModel;
});

define([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/searchmanager'
], function($,
            _,
            Backbone,
            SearchManager) {
    /**
     *  A simple mock search manager that can be use with input and visualization view
     *  @example
     *  var search1 = new MockSearchManager({
     *           id: 'search1'
     *  });
     *
     *  bind it to a input or viz element
     *
     *  var input = new DropdownView({
     *      id: 'input',
     *      managerid : 'search1'
     *  })
     *
     *  // you can start emitting mock data by
     *  search1.progress(data,jobContent);
     *  search1.done(data,jobContent);
     *  or
     *  search1.error(errorMessage);
     *
     *  For example:
     *  search1.ready().then(function(){
     *      search1.progress({
     *               "fields": [
     *                   {
     *                       "name": "sourcetype",
     *                       "groupby_rank": "0"
     *                   },
     *                   {
     *                       "name": "count"
     *                   }
     *               ],
     *               "results": [
     *                   {
     *                       "sourcetype": "mongod",
     *                       "count": "176"
     *                   }
     *               ]
     *           }, {
     *               "doneProgress": 0.3,
     *               "resultCount": 3,
     *               "resultPreviewCount": 1
     *           })
     *  })
     */


    var MockResultModel = Backbone.Model.extend({
        DATA_DEFAULTS: {
            init_offset: 0,
            messages: [],
            preview: false
        },
        initialize: function(attributes) {
            Backbone.Model.prototype.initialize.apply(this, arguments);
            this.manager = attributes.manager;
            this.source = attributes.source;
            this.listenTo(this.manager, 'data', function(data) {
                this._data = data;
                this.trigger('data', this, _.extend({}, this.DATA_DEFAULTS, data));
            }, this);
        },
        hasData: function() {
            return this._data;
        },
        data: function() {
            return this._data;
        }
    });

    var MockSearchManager = SearchManager.extend({
        initialize: function() {
            SearchManager.prototype.initialize.apply(this, arguments);
            this._ready = $.Deferred();
        },
        startSearch: function(refresh) {
            //
            this.start({});
        },
        start: function(jobContent, options) {
            var content = {
                content: _.extend({
                    dispatchState: 'RUNNING',
                    isDone: false
                }, jobContent)
            };
            this.trigger('search:start', content);
        },
        progress: function(data, jobContent, options) {
            var content = {
                content: _.extend({
                    dispatchState: 'RUNNING',
                    isDone: false
                }, jobContent)
            };
            this.trigger('data', data);
            this.trigger('search:progress', content);
        },
        done: function(data, jobContent, options) {
            var content = {
                content: _.extend({
                    dispatchState: 'DONE',
                    isDone: true
                }, jobContent)
            };
            this.trigger('data', data);
            this.trigger('search:progress', content);
            this.trigger('search:done', content);
        },
        error: function(error) {
            this.trigger('search:error', error);
        },
        pause: function() {
            //
        },
        unpause: function() {
            //
        },
        finalize: function() {
            //?
        },
        cancel: function() {
            this.trigger("search:cancelled");
        },
        data: function(source, attrs) {
            if (!source) {
                throw new Error("Cannot get a results model without specifying the source.");
            }
            attrs = attrs || {};
            attrs.manager = this;
            attrs.source = source;
            _.defer(this._ready.resolve);
            return new MockResultModel(attrs);
        },
        ready: function() {
            return this._ready.promise();
        }
    });

    return MockSearchManager;
});
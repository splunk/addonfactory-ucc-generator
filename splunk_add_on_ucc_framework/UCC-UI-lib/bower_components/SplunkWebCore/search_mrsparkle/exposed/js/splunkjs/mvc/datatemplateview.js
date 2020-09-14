define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var mvc = require('./mvc');
    var BaseSplunkView = require("./basesplunkview");
    var Messages = require("./messages");
    
    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name DataTemplateView
     * @description The **DataTemplate** view is a generic view that provides 
     * developers with the ability to display an 
     * <a href="http://underscorejs.org/" target="_blank">underscore.js</a> 
     * template and fill it out with the results of an associated search manager.
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {String} [options.data="preview"] - The type of data to retrieve from the
     * search results </br>(`results | preview | events | summary | timeline`).
     * @param {String} [options.managerid=null] - The ID of the search manager to bind 
     * this control to.
     * @param {Boolean} [options.messages=false] - Indicates whether to display messages.
     * @param {Object} [options.settings] - The properties of the view. 
     * @param {String} [options.template] - The template to render. You can specify the 
     * Underscore template inline as a string, or programmatically.
     * @param {String} [options.templateName] - The CSS ID of the template to render. 
     * This ID should refer to an ID that is within a &lt;script&gt; tag. 
     */
    var DataTemplateView = BaseSplunkView.extend(/** @lends splunkjs.mvc.DataTemplateView.prototype */{
        moduleId: module.id,
        
        className: "splunk-datatemplateview",

        options: {
            managerid: null,
            data: "preview",
            template: "",
            templateName: "",
            messages: false
        },

        initialize: function() {
            this.configure();
            this.settings.on("change:template change:templateName", this.render, this);
            
            this.bindToComponentSetting('managerid', this._onManagerChange, this);
            
            // If we don't have a manager by this point, then we're going to
            // kick the manager change machinery so that it does whatever is
            // necessary when no manager is present.
            if (!this.manager) {
                this._onManagerChange(mvc.Components, null);
            }
        },

        _onManagerChange: function(managers, manager) {
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
                this.message('no-search');
                return;
            }
            
            // Clear any messages, since we have a new manager.
            this.message("empty");

            this.manager = manager;            
            this.resultsModel = manager.data(this.settings.get("data"), {
                output_mode: "json"
            });

            manager.on("search:start", this._onSearchStart, this);
            manager.on("search:progress", this._onSearchProgress, this);
            manager.on("search:cancelled", this._onSearchCancelled, this);
            manager.on("search:error", this._onSearchError, this);
            this.resultsModel.on("data", this.render, this);
            this.resultsModel.on("error", this._onSearchError, this);
            
            manager.replayLastSearchEvent(this);
        },

        _onSearchCancelled: function() {
            this._isJobDone = false;
            this.message('cancelled', this.$el);
        },

        _onSearchProgress: function(properties, job) { 
            properties = properties || {};
            var content = properties.content || {};
            var previewCount = content.resultPreviewCount || 0;
            var isJobDone = this._isJobDone = content.isDone || false;

            if (previewCount === 0 && isJobDone) {
                this.message('no-results', this.$el);
                return;
            }
            
            if (previewCount === 0) {
                this.message('waiting', this.$el);
                return;
            }
        },
        
        _onSearchStart: function() {
            this._isJobDone = false;
            this.message('waiting', this.$el);
        },
            
        _onSearchError: function(message, err) {
            this._isJobDone = false;
            var msg = message;
            if(err && err.data && err.data.messages && err.data.messages.length) {
                msg = _(err.data.messages).pluck('text').join('; ');

                // This control clears itself on error 
                this.$el.empty();
            }
            this.message({
                level: "error",
                icon: "warning-sign",
                message: msg
            });
        },
        
        message: function(info) {
            if (this.settings.get("messages")) {
                Messages.render(info, this.$el);
            }
        },

        /**
         * Draws the view to the screen. Called only when you create the view manually.
         */
        render: function() {
            if (this.resultsModel) {
                if (!this.resultsModel.hasData() && this._isJobDone) {
                    this.message("no-results");
                    return this;
                }
            }
            if (!this.resultsModel) {
                return this;
            }

            var template = this.settings.get("template") || "";
            var templateName = this.settings.get("templateName") || "";

            if (!template && templateName) {
                if ($('#' + templateName).length > 0) {
                    template = $('#' + templateName).html();
                }
            }
            
            if (!template) {
                this.message({
                    level: "error",
                    icon: "warning-sign",
                    message: "There is no template to render."
                });
                return;
            }
            
            var html = _.template(template, this.resultsModel.data());
            this.$el.html(html);

            return this;
        }
    });
    
    return DataTemplateView;
});

define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var SplunkUtil = require("splunk.util");
    var SplunkWindow = require("splunk.window");
    var SearchJobModel = require("models/search/Job");
    var Route = require("uri/route");
    var ExportResultsDialog = require("views/shared/jobstatus/buttons/ExportResultsDialog");
    var BaseSplunkView = require("./basesplunkview");
    var mvc = require("./mvc");
    var ReportModel = require('models/search/Report');
    var SavedSearchManager = require("./savedsearchmanager");
    var Utils = require("./utils");
    var sharedModels = require('./sharedmodels');
    var util = require('splunk.util');
    var PostProcessSearchManager = require('./postprocessmanager');

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name ResultsLinkView
     * @description The **ResultsLink** view displays a panel with buttons to 
     * open the search, export results, open the search job inspector, and 
     * refresh the page. This panel is the same as one that is included with the 
     * wrapper for converted visualizations, allowing you to use these controls 
     * with a search directly.
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options 
     * @param {String} options.id - The unique ID for this control. 
     * @param {Boolean} [options.link.exportResults.visible] - Indicates whether to show
     * the **Export** button in the panel.
     * @param {Boolean} [options.link.inspectSearch.visible] - Indicates whether to show
     * the **Inspect** button in the panel.
     * @param {String} [options.link.openSearch.search] - The alternative search query 
     * to use for the **Open in Search** button.
     * @param {String} [options.link.openSearch.searchEarliestTime] - The earliest time 
     * to use for the alternative search specified by **link.openSearch.search**.
     * @param {String} [options.link.openSearch.searchLatestTime] - The latest time to 
     * use for the alternative search specified by **link.openSearch.search**.
     * @param {String} [options.link.openSearch.text="Open in Search"] - The label to 
     * use for the **Open in Search** button.
     * @param {String} [options.link.openSearch.ViewTarget="Search"] - The name of the 
     * target view for the **Open in Search** button.
     * @param {Boolean} [options.link.openSearch.visible] - Indicates whether to show the
     * **Open in Search** button in the panel.
     * @param {Boolean} [options.link.visible=true] - Indicates whether to show link 
     * buttons in the panel.
     * @param {String} [options.managerid=null] - The ID of the search manager to bind 
     * this control to.
     *
     * @example
     * require([
     *     "jquery",
     *     "splunkjs/mvc/searchmanager",
     *     "splunkjs/mvc/resultslinkview",
     *     "splunkjs/mvc/simplexml/ready!"
     *     ], function(
     *         $,
     *         SearchManager,
     *         ResultsLinkView
     *     ) {
     *         
     *     // Instantiate the search manager
     *     var mysearch = new SearchManager({
     *         id: "mysearch",
     *         search: "index=_internal | head 1000 | top 3 sourcetype"
     *     });
     * 
     *     // Instantiate the results link view
     *     var resultsLink = new ResultsLinkView({
     *         id: "resultsLink",
     *         managerid: "mysearch",
     *         "link.exportResults.visible": false,
     *         el: $("#controlpanel")
     *     });
     * 
     *     // Display the results link view
     *     resultsLink.render().$el.appendTo($("controlpanel"));
     * });
     */
    var ResultsLinkView = BaseSplunkView.extend(/** @lends splunkjs.mvc.ResultsLinkView.prototype */{
        moduleId: module.id,
        events: {
            "click a.refresh-button": 'refresh',
            "blur a": "hideResultsLink",
            "focus a": "showResultsLink"
        },
        hideResultsLink: function(evt) {
            var curClass = evt.currentTarget.getAttribute('class');
            this.$el.removeClass('show');
        },
        showResultsLink: function(evt) {
            var curClass = evt.currentTarget.getAttribute('class');
            this.$el.addClass('show');
        },
        configure: function() {
            // Silently rewrite the deprecated 'manager' setting if present
            if (this.options.manager) {
                this.options.managerid = this.options.manager;
            }

            BaseSplunkView.prototype.configure.apply(this, arguments);
        },
        initialize: function() {
            this.configure();
            
            this.bindToComponentSetting('managerid', this.onManagerChange, this);

            this.searchJobModel = new SearchJobModel();
            this.applicationModel = sharedModels.get("app");
            this.userModel = sharedModels.get("user");
            
            this.showExportResultsButton = this.userModel.canExportResults();

            // If this component is not part of an element, it will not 
            // have a ReportModel and needs to create one.
            this.model = this.model || new ReportModel();
            
            //so search/pivot icons re-render whenever panel switches between search/pivot
            this.listenTo(this.model.entry.content, 'change:search', _.bind(this.render, this)); 
        },
        onManagerChange: function(managers, manager) {
            if (this.manager) {
                this.manager.off(null, null, this);
                this.manager = null;
            }

            if (!manager) {
                return;
            }

            this.manager = manager;
            this.listenTo(manager, "search:start", this.onSearchStart);
            this.listenTo(manager, "search:done", this.onSearchDone);

            if (this.manager.hasJob()) {
                this.onSearchStart();
            }
            
            this.manager.replayLastSearchEvent(this);
        },

        onSearchStart: function() {
            var sid = this.manager.getSid();
            this.searchJobModel.set("id", sid);

            if (this.$pivotButton) {
                this.$pivotButton.off("click").on("click", this.openPivot.bind(this)).show(); 
            }
            if (this.$searchButton) {
                this.$searchButton.off("click").on("click", this.openSearch.bind(this)).show();
            }
            if (this.$refreshButton) {
                this.$refreshButton.show();
            }
            if (this.$exportButton) {
                if (this.manager instanceof PostProcessSearchManager) {
                    // Disable Export for post process
                    this.$exportButton.tooltip("destroy");
                    this.$exportButton.attr("title", _("Export - You cannot export results for post-process jobs.").t());
                    this.$exportButton.tooltip({ animation: false, container: "body" });
                    this.$exportButton.addClass("disabled");
                    this.$exportButton.off("click").on("click", function(e) { e.preventDefault(); }).show();
                } else {
                    this.$exportButton.addClass("disabled");
                    this.$exportButton.off("click").on("click", function(e) { e.preventDefault(); }).show();
                }
            }
            if (this.$inspectButton) {
                this.$inspectButton.off("click").on("click", this.inspectSearch.bind(this)).show();
            }
        },

        onSearchDone: function(properties) {
            var jobResponse = this.manager.getJobResponse();
            this.searchJobModel.setFromSplunkD(jobResponse);
            if (this.$exportButton) {
                    if (this.manager instanceof PostProcessSearchManager) {
                        // Disable Export for post process
                        this.$exportButton.tooltip("destroy");
                        this.$exportButton.attr("title", _("Export - You cannot export results for post-process jobs.").t());
                        this.$exportButton.tooltip({ animation: false, container: "body" });
                        this.$exportButton.addClass("disabled");
                        this.$exportButton.off("click").on("click", function(e) { e.preventDefault(); }).show();
                    } else {
                        this.$exportButton.tooltip("destroy");
                        this.$exportButton.attr("title", _("Export").t());
                        this.$exportButton.tooltip({ animation: false, container: "body" });
                        this.$exportButton.removeClass("disabled");
                        this.$exportButton.off("click").on("click", this.exportResults.bind(this)).show();
                    }
            }
        },

        openSearch: function(e) {
            if (e) {
                e.preventDefault();
                $(e.currentTarget).blur();
            }

            var options = this.options;
            var manager = this.manager;
            var params = {};
            var jobProperties = manager.get('data');
            var earliest = options["link.openSearch.searchEarliestTime"];
            if (!earliest && jobProperties.earliestTime){
                earliest = util.getEpochTimeFromISO(jobProperties.earliestTime);
            }
            else {
                earliest = manager.settings.get("earliest_time");
            }
            if (earliest != null) {
                params.earliest = earliest;
            }
            var latest = options["link.openSearch.searchLatestTime"];
            if (!latest && jobProperties.latestTime){
                latest = util.getEpochTimeFromISO(jobProperties.latestTime);
            }
            else {
                latest = manager.settings.get("latest_time");
            }
            if (latest != null) {
                params.latest = latest;
            }
            if (options["link.openSearch.search"]) {
                params.q = options["link.openSearch.search"];
            } else if (!options["link.openSearch.viewTarget"]) {
                params.sid = this.searchJobModel.get("id");
                params.q = manager.settings.resolve();
                if (manager instanceof SavedSearchManager){
                    params['s'] = manager.get('searchname');
                }
            } else {
                params = {
                    sid: this.searchJobModel.get("id")
                };
            }

            var pageInfo = Utils.getPageInfo();
            var url = Route.page(pageInfo.root, pageInfo.locale, pageInfo.app, options["link.openSearch.viewTarget"] || "search", { data: params });

            Utils.redirect(url, true);
        },

        exportResults: function(e) {
            if (e) {
                e.preventDefault();
            }

            var exportDialog = new ExportResultsDialog({
                model: {
                    searchJob: this.searchJobModel,
                    application: this.applicationModel, 
                    report: this.model
                }, 
                usePanelType: true,
                onHiddenRemove: true
            });

            exportDialog.render().appendTo($("body"));
            exportDialog.show();
        },

        inspectSearch: function(e) {
            if (e) {
                e.preventDefault();
                $(e.currentTarget).blur();
            }

            var pageInfo = Utils.getPageInfo();
            var url = Route.jobInspector(pageInfo.root, pageInfo.locale, pageInfo.app, this.searchJobModel.get("id"));

            SplunkWindow.open(url, "splunk_job_inspector", { width: 870, height: 560, menubar: false });
        },

        openPivot: function(e){
            if (e) {
                e.preventDefault();
                $(e.currentTarget).blur();
            }
            var pageInfo = Utils.getPageInfo(), params, url;
            if(this.model.has('id')){
                //saved pivot 
                //URI API: app/search/pivot?s=<reportId>
                //example id: "/servicesNS/admin/simplexml/saved/searches/Report%20Pivot2"
                var id = this.model.get('id');
                params = { s : id };
                if(this.model.entry.content.has('dispatch.earliest_time')) {
                    params.earliest = this.model.entry.content.get('dispatch.earliest_time');
                    params.latedst = this.model.entry.content.get('dispatch.latest_time');
                }
                url = Route.pivot(pageInfo.root, pageInfo.locale, pageInfo.app, { data: params });
                Utils.redirect(url, true);
            }else{
                //inline pivot 
                //URI API: app/search/pivot?q=<search string with pivot command>
                //example search: "| pivot Debugger RootObject_1 count(RootObject_1) AS "Count of RootObject_1" | stats count"
                var search = this.model.entry.content.get('search');
                params = { q : search };
                if(this.model.entry.content.has('dispatch.earliest_time')) {
                    params.earliest = this.model.entry.content.get('dispatch.earliest_time');
                    params.latest = this.model.entry.content.get('dispatch.latest_time');
                }
                url = Route.pivot(pageInfo.root, pageInfo.locale, pageInfo.app, { data: params });
                Utils.redirect(url, true);
            }
        },

        /**
         * Draws the view to the screen. Called only when you create the view manually.
         */
        render: function() {
            var template; 
            if(this.model.isPivotReport() && this.userModel.canPivot()){
                template = _.template(this.pivotTemplate);
            }else{
                template = _.template(this.template);
            }

            this.$el.html(template({
                options: this.options,
                showExportResultsButton: this.showExportResultsButton
            }));

            if (this.resolveBooleanOptions("link.openPivot.visible", "link.visible", true)) {
                this.$pivotButton = this.$(".pivot-button").hide();
            } else {
                this.$(".pivot-button").remove();
            }

            if (this.resolveBooleanOptions("link.openSearch.visible", "link.visible", true)) {
                this.$searchButton = this.$(".search-button").hide();
            } else {
                this.$(".search-button").remove();
            }

            if (this.resolveBooleanOptions("link.exportResults.visible", "link.visible", true)) {
                this.$exportButton = this.$(".export-button").hide();
            } else {
                this.$(".export-button").remove();
            }

            if (this.resolveBooleanOptions("link.inspectSearch.visible", "link.visible", true)) {
                this.$inspectButton = this.$(".inspect-button").hide();
            } else {
                this.$(".inspect-button").remove();
            }

            if (this.resolveBooleanOptions("refresh.link.visible", "link.visible", true)) {
                this.$refreshButton = this.$(".refresh-button").hide();
            } else {
                this.$(".refresh-button").remove();
            }

            if (this.$searchButton || this.$exportButton || this.$inspectButton || this.$refreshButton) {
                this.$el.show();
            } else {
                this.$el.hide();
            }

            this.$("> a").tooltip({ animation: false, container: "body" });

            return this;
        },

        resolveBooleanOptions: function(/*optionName1, optionName2, ..., defaultValue*/) {
            var options = this.options;
            var value;
            for (var i = 0, l = arguments.length - 1; i < l; i++) {
                value = options[arguments[i]];
                if (value != null) {
                    return SplunkUtil.normalizeBoolean(value);
                }
            }
            return SplunkUtil.normalizeBoolean(arguments[arguments.length - 1]);
        },

        refresh: function(event){
            if (event){
                event.preventDefault();
            }
            this.manager.startSearch('refresh');
        },

        template: '\
            <a href="#search" class="search-button btn-pill" title="<%- options[\'link.openSearch.text\'] || _(\'Open in Search\').t() %>">\
                <i class="icon-search"></i>\
                <span class="hide-text"><%- options[\'link.openSearch.text\'] || _("Open in Search").t() %></span>\
            </a>\
            <% if (showExportResultsButton) { %>\
                <a href="#export" class="export-button btn-pill" title="<%- _(\'Export - You can only export results for completed jobs.\').t() %>">\
                    <i class="icon-export"></i>\
                    <span class="hide-text"><%- _("Export").t() %></span>\
                </a>\
            <% } %>\
            <a href="#inspect" class="inspect-button btn-pill" title="<%- _(\'Inspect\').t() %>">\
                <i class="icon-info"></i>\
                <span class="hide-text"><%- _("Inspect").t() %></span>\
            </a><a href="#refresh" class="refresh-button btn-pill" title="<%- _(\'Refresh\').t() %>">\
                <i class="icon-rotate-counter"></i>\
                <span class="hide-text"><%- _("Refresh").t() %></span>\
            </a>\
        ', 

        pivotTemplate: '\
            <a href="#pivot" class="pivot-button btn-pill" title="<%- _(\'Open in Pivot\').t() %>">\
                <i class="icon-pivot"></i>\
                <span class="hide-text"><%- _("Open in Pivot").t() %></span>\
            </a>\
            <% if (showExportResultsButton) { %>\
                <a href="#export" class="export-button btn-pill" title="<%- _(\'Export\').t() %>">\
                    <i class="icon-export"></i>\
                    <span class="hide-text"><%- _("Export").t() %></span>\
                </a>\
            <% } %>\
            <a href="#inspect" class="inspect-button btn-pill" title="<%- _(\'Inspect\').t() %>">\
                <i class="icon-info"></i>\
                <span class="hide-text"><%- _("Inspect").t() %></span>\
            </a><a href="#refresh" class="refresh-button btn-pill" title="<%- _(\'Refresh\').t() %>">\
                <i class="icon-rotate-counter"></i>\
                <span class="hide-text"><%- _("Refresh").t() %></span>\
            </a>\
        '
    });
    
    return ResultsLinkView;
});

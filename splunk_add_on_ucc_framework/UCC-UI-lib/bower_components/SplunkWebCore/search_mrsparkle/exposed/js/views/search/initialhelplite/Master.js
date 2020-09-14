define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/search/initialhelplite/What',
        'views/search/searchhistory/Master',
        'models/search/Job',
        'models/services/search/jobs/Result',
        'collections/services/data/Indexes',
        'splunk.util',
        'util/time',
        'uri/route'
    ],
    function(_,
        $,
        module,
        Base,
        What,
        SearchHistoryView,
        JobModel,
        ResultModel,
        IndexCollection,
        splunk_util,
        time_utils,
        route
    ) {
        return Base.extend({
            moduleId: module.id,
            className:'section-content',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.searchHistory = new SearchHistoryView({
                    model: {
                        application: this.model.application,
                        searchBar: this.model.searchBar,
                        uiPrefs: this.model.uiPrefs
                    }
                });
            },
            activate: function (){
                if (!this.model.hostsJob && !this.model.sourcesJob && !this.model.sourcetypesJob) {
                    var sourcetypesJobDeferred = $.Deferred(),
                        hostsJobDeferred = $.Deferred(),
                        sourcesJobDeferred = $.Deferred(),
                        minDelay = 6000,
                        maxTries = 10;

                    this.model.hostsResult = new ResultModel();
                    this.model.hostsResult.fetchData.set({count: 50}, {silent: true});
                    this.model.sourcesResult = new ResultModel();
                    this.model.sourcesResult.fetchData.set({count: 50}, {silent: true});
                    this.model.sourcetypesResult = new ResultModel();
                    this.model.sourcetypesResult.fetchData.set({count: 50}, {silent: true});
                    
                    this.model.hostsJob = JobModel.createMetaDataSearch(
                        '| metadata type=hosts | search totalCount > 0 | table host totalCount recentTime | fieldformat totalCount=tostring(totalCount, "commas") | fieldformat recentTime=strftime(recentTime, "' + time_utils.ISO_PATTERN + '")',
                        hostsJobDeferred,
                        this.model.application,
                        minDelay,
                        {data: {provenance: 'UI:Search'}}
                    );
                    
                    this.model.sourcesJob = JobModel.createMetaDataSearch(
                        '| metadata type=sources | search totalCount > 0 | table source totalCount recentTime | fieldformat totalCount=tostring(totalCount, "commas") | fieldformat recentTime=strftime(recentTime, "' + time_utils.ISO_PATTERN + '")',
                        sourcesJobDeferred,
                        this.model.application,
                        minDelay,
                        {data: {provenance: 'UI:Search'}}
                    );
                    
                    this.model.sourcetypesJob = JobModel.createMetaDataSearch(
                        '| metadata type=sourcetypes | search totalCount > 0 | table sourcetype totalCount recentTime | fieldformat totalCount=tostring(totalCount, "commas") | fieldformat recentTime=strftime(recentTime, "' + time_utils.ISO_PATTERN + '")',
                        sourcetypesJobDeferred,
                        this.model.application,
                        minDelay,
                        {data: {provenance: 'UI:Search'}}
                    );

                    $.when(hostsJobDeferred).then(function() {
                        this.model.hostsJob.registerJobProgressLinksChild(
                            JobModel.RESULTS_PREVIEW,
                            this.model.hostsResult,
                            function() {
                                var resultPreviewCount = this.model.hostsJob.entry.content.get("resultPreviewCount");
                                if (_.isNumber(resultPreviewCount) && (resultPreviewCount > 0)) {
                                    this.model.hostsResult.safeFetch();
                                }
                            },
                            this
                        );
                    }.bind(this));

                    $.when(sourcesJobDeferred).then(function() {
                        this.model.sourcesJob.registerJobProgressLinksChild(
                            JobModel.RESULTS_PREVIEW,
                            this.model.sourcesResult,
                            function() {
                                var resultPreviewCount = this.model.sourcesJob.entry.content.get("resultPreviewCount");
                                if (_.isNumber(resultPreviewCount) && (resultPreviewCount > 0)) {
                                    this.model.sourcesResult.safeFetch();
                                }
                            },
                            this
                        );
                    }.bind(this));
                    
                    $.when(sourcetypesJobDeferred).then(function() {                        
                        this.model.sourcetypesJob.registerJobProgressLinksChild(
                            JobModel.RESULTS_PREVIEW,
                            this.model.sourcetypesResult,
                            function() {
                                var resultPreviewCount = this.model.sourcetypesJob.entry.content.get("resultPreviewCount");
                                if (_.isNumber(resultPreviewCount) && (resultPreviewCount > 0)) {
                                    this.model.sourcetypesResult.safeFetch();
                                }
                            },
                            this
                        );
                    }.bind(this));

                    $.when(hostsJobDeferred, sourcesJobDeferred, sourcetypesJobDeferred).then(function(){
                        this.model.hostsJob.startPolling();
                        this.model.sourcesJob.startPolling();
                        this.model.sourcetypesJob.startPolling();

                        this.children.what = new What({
                            model: {
                                report: this.model.report,
                                sourcetypesJob: this.model.sourcetypesJob,
                                hostsJob: this.model.hostsJob,
                                sourcesJob: this.model.sourcesJob,
                                sourcetypesResult: this.model.sourcetypesResult,
                                hostsResult: this.model.hostsResult,
                                sourcesResult: this.model.sourcesResult,
                                application: this.model.application,
                                serverInfo: this.model.serverInfo,
                                metaDataResult: this.model.metaDataResult,
                                user: this.model.user
                            }
                        });
                        this.children.what.render().appendTo(this.$(".column-what"));
                    }.bind(this));
                }

                setTimeout(this.deactivate.bind(this), minDelay*maxTries);

                return Base.prototype.activate.call(this, arguments);
            },
            deactivate: function() {
                if (!this.active) {
                    return Base.prototype.deactivate.call(this, arguments);
                }
                if (this.model.hostsJob && this.model.sourcesJob && this.model.sourcetypesJob) {
                    if (this.model.hostsJob.isRunning() || this.model.sourcesJob.isRunning() || this.model.sourcetypesJob.isRunning()){
                        this.model.hostsJob.stopPolling();
                        this.model.sourcesJob.stopPolling();
                        this.model.sourcetypesJob.stopPolling();
                    }
                }

                Base.prototype.deactivate.call(this, arguments);
            },
            render: function() {
                var template = _.template(this.template),
                    root = this.model.application.get("root"),
                    locale = this.model.application.get("locale"),
                    app = this.model.application.get("app"),
                    version = this.model.appLocal.entry.content.get('version'),
                    extractFieldsUrl = route.page(this.model.application.get('root'), this.model.application.get('locale'), 'search', 'field_extractor'),
                    link = splunk_util.sprintf(_('Add or forward data to Splunk Light. Afterwards, you may <a href="%s">extract fields</a>').t(), extractFieldsUrl);

                this.$el.html(this.compiledTemplate({
                    _: _,
                    searchExamplesRoute: route.docHelp(root, locale, 'search_app.search_examples'),
                    gettingStartedRoute: route.docHelp(root, locale, 'search_app.getting_started'),
                    addDataRoute: route.manager(root, locale, app, 'adddata'),
                    link: link,
                    isAdmin: this.model.user.isAdmin() || this.model.user.isCloudAdmin()
                }));
                this.children.searchHistory.render().appendTo(this.$el);
                return this;
            },
            template: '\
                <div class="column column-what">\
                </div>\
                <div class="column column-how">\
                    <% if (isAdmin) { %>\
                        <h3><%- _("Data").t() %></h3>\
                        <a href="<%- addDataRoute %>" title="<%- _("Add Data").t() %>" class="btn btn-wide add-data"><%- _("Add Data").t() %></a>\
                        <p><%=link%></p>\
            	<% } %>\
                    <ul class="howto">\
                        <h3><%- _("Documentation").t() %></h3>\
                        <li><a href="<%- gettingStartedRoute %>" class="external" target="_blank" title="<%- _("Getting Started").t() %>"><%- _("Getting Started").t() %></a></li>\
                        <li><a href="<%- searchExamplesRoute %>" class="external" target="_blank" title="<%- _("Search Examples").t() %>"><%- _("Search Examples").t() %></a></li>\
                        <li><a href="http://www.splunk.com/view/SP-CAAAN57" class="external" target="_blank" title="<%- _("Video Product Tour").t() %>"><%- _("Video Product Tour").t() %></a></li>\
                    </ul>\
                </div>\
            '
        });
    }
);

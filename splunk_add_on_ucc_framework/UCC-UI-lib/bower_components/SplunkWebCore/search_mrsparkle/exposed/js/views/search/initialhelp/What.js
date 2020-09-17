define(
    [
        'jquery',
        'underscore',
        'module',
        'models/search/Job',
        'models/services/search/jobs/Result',
        'views/Base',
        'views/search/initialhelp/datasummary/Master',
        'util/time',
        'splunk.util'
    ],
    function($, _, module, JobModel, ResultModel, Base, DataSummaryModal, time_utils, splunkUtil) {
        return Base.extend({
            moduleId: module.id,
            className:'column help-column column-what',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

            },
            startListening: function() {
                this.listenTo(this.model.metaDataResult, 'sync', this.render);  
            },
            events: {
                'click a.btn-data-summary': function(e) {
                    e.preventDefault();
                    
                    if (this.$("a.btn-data-summary").hasClass("disabled")) {
                        return;
                    } else {
                        this.$("a.btn-data-summary").addClass("disabled");
                    }
                    
                    var sourceTypesJobDeferred = $.Deferred(),
                        hostsJobDeferred = $.Deferred(),
                        sourcesJobDeferred = $.Deferred();
                    
                    this.model.sourceTypesResult = new ResultModel();
                    this.model.sourceTypesResult.fetchData.set({count: 50}, {silent: true});
                    this.model.hostsResult = new ResultModel();
                    this.model.hostsResult.fetchData.set({count: 50}, {silent: true});
                    this.model.sourcesResult = new ResultModel();
                    this.model.sourcesResult.fetchData.set({count: 50}, {silent: true});
                    
                    this.model.sourceTypesJob = JobModel.createMetaDataSearch(
                        '| metadata type=sourcetypes | search totalCount > 0 | table sourcetype totalCount recentTime | fieldformat totalCount=tostring(totalCount, "commas") | fieldformat recentTime=strftime(recentTime, "' + time_utils.ISO_PATTERN + '")',
                        sourceTypesJobDeferred,
                        this.model.application,
                        undefined,
                        {data: {provenance: 'UI:Search'}}
                    );
                    
                    $.when(sourceTypesJobDeferred).then(function() {                        
                        this.model.sourceTypesJob.registerJobProgressLinksChild(
                            JobModel.RESULTS_PREVIEW,
                            this.model.sourceTypesResult,
                            function() {
                                var resultPreviewCount = this.model.sourceTypesJob.entry.content.get("resultPreviewCount");
                                if (_.isNumber(resultPreviewCount) && (resultPreviewCount > 0)) {
                                    this.model.sourceTypesResult.safeFetch();
                                }
                            },
                            this
                        );
                    }.bind(this));
                    
                    this.model.hostsJob = JobModel.createMetaDataSearch(
                        '| metadata type=hosts | search totalCount > 0 | table host totalCount recentTime | fieldformat totalCount=tostring(totalCount, "commas") | fieldformat recentTime=strftime(recentTime, "' + time_utils.ISO_PATTERN + '")',
                        hostsJobDeferred,
                        this.model.application,
                        undefined,
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
                    
                    this.model.sourcesJob = JobModel.createMetaDataSearch(
                        '| metadata type=sources | search totalCount > 0 | table source totalCount recentTime | fieldformat totalCount=tostring(totalCount, "commas") | fieldformat recentTime=strftime(recentTime, "' + time_utils.ISO_PATTERN + '")',
                        sourcesJobDeferred,
                        this.model.application,
                        undefined,
                        {data: {provenance: 'UI:Search'}}
                    );
                    
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
                    
                    $.when(sourceTypesJobDeferred, hostsJobDeferred, sourcesJobDeferred).then(function(){
                        this.model.sourceTypesJob.startPolling();
                        this.model.hostsJob.startPolling();
                        this.model.sourcesJob.startPolling();
                        
                        this.children.dataSummaryModal = new DataSummaryModal({
                            model: {
                                report: this.model.report,
                                sourceTypesJob: this.model.sourceTypesJob,
                                hostsJob: this.model.hostsJob,
                                sourcesJob: this.model.sourcesJob,
                                sourceTypesResult: this.model.sourceTypesResult,
                                hostsResult: this.model.hostsResult,
                                sourcesResult: this.model.sourcesResult,
                                application: this.model.application,
                                serverInfo: this.model.serverInfo
                            },
                            onHiddenRemove: true
                        });

                        this.children.dataSummaryModal.render().appendTo($("body")).show();
                        
                        this.children.dataSummaryModal.on("hidden", function(){                            
                            this.model.sourceTypesJob.destroy();
                            this.model.hostsJob.destroy();
                            this.model.sourcesJob.destroy();
                            this.$("a.btn-data-summary").removeClass("disabled");
                        }, this);
                    }.bind(this));
                }
            },
            render: function() {
                var result = this.model.metaDataResult.results.at(0),
                    hasResult = !!result,
                    cntEvents, earliestRel, latestRel, latestTimeRaw, now;
                
                if (hasResult) {
                    cntEvents = result.get('cnt')[0] || '0';
                    earliestRel = time_utils.convertToRelativeTime(parseInt(result.get('min')[0], 10)) || _('N/A').t();
                    latestTimeRaw = parseInt(result.get('max')[0], 10);
                    now = (new Date()).getTime()/1000;
                    if (latestTimeRaw >= now) {
                        latestRel = _('Now').t();
                    } else {
                        latestRel = time_utils.convertToRelativeTime(latestTimeRaw) || _('N/A').t();
                    }
                }
                
                this.el.innerHTML = this.compiledTemplate({
                    _: _,
                    hasResult: hasResult,
                    cntEvents: cntEvents,
                    earliestRel: earliestRel,
                    latestRel: latestRel,
                    enableMetaData: splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.enableMetaData')),
                    showDataSummary: splunkUtil.normalizeBoolean(this.model.report.entry.content.get('display.prefs.showDataSummary'))
                });
                return this;
            },
            template: '\
                <h3><%- _("What to Search").t() %></h3>\
                <% if (enableMetaData) { %>\
                    <div class="what-columns">\
                        <% if (hasResult) { %>\
                            <div style="float:left; width: 30%;">\
                                <%- format_decimal(cntEvents) %> <%- _("Events").t() %><br>\
                                <span style="text-transform: uppercase; color: #999; font-size: 11px;"><%- _("Indexed").t() %></span>\
                            </div>\
                            <div style="float:left;  width: 30%;">\
                                <%= earliestRel %> <br>\
                                <span style="text-transform: uppercase; color: #999; font-size: 11px;"><%- _("Earliest Event").t() %></span>\
                            </div>\
                            <div style="float:left; width: 30%;">\
                                <%= latestRel %> <br>\
                                <span style="text-transform: uppercase; color: #999; font-size: 11px;"><%- _("Latest Event").t() %></span>\
                            </div>\
                        <% } else { %>\
                            <%- _("Waiting for data...").t() %>\
                        <% } %>\
                    </div>\
                <% } %>\
                <% if (showDataSummary) { %>\
                    <a href="#" class="btn btn-data-summary" style="margin-bottom: 10px<% if (!enableMetaData) { %>;margin-top: 60px<% } %>" title="<%- _("View sources, source types and hosts.").t() %>"><%- _("Data Summary").t() %></a>\
                <% } %>\
            '
        });
    }
);

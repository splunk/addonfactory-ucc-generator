define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'uri/route',
        'util/time',
        'splunk.util',
        'splunk.i18n'
    ],
    function(
        $,
        _,
        module,
        Base,
        route,
        time_utils,
        splunkUtil,
        i18n
    ){
        /**
         * @constructor
         * @memberOf views
         * @name JobOverviewView
         * @description
         * @extends {Base}
         */
        return Base.extend(/** @lends views.Base.prototype */{
            moduleId: module.id,
            className: "job-overview",
            /**
             * @param {Object} options {
             *      model: {
             *         searchJob: <model.search.job>
             *         application: <model.shared.application>
             *      }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            
            /**
             * Returns the Splunk formatted dateTime for the given ISO date string.
             * @param {ISO Date String} isoDate.
             * @returns {DateTime} Splunk formatted dateTime string.
             */
            getFormattedTimeFromIso: function(isoDate) {
                var jsDate = time_utils.isoToDateObject(isoDate);
                return i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(jsDate));
            },
            
            render: function() {
                var earliestTime = _.isUndefined(this.model.searchJob.entry.content.get('earliestTime')) ?
                        _("(earliest indexed event)").t() :
                        this.getFormattedTimeFromIso(this.model.searchJob.entry.content.get('earliestTime')),
                    latestTime = _.isUndefined(this.model.searchJob.entry.content.get('latestTime')) ?
                        _("(latest indexed event)").t() :
                        this.getFormattedTimeFromIso(this.model.searchJob.entry.content.get('latestTime'));
                
                this.$el.html(this.compiledTemplate({
                    splunkUtil: splunkUtil,
                    i18n: i18n,
                    route: route,
                    searchJob: this.model.searchJob,
                    application: this.model.application,
                    earliestTime: earliestTime,
                    latestTime: latestTime,
                    docLink: route.docHelp(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        "inspector.noresults")   
                }));
                
                return this;
            },
            
            template: '\
                <div class="summary">\
                    <% if (searchJob.entry.content.get("isZombie")) { %>\
                        <p><%- _("This search has encountered a fatal error and has been marked as zombied.").t() %></p>\
                    <% } else if (searchJob.entry.content.get("isFailed")) { %>\
                        <p>\
                            <%- _("This search did not successfully execute.  Any results returned from this job \
                                are not consistent and should not be used.").t() \
                            %>\
                        </p>\
                        <pre><%- this.model.searchJob.getSearch() %></pre>\
                    <% } else if (searchJob.entry.content.get("isPaused")) { %>\
                        <p><%- _("This search is currently paused and must be unpaused before continuing.").t() %></p>\
                    <% } else if (!searchJob.entry.content.get("isDone")) { %>\
                        <p>\
                            <%- splunkUtil.sprintf(_("This search is still running and is approximately %s \
                                complete.").t(), i18n.format_percent(searchJob.entry.content.get("doneProgress"))) \
                            %>\
                        </p>\
                    <% } else if (searchJob.entry.content.get("isDone")) { %>\
                        <% if (searchJob.entry.content.get("resultCount") == 0) { %>\
                            <% if (searchJob.entry.content.get("eventCount") == 0) { %>\
                                <p>\
                                    <%- splunkUtil.sprintf(_("This search has completed in %s seconds, but did not match any events.  The terms \
                                        specified in the highlighted portion of the search:").t(), i18n.format_number(searchJob.entry.content.get("runDuration"))) \
                                    %>\
                                </p>\
                                <pre>\
                                    <span class="highlighted"><%- searchJob.entry.content.get("eventSearch") %></span>\
                                    <% if (searchJob.entry.content.get("reportSearch")) { %>\
                                        <span><%- searchJob.entry.content.get("reportSearch") %></span>\
                                    <% } %>\
                                </pre>\
                                <p>\
                                    <%- _("over the time range:").t() %>\
                                </p>\
                                <pre>\
                                    <%- earliestTime %> - <%- latestTime %>\
                                </pre>\
                                <p>\
                                    <%- _("did not return any data.  Possible solutions are to:").t() %>\
                                </p>\
                                <ul>\
                                    <li><%- _("relax the primary search criteria").t() %></li>\
                                    <li><%- _("widen the time range of the search").t() %></li>\
                                    <li>\
                                        <%- _("check that the default search indexes for your account include the desired indexes").t() %>\
                                    </li>\
                                </ul>\
                            <% } else if (searchJob.entry.content.get("reportSearch") != "None" && \
                                        searchJob.entry.content.get("reportSearch").length > 0 ) { %>\
                                <%= splunkUtil.sprintf(_("This search has completed and found <span class=\'emphatic\'>%(eventCount)s </span>\
                                      matching %(entityName)s in %(runDuration)s seconds. However, the transforming commands in the \
                                      highlighted portion of the following search:").t(), \
                                      {eventCount: i18n.format_number(searchJob.entry.content.get("eventCount")), \
                                       entityName: i18n.ungettext("event", "events", searchJob.entry.content.get("eventCount")), \
                                       runDuration: i18n.format_number(searchJob.entry.content.get("runDuration"))\
                                      })\
                                %>\
                                <pre>\
                                    <% if (searchJob.entry.content.get("eventSearch")) { %>\
                                        <span class="muted">\
                                            <%- searchJob.entry.content.get("eventSearch") %> |\
                                        </span>\
                                    <% } %>\
                                    <span class="highlighted">\
                                        <%- searchJob.entry.content.get("reportSearch") %>\
                                    </span>\
                                </pre>\
                                <p>\
                                    <%- _("over the time range:").t() %>\
                                </p>\
                                <pre>\
                                    <%- earliestTime %> - <%- latestTime %>\
                                </pre>\
                                <p>\
                                    <%- _("generated no results.  Possible solutions are to:").t() %>\
                                </p>\
                                <ul>\
                                    <li><%- _("check the syntax of the commands").t() %></li>\
                                    <li>\
                                        <%- _("verify that the fields expected by the report commands are present in the events").t() %>\
                                    </li>\
                                </ul>\
                            <% } else { %>\
                                <p>\
                                    <%- _("This search has completed, but did not return any results.").t() %>\
                                </p>\
                            <% } %>\
                            <p>\
                                <%- _("Learn more about troubleshooting empty search results at").t() %>\
                                <a target="_blank" href="<%- docLink %>" title="<%- _("Splunk help").t() %>">\
                                    <%- _("Splunk Documentation").t() %>\
                                    <i class="icon-external"></i>\
                                </a>\
                            </p>\
                        <% } else { %>\
                            <p>\
                                <%= splunkUtil.sprintf(_("This search has completed and has returned <span class=\'emphatic\'>%(resultCount)s</span> %(resultEntity)s  \
                                by scanning <span class=\'emphatic\'>%(scanCount)s</span> %(eventEntity)s in <span class=\'emphatic\'>%(runDuration)s </span> seconds").t(), {\
                                    resultCount: i18n.format_number(searchJob.entry.content.get("resultCount")),\
                                    resultEntity: i18n.ungettext("result", "results", searchJob.entry.content.get("resultEntity")),\
                                    scanCount: i18n.format_number(searchJob.entry.content.get("scanCount")),\
                                    eventEntity: i18n.ungettext("event", "events", searchJob.entry.content.get("eventEntity")),\
                                    runDuration: i18n.format_number(searchJob.entry.content.get("runDuration"))\
                                })\
                                %>\
                            </p>\
                            <% if (searchJob.entry.content.get("isSavedSearch")) { %>\
                                <p>\
                                    <%- _("This search is an instance of the saved search:").t() %>\
                                    <span class="emphatic"><%- searchJob.entry.content.get("label") %></span>\
                                </p>\
                            <% } %>\
                        <% } %>\
                        <% if (searchJob.entry.content.get("messages").length > 0) { %>\
                            <div class="messages">\
                                <p><%- _("The following messages were returned by the search subsystem:").t() %></p>\
                                <ul>\
                                    <% _.each(searchJob.getMessages(),function(message) { %>\
                                        <li>\
                                            <%- message.type %> : \
                                            <span class="text"> <%= splunkUtil.getWikiTransform(message.text) %> </span>\
                                            <% if (message.help) { %>\
                                                <a href="<%- route.docHelp(application.get("root"), application.get("locale"), message.help) %>"\
                                                    target="_blank">\
                                                    <%- _("Learn More").t() %>\
                                                    <i class="icon-external"></i>\
                                                </a>\
                                            <% } %>\
                                        </li>\
                                    <% }) %> \
                                </ul>\
                            </div>\
                        <% } %>\
                    <% } %>\
                </div>\
                <p>\
                    (<%- _("SID:").t() %> \
                    <%- searchJob.id %>)\
                    <% _.each(searchJob.getAvailableSearchLogs(), function(link) { %>\
                        <a class="search-log" href="<%- route.searchJobUrls(application.get("root"), \
                                                        application.get("locale"), \
                                                        searchJob.id, \
                                                        link, \
                                                        {data: {outputMode:"raw"}}) %>">\
                            <%- link %>\
                        </a>\
                    <% }) %>\
                </p>\
            '
        });
    }
);
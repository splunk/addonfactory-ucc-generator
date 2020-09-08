define(
    [
        'underscore',
        'module',
        'views/Base',
        'uri/route',
        'util/time',
        'splunk.util',
        'splunk.i18n'
    ],
    function(
        _,
        module,
        BaseView,
        route,
        time_utils,
        splunkUtil,
        i18n
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'more-info',
            initialize: function(options) {
                options = options || {};
                var defaults = {
                    cols: 1
                };
                _.defaults(options, defaults);
                BaseView.prototype.initialize.call(this, options);
            },

            render: function() {
                var savedSearchId = this.model.job.getSavedSearchId(),
                    earliestTimeISO = this.model.job.entry.content.get("earliestTime"),
                    isRealTime = this.model.job.isRealtime(),
                    latestTimeISO = this.model.job.latestTimeSafe(),
                    linkData = { 
                        data: {
                            sid: this.model.job.id 
                        }
                    },
                    search;
                
                if (savedSearchId) {
                    linkData.data.s = savedSearchId;
                    search = this.model.job.entry.content.get('label');
                } else {
                    search = splunkUtil.stripLeadingSearchCommand(this.model.job.getSearch());
                }
                
                var currentAppName = this.model.application.get('app'),
                    alternateAppName = (currentAppName !== 'system' && currentAppName !== 'launcher') ? currentAppName : 'search',
                    jobAppName = this.model.job.entry.acl.get('app'),
                    jobApp = _.find(this.collection.apps.models, function(app) {return app.entry.get('name') === jobAppName;}),
                    openInAppName = (jobApp && jobApp.entry.content.get('visible')) ? jobAppName : alternateAppName;
                                
                this.$el.html(this.compiledTemplate({
                    link: route.search(this.model.application.get('root'), this.model.application.get('locale'), openInAppName, linkData),
                    search: search,
                    earliest_date: this.model.job.isOverAllTime() ? null : time_utils.isoToDateObject(earliestTimeISO),
                    latest_date: latestTimeISO ? time_utils.isoToDateObject(latestTimeISO) : new Date(0),
                    isRealTime: isRealTime,
                    cols: this.options.cols,
                    splunkUtil: splunkUtil,
                    time_utils: time_utils,
                    savedSearchId: savedSearchId,
                    i18n: i18n
                }));
                
                return this;
            },
            
            template: '\
                <td class="details" colspan="<%= cols %>">\
                    <% if (search) { %>\
                        <a href="<%= link %>" class="search<% if (savedSearchId) { %> saved-search<% }%>"><%- search %></a>\
                        <span class="timerange">\
                            <% if (isRealTime) { %>\
                                <%- _("[real-time]").t() %>\
                            <% } else if (earliest_date) { %>\
                                <%- splunkUtil.sprintf(_("[%s to %s]").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(earliest_date)), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                            <% } else { %>\
                                <%- splunkUtil.sprintf(_("[before %s]").t(), i18n.format_datetime_microseconds(time_utils.jsDateToSplunkDateTimeWithMicroseconds(latest_date))) %>\
                            <% } %>\
                        </span>\
                    <% } %>\
                </td>\
            '
        });
    }
);

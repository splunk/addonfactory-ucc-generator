define(['underscore', 'module', 'views/search/results/shared/BaseTab', 'splunk.i18n'], function(_, module, BaseTab, i18n) {
    return BaseTab.extend({
        initialize: function(options) {
            options = options || {};
            options.tab = 'statistics';
            options.type = 'statistics';
            BaseTab.prototype.initialize.call(this, options);
        },
        startListening: function() {
            this.listenTo(this.model.searchJob.entry.content, 'change:resultPreviewCount change:resultCount change:dispatchState', this.debouncedRender);
            BaseTab.prototype.startListening.apply(this, arguments);
        },
        render: function() {
            this.$el.html(this.compiledTemplate({
                _: _,
                searchJob: this.model.searchJob,
                i18n: i18n
            }));
            this.toggleActive();
            return this;
        },
        template:'\
            <a href="#" data-tab="statistics" data-type="statistics">\
                <% if (searchJob.isNew() || !searchJob.entry.content.get("reportSearch")) { %>\
                    <%- _("Statistics").t() %>\
                <% } else { %>\
                    <%- _("Statistics").t() %> (<%= i18n.format_decimal(searchJob.resultCountSafe()) %>)\
                <% } %>\
            </a>\
        '
    });
});

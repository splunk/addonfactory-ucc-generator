define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'uri/route',
        'util/time',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        route,
        timeUtil,
        splunkUtil
    ) {
        return BaseView.extend({
            className: 'message-wrapper',
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click a.open-in-search': function(e) {
                    e.preventDefault();
                    var data = {s: this.model.report.id},
                        routeString = route.search(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            {data: data}
                        );

                    window.location = routeString;
                },

                'click a.reload-report': function(e) {
                    e.preventDefault();
                    this.model.searchJob.trigger('reload', {replaceState: true});
                },

                'click a.enable-report': function(e) {
                    e.preventDefault();
                    this.model.report.save({disabled: false}, {wait: true});
                }
            },

            activate: function(options) {
                if (this.$el.html()) {
                    this.render();
                }
                return BaseView.prototype.activate.call(this, options);
            },

            startListening: function() {
                this.listenTo(this.model.report.entry.content, 'change:cron_schedule', this.render);
            },
        
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _:_,
                    disabled: this.model.report.entry.content.get('disabled'),
                    isScheduled: this.model.report.entry.content.get('is_scheduled'),
                    canWrite: this.model.report.canWrite(this.model.user.canScheduleSearch(), this.model.user.canRTSearch())
                }));
                return this;
            },

            template: '\
                <% if (disabled) { %>\
                    <h2><%- _("There are no results because the report is disabled.").t() %></h2>\
                <% } else if (isScheduled) { %>\
                    <h2><%- _("There are no results because the first scheduled run of the report has not completed.").t() %></h2>\
                <% } %>\
                <p>\
                    <% if (disabled && canWrite) { %>\
                        <a href="#" class="btn enable-report"><%- _("Enable Report").t() %></a>\
                    <% } %>\
                    <a href="#" class="btn open-in-search"><%- _("Open in Search").t() %></a>\
                </p>\
            '
        });
    }
);
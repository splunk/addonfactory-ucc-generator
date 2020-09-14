define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/Modal',
        'uri/route',
        'util/time'
     ],
     function($, _, module, Base, Modal, route, time_utils){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click .createDashboard': function(e) {
                    this.trigger("addToDashboardPanel");
                    e.preventDefault();
                },
                'click .routeToReport': function(e) {
                    window.location = route.report(this.model.application.get('root'),
                                        this.model.application.get('locale'),
                                        this.model.application.get("app"),
                                        {data: this.getData()});
                    e.preventDefault();
                },
                'click .routeToPermissions': function(e) {
                    window.location = route.report(this.model.application.get('root'),
                                        this.model.application.get('locale'),
                                        this.model.application.get("app"),
                                        {data: $.extend(this.getData(), {dialog: 'permissions'})});
                    e.preventDefault();
                },
                'click .routeToSchedule': function(e) {
                    window.location = route.report(this.model.application.get('root'),
                                        this.model.application.get('locale'),
                                        this.model.application.get("app"),
                                        {data: $.extend(this.getData(), {dialog: 'schedule'})});
                    e.preventDefault();
                },
                'click .routeToAccleration': function(e) {
                    window.location = route.report(this.model.application.get('root'),
                                        this.model.application.get('locale'),
                                        this.model.application.get("app"),
                                        {data: $.extend(this.getData(), {dialog: 'acceleration'})});
                    e.preventDefault();
                },
                'click .routeToEmbed': function(e) {
                    window.location = route.report(this.model.application.get('root'),
                                        this.model.application.get('locale'),
                                        this.model.application.get("app"),
                                        {data: $.extend(this.getData(), {dialog: 'embed'})});
                    e.preventDefault();
                }
            },
            getData: function() {
                var data = {
                    s: this.model.inmem.id
                };

                if (this.model.searchJob) {
                    data.sid = this.model.searchJob.id;
                }

                return data;
            },
            render: function() {
                var canChangePerms = this.model.inmem.entry.acl.get("can_change_perms"),
                    canScheduleSearch = this.model.user.canScheduleSearch(),
                    canAccelerateReport = this.model.user.canAccelerateReport(),
                    isRealTimeSearch = this.model.inmem.isRealTime(),
                    canEmbed = this.model.user.canEmbed(),
                    isPivot = this.model.inmem.isPivotReport();

                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Your Report Has Been Saved").t());

                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    _: _,
                    model: this.model.inmem,
                    isRealTimeSearch: isRealTimeSearch,
                    canChangePerms: canChangePerms,
                    canScheduleSearch: canScheduleSearch,
                    canAccelerateReport: canAccelerateReport,
                    canEmbed: canEmbed,
                    isPivot: isPivot
                }));

                if (canChangePerms || canScheduleSearch && (!isRealTimeSearch || !isPivot)) {
                    this.$('span.save-report-success-message').text(_("You may now view your report, add it to a dashboard, change additional settings, or continue editing it.").t());
                } else {
                    this.$('span.save-report-success-message').text(_("You may now view your report, add it to a dashboard, or continue editing it.").t());
                    this.$('p.additional-settings').remove();
                }


                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CONTINUE);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn createDashboard">' + _('Add to Dashboard').t() + '</a>');
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#"class="btn btn-primary modal-btn-primary routeToReport">' + _('View').t() + '</a>');

                return this;
            },
            focus: function() {
                this.$('.btn-primary').focus();
            },
            template: '\
                <p>\
                    <span class="save-report-success-message"></span>\
                </p>\
                <p class="additional-settings">\
                    <%- _("Additional Settings:").t() %>\
                    <ul>\
                        <% if (canChangePerms) { %>\
                            <li><a href ="#" class="routeToPermissions"><%- _("Permissions").t() %></a></li>\
                        <% } %>\
                        <% if (!isRealTimeSearch && canScheduleSearch) { %>\
                            <li><a href ="#" class="routeToSchedule"><%- _("Schedule").t() %></a></li>\
                        <% } %>\
                        <% if (!isPivot && canAccelerateReport) { %>\
                            <li><a href ="#" class="routeToAccleration"><%- _("Acceleration").t() %></a></li>\
                        <% } %>\
                        <% if (!isRealTimeSearch && canScheduleSearch && canEmbed) { %>\
                            <li><a href="#" class="routeToEmbed"><%- _("Embed").t() %></a></li>\
                        <% } %>\
                    <ul>\
                </p>\
            '
        });
    }
);
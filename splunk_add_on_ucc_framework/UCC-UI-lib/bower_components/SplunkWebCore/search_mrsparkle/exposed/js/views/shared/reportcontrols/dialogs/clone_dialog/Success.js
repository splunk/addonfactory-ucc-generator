define([
    'underscore',
    'module',
    'views/Base',
    'views/shared/Modal',
    'views/shared/FlashMessages',
    'uri/route',
    'splunk.util'
    ],
    function(
        _,
        module,
        Base,
        Modal,
        FlashMessages,
        route,
        splunkUtil
    ) {
    return Base.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *    model: {
        *        report: <models.Report>,
        *        application: <models.Application>,
        *        inmem: <models.Report>,
        *        user: <models.service.admin.user>
        *    }
        * }
        */
        initialize: function(options) {
            Base.prototype.initialize.apply(this, arguments);
            this.children.flashMessage = new FlashMessages({ model: this.model.inmem });
        },
        events: {
            'click .createDashboard': function(e) {
                this.trigger("addToDashboardPanel");
                e.preventDefault();
            },
            'click .routeToReport': function(e) {
                window.location = route.report(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id }});
                e.preventDefault();
            },
            'click .routeToPermissions': function(e) {
                window.location = route.report(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id, dialog: 'permissions' }});
                e.preventDefault();
            },
            'click .routeToSchedule': function(e) {
                window.location = route.report(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id, dialog: 'schedule' }});
                e.preventDefault();
            },
            'click .routeToAccleration': function(e) {
                window.location = route.report(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id, dialog: 'acceleration' }});
                e.preventDefault();
            },
            'click .routeToEmbed': function(e) {
                window.location = route.report(this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id, dialog: 'embed' }});
                e.preventDefault();
            },
            'click .openInCreator': function(e) {
                var openRoute = this.model.inmem.openInView(this.model.user);
                window.location = route[openRoute](this.model.application.get('root'), this.model.application.get('locale'), this.model.application.get("app"), {data: {s: this.model.inmem.id }});
                e.preventDefault();
            }
        },
        render : function() {
            var canChangePerms = this.model.inmem.entry.acl.get("can_change_perms"),
                canScheduleSearch = this.model.user.canScheduleSearch(),
                canAccelerateReport = this.model.user.canAccelerateReport(),
                isRealTimeSearch = this.model.inmem.isRealTime(),
                isPivot = this.model.inmem.isPivotReport(),
                canEmbed = this.model.user.canEmbed(),
                openWith = this.model.inmem.openInView(this.model.user) === 'pivot' ? _('Pivot').t() : _('Search').t();
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Report has been cloned").t());
            
            this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                _: _,
                splunkUtil: splunkUtil,
                canChangePerms: canChangePerms,
                canScheduleSearch: canScheduleSearch,
                canAccelerateReport: canAccelerateReport,
                isRealTimeSearch: isRealTimeSearch,
                isPivot: isPivot,
                canEmbed: canEmbed
            }));

            this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

            if (canChangePerms || canScheduleSearch && (!isRealTimeSearch || !isPivot)) {
                this.$('span.clone-report-success-message').text(splunkUtil.sprintf(_("You may now view your report, add it to a dashboard, change additional settings, or edit it in %s.").t(), openWith));
            } else {
                this.$('span.clone-report-success-message').text(splunkUtil.sprintf(_("You may now view your report, add it to a dashboard, or edit it in %s.").t(), openWith));
                this.$('p.additional-settings').remove();
            }

            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn createDashboard pull-left">' + _('Add to Dashboard').t() + '</a>');
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn openInCreator pull-left">' + splunkUtil.sprintf(_('Open in %s').t(), openWith) + '</a>');

            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary routeToReport">' + _('View').t() + '</a>');

            return this;
        },
        template: '\
            <p>\
                <span class="clone-report-success-message"></span>\
            </p>\
            <p class="additional-settings">\
            <%- _("Additional Settings:").t() %>\
                <ul>\
                    <% if (canChangePerms) { %>\
                        <li><a href="#" class="routeToPermissions"><%- _("Permissions").t() %></a></li>\
                    <% } %>\
                    <% if (!isRealTimeSearch && canScheduleSearch) { %>\
                        <li><a href="#" class="routeToSchedule"><%- _("Schedule").t() %></a></li>\
                    <% } %>\
                    <% if (!isPivot && canAccelerateReport) { %>\
                        <li><a href="#" class="routeToAccleration"><%- _("Acceleration").t() %></a></li>\
                    <% } %>\
                    <% if (!isRealTimeSearch && canScheduleSearch && canEmbed) { %>\
                        <li><a href="#" class="routeToEmbed"><%- _("Embed").t() %></a></li>\
                    <% } %>\
                <ul>\
            </p>\
        '
    });
});

define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'uri/route',
    'views/shared/apps_remote/dialog/Success',
    'views/shared/Modal',
    'helpers/managementconsole/url',
    'splunk.util'
], function(
    $,
    _,
    module,
    BaseView,
    route,
    SuccessView,
    Modal,
    dmcUrlHelper,
    splunkUtils
){
    return SuccessView.extend({
        moduleId: module.id,

        initialize: function(options) {
            SuccessView.prototype.initialize.call(this, options);

            this.appName = this.model.appRemote.get('title');
            this.appVersion = this.model.appRemote.get('release').title;

            this.listenTo(this.model.dmcApp, 'sync', this.render);
        },

        canOpenApps: function() {
            return false;
        },

        renderSuccessOptions: function() {
            var releaseNotesURI = this.model.dmcApp.getReleaseNotesURI();
            var sourcePackageDownloadLink = this.model.dmcApp.getExportUrl();

            if (!_.isNull(releaseNotesURI)) {
                this.$(Modal.BODY_FORM_SELECTOR).append('<a target="_blank" href="' + releaseNotesURI + '" class="btn btn-secondary successbtn releasenotes">' + _('Read Release Notes').t() + ' <i class="icon-external"></i></a>');
            }

            if (!_.isNull(sourcePackageDownloadLink)) {
                this.$(Modal.BODY_FORM_SELECTOR).append('<a href="' + sourcePackageDownloadLink + '" class="btn btn-secondary successbtn downloadpackage">' + _('Download Source Package').t() + '</a>');
            }

            this.$(Modal.BODY_FORM_SELECTOR).append('<a href="#" class="btn btn-secondary successbtn appslisting">' + _('View Apps').t() + '</a>');

            SuccessView.prototype.renderSuccessOptions.apply(this, arguments);
        },

        events: $.extend(true, {}, SuccessView.prototype.events, {
            'click .appslisting': function(e) {
                e.preventDefault();
                var url = dmcUrlHelper.pageUrl('apps');
                document.location.href = url;
            }
        }),

        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).text(_("Complete").t());
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

            var msg = _("was successfully installed.").t();
            var template = this.compiledTemplate({
                appName: this.appName,
                appVersion: this.appVersion,
                msg: msg
            });
            this.$(Modal.BODY_FORM_SELECTOR).append(template);

            this.renderSuccessOptions();

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);

            return this;
        },

        template: '<p><strong><%- appName %></strong> (<%- appVersion %>) <%- msg %></p>'
    });
});

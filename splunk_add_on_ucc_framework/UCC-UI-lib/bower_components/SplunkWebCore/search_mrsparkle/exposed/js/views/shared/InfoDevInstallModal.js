define([
    'jquery',
    'underscore',
    'views/shared/apps_remote/dialog/Master',
    'collections/SplunkDsBase',
    'models/services/appsbrowser/v1/App',
    'models/apps_remote/Login',
    'collections/services/Messages',
    'views/shared/InfoDevInstallModal.pcss'
], function ($,
             _,
             DialogView,
             BaseCol,
             AppModel,
             LoginModel,
             MessagesCollection,
             css) {

    //These values are hard coded for the time being, we might want to move these out in the future
    var APP_DETAILS = {
        "uid": 5687,
        "appid": "info-delivery",
        "title": "Enhanced Dashboard Export Add-on",
        "license_name": "End User License Agreement for Third-Party Content",
        "license_url": "https://d38o4gzaohghws.cloudfront.net/static/misc/eula.html",
        "description": "Improved dashboard exporting",
        "access": "unrestricted",
        "path": "https://splunkbase.splunk.com/app/3176/"
    };

    return DialogView.extend({
        initialize: function(options) {

            // set-up required sub classes
            this.collection.messages = new MessagesCollection();
            this.model.appRemote = new AppModel(APP_DETAILS);
            this.model.auth = new LoginModel();

            // add templates to options to override default templates
            $.extend(options, {
                // custom templates
                loginTemplate: this.loginTemplate,
                installTemplate: this.installTemplate,
                successTemplate: this.successTemplate,
                // footer
                footerSuccessTemplate: this.footerSuccessTemplate,
                // modifications
                customHeader: _("Download and Installing add-on").t()
            });

            DialogView.prototype.initialize.apply(this, arguments);

            // when the app is installed refresh list of apps
            this.on('onInstallSuccess', this.refreshApps, this);
        },
        refreshApps: function () {
            // force refresh of list of apps
            this.collection.apps.fetch({
                data: {
                    refresh: true
                }
            });
        },
        loginTemplate: '\
            <div class="modal-info-dev-install">\
                <p><%- _("Enter your Splunk.com username and password to download the add-on").t() %></p>\
                <div class="username-placeholder"></div>\
                <div class="password-placeholder"></div>\
                <p><a class="forgot-password"><%- _("Forgot your password?").t() %></a></p>\
                <p><a class="license-agreement" id="software-license"><%- _("Splunk Software License Agreement").t() %></a></p>\
                <p><a class="license-agreement" id="terms-conditions"><%- _("Splunk Websites Terms and Conditions of Use").t() %></a></p>\
                <div class="consent-placeholder"></div>\
            </div>\
        ',
        installTemplate: '\
            <p><%- splunkUtils.sprintf(_("Downloading and installing the %s.").t(), _(appName).t()) %></p>\
            <p class="info-dev-download-size"><%- _("This step might take several minutes depending on your internet connection speed.").t() %></p>\
        ',
        successTemplate: '\
        <div class="modal-info-dev-install">\
            <p><%- _("The ").t() %> <%- _(appName).t() %> <%- _(" was installed successfully. The add-on must be configured before it can be used.").t() %></p>\
            <p><%- _(" For more information, review the ").t() %><a class="info-dev-documentation" href="http://docs.splunk.com/Documentation/Splunk/6.5.0/Viz/DashboardExportApp" target="_blank"><%- _("documentation ").t() %><i class="icon-external"></i> .</a></p>\
        </div>\
        ',
        footerSuccessTemplate: '\
            <a href="/app/info-delivery/setup" class="btn btn-primary modal-btn-primary configure"> <%- _("Configure Add-on").t() %></a>\
        '
    });
});
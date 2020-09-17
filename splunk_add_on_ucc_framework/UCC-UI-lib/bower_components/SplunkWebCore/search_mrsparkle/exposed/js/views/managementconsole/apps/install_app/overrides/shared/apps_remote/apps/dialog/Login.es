import $ from 'jquery';
import _ from 'underscore';
import LoginView from 'views/shared/apps_remote/dialog/Login';

export default LoginView.extend({
    moduleId: module.id,

    initialize(options) {
        $.extend(options, {
            loginBtnLabel: _('Login and Download').t(),
        });
        LoginView.prototype.initialize.call(this, options);

        this.appName = this.model.appRemote.get('title');
        this.splunkBaseLink = this.model.appRemote.get('path');
        this.licenseName = this.model.appRemote.get('license_name');
        this.licenseURL = this.model.appRemote.get('license_url');
    },

    render(...args) {
        LoginView.prototype.render.apply(this, ...args);

        this.$('#splunk-base-link').text(this.appName);
        this.$('#splunk-base-link').attr('href', this.splunkBaseLink);
        this.$('#app-license').text(this.licenseName);
        this.$('#app-license').attr('href', this.licenseURL);

        return this;
    },

    template:
    '<p><%- _("Enter your Splunk.com username and password to download the app.").t() %></p>' +
    '<div class="username-placeholder"></div>' +
    '<div class="password-placeholder"></div>' +
    '<a class="forgot-password"><%- _("Forgot your password?").t() %></a>' +
    '<p class="rights"><%- _("The app, and any related dependency that will be installed, ' +
    'may be provided by Splunk and/or a third party and your right to use these app(s) is in ' +
    'accordance with the applicable license(s) provided by Splunk and/or the third-party licensor. ' +
    'Splunk is not responsible for any third-party app and does not provide any warranty or support. ' +
    'If you have any questions, complaints or claims with respect to an app, please contact the applicable ' +
    'licensor directly whose contact information can be found on the Splunkbase download page.").t() %></p>' +
    '<a target="_blank" class="license-agreement" id="splunk-base-link"></a></br> ' +
    '<a target="_blank" class="license-agreement" id="app-license"></a></br> ' +
    '<a target="_blank" class="license-agreement" id="cloud-terms-conditions" ' +
    'href="https://www.splunk.com/en_us/legal/terms/splunk-cloud-terms-of-service.html">' +
    '<%- _("Splunk Cloud Terms of Service").t() %></a></br> ' +
    '<div class="consent-placeholder"></div> ',
});

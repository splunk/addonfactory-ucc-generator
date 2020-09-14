import _ from 'underscore';
import $ from 'jquery';
import BaseView from 'views/Base';
import Modal from 'views/shared/Modal';
import SyntheticCheckboxControl from 'views/shared/controls/SyntheticCheckboxControl';

/* eslint-disable prefer-template */
const BUTTON_INSTALL_DEPENDENCIES = '<a href="#" class="btn btn-primary install-dependencies modal-btn-primary ' +
'pull-right">' + _('Install').t() + '</a>';
const BUTTON_GO_BACK_TO_APP_BROWSER = '<a href="#" class="btn modal-btn-close pull-left" data-dismiss="modal">' +
_('Go back to App Browser').t() + '</a>';
/* eslint-enable prefer-template */

export default BaseView.extend({
    moduleId: module.id,

    initialize(...args) {
        BaseView.prototype.initialize.apply(this, ...args);

        this.licenseMap = {};
        this.children = this.children || {};

        this.children.consent = new SyntheticCheckboxControl({
            label: _('I have read the terms and conditions of the license(s) and agree to be bound by them.').t(),
            model: this.model.working,
            modelAttribute: 'consent',
        });

        this.listenTo(this.model.working, 'change:consent', (model, newVal) => {
            this.model.working.set('installDependencies', newVal);
            if (newVal) {
                this.$('.install-dependencies').removeClass('disabled');
            } else {
                this.$('.install-dependencies').addClass('disabled');
            }
        });

        this.listenTo(this.model.working, 'start:updateDependencies', this.updateDependencies);
        this.listenTo(this.model.working, 'finish:updateDependencies', this.render);
    },

    events: $.extend({}, Modal.prototype.events, {
        'click .install-dependencies'(e) {
            e.preventDefault();

            this.model.working.trigger('installDependencies');
        },
    }),

    updateDependencies(dependencies) {
        this.licenseMap = {};
        _.each(dependencies, function mapLicense(app) {
            this.licenseMap[app.license] = this.licenseMap[app.license] || { apps: [], license_url: app.license_url };
            this.licenseMap[app.license].apps.push(app);
        }, this);

        this.model.working.trigger('finish:updateDependencies');
    },

    render() {
        this.$el.html(Modal.TEMPLATE);
        this.$(Modal.HEADER_TITLE_SELECTOR).text(_('App Dependency License Agreement').t());

        this.$(Modal.BODY_SELECTOR).append(this.compiledTemplate({
            _,
            licenses: this.licenseMap,
        }));

        this.children.consent.$el.detach();
        this.$('.app-dependency-consent-placeholder').append(this.children.consent.render().el);
        this.children.consent.delegateEvents();

        this.$(Modal.FOOTER_SELECTOR).append(BUTTON_INSTALL_DEPENDENCIES);

        if (!this.model.working.get('consent')) {
            this.$('.install-dependencies').addClass('disabled');
        }

        this.$(Modal.FOOTER_SELECTOR).append(BUTTON_GO_BACK_TO_APP_BROWSER);
        return this;
    },

    template:
    '<p class="rights"><%- _("The following dependent app(s) to be installed ' +
    'are governed by the license listed:").t() %></p>' +
    '<% _.each(licenses, function(licenseGroup, licenseName) { %>' +
        '<div class="license-group">' +
            '<a target="_blank" class="license-link" href="<%- licenseGroup.license_url %>"><%- licenseName %></a>:' +
            '<ul>' +
            '<% _.each(licenseGroup.apps, function(app) { %>' +
                '<li><%- app.app_title %></li>' +
            '<% }) %>' +
            '</ul>' +
        '</div>' +
    '<% }) %>' +
    '<a target="_blank" class="license-agreement" id="cloud-terms-conditions" href="' +
    'https://www.splunk.com/en_us/legal/terms/splunk-cloud-terms-of-service.html">' +
    '<%- _("Splunk Cloud Terms of Service").t() %></a></br> ' +
    '<div class="app-dependency-consent-placeholder"></div> ',
});

import _ from 'underscore';
import Modal from 'views/shared/Modal';
import ErrorView from 'views/shared/apps_remote/dialog/Error';
import splunkUtils from 'splunk.util';

const ERROR_STATUS = {
    MISSING_DEPENDENCIES: 4,
    ACCESS_DENIED: 403,
};
const STRINGS = {
    MISSING_DEPENDENCIES_STR_1_TEMPLATE: _('(version %s) could not be ' +
    'installed because it requires the following app dependencies to be ' +
    'installed:').t(),
    MISSING_DEPENDENCIES_STR_2: _('Do you want to continue and install').t(),
    MISSING_DEPENDENCIES_STR_3_TEMPLATE: _('(version %s) with these dependencies?').t(),
    INSTALLED_DEPENDENCIES_STR1: _('The following dependencies are already installed on your machine:').t(),
    INSTALLED_DEPENDENCIES_STR2: _('These dependencies were not self-service installed and are not compatible with ' +
    'App Management. Please file a support ticket to resolve this issue.').t(),
};

/* eslint-disable prefer-template */
const BUTTON_INSTALL_DEPENDENCIES = '<a href="#" class="btn btn-primary ' +
'modal-btn-primary pull-right install-dependencies">' +
_('Continue').t() + '</a>';
/* eslint-enable prefer-template */

export default ErrorView.extend({
    moduleId: module.id,

    events: {
        'click .install-dependencies'(e) {
            e.preventDefault();

            this.model.wizard.set('appDependencies', this.dependencies);
            this.model.wizard.set('step', 'install_dependencies');
        },
    },

    render() {
        this.$el.html(Modal.TEMPLATE);

        const errorHTML = this.getErrorHTML();
        this.$(Modal.HEADER_TITLE_SELECTOR).text(errorHTML.title);
        this.$(Modal.BODY_SELECTOR).append(errorHTML.body);
        _.each(errorHTML.buttons, function appendButton(button) {
            this.$(Modal.FOOTER_SELECTOR).append(button);
        }, this);
        return this;
    },

    hasAppInstalled(appId) {
        return !_.isUndefined(this.collection.appLocalsUnfiltered.findByEntryName(appId));
    },

    getInstalledDependencies(dependencies) {
        const installedDependencies = [];
        _.each(dependencies, (dependency) => {
            if (this.hasAppInstalled(dependency.app_id)) {
                installedDependencies.push(dependency);
            }
        });
        return installedDependencies;
    },

    getErrorHTML() {
        const errorResponse = this.model.entryById.errorResponse;

        if (!errorResponse) {
            return '';
        }

        switch (errorResponse.status) {
            case ERROR_STATUS.MISSING_DEPENDENCIES: {
                this.dependencies = errorResponse.missing_dependencies;

                const appName = this.model.appRemote.get('title');
                const appVersion = this.model.appRemote.get('release').title;
                const installedDependencies = this.getInstalledDependencies(this.dependencies);
                if (!_.isEmpty(installedDependencies)) {
                    return {
                        title: _('App installation failed - Install method conflict').t(),
                        body: _.template(this.installedDependenciesTemplate)({
                            appName,
                            installedDependencies,
                            INSTALLED_DEPENDENCIES_STR1: STRINGS.INSTALLED_DEPENDENCIES_STR1,
                            INSTALLED_DEPENDENCIES_STR2: STRINGS.INSTALLED_DEPENDENCIES_STR2,
                        }),
                        buttons: [Modal.BUTTON_CLOSE],
                    };
                }

                return {
                    title: _('App installation failed - Missing dependencies').t(),
                    body: _.template(this.missingDependenciesTemplate)({
                        appName,
                        dependencies: this.dependencies,
                        MISSING_DEPENDENCIES_STR_1: splunkUtils.sprintf(
                            STRINGS.MISSING_DEPENDENCIES_STR_1_TEMPLATE,
                            appVersion),
                        MISSING_DEPENDENCIES_STR_2:
                            STRINGS.MISSING_DEPENDENCIES_STR_2,

                        MISSING_DEPENDENCIES_STR_3: splunkUtils.sprintf(
                            STRINGS.MISSING_DEPENDENCIES_STR_3_TEMPLATE,
                            appVersion),
                    }),
                    buttons: [Modal.BUTTON_CANCEL, BUTTON_INSTALL_DEPENDENCIES],
                };
            }
            case ERROR_STATUS.ACCESS_DENIED: {
                return {
                    title: _('App installation failed - Insufficient permissions').t(),
                    body: this.compiledTemplate({
                        errorText: _('You do not have sufficient permissions to do this.').t(),
                    }),
                };
            }
            default: {
                return {
                    title: _('App installation failed').t(),
                    body: this.compiledTemplate({
                        errorText: errorResponse.responseJSON.error.message,
                    }),
                    buttons: [Modal.BUTTON_CLOSE],
                };
            }
        }
    },

    missingDependenciesTemplate: `
        <p>
            <strong><%- appName %></strong> <%- MISSING_DEPENDENCIES_STR_1 %>
        </p>
        <ul>
        <% _.each(dependencies, function(dependency) { %>
            <li><%- dependency.app_title %></li>
        <% }) %>
        </ul>
        <p> <%- MISSING_DEPENDENCIES_STR_2 %> <strong><%- appName %></strong> <%- MISSING_DEPENDENCIES_STR_3 %></p>
    `,

    installedDependenciesTemplate: `
    <p><%- INSTALLED_DEPENDENCIES_STR1 %></p>
    <ul>
    <% _.each(installedDependencies, function(dependency) { %>
        <li><%- dependency.app_title %></li>
    <% }) %>
    </ul>
    <p><%- INSTALLED_DEPENDENCIES_STR2 %></p>
    `,
});

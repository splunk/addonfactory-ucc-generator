/**
 * Created by rtran on 2/23/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/managementconsole/utils/string_utils',
    'models/managementconsole/App',
    'views/managementconsole/shared.pcss',
    './Review.pcss'
], function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    string_utils,
    AppModel,
    cssShared,
    css
) {
    return BaseView.extend({
        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
        },

        _getInstallTypeLabel: function() {
            var installType = this.model.wizard.get('appInstallType');
            if (installType === 'upload') {
                return _('Upload App').t();
            } else if (installType === 'browse') {
                return _('Browse App').t();
            } else {
                return '';
            }
        },

        _getServerClassesLabel: function() {
            var serverClasses = _.filter(this.model.appModel.entry.content.get('groups'), function(group) {
                return group.trim();
            });

            return string_utils.formatServerClassList(serverClasses);
        },

        render: function() {
            var installTypeLabel = this._getInstallTypeLabel(),
                fileName = this.model.appModel.entry.content.get('data') ? this.model.appModel.entry.content.get('data').name : null,
                appName = this.model.appModel.entry.content.get('appId'),
                serverClassesLabel = this._getServerClassesLabel(),
                afterInstallation = AppModel.getAfterInstallationLabel(this.model.appModel.entry.content.get('afterInstallation'));

            this.$el.append(this.compiledTemplate({
                installTypeLabel: installTypeLabel,
                fileName: fileName,
                appName: appName,
                serverClassesLabel: serverClassesLabel,
                afterInstallation: afterInstallation
            }));

            return this;
        },

        template: '<div class="content-section review-section add-app-section">\
            <div class="content-header">\
                <h3 class="content-title">Review</h3>\
            </div>\
            <div class="content-body review-body">\
                <dl>\
                    <div class="review-row">\
                        <dt><%- _("Application Install Type").t() %></dt>\
                        <dd><%- installTypeLabel %></dd>\
                    </div>\
                    <% if (fileName) { %>\
                    <div class="review-row">\
                        <dt><%- _("File Name").t() %></dt>\
                        <dd><%- fileName %></dd>\
                    </div>\
                    <% } %>\
                    <% if (appName) { %>\
                    <div class="review-row">\
                        <dt><%- _("App Name").t() %></dt>\
                        <dd><%- appName %></dd>\
                    </div>\
                    <% } %>\
                    <div class="review-row">\
                        <dt><%- _("Selected Server Classes").t() %></dt>\
                        <dd><%- serverClassesLabel %></dd>\
                    </div>\
                    <div class="review-row">\
                        <dt><%- _("After Installation").t() %></dt>\
                        <dd><%- afterInstallation %></dd>\
                    </div>\
                </dl>\
            </div>\
        </div>'
    });
});
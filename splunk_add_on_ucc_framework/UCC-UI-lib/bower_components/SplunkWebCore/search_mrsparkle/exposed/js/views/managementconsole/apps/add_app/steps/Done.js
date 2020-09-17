/**
 * Created by rtran on 2/23/16.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'helpers/managementconsole/url',
    'views/managementconsole/shared.pcss',
    '../AddApp.pcss'
], function(
    $,
    _,
    Backbone,
    module,
    BaseView,
    urlHelper,
    cssShared,
    css
) {
    return BaseView.extend({
        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.compiledSuccessTemplate = _.template(this.successTemplate);
            this.compiledFailTemplate = _.template(this.failTemplate);
            this.errorMsg = this.options.errorMsg;
        },

        render: function() {
            var mgmtAppsUrl = urlHelper.pageUrl('apps');

            if (!this.errorMsg) {
                this.$el.append(this.compiledSuccessTemplate({
                    mgmtAppsUrl: mgmtAppsUrl
                }));
            } else {
                this.$el.html(this.compiledFailTemplate({
                    errorMsg: this.errorMsg
                }));
            }

            return this;
        },

        successTemplate: '<div class="done-section success-section">\
            <i class="icon icon-check"></i>\
            <div class="done-header success-header">\
                <h3><%- _("Application was installed successfully.").t() %></h3>\
                <p><%- _("Configure your apps by going to").t() %> <a href="<%- mgmtAppsUrl %>"><%- _("Apps").t() %></a></p>\
            </div>\
        </div>',

        failTemplate: '<div class="done-section fail-section">\
            <i class="icon icon-error"></i>\
            <div class="done-header fail-header">\
                <h3><%- _("Application could not be installed successfully.").t() %></h3>\
                <p><%- errorMsg %></p>\
            </div>\
        </div>'
    });
});
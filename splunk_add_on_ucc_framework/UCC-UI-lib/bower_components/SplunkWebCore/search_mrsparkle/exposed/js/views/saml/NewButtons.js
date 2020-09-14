/**
 * @author lbudchenko
 * @date 10/1/15
 *
 */
define([
        'jquery',
        'underscore',
        'module',
        'views/shared/basemanager/NewButtons'
    ],
    function (
        $,
        _,
        module,
        BaseView
    ) {

        return BaseView.extend({
            moduleId: module.id,

            events: $.extend({}, BaseView.prototype.events, {
                'click .saml-config-button': 'onSAMLConfigButton'
            }),

            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.listenTo(this.model.authModule, 'change reset', this.checkSAMLConfigured);
            },

            onSAMLConfigButton: function() {
                this.model.controller.trigger("configSAML");
            },

            checkSAMLConfigured: function() {
                var authMode = this.model.authModule.getAuthMode(),
                    $warningIcon = this.$('.saml-disabled-warning');
                if (authMode !== 'SAML') {
                    var tooltipText = _("SAML is not configured.").t();
                    $warningIcon.tooltip({ animation: false, title: tooltipText, container: $warningIcon, placement: "bottom" });
                    $warningIcon.show();
                } else {
                    $warningIcon.hide();
                }
            },

            render: function () {
                var html = this.compiledTemplate({
                    entitySingular: this.options.entitySingular
                });

                this.$el.html(html);

                this.checkSAMLConfigured();

                return this;
            },

            template: '\
            <div class="saml-disabled-warning alert-error red-triangle-warning"><i class="icon-alert"/></div>\
            <a href="#" class="btn btn-primary saml-config-button"><%- _("SAML Configuration").t() %></a>\
            <a href="#" class="btn btn-primary new-entity-button"><%- _("New Group").t() %></a>'
        });
    });


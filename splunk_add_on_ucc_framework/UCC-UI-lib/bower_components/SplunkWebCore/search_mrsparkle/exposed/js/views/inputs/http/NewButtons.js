/**
 * @author lbudchenko
 * @date 8/13/14
 *
 */
define([
        'jquery',
        'underscore',
        'module',
        'views/Base'
    ],
    function (
        $,
        _,
        module,
        BaseView
    ) {

        return BaseView.extend({
            moduleId: module.id,

            events: {
                'click .new-entity-button': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger("editEntity");
                },
                'click .global-settings-button': function(e) {
                    e.preventDefault();
                    this.model.controller.trigger("globalSettings");
                }
            },

            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);

                this.listenTo(this.model.controller, "globalSaved", this.checkTokensDisabled);
            },

            checkTokensDisabled: function() {
                var disabled = this.model.settings.get('ui.disabled'),
                    $warningIcon = this.$('.tokens-disabled-warning');
                if (disabled) {
                    var tooltipText = _("All the tokens are currently disabled. They can be enabled in the Global Settings.").t();
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

                this.checkTokensDisabled();

                return this;
            },

            template: '\
            <div class="tokens-disabled-warning alert-error red-triangle-warning"><i class="icon-alert"/></div>\
            <a href="#" class="btn btn-primary global-settings-button"><%- _("Global Settings").t() %></a>\
            <a href="#" class="btn btn-primary new-entity-button"><%- _("New ").t() + entitySingular %></a>'

        });
    });


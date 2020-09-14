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
                    if (!this.options.editLinkHref) {
                        e.preventDefault();
                        this.onNewEntityButton();
                    }
                }
            },

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            onNewEntityButton: function() {
                this.model.controller.trigger("editEntity");
            },

            render: function () {
                var html = this.compiledTemplate({
                    entitySingular: this.options.entitySingular,
                    editLinkHref: this.options.editLinkHref || '#'
                });

                this.$el.html(html);

                return this;
            },

            template: '<a href="<%- editLinkHref %>" class="btn btn-primary new-entity-button"><%- _("New ").t() + entitySingular %></a>'
        });
    });


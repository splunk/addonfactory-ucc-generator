/**
 * @author nmistry
 * @date 02/04/16
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

            events: {
                'click .new-entity-button': function(e){
                    if (!this.options.editLinkHref && !$(e.target).hasClass('disabled')) {
                        e.preventDefault();
                        this.onNewEntityButton();
                    }
                }
            },

            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);
            },


            render: function () {
                var canCreate = this.collection.entities.links.has('create'),
                    tooltipText = _("You do not have the permission to create a new index.").t(),
                    html = this.compiledTemplate({
                    entitySingular: this.options.entitySingular,
                    editLinkHref: this.options.editLinkHref || '#'
                });

                this.$el.html(html);

                var warningIcon = this.$('.disabled-warning');
                warningIcon.tooltip({
                    animation: false,
                    title: tooltipText,
                    container: warningIcon,
                    placement: 'bottom'
                });

                if (canCreate) {
                    warningIcon.hide();
                } else {
                    this.$('.new-entity-button').addClass('disabled');
                }

                return this;
            },

            template: '\
            <div class="disabled-warning alert-error red-triangle-warning"><i class="icon-alert"/></div>\
            <a href="<%- editLinkHref %>" class="btn btn-primary new-entity-button"><%- _("New ").t() + entitySingular %></a>'
        });
    });


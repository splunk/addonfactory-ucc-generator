/**
 * @author lbudchenko
 * @date 8/13/14
 *
 * Represents the Action cell in each row.
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
            className: "action-cell",

            events: {
                'click .delete-action': function(e) {
                    this.model.controller.trigger("deleteEntity", this.model.entity);
                    e.preventDefault();
                },
                'click .clone-action': function(e) {
                    this.model.controller.trigger("cloneEntity", this.model.entity);
                    e.preventDefault();
                },
                'click .edit-action': function(e) {
                    this.model.controller.trigger("editEntity", this.model.entity);
                    e.preventDefault();
                }
            },

            controlActionsVisibility: function() {
                var canDelete = this.model.entity.entry.links.has("remove"),
                    canEdit = this.model.entity.entry.links.has("edit"),
                    canEnable = this.model.entity.entry.links.has("enable"),
                    canDisable = this.model.entity.entry.links.has("disable");

                if (!canDelete) {
                    this.$el.find('.delete-action').replaceWith(function() {
                        return $('<span>').addClass('disabled-action').append($(this).contents());
                    });
                }
                if (!canEdit) {
                    this.$el.find('.edit-action').replaceWith(function() {
                        return $('<span>').addClass('disabled-action').append($(this).contents());
                    });
                }
                if (!canEnable) {
                    this.$el.find('.enable-action').replaceWith(function() {
                        return $('<span>').addClass('disabled-action').append($(this).contents());
                    });
                }
                if (!canDisable) {
                    this.$el.find('.disable-action').replaceWith(function() {
                        return $('<span>').addClass('disabled-action').append($(this).contents());
                    });
                }
            },

            render: function () {
                var html = this.compiledTemplate(this.prepareTemplate());
                this.$el.html(html);
                this.controlActionsVisibility();
                return this;
            },

            // can be overridden by subclass
            // this is useful when you have some custom logic in the subclass's template
            prepareTemplate: function() {
                return {
                    model: this.model.entity
                };
            },

            template: '<a href="#" class="entity-action edit-action"><%= _("Edit").t() %></a>\
                       <a href="#" class="entity-action delete-action"><%= _("Delete").t() %></a>'
        });
    });


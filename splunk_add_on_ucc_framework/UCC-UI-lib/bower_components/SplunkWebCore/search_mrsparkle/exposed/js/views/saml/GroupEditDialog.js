/**
 * @author lbudchenko
 * @date 10/1/15
 *
 * Popup dialog for editing SAML group config
 */

define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/FlashMessages',
        'views/shared/basemanager/EditDialog',
        'views/shared/controls/ControlGroup'
    ],

    function(
        $,
        _,
        Backbone,
        module,
        FlashMessages,
        BaseDialog,
        ControlGroup
    ) {

        return BaseDialog.extend({
            moduleId: module.id,

            setFormControls: function() {
                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({
                    model: this.model.entity
                });

                this.children.name = new ControlGroup({
                    controlType: 'Text',
                    className: 'samlgroup-name control-group',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.entity.entry
                    },
                    controlClass: 'controls-block',
                    label: _('Group Name').t()
                });

                var availableItems = _.map(this.collection.roles.models, function(model) {
                        return {label:model.entry.get('name'), value:model.entry.get('name')};
                    }),
                    selectedItems = this.model.entity.entry.content.get('roles');
                this.children.roles = new ControlGroup({
                    controlType: 'Accumulator',
                    className: 'samlgroup-roles control-group',
                    controlOptions: {
                        modelAttribute: 'roles',
                        model: this.model.entity.entry.content,
                        availableItems: availableItems,
                        selectedItems: selectedItems
                    },
                    controlClass: 'controls-block',
                    label: _('Splunk Roles').t()
                });
            },

            renderFormControls: function($modalBody) {
                BaseDialog.prototype.renderFormControls.apply(this, arguments);
                this.children.roles.render().appendTo(this.$(".roles-placeholder"));
            },

            formControlsTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <div class="name-placeholder"></div>\
                <div class="roles-placeholder"></div>\
            '
        });
    });

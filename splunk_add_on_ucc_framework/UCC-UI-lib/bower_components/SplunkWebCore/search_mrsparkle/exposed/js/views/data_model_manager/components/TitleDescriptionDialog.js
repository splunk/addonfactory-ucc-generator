/**
 * @author nmistry
 *
 * Dialog to edit the title and description of a DataModel
 *
 * Inputs:
 *
 *     model {models/services/datamodel/DataModel}
 *
 * @fires TitleDescriptionDialog#action:saveModel
 */

define([
'jquery',
'underscore',
'backbone',
'module',
'views/shared/Modal',
'views/shared/controls/ControlGroup',
'views/shared/FlashMessages'
],
function ($, _, Backbone, module, Modal, ControlGroup, FlashMessage){

    return Modal.extend({
        moduleId: module.id,

        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                /**
                 * Save the Data Model
                 *
                 * @event TitleDescriptionDialog#action:saveModel
                 * @param {string} data model name
                 */
                this.trigger("action:saveModel", this.model.entry.content.get("id"));
                this.hide();
            }
        }),

        initialize: function (options) {
            Modal.prototype.initialize.apply(this, arguments);
            this.children.flashMessage = new FlashMessage({model: this.model.complete});
            this.children.titleField = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'displayName',
                    model: this.model.entry.content
                },
                controlClass: 'controls-block',
                label: _('Title').t()
            });
            this.children.descriptionField = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: 'description',
                    model: this.model.entry.content
                },
                controlClass: 'controls-block',
                label: _('Description').t()
            });

        },
 
        render: function() {
            this.$el.html(Modal.TEMPLATE);

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Title or Description").t());

            this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessage.render().el);

            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.titleField.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.descriptionField.render().el);

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

            return this;
        }

    
/* end of return */
});

/*end of annonymous function */
});

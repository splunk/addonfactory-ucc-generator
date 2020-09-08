define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/FlashMessages'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        Modal,
        ControlGroup,
        FlashMessage
    ) {
    return Modal.extend({
        moduleId: module.id,
        /**
        * @param {Object} options {
        *       model: <models.Report>
        * }
        */
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);

            this.workingModel = this.model.clone(); 

            this.children.flashMessage = new FlashMessage({ model: this.model });

            this.children.titleField = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'label',
                    model: this.workingModel,
                    placeholder: _("optional").t(),
                    trimLeadingSpaces: true,
                    trimTrailingSpaces: true
                },
                label: _("Title").t()
            });

            this.children.descriptionField = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: 'description',
                    model: this.workingModel,
                    placeholder: _("optional").t(),
                    trimLeadingSpaces: true,
                    trimTrailingSpaces: true
                },
                label: _("Description").t()
            });

        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                this.model.set('label', this.workingModel.get('label')); 
                this.model.set('description', this.workingModel.get('description')); 
                this.hide();
                e.preventDefault();
            }
        }),
        render : function() {
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
    });
});

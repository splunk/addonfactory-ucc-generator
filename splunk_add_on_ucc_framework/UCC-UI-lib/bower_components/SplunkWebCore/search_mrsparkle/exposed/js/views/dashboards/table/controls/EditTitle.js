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

    /**
     * @params model <models.Dashboard.DashboardMetadata>
     */
    return Modal.extend({
        moduleId: module.id,
        initialize: function(options) {
            Modal.prototype.initialize.apply(this, arguments);

            if(!this.model.working){
                this.model.working = new Backbone.Model();
                this.model.working.set(this.model.dashboardMetadata.toJSON());
            }

            this.children.flashMessage = new FlashMessage({ model: this.model.working });
            this.children.titleField = new ControlGroup({
                controlType: 'Text',
                controlOptions: {
                    modelAttribute: 'label',
                    model: this.model.working,
                    placeholder: _("optional").t()
                },
                label: _("Title").t()
            });

            this.children.descriptionField = new ControlGroup({
                controlType: 'Textarea',
                controlOptions: {
                    modelAttribute: 'description',
                    model: this.model.working,
                    placeholder: _("optional").t()
                },
                label: _("Description").t()
            });

        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-primary': function(e) {
                e.preventDefault();
                var dialog = this;
                this.model.dashboardMetadata.save(this.model.working.toJSON()).done(function(){
                    dialog.hide();
                });
            }
        }),
        render : function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Title or Description").t());
            this.$(Modal.BODY_SELECTOR).prepend(this.children.flashMessage.render().el);
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL_JUSTIFIED);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.titleField.render().el);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.children.descriptionField.render().el);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
            return this;
        }
    });
});

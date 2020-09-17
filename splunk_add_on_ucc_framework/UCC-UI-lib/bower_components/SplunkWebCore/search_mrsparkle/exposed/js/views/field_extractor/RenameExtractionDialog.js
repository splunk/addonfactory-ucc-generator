/**
 * Modal that allows user to rename an existing extracted field.
 * Rendered when user clicks on an existing extracted field highlighting in the Master Event.
 */
define([
    'underscore',
    'backbone',
    'module',
    'models/shared/dataenrichment/FieldExtraction',
    'views/shared/Modal',
    'views/shared/FlashMessages'
    ],
    function(
        _,
        Backbone,
        module,
        FieldExtraction,
        Modal,
        FlashMessages
    ) {

    return Modal.extend({
        moduleId: module.id,
        events: {
            'click .btn-primary': function(e) {
                e.preventDefault();
                this.onSubmit();
            },
            'keypress' : function(e) {
                var ENTER_KEY = 13;
                if(e.which === ENTER_KEY) {
                    e.preventDefault();
                    this.onSubmit();
                }
            },
            'show': function(e) {
                if(e.target !== e.currentTarget){
                    return;
                }
                this.$('.field-name-input').focus();
            },
            'hide': function(e) {
                this.remove();
            }
        },
        initialize: function() {
            Modal.prototype.initialize.apply(this, arguments);
            this.model.fieldExtraction = new FieldExtraction({ regex: this.model.state.get('regex') });
            this.children.flashMessages = new FlashMessages({
                model: this.model.fieldExtraction
            });
        },
        render : function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Rename Extraction").t());
            this.children.flashMessages.render().appendTo(this.$(Modal.BODY_SELECTOR));
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
            this.$(Modal.BODY_FORM_SELECTOR).append(this.compiledTemplate(
                {
                    fieldName: this.options.fieldName,
                    fieldValue: this.options.fieldValue
                }
            ));
            var BUTTON_RENAME = '<a href="#" class="btn btn-primary modal-btn-primary pull-right">' + _('Rename').t() + '</a>';
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(BUTTON_RENAME);
            return this;
        },
        onSubmit: function() {
            var fieldName = this.$('.field-name-input').val();
            this.model.fieldExtraction.set({ fieldName: fieldName });
            if(this.model.fieldExtraction.isValid(true)) {
                this.trigger('action:rename', fieldName);
            }
        },
        template: '\
            <div class="control-group">\
                <label class="control-label"><%- _("Field Name").t() %></label>\
                <div class="controls">\
                    <div class="control">\
                        <input type="text" class="input-medium field-name-input" id="input-field-name" value="<%- fieldName %>" />\
                    </div>\
                </div>\
            </div>\
            <div class="control-group">\
                <label class="control-label"><%- _("Field Value").t() %></label>\
                <div class="controls">\
                    <div class="control">\
                        <span class="input-label field-value"><%- fieldValue %></span>\
                    </div>\
                </div>\
            </div>\
        '
    });
});

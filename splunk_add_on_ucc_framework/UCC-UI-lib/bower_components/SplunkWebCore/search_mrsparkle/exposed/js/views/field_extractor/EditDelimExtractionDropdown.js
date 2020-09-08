/**
 * Dropdown Menu
 */
define(
    [
        'underscore',
        'module',
        'jquery',
        'models/shared/dataenrichment/FieldExtraction',
        'views/Base',
        'views/shared/FlashMessages'
    ],
    function(
        _,
        module,
        $,
        FieldExtraction,
        BaseView,
        FlashMessages
    ) {
    return BaseView.extend({
        moduleId: module.id,
        tagName: 'form',
        className: 'form-horizontal field-extraction-form',
        
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.startIndex = this.options.startIndex;
            this.delimFieldNames = this.model.state.get('delimFieldNames') || {};
            this.model.fieldName = new FieldExtraction({ regex: this.model.state.get('regex') });
            this.children.flashMessages = new FlashMessages({
                model: this.model.fieldName
            });
        },
        
        events: {
            'click .submit-button': 'onSubmit',
            'keypress' : function(event) {
                var ENTER_KEY = 13;
                if (event.which === ENTER_KEY) {
                    this.onSubmit(event);
                }
            }
        },

        setModalBody: function() {
            //switch out body of modal
            var popDownWidth = $('.popdown-dialog.open').width();
            //this.$el.find('.extraction-form-content').html(_(this.getTemplate()).template({ selection: this.options.selection }));
            $('.popdown-dialog.open').width(popDownWidth); //Maintain the current width of the popdown

            this.setButtonText('Rename Field');
            this.children.flashMessages.$el.show();
        },
    
        setButtonText: function(text) {
            this.getSubmitButton().text(_(text).t());
        },

        getSubmitButton: function() {
            return this.$('.extraction-form-buttons .buttons-container .submit-button');
        },

        focus: function() {
            this.$('.field-name-input').focus();
        },
    
        onSubmit: function(e) {
            e.preventDefault();
            if (!this.getSubmitButton().hasClass('disabled')) {
                var fieldName = this.$('.field-name-input').val();
                this.model.fieldName.set({ fieldName: fieldName });
                if (this.model.fieldName.isValid(true)) {
                    this.trigger('action:renameField', fieldName, this.startIndex);
                }
            }
        },

        render: function() {
            this.fieldName = this.delimFieldNames[this.startIndex];
            var fieldNum = this.options.startIndex + 1;
            var usePlaceholder = (this.fieldName === 'field' + fieldNum) ? true : false;

            this.$el.html(this.compiledTemplate({
                fieldName: this.fieldName,
                usePlaceholder: usePlaceholder
            }));
            if (!usePlaceholder) {
                this.$('.field-name-input').val(this.fieldName);
            }
            this.setModalBody();
            this.children.flashMessages.render().prependTo(this.el);
            return this;
        },
        
        template: '\
        <div class="extraction-form-container">\
            <div class="control-group">\
                <label class="control-label"><%- _("Field Name").t() %></label>\
                <div class="controls">\
                    <div class="control">\
                        <input type="text" class="input-medium field-name-input" <% if(usePlaceholder){ %>placeholder="<%- fieldName %>"<%}%> />\
                    </div>\
                </div>\
            </div>\
        </div>\
        <div class="extraction-form-buttons">\
            <div class="buttons-container">\
                <a href="#" class="btn btn-primary submit-button"></a>\
            </div>\
        </div>\
        '
    });
});

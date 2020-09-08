/**
 * Dialog contents that allows user to name a new extracted field or required text.
 * This is loaded into a PopDown in MasterEventEditor.
 */
define([
            'jquery',
            'underscore',
            'module',
            'models/shared/dataenrichment/FieldExtraction',
            'views/Base',
            'views/shared/FlashMessages',
            'views/shared/controls/ControlGroup',
            'util/field_extractor_utils'
        ],
        function(
            $,
            _,
            module,
            FieldExtraction,
            BaseView,
            FlashMessages,
            ControlGroup,
            fieldExtractorUtils
        ) {

    return BaseView.extend({

        moduleId: module.id,
        tagName: 'form',
        className: 'form-horizontal field-extraction-form',
        EXTRACT_MODE: 'extract',
        REQUIRE_MODE: 'require',

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.formMode = this.EXTRACT_MODE;
            this.model.fieldExtraction = new FieldExtraction({ regex: this.model.state.get('regex') });
            this.children.flashMessages = new FlashMessages({
                model: this.model.fieldExtraction
            });
            this.currentInput = '';
        },

        events: {
            'click .submit-button': 'onSubmit',
            'keypress' : function(event) {
                var ENTER_KEY = 13;
                if(event.which === ENTER_KEY) {
                    this.onSubmit(event);
                }
            },
            'click .mode-extract': function(e) {
                e.preventDefault();
                this.formMode = this.EXTRACT_MODE;
                this.setModalBody();
                $('.field-name-input').val(this.currentInput);
            },
            'click .mode-require': function(e) {
                e.preventDefault();
                this.formMode = this.REQUIRE_MODE;
                this.currentInput = $('.field-name-input').val();
                this.setModalBody();
            }
        },

        getTemplate: function() {
            if(this.options.eventType === 'master'){
                if(this.formMode === this.EXTRACT_MODE){
                    return this.masterExtractTemplate;
                } else {
                    var message;
                    if(this.options.requiredText) {
                        // There is already 1 required text set by the user, and there can only be 1
                        message = _('You can only have 1 required text string. Selecting this new required text string will remove your old one.').t();
                    }else{
                        message = _('Use required text to help Splunk Enterprise find the events with the fields you want.').t();
                    }
                    return '<div class="require-message">' + message + '</div>';
                }
            }else{
                return this.sampleExtractTemplate;
            }
        },

        setModalBody: function() {
            //switch out body of modal
            var popDownWidth = $('.popdown-dialog.open').width();
            this.$el.find('.extraction-form-content').html(_(this.getTemplate()).template({ selection: this.options.selection }));
            $('.popdown-dialog.open').width(popDownWidth); //Maintain the current width of the popdown

            if(this.options.eventType === 'master'){
                //find currently active button by active class and deactivate it
                this.$el.find('.mode-toggle').each(_.bind(function(i, el) {
                    var $el = $(el);
                    if(this.formMode === $el.data('value')){
                        $el.addClass('active');
                    }else{
                        $el.removeClass('active');
                    }
                }, this));
                if(this.formMode === this.EXTRACT_MODE){
                    this.setButtonText('Add Extraction');
                    this.children.flashMessages.$el.show();
                }else{
                    this.setButtonText('Add Required Text');
                    this.children.flashMessages.$el.hide();
                }
            }else{
                var availableFields = this.getAvailableFields();
                if(this.model.state.get('examples').length === 0){
                    this.showErrorMessage('Additional examples cannot be added until at least one field has been chosen.');
                }else if (availableFields.length === 0){
                    this.showErrorMessage('All existing fields have already been added to this sample event.');
                }else{
                    if (availableFields.length === 1) {
                        this.model.fieldExtraction.set('fieldName', availableFields[0].value);
                    }
                    this.children.fieldNameDropdown = new ControlGroup({
                        label: _("Field Name").t(),
                        controlType: "SyntheticSelect",
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute: "fieldName",
                            model: this.model.fieldExtraction,
                            toggleClassName: 'btn',
                            menuWidth: 'narrow',
                            prompt: _("Select a Field").t(),
                            items: availableFields
                        }
                    });
                    this.setButtonText('Add Extraction');
                    if (availableFields.length !== 1) {
                        this.getSubmitButton().addClass('disabled');
                    }
                    this.children.fieldNameDropdown.render().replaceAll(this.$('.extraction-dropdown-wrapper'));
                    this.listenTo(this.model.fieldExtraction, 'change:fieldName', function() {
                        if (this.model.fieldExtraction.get('fieldName')) {
                            this.getSubmitButton().removeClass('disabled');
                        }
                        else {
                            this.getSubmitButton().addClass('disabled');
                        }
                    });
                    this.listenTo(this.children.fieldNameDropdown.children.child0, 'popdownHidden', function() {
                        this.getSubmitButton().focus();
                    });
                }
            }
        },

        showErrorMessage: function(message) {
            this.$('.extraction-form-container').hide();
            this.$('.extraction-form-buttons').hide();
            this.$el.append(_(this.noFieldsMessageTemplate).template({ message: _(message).t() }));
        },

        noFieldsMessageTemplate: '\
            <div class="no-fields-message-container">\
                <div class="no-fields-message">\
                    <i class="icon-alert"></i>\
                    <%- message %>\
                </div>\
            </div>\
        ',

        getAvailableFields: function() {
            var allFieldNames = fieldExtractorUtils.getCaptureGroupNames(this.model.state.get('regex')),
                sampleEventIndex = this.options.sampleEventIndex,
                sampleEvents = this.model.state.get('sampleEvents'),
                sampleEvent, availableFieldNames, usedFieldNames, availableFields;
            if(sampleEvents) {
                sampleEvent = sampleEvents[sampleEventIndex];
                if(sampleEvent) {
                    usedFieldNames = _.pluck(sampleEvent.extractions, 'fieldName');
                    availableFieldNames = _.difference(allFieldNames, usedFieldNames);
                    availableFields = _.map(availableFieldNames, function(fieldName) {
                        return ({ label: fieldName, value: fieldName });
                    });
                    return availableFields;
                }
            }
        },

        setButtonText: function(text) {
            this.getSubmitButton().text(_(text).t());
        },

        getSubmitButton: function() {
            return this.$('.extraction-form-buttons .buttons-container .submit-button');
        },

        focus: function() {
            if(this.options.eventType === 'master'){
                this.$('.field-name-input').focus();
            }else{
                if (this.model.fieldExtraction.get('fieldName')) {
                    this.getSubmitButton().focus();
                }else{
                    this.$('.extraction-form-content').find('.dropdown-toggle').focus();
                }
            }
        },

        onSubmit: function(e) {
            e.preventDefault();
            if(!this.getSubmitButton().hasClass('disabled')){
                if(this.options.eventType === 'master') {
                    if(this.formMode === this.EXTRACT_MODE) {
                        var fieldName = this.$('.field-name-input').val();
                        this.model.fieldExtraction.set({ fieldName: fieldName });
                        if(this.model.fieldExtraction.isValid(true)) {
                            this.trigger('action:addExtraction', _.extend({
                                fieldName: fieldName
                            }, this.options.selection));
                        }
                    }
                    else {
                        this.trigger('action:addRequiredText', this.options.selection);
                    }
                }
                else {
                    this.trigger('action:addSampleExtraction', _.extend({
                        fieldName: this.model.fieldExtraction.get('fieldName')
                    }, this.options.selection));
                }
            }
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                selection: this.options.selection,
                eventType: this.options.eventType
            }));
            this.setModalBody();
            this.children.flashMessages.render().prependTo(this.el);
            return this;
        },

        template: '\
            <div class="extraction-form-container">\
                <% if(eventType === "master") { %>\
                    <div class="extraction-form-mode-toggle">\
                        <div class="btn-group btn-group-radio">\
                            <button class="btn mode-toggle mode-extract" data-value="extract"><%- _("Extract").t() %></button>\
                            <button class="btn mode-toggle mode-require" data-value="require"><%- _("Require").t() %></button>\
                        </div>\
                    </div>\
                <% } %>\
                <div class="extraction-form-content"></div>\
            </div>\
            <div class="extraction-form-buttons">\
                <div class="buttons-container">\
                    <a href="#" class="btn btn-primary submit-button"></a>\
                </div>\
            </div>\
        ',

        masterExtractTemplate: '\
            <div class="control-group">\
                <label class="control-label"><%- _("Field Name").t() %></label>\
                <div class="controls">\
                    <div class="control">\
                        <input type="text" class="input-medium field-name-input" />\
                    </div>\
                </div>\
            </div>\
             <div class="control-group">\
                <label class="control-label"><%- _("Sample Value").t() %></label>\
                <div class="controls">\
                    <div class="control selected-text-control">\
                        <span class="input-label selected-text"><%- selection.selectedText %></span>\
                    </div>\
                </div>\
            </div>\
        ',

        sampleExtractTemplate: '\
             <div class="extraction-dropdown-wrapper"></div>\
             <div class="control-group sample-value-control">\
                <label class="control-label"><%- _("Sample Value").t() %></label>\
                <div class="controls">\
                    <div class="control selected-text-control">\
                        <span class="input-label selected-text"><%- selection.selectedText %></span>\
                    </div>\
                </div>\
            </div>\
        '

    });

});

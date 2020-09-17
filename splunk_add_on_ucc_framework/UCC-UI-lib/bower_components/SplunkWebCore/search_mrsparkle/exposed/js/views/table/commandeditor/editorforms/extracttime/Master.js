
define(
    [
        'jquery',
        'underscore',
        'module',
        'models/Base',
        'models/datasets/Column',
        'models/datasets/commands/Base',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Control',
        'views/table/commandeditor/editorforms/extracttime/CustomHelp',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        BaseModel,
        ColumnModel,
        BaseCommandModel,
        BaseEditorView,
        ListOverlayControl,
        CustomHelpView,
        ControlGroup
        ) {

        var CUSTOM_LABEL = _('Custom').t();

        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-extract-time',
            initializeEmptyRequiredColumn: true,

            formatPatterns: [
                { label: _('2009-06-15T13:45:30').t(), value: _('%FT%T').t() },
                { label: _('06/15/2009').t(), value: _('%m/%e/%Y').t() },
                { label: _('Monday, June 15, 2009').t(), value: _('%A, %B %e, %Y').t() },
                { label: _('June 15').t(), value: _('%B %e').t() },
                { label: _('06/15/2009 01:45 PM').t(), value: _('%m/%e/%Y %I:%M %p').t() },
                { label: _('06/15/2009 01:45:30 PM').t(), value: _('%m/%e/%Y %I:%M:%S %p').t() },
                { label: _('Monday, June 15, 2009 01:45 PM').t(), value: _('%A, %B %e, %Y %I:%M %p').t() },
                { label: _('Monday, June 15, 2009 01:45:30 PM').t(), value: _('%A, %B %e, %Y %I:%M:%S %p').t() },
                { label: _('Mon June 15 13:45:30 2009').t(), value: _('%c').t() },
                { label: _('Mon June 15 13:45:30 PDT 2009').t(), value: _('%+').t() },
                { label: _('13:45:30').t(), value: _('%T').t() },
                { label: _('01:45:30 PM').t(), value: _('%I:%M:%S %p').t() },
                { label: _('01:45 PM').t(), value: _('%I:%M %p').t() },
                { label: CUSTOM_LABEL, value: '' }
            ],

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                this.children.fieldPicker = new ControlGroup({
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
                    label: _('Field').t(),
                    size: 'small',
                    controlOptions: {
                        listOptions: {
                            items: this.getFieldPickerItems(),
                            selectedValues: this.model.command.requiredColumns.pluck('id'),
                            size: 'small',
                            multiselect: false,
                            selectMessage: _('Select a field...').t()
                        },
                        model: this.model.command.requiredColumns.first(),
                        modelAttribute: 'id',
                        toggleClassName: 'btn-overlay-toggle'
                    }
                });

                this.children.fieldNameInput = new ControlGroup({
                    controlType: 'Text',
                    label: _('New field name').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'newFieldName',
                        updateOnKeyUp: true
                    }
                });

                this.children.formatPicker = new ControlGroup({
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
                    label: _("Date-time format").t(),
                    size: 'small',
                    controlOptions: {
                        listOptions: {
                            items: this.formatPatterns,
                            size: 'small',
                            multiselect: false,
                            selectMessage: _('Select a date-time format...').t()
                        },
                        model: this.model.command,
                        modelAttribute: 'formatPatternFromPicker',
                        toggleClassName: 'btn-overlay-toggle'
                    }
                });

                this.children.patternLabel = new ControlGroup({
                    controlType: 'Text',
                    label: _('Pattern').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'formatPattern',
                        updateOnKeyUp: true
                    }
                });

                this.children.customHelpView = new CustomHelpView();
            },

            startListening: function() {
                BaseEditorView.prototype.startListening.apply(this, arguments);

                this.listenTo(this.model.command, 'change:formatPatternFromPicker', this.handleSelectionChange);
            },

            handleSelectionChange: function() {
                var pickerFormat = this.model.command.get('formatPatternFromPicker');

                if (this.model.command.get('formatPatternFromPicker') === '') {
                    this.model.command.set('isCustom', true);
                } else {
                    this.model.command.set('isCustom', false);
                }

                // This line will auto-fill the text control with the correct format. If the user picked custom,
                // then they can type in the box and formatPattern will update accordingly.
                this.model.command.set('formatPattern', pickerFormat);
                this.visibility();
            },

            handleApply: function(options) {
                this.addNewField();
                BaseEditorView.prototype.handleApply.apply(this, arguments);
            },

            visibility: function() {
                if (this.model.command.get('isCustom')) {
                    this.children.patternLabel.enable();
                    this.children.customHelpView.activate({ deep: true }).$el.css('display', '');
                } else {
                    this.children.patternLabel.disable();
                    this.children.customHelpView.deactivate({ deep: true }).$el.css('display', 'none');
                }
            },

            render: function() {
                $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                    _: _
                }));

                var $formSection = this.$('.commandeditor-section-padded');

                this.children.fieldPicker.activate().render().appendTo($formSection);
                this.children.fieldNameInput.activate().render().appendTo($formSection);
                this.children.formatPicker.activate().render().appendTo($formSection);
                this.children.patternLabel.activate().render().appendTo($formSection);
                this.children.customHelpView.render().appendTo($formSection);
                this.appendButtons();
                this.appendAdvancedEditorLink();

                this.visibility();

                return this;
            },

            template: '\
                <div class="commandeditor-section-padded"></div>\
            '
        });
    }
);

define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Control',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/TextareaControl',
        'util/keyboard'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        ListOverlayControl,
        ControlGroup,
        TextareaControl,
        keyboardUtils
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-eval',
            
            initialize: function(options) {
                BaseEditorView.prototype.initialize.apply(this, arguments);
                
                this.children.newFieldName = new ControlGroup({
                    controlType: 'ListOverlay',
                    controlTypes: {'ListOverlay': ListOverlayControl},
                    label: _('Field').t(),
                    size: 'small',
                    controlOptions: {
                        model: this.model.command.requiredColumns.at(0),
                        modelAttribute: 'id',
                        listOptions: {
                            items: this.getFieldPickerItems(),
                            selectedValues: this.model.command.requiredColumns.pluck('id'),
                            selectMessage: _('Select a field...').t()
                        },
                        toggleClassName: 'btn-overlay-toggle'
                    }
                });

                this.children.evalExpressionBox = new TextareaControl({
                    className: 'eval-box',
                    model: this.model.command,
                    modelAttribute: 'expression',
                    size: 'small'
                });

                this.children.evalExpressionControl = new ControlGroup({
                    controls: this.children.evalExpressionBox,
                    label: _('Eval expression').t()
                });
            },

            events: $.extend({}, BaseEditorView.prototype.events, {
                // Don't actually add a new line, this will trigger a submit of the form
                'keydown textarea': function(e) {
                    if (!e.shiftKey && e.which === keyboardUtils.KEYS["ENTER"]) {
                        e.preventDefault();
                    }
                },

                // Textarea control does not have 'updateOnKeyUp' flag option to pass into control constructor
                // so manually update working model attribute (and apply button state) if user inputs text
                'keyup textarea': function(e) {
                    this.onInputChange(e);
                }
            }),

            onInputChange: function(e) {
                var inputValue = this.children.evalExpressionBox.$('textarea').val();
                this.children.evalExpressionBox.setValue(inputValue, false);
                if (!e.shiftKey && e.which === keyboardUtils.KEYS["ENTER"]) {
                    this.handleApply();
                }
            },

            handleApply: function(options) {
                var previousCommand = this.model.table.commands.getPreviousCommand(this.model.commandPristine),
                    optionsCopy = $.extend(true, {}, options, {
                        validateFields: true,
                        updateSPLOptions: {
                            previousCommand: previousCommand
                        }
                    }),
                    updateDeferred;

                updateDeferred = this.model.command.updateSPL(optionsCopy.updateSPLOptions);

                $.when(updateDeferred).always(function() {
                    if (!this.model.command.validationError) {
                        this.model.command.updateRequiredColumns();
                        BaseEditorView.prototype.handleApply.call(this, optionsCopy);
                    }
                }.bind(this));
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _,
                        helpLink: this.getHelpLink('learnmore.about.eval')
                    }));
                    
                    this.children.evalExpressionControl.activate({ deep: true }).render().$el.prependTo(this.$('.commandeditor-section-padded'));
                    this.children.newFieldName.activate({ deep: true }).render().$el.prependTo(this.$('.commandeditor-section-padded'));
                    
                    this.appendButtons();
                    if (this.model.state.get('previousJSON')) {
                        this.appendAdvancedEditorReturnLink();
                    }
                }

                return this;
            },

            template: '\
                <div class="commandeditor-section-padded">\
                    <a class="external commandeditor-help-link" target="_blank" href=<%- helpLink %>><%- _("Learn more").t() %></a>\
                </div>\
            '
        });
    }
);

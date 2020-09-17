define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/TextareaControl',
        'util/keyboard'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        ControlGroup,
        TextareaControl,
        keyboardUtils
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-eval',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                this.children.newFieldName = new ControlGroup({
                    controlType: 'Text',
                    size: 'small',
                    label: _('Field name').t(),
                    controlClass: 'controls-fill',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'newFieldName',
                        updateOnKeyUp: true
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
                        // We don't *technically* add multiple fields here, but addNewFields has the logic for removing
                        // fields that have been previously added. This is necessary for eval, where you might first
                        // eval a new field, then change your eval to clean an existing field, and thus you need to remove
                        // the new field that was added.
                        this.addNewFields();
                        BaseEditorView.prototype.handleApply.call(this, optionsCopy);
                    }
                }.bind(this));
            },

            // Need to override this from Base because unlike every other command, it is legal for eval to define
            // a newFieldName that is the same as one currently present in the table. However, we should still
            // block the user from colliding with a future name.
            setCollidingFieldNames: function() {
                var newFieldName = this.model.command.get('newFieldName');

                // If the newFieldName exists in the pristine columns, then we're just editing, so don't run the collision checks
                if (this.model.commandPristine.columns.pluck('name').indexOf(newFieldName) < 0) {
                    BaseEditorView.prototype.setCollidingFieldNames.apply(this, arguments);
                }
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

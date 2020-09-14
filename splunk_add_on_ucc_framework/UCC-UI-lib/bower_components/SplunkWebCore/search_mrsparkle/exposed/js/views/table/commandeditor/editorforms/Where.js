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
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-where',

            initialize: function(attributes, options) {
                BaseEditorView.prototype.initialize.apply(this, arguments);
				
				
                this.children.expressionBox = new TextareaControl({
                    className: 'where-box',
                    model: this.model.command,
                    modelAttribute: 'expression',
                    size: 'small'
                });

                this.children.expressionControl = new ControlGroup({
                    controls: this.children.expressionBox,
                    label: _('Where expression').t()
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
                var inputValue = this.children.expressionBox.$('textarea').val();
                this.children.expressionBox.setValue(inputValue, false);
                if (!e.shiftKey && e.which === keyboardUtils.KEYS["ENTER"]) {
                    this.handleApply();
                }
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _
                    }));

                    this.children.expressionControl.activate({ deep: true }).render().$el.prependTo(this.$('.commandeditor-section-padded'));

                    this.appendButtons();
                    if (this.model.state.get('previousJSON')) {
                        this.appendAdvancedEditorReturnLink();
                    }
                }

                return this;
            },

            template: '\
                <div class="commandeditor-section-padded"></div>\
            '
        });
    }
);

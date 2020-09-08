define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/shared/controls/ControlGroup'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        ControlGroup
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-truncate',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);
                this.children.spinner = new ControlGroup({
                    label: _('Max rows').t(),
                    controlType: "Spinner",
                    size: 'small',
                    controlOptions: {
                        modelAttribute: 'limit',
                        model: this.model.command,
                        min: 1,
                        step: 10,
                        placeholder: 10,
                        integerOnly: true,
                        updateOnKeyUp: true
                    }
                });
            },

            render: function() {
                $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                    _: _
                }));
                
                this.children.spinner.render().appendTo(this.$(".commandeditor-section-padded"));
                this.appendButtons();

                return this;
            },

            template: '<div class="commandeditor-section-padded"></div>'
        });
    }
);
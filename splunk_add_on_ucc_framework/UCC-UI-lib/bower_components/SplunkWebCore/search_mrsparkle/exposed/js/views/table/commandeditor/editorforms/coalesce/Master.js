define(
    [
        'jquery',
        'underscore',
        'module',
        'models/Base',
        'models/datasets/commands/Base',
        'views/shared/controls/ControlGroup',
        'views/table/commandeditor/editorforms/BaseSortable',
        'views/table/commandeditor/editorforms/coalesce/CoalesceRow'
    ],
    function(
        $,
        _,
        module,
        BaseModel,
        BaseCommandModel,
        ControlGroup,
        BaseSortableEditorView,
        FieldRowView
        ) {
        return BaseSortableEditorView.extend({
            moduleId: module.id,
            className: BaseSortableEditorView.CLASS_NAME + ' commandeditor-form-coalesce',

            FieldRowView: FieldRowView,

            initialize: function() {
                BaseSortableEditorView.prototype.initialize.apply(this, arguments);

                this.children.fieldName = new ControlGroup({
                    controlType: 'Text',
                    size: 'small',
                    label: _('New field name').t(),
                    controlClass: 'controls-fill',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'newFieldName',
                        updateOnKeyUp: true
                    }
                });
            },

            handleApply: function(options) {
                this.addNewField();
                BaseSortableEditorView.prototype.handleApply.call(this, options);
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseSortableEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseSortableEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _
                    }));

                    this.children.fieldName.render().appendTo(this.$('.commandeditor-section-field-name'));

                    _.each(this.children, function(rowView) {
                        // Need to ignore the render of fieldName
                        if (rowView.model) {
                            rowView.render().appendTo(this.getSortableContainer());
                        }
                    }, this);

                    this.appendButtons();
                    this.appendAdvancedEditorLink();
                    this.setSortingOnContainer();
                }
                return this;
            },

            template: '\
                <div class="commandeditor-section commandeditor-section-padded commandeditor-section-field-name"></div>\
                <div class="commandeditor-section commandeditor-section-scrolling commandeditor-section-sortable ui-sortable"></div>\
                <div class="commandeditor-section commandeditor-section-padded">\
                    <div>\
                        <a class="add-field">\
                            <i class="icon-plus"></i>\
                            <%- _("Add field...").t()%>\
                        </a>\
                    </div>\
                </div>\
            '
        });
    }
);
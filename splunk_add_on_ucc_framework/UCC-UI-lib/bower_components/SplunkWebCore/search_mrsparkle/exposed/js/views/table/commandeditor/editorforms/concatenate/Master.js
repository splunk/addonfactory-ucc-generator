define(
    [
        'jquery',
        'underscore',
        'module',
        'models/Base',
        'models/datasets/commands/Base',
        'views/shared/controls/ControlGroup',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/editorforms/BaseSortable',
        'views/table/commandeditor/editorforms/concatenate/ConcatenateRow'
    ],
    function(
        $,
        _,
        module,
        BaseModel,
        BaseCommandModel,
        ControlGroup,
        BaseEditorView,
        BaseSortableEditorView,
        ConcatenateRowView
    ) {
        return BaseSortableEditorView.extend({
            moduleId: module.id,
            className: BaseSortableEditorView.CLASS_NAME + ' commandeditor-form-concatenate',

            FieldRowView: ConcatenateRowView,

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

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

                this.model.command.editorValues.each(function(editorValue) {
                    this.createFieldRow(editorValue);
                }, this);
            },

            events: $.extend({}, BaseSortableEditorView.prototype.events, {
                'click .add-string': function(e) {
                    e.preventDefault();

                    var rowView;

                    this.model.command.editorValues.add({ text: '' });
                    rowView = this.createFieldRow(this.model.command.editorValues.last());
                    rowView.render().appendTo(this.getSortableContainer());
                }
            }),

            updateFieldOrder: function(e, ui) {
                var idArray = this.getSortableContainer().sortable('toArray'),
                    id = ui.item.length && ui.item[0].id,
                    newIndex = idArray.indexOf(id),
                    modelToMove = this.model.command.editorValues.find(function(editorValue) {
                        return editorValue.id === id;
                    }, this);
                this.model.command.editorValues.remove(modelToMove);
                this.model.command.editorValues.add(modelToMove, { at: newIndex });
            },

            createFieldRow: function(editorValue) {
                var editorValueId = this.model.command.getUniqueEditorValueId();

                editorValue.set('id', editorValueId);

                return BaseSortableEditorView.prototype.createFieldRow.apply(this, arguments);
            },

            addNewRow: function(newRequiredGuid) {
                var rowView;

                this.model.command.editorValues.add({ columnGuid: newRequiredGuid });

                if (!this.model.command.requiredColumns.get(newRequiredGuid)) {
                    this.model.command.requiredColumns.add({ id: newRequiredGuid });
                }
                rowView = this.createFieldRow(this.model.command.editorValues.last());
                rowView.render().appendTo(this.getSortableContainer());
            },

            removeRow: function(id) {
                var modelToRemove = this.model.command.editorValues.find(function(editorValue) {
                    return editorValue.id === id;
                }, this);

                // If this is the last row that uses a particular columnGuid, then it gets removed from requiredColumns
                if (this.model.command.editorValues.where({ columnGuid: modelToRemove.get('columnGuid') }).length === 1) {
                    this.model.command.requiredColumns.remove({ id: modelToRemove.get('columnGuid') });
                }

                this.model.command.editorValues.remove(modelToRemove);
                this.children[id].remove();
                delete this.children[id];
            },

            handleApply: function(options) {
                this.addNewField();
                BaseSortableEditorView.prototype.handleApply.apply(this, arguments);
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _
                    }));

                    this.children.fieldName.render().appendTo(this.$('.commandeditor-section-field-name'));
                    _.each(this.children, function(rowView) {
                        // Need to ignore the render of fieldName
                        if (rowView.model) {
                            rowView.render().appendTo(this.getSortableContainer());
                        }
                    }, this);

                    this.getSortableContainer().sortable(
                        {
                            axis: 'y',
                            stop: _.bind(function(e, ui) {
                                this.updateFieldOrder(e, ui);
                            }, this)
                        }
                    );

                    this.appendButtons();
                    this.appendAdvancedEditorLink();

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
                    <div>\
                        <a class="add-string">\
                            <i class="icon-plus"></i>\
                            <%- _("Add string...").t()%>\
                        </a>\
                    </div>\
                </div>\
            '
        });
    }
);

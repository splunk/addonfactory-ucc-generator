define(
    [
        'jquery',
        'underscore',
        'module',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/listpicker/Overlay',
        'jquery.ui.sortable'
    ],
    function(
        $,
        _,
        module,
        BaseEditorView,
        ListPickerOverlay,
        undefined
    ) {
        var CLASS_NAME = BaseEditorView.CLASS_NAME + ' commandeditor-form-sortable';

        return BaseEditorView.extend({
            moduleId: module.id,
            className: CLASS_NAME,

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                this.model.command.requiredColumns.each(function(rowModel) {
                    this.createFieldRow(rowModel);
                }, this);
            },

            events: $.extend({}, BaseEditorView.prototype.events, {
                'click .add-field': function(e) {
                    e.preventDefault();
                    this.openFieldsPicker();
                }
            }),

            updateFieldOrder: function(e, ui) {
                var idArray = this.getSortableContainer().sortable('toArray'),
                    guid = ui.item.length > 0 && ui.item[0].id,
                    newIndex = idArray.indexOf(guid),
                    modelToMove = this.model.command.requiredColumns.get(guid);
                this.model.command.requiredColumns.remove(modelToMove);
                this.model.command.requiredColumns.add(modelToMove, { at: newIndex });
            },

            createFieldRow: function(rowModel) {
                var rowView = this.children[rowModel.id] = new this.FieldRowView({
                    model: rowModel,
                    selectedValue: rowModel.id,
                    fieldPickerItems: this.getFieldPickerItems()
                });
                this.listenTo(rowView, 'removeRow', function(options) {
                    this.removeRow(options.id);
                });
                return rowView;
            },

            addNewRow: function(newRequiredGuid) {
                var newRowView,
                    newRowModel = this.model.command.requiredColumns.add({
                        id: newRequiredGuid
                    });
                newRowView = this.createFieldRow(newRowModel);
                newRowView.render().appendTo(this.getSortableContainer());
            },

            removeRow: function(id) {
                var modelToRemove = this.model.command.requiredColumns.get(id);
                this.model.command.requiredColumns.remove(modelToRemove);
                this.children[id].remove();
                delete this.children[id];
            },

            openFieldsPicker: function() {
                var requiredValues = this.model.command.requiredColumns.pluck('id');

                if (this.children.fieldsPickerOverlay) {
                    this.children.fieldsPickerOverlay.deactivate({deep: true}).remove();
                }

                this.children.fieldsPickerOverlay = new ListPickerOverlay({
                    items: this.getFieldPickerItems(),
                    selectedValues: requiredValues,
                    selectMessage: _('Select a field...').t(),
                    multiselect: false,
                    required: true
                });

                this.children.fieldsPickerOverlay.render().appendTo(this.$el);
                this.children.fieldsPickerOverlay.slideIn();

                this.listenTo(this.children.fieldsPickerOverlay, 'selectionDidChange', function() {
                    var requiredValues = this.model.command.requiredColumns.pluck('id'),
                        newRequiredGuid = _.difference(this.children.fieldsPickerOverlay.getSelectedValues(), requiredValues)[0];

                    this.addNewRow(newRequiredGuid);
                });
            },

            getSortableContainer: function() {
                return this.$('.commandeditor-section-sortable');
            },

            setSortingOnContainer: function() {
                this.getSortableContainer().sortable(
                    {
                        axis: "y",
                        stop: _.bind(function(e, ui) {
                            this.updateFieldOrder(e, ui);
                        }, this)
                    }
                );
            }
        }, {
            CLASS_NAME: CLASS_NAME
        });
    }
);
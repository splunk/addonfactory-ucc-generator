define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/PolymorphicCommand',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'models/datasets/commands/FilterValues',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/editorforms/filtervalues/ConstraintRow',
        'views/table/commandeditor/editorforms/filtervalues/MatchTypeLabelRow',
        'views/table/commandeditor/listpicker/Overlay',
        'views/shared/controls/ControlGroup',
        'splunk.util'
    ],
    function(
        _,
        $,
        module,
        PolymorphicCommand,
        BaseCommandModel,
        ColumnModel,
        FilterValuesModel,
        BaseEditorView,
        ConstraintView,
        MatchTypeLabelView,
        ListPickerOverlay,
        ControlGroup,
        splunkUtil
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-filter-values',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);
            },

            events: $.extend({}, BaseEditorView.prototype.events, {
                'click .add-filter-parameter': function(e) {
                    e.preventDefault();
                    this.openFieldsPicker();
                }
            }),

            openFieldsPicker: function() {
                if (this.children.fieldsPickerOverlay) {
                    this.children.fieldsPickerOverlay.deactivate({deep: true}).remove();
                }
                this.children.fieldsPickerOverlay = new ListPickerOverlay({
                    items: this.getFieldPickerItems(),
                    required: false,
                    selectMessage: _('Select a field...').t(),
                    multiselect: false
                });
                this.children.fieldsPickerOverlay.render().appendTo(this.$commandSectionAdd);
                this.children.fieldsPickerOverlay.slideIn();

                this.listenTo(this.children.fieldsPickerOverlay, 'selectionDidChange', this._addRow);
            },

            _addRow: function() {
                var selectedColumn = this.model.commandPristine.columns.get(this.children.fieldsPickerOverlay.getSelectedValue()),
                    newConstraintRow;

                // If the column doesn't exist in the required columns list, add it
                if (!this.model.command.requiredColumns.get(selectedColumn.id)) {
                    // Add a new column with just the ID attribute
                    this.model.command.requiredColumns.add({ id: selectedColumn.id });
                }
                // Add the new editor values (Doesn't matter if the same column has an editor value already, user can
                // filter on the same column as many times as they want)
                this.model.command.editorValues.add({
                    columnGuid: selectedColumn.id,
                    comparator: this.getDefaultComparator(selectedColumn)
                });

                this.createNewMatchTypeRow(this.model.command.editorValues.length - 1);

                // Add a new view as well
                // The editor value should always be the value that was just pushed on
                newConstraintRow = this.createNewConstraintRow(this.model.command.editorValues.last());
                newConstraintRow.$('input[type=text]').focus();

                this.updateAdvancedEditorLink();
            },

            _renderRows: function() {
                //Clear out any old rows; Should not be necessary, but won't hurt
                _.each(this.children.constraintRows, function(row) {
                    row.deactivate({deep: true}).remove();
                });

                _.each(this.children.matchTypeRows, function(row) {
                    row.deactivate({deep: true}).remove();
                });

                this.children.constraintRows = [];
                this.children.matchTypeRows = [];

                // Iterate through the editor values to create each row
                this.model.command.editorValues.each(function(value, i) {
                    //Create new row, push onto children, and append to view
                    this.createNewMatchTypeRow(i);
                    this.createNewConstraintRow(value, i);
                }.bind(this));

                this.updateAdvancedEditorLink();
            },

            createNewConstraintRow: function(editorValue, i) {
                var newConstraintRow = new ConstraintView({
                    fieldPickerItems: this.getFieldPickerItems(),
                    model: {
                        command: this.model.command,
                        editorValue: editorValue
                    },
                    index: i
                });

                this.children.constraintRows.push(newConstraintRow);
                this.$sectionScrolling && newConstraintRow.activate({deep: true}).render().appendTo(this.$sectionScrolling);

                this.listenTo(newConstraintRow, "removeRow", this.handleRemove);

                return newConstraintRow;
            },

            createNewMatchTypeRow: function(i) {
                var newMatchTypeRow;

                if (i === 1) {
                    // This is the second constraint. Prepend a match type radio button.
                    newMatchTypeRow = this.createMatchTypeRadio();
                } else if (i > 1) {
                    newMatchTypeRow = this.createMatchTypeLabel();
                }

                if (newMatchTypeRow) {
                    this.children.matchTypeRows.push(newMatchTypeRow);
                    this.$sectionScrolling && newMatchTypeRow.activate({deep: true}).render().appendTo(this.$sectionScrolling);
                    newMatchTypeRow.$el.addClass('commandeditor-group');
                }

                return newMatchTypeRow;
            },

            createMatchTypeRadio: function() {
                var matchTypeRadio = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    size: 'small',
                    controlClass: 'controls-fill',
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'filterAllValues',
                        items: [
                            {
                                label: _('AND').t(),
                                value: true
                            },
                            {
                                label: _('OR').t(),
                                value: false
                            }
                        ]
                    }
                });
                matchTypeRadio.render().appendTo(this.$sectionScrolling);
                return matchTypeRadio;
            },

            createMatchTypeLabel: function() {
                var matchTypeLabel = new MatchTypeLabelView({
                    model: this.model.command,
                    modelAttribute: 'filterAllValues',
                    labelMap: {
                        'true': _('AND').t(),
                        'false': _('OR').t()
                    },
                    additionalClassNames: 'filter-value-match-type-label'
                });
                matchTypeLabel.render().appendTo(this.$sectionScrolling);
                return matchTypeLabel;
            },

            getDefaultComparator: function(column) {
                return FilterValuesModel.getFilterItems(column.get("type")).defaultComparator;
            },

            handleRemove: function(colIndex) {
                // editorValue at index 0 cannot be removed
                if (colIndex > 0) {
                    this.children.matchTypeRows[colIndex - 1].remove();
                    this.children.matchTypeRows.splice(colIndex - 1, 1); //delete element from array
                }
                this.updateAdvancedEditorLink();
            },

            updateAdvancedEditorLink: function() {
                // We need to update the advanced editor link any time we render/add/remove constraints
                this.$(BaseEditorView.ADVANCED_EDITOR_SELECTOR).remove();
                this.appendAdvancedEditorLink();
            },

            render: function() {
                $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                    _: _,
                    splunkUtil: splunkUtil
                }));

                this.$sectionScrolling = this.$('.popdown-dialog-scroll-parent');
                this.$commandSectionAdd = this.$('.commandeditor-section-add');
                this.appendButtons();
                this._renderRows();
                return this;
            },

            template: '\
                <div class="commandeditor-section-scrolling popdown-dialog-scroll-parent"></div>\
                <div class="commandeditor-section-padded commandeditor-section-add">\
                    <a href="#" class="add-filter-parameter"><i class="icon-plus"></i> <%-_("Add condition...").t()%></a>\
                </div>\
            '
        });
    }
);

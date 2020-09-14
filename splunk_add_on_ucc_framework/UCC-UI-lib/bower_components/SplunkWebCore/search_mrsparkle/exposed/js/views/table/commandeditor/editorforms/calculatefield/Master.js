define(
    [
        'jquery',
        'underscore',
        'module',
        'models/Base',
        'models/datasets/Column',
        'models/datasets/commands/Base',
        'views/shared/controls/ControlGroup',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/editorforms/calculatefield/CalculateFieldRow',
        'views/table/commandeditor/editorforms/calculatefield/CalculateValueRow'
    ],
    function(
        $,
        _,
        module,
        BaseModel,
        ColumnModel,
        BaseCommandModel,
        ControlGroup,
        BaseEditorView,
        CalculateFieldRow,
        CalculateValueRow
        ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-calculate-field',
            FieldRowView: CalculateFieldRow,
            
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
                // create new array for value/field rows
                this.children.rows = [];
            },

            startListening: function() {
                this.listenTo(this.model.state, 'removeRow', this.handleRowRemoved);
                this.listenTo(this.model.command.editorValues, 'add remove', this.renderRows);
                BaseEditorView.prototype.startListening.apply(this, arguments);
            },
            
            events: $.extend({}, BaseEditorView.prototype.events, {
                'click .add-field:not(.disabled)': function(e) {
                    // Add an empty column guid to signify a field row
                    this.model.command.editorValues.add({
                        columnGuid: ''
                    });
                    e.preventDefault();

                },
                'click .add-value:not(.disabled)': function(e) {
                    // Add an empty editor value to signify a value row
                    this.model.command.editorValues.add({});
                    e.preventDefault();
                }
            }),

            // Create a new field row to allow the user to do arithmetic with a field
            addNewFieldRow: function(editorValue) {
                // Need to manually filter out all types except number
                var newFieldRow = new CalculateFieldRow({
                        model: {
                            state: this.model.state,
                            editorValue: editorValue
                        },
                        listpickerItems: this.getFieldPickerItems({blacklist: [
                            ColumnModel.TYPES.EPOCH_TIME,
                            ColumnModel.TYPES.IPV4,
                            ColumnModel.TYPES.BOOLEAN,
                            ColumnModel.TYPES.STRING,
                            ColumnModel.TYPES._TIME,
                            ColumnModel.TYPES._RAW
                        ]}),
                        collection: {
                            editorValues: this.model.command.editorValues
                        }
                    });
                this.children.rows.push(newFieldRow);
                newFieldRow.activate({deep: true}).render().insertBefore(this.$('.calculated-field-add'));
            },

            // Create a new value row to allow the user to do arithmetic with a specific value
            addNewValueRow: function(editorValue) {
                var newFieldRow = new CalculateValueRow({
                        model: {
                            state: this.model.state,
                            editorValue: editorValue
                        },
                        collection: {
                            editorValues: this.model.command.editorValues
                        }
                    });
                this.children.rows.push(newFieldRow);
                newFieldRow.activate({deep: true}).render().insertBefore(this.$('.calculated-field-add'));
            },

            // Render all rows from the editor values
            renderRows: function() {
                // Clear out the operation and old rows
                if (this.children.operation) {
                    this.children.operation.deactivate({deep: true}).remove();
                    delete this.children.operation;
                }

                if (this.children.rows.length) {
                    _.each(this.children.rows, function(row) {
                        row.deactivate({deep: true}).remove();
                    });
                    this.children.rows = [];
                }

                // Rerender the rows
                this.model.command.editorValues.each(function(editorValue, idx) {
                    var isFieldRow = this.model.command.isFieldRow(editorValue);

                    if (isFieldRow) {
                        this.addNewFieldRow(editorValue);
                    // Else, we add a value row
                    } else {
                        this.addNewValueRow(editorValue);
                    }
                    
                    if (idx === 0) {
                        // If there are 2 rows, or there is one row that is a field value row,
                        // we render the button grouo
                        if (this.model.command.editorValues.length === 2) {
                            this.renderButtonGroup();
                            // Hide the links when there are 2 values
                            this.hideLinks();
                        } else {
                            if (isFieldRow) {
                                this.renderButtonGroup();
                            }
                            this.showLinks();
                        }
                    }
                }.bind(this));
            },

            // Disable the add links
            hideLinks: function() {
                this.$('.calculated-field-add').hide();
            },

            // Enable the add links
            showLinks: function() {
                this.$('.calculated-field-add').css('display', 'flex');
            },

            // Deactivate and remove the row
            handleRowRemoved: function(rowView) {
                rowView.deactivate({deep: true}).remove();
            },

            // Create and render the button group
            renderButtonGroup: function() {
                // Remove any existing button group
                if (this.children.operation) {
                    this.children.operation.deactivate({deep: true}).remove();
                    delete this.children.operation;
                }
                this.children.operation = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    size: 'small',
                    additionalClassNames: 'arithmetic-controls-radio',
                    controlOptions: {
                        items: [
                            {
                                value: '+',
                                label: '+'
                            },
                            {
                                value: '-',
                                label: '-'
                            },
                            {
                                value: '*',
                                label: '*'
                            },
                            {
                                value: '/',
                                label: '/'
                            }
                        ],
                        model: this.model.command,
                        modelAttribute: 'operator'
                    }
                });
                this.children.operation.activate({deep: true}).render().insertBefore(this.$('.calculated-field-add'));
            },

            // Set up adding of the new field, then call into the base function
            handleApply: function(options) {
                this.model.command.updateRequiredColumns();
                this.addNewField({
                    type: ColumnModel.TYPES.NUMBER
                });
                BaseEditorView.prototype.handleApply.call(this, options);
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _
                    }));

                    this.children.fieldName.render().appendTo(this.$('.commandeditor-section-field-name'));
                    this.renderRows();
                    this.appendButtons();
                    this.appendAdvancedEditorLink();
                }
                return this;
            },

            template: '\
                <div class="commandeditor-section commandeditor-section-padded commandeditor-section-field-name"></div>\
                <div>\
                    <div class="calculated-field-add">\
                        <a href="#" class="add-field">\
                            <i class="icon-plus"></i>\
                            <%- _("Add a numeric field...").t()%>\
                        </a>\
                        <a href="#" class="add-value">\
                            <i class="icon-plus"></i>\
                            <%- _("Add a numeric value...").t()%>\
                        </a>\
                    </div>\
                </div>\
            '
        });
    }
);
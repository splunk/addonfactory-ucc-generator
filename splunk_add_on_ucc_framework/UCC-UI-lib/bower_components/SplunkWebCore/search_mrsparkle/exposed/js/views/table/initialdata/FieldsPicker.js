define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/Column',
        'views/Base',
        'views/table/commandeditor/listpicker/Master',
        'views/table/initialdata/FieldInfo',
        'views/table/modals/CollisionFieldDialog',
        'views/table/modals/FieldRemovalDialog'
    ],
    function(
        $,
        _,
        module,
        ColumnModel,
        BaseView,
        ListPicker,
        FieldInfoView,
        CollisionFieldDialog,
        FieldRemovalDialog
    ) {
        return BaseView.extend({
            module: module.id,
            className: 'fields-picker-container',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                var selectedValues = this.collection.columns.pluck('name'),
                    staticItems;
                this.existingColumnNames = selectedValues.slice();

                if (this.model.ast && !this.model.ast.isTransforming() && !this.model.ast.getFromCommandObjectPayloads().length) {
                    staticItems = [{ value: '_time', isDisabled: true }, { value: '_raw' }];
                }

                this.children.fieldsPicker = new ListPicker({
                    model: {
                        ast: this.model.ast,
                        fieldsSummary: this.model.fieldsSummary,
                        command: this.model.command,
                        state: this.model.state
                    },
                    collection: {
                        customAddedFieldPickerItems: this.collection.customAddedFieldPickerItems
                    },
                    multiselectMessage: _('Field name').t(),
                    // We need to include the current command columns as selectable fields
                    items: _.map(this.collection.columns.pluck('name'), function(item) {
                            return { value: item };
                        }, this),
                    // _time and _raw are always at the top of the list
                    staticItems: staticItems,
                    selectedValues: selectedValues,
                    multiselect: true,
                    sort: true,
                    additionalClassNames: 'fields-picker',
                    deferred: this.options.deferred,
                    includeAddItem: true
                });
            },

            events: {
                'mouseover .list-picker-list > li > a': function(e) {
                    e.preventDefault();
                    this.handleFieldHover(e);
                },
                'mouseover .list-picker-heading': function(e) {
                    this.removeFieldInfo();
                    e.preventDefault();
                }
            },

            startListening: function(options) {
                this.listenTo(this.children.fieldsPicker, 'selectionDidChange', _.debounce(this.handleFieldSelection), 1000);
            },

            getFieldModel: function(selectedColumnName) {
                if (this.model.fieldsSummary) {
                    return this.model.fieldsSummary.fields.find(function(field) {
                        return field.get('name') === selectedColumnName;
                    });
                }
            },

            handleFieldSelection: function() {
                var currentColumns = this.collection.columns,
                    currentColumnNames = currentColumns.pluck('name'),
                    selectedFieldNames = this.children.fieldsPicker.getSelectedValues(),
                    fieldNamesToAdd = _.difference(selectedFieldNames, currentColumnNames),
                    fieldNamesToRemove = _.difference(currentColumnNames, selectedFieldNames),
                    fieldObjectsToAdd = [],
                    fieldModelsToRemove = [],
                    callback = function() {
                        currentColumns.remove(fieldModelsToRemove);
                        this.children.fieldsPicker.setSelectedValues(currentColumns.pluck('name'));
                    }.bind(this),
                    fieldNameCollisionError,
                    addedColumnModels,
                    scrollToModel,
                    futureRequiredFields;

                if (fieldNamesToAdd.length) {
                    // The existing column names, by name, have existed before, so they cannot collide.
                    // In other words, if you uncheck a field and recheck it, you should never see the modal.
                    this.model.tablePristine.setCollidingFieldNames({
                        fieldsToAdd: _.difference(fieldNamesToAdd, this.existingColumnNames),
                        command: this.model.command
                    });

                    fieldNameCollisionError = this.model.command.validateCollisionFields();

                    if (fieldNameCollisionError) {
                        this.children.collisionFieldDialog = new CollisionFieldDialog({
                            message: fieldNameCollisionError
                        });
                        this.children.collisionFieldDialog.activate({ deep: true }).render().appendTo($('body')).show();

                        this.children.fieldsPicker.setSelectedValues(currentColumnNames);
                    } else {
                        _.each(fieldNamesToAdd, function(fieldName) {
                            fieldObjectsToAdd.push({
                                columnName: fieldName,
                                fieldsSummaryModel: this.getFieldModel(fieldName)
                            });
                        }, this);

                        addedColumnModels = currentColumns.addColumns(fieldObjectsToAdd, {
                            pristineColumns: this.model.tablePristine.commands.first().columns
                        });
                        scrollToModel = _.isArray(addedColumnModels) ? _.last(addedColumnModels) : addedColumnModels;
                        this.setScrollLeftToAddedColumn(scrollToModel);
                    }

                    this.model.command.unset('collisionFields');
                } else if (fieldNamesToRemove.length) {
                    _.each(fieldNamesToRemove, function(fieldName) {
                        fieldModelsToRemove.push(currentColumns.find(function(columnModel) {
                            return columnModel.get('name') === fieldName;
                        }, this));
                    }, this);

                    futureRequiredFields = this.model.table.commands.validateSubsequentCommands(
                        _.pluck(fieldModelsToRemove, 'id'),
                        this.model.table.getCurrentCommandIdx()
                    );

                    if (futureRequiredFields) {
                        this.children.fieldsPicker.setSelectedValues(currentColumnNames);

                        this.children.fieldRemovalDialog && this.children.fieldRemovalDialog.deactivate({deep: true}).remove();
                        this.children.fieldRemovalDialog = new FieldRemovalDialog({
                            fields: _.invoke(futureRequiredFields, 'get', 'name')
                        });
                        this.children.fieldRemovalDialog.render().appendTo($('body')).show();
                        this.listenTo(this.children.fieldRemovalDialog, 'accepted', function() {
                            callback();
                        });
                    } else {
                        callback();
                    }
                }
            },

            // TODO: This is pretty similar to the base editorform's auto scrolling function.
            // Don't really know how we would share that logic though...
            setScrollLeftToAddedColumn: function(addedColumn) {
                var insertedIndex,
                    sumOfWidths = ColumnModel.WIDTH_SELECT_ALL,
                    i = 0;

                insertedIndex = this.collection.columns.indexOf(addedColumn);
                for (; i < insertedIndex - 1; i++) {
                    sumOfWidths += this.collection.columns.at(i).getWidth();
                }
                this.model.table.entry.content.set('dataset.display.scrollLeft', sumOfWidths);
            },

            handleFieldHover: function(e) {
                var $target = $(e.currentTarget),
                    fieldName = $target.data('value'),
                    fieldModel = this.getFieldModel(fieldName);

                this.removeFieldInfo();

                if (!$target.hasClass('disabled') && fieldModel) {
                    this.children.fieldInfo = new FieldInfoView({
                        model: {
                            field: fieldModel,
                            fieldsSummary: this.model.fieldsSummary,
                            table: this.model.table
                        },
                        direction: 'right',
                        onHiddenRemove: true
                    });

                    this.children.fieldInfo.activate({ deep: true }).render().appendTo($('body'));

                    // Focus on this field in the picker so that the return key selects this field
                    this.children.fieldInfo.show($target, {
                        $onOpenFocus: $target
                    });
                    // Push the margin out past the scroll bar (this is set inline from the modal, so we override after rendering)
                    this.children.fieldInfo.$el.css('margin-left', this.calculateMarginWithScrollbar($target.closest('ul'), this.children.fieldInfo.$el) + 'px');
                }
            },

            calculateMarginWithScrollbar: function($target, $container) {
                // Measure the difference to get the scrollbar size
                var scrollWidth = $target.outerWidth() - $target.get(0).clientWidth,
                    // Find the arrow div and get its width (we want the arrow to start at the end of the scrollbar)
                    arrowLength = $container.children('.arrow').outerWidth();
                return scrollWidth + arrowLength;
            },

            removeFieldInfo: function() {
                if (this.children.fieldInfo) {
                    this.children.fieldInfo.deactivate({ deep: true }).remove();
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _
                }));

                this.children.fieldsPicker.activate({ deep: true }).render().appendTo(this.$el);

                return this;
            },

            template: '\
                <div class="fields-picker-header"><%= _("Select existing fields").t() %></div>\
            '
        });
    }
);

define(
    [
        'underscore',
        'jquery',
        'module',
        'models/datasets/commands/FilterValues',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/table/commandeditor/listpicker/Control'
    ],
    function(
        _,
        $,
        module,
        FilterValuesModel,
        BaseView,
        ControlGroup,
        ListPickerControl
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'commandeditor-group',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.fieldPicker = new ListPickerControl({
                    listOptions: {
                        items: this.options.fieldPickerItems,
                        selectedValues: this.model.command.requiredColumns.pluck('id'),
                        size: 'small',
                        multiselect: false,
                        selectMessage: _('Select a field...').t()
                    },
                    model: this.model.editorValue,
                    modelAttribute: 'columnGuid',
                    toggleClassName: '',
                    className: ListPickerControl.prototype.className + ' commandeditor-group-label',
                    size: 'small'
                });

                this.createFilterControl(); // since this control is destroyed and recreated, it's in a function
            },

            startListening: function() {
                this.listenTo(this.model.editorValue, 'change:columnGuid', this.onChangeField);
                this.listenTo(this.model.editorValue, 'change:comparator', this.setTextDisplay);
                this.listenTo(this.model.editorValue, 'change:hasError', this.setErrorState);
            },

            events: {
                'click .commandeditor-group-remove': function(e) {
                    e.preventDefault();
                    this.removeRow();
                }
            },

            onChangeField: function() {
                this.children.filterControl && this.children.filterControl.remove();

                this.createFilterControl();
                this.children.filterControl.render().appendTo(this.$el);

                this.setTextDisplay(this.model, this.model.editorValue.get("comparator"));

                // Always make sure requiredColumns is in sync with updated editorValues
                this.model.command.resetRequiredColumns(this.model.command.editorValues.pluck('columnGuid'));
            },

            createFilterControl: function() {
                var filterItems = this.getFilterItems(),
                    validCompatators = _.map(filterItems.items, function(filterItem, idx) {
                        return {
                            label: filterItem.label,
                            value: idx
                        };
                    }),
                    currentComparator = this.model.editorValue.get("comparator");

                if (validCompatators.length) {
                    // Reset to be default comparator if the current comparator is not in the new list of comparators
                    if (!filterItems.items.hasOwnProperty(currentComparator)) {
                        this.model.editorValue.set("comparator", filterItems.defaultComparator);
                    }

                    this.children.filterControl = new ControlGroup(
                        {
                            size: 'small',
                            controlClass: 'input-prepend',
                            controls: [
                                {
                                    type: 'SyntheticSelect',
                                    model: this.model.editorValue,
                                    options: {
                                        model: this.model.editorValue,
                                        modelAttribute: 'comparator',
                                        items: validCompatators,
                                        toggleClassName: 'btn',
                                        size: 'small',
                                        popdownOptions: {
                                            detachDialog: true
                                        }
                                    }
                                },
                                {
                                    type: 'Text',
                                    model: this.model.editorValue,
                                    options: {
                                        model: this.model.editorValue,
                                        modelAttribute: 'filterString',
                                        size: 'small',
                                        updateOnKeyUp: true
                                    }
                                }
                            ]
                        }
                    );
                }
            },

            setErrorState: function(hasError) {
                hasError && this.children.filterControl && this.children.filterControl.$el.addClass('error');
            },

            getFilterItems: function() {
                var column = this.model.command.columns.get(this.model.editorValue.get("columnGuid")),
                    type = column && column.get("type");

                return FilterValuesModel.getFilterItems(type);
            },

            setTextDisplay: function(model, value, options) {
                // textControl will always be the last control
                var filterItems = this.getFilterItems(),
                    filterItem = filterItems.items[value] || filterItems.items[filterItems.defaultComparator] || {},
                    textControl = this.children.filterControl && _(this.children.filterControl.getAllControls()).last();

                if (textControl) {
                    if (filterItem.rightSideDisabled) {
                        textControl.disable();
                        // Remove any text that has been set (This won't affect the model value)
                        textControl.$disabledInput.text("");
                    } else {
                        textControl.enable();
                    }
                }
            },

            removeRow: function() {
                var colId = this.model.editorValue.get("columnGuid"),
                    colIndex = this.model.editorValue.collection.indexOf(this.model.editorValue);
                //Only remove from required columns if its the only instance of this column by ID
                if (this.model.editorValue.collection.where({columnGuid: colId}).length === 1) {
                    this.model.command.requiredColumns.remove(colId);
                }
                //Remove editor value from collection and view
                this.model.editorValue.collection.remove(this.model.editorValue);
                this.remove();
                this.trigger('removeRow', colIndex);
            },

            render: function() {
                this.$el.html(this.compiledTemplate({}));
                this.children.fieldPicker.render().appendTo(this.$el);
                if (this.children.filterControl) {
                    this.children.filterControl.render().appendTo(this.$el);
                }
                this.setTextDisplay(this.model, this.model.editorValue.get("comparator"));
                this.setErrorState(this.model.editorValue.get("hasError"));
                if (this.options.index === 0) {
                    this.$('.commandeditor-group-remove').hide();
                }
                return this;
            },

            template: '<a href="#" class="commandeditor-group-remove"><i class="icon-x" /></a>'
        });
    }
);

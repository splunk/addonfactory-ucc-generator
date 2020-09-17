define(
    [
        'jquery',
        'underscore',
        'module',
        'models/datasets/Column',
        'views/table/commandeditor/editorforms/Base',
        'views/table/commandeditor/editorforms/stats/AggregatesContainer',
        'views/table/commandeditor/editorforms/stats/RowCount',
        'views/table/commandeditor/editorforms/stats/SplitByContainer',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        ColumnModel,
        BaseEditorView,
        AggregatesContainerView,
        RowCountView,
        SplitByContainerView,
        splunkUtils
    ) {
        return BaseEditorView.extend({
            moduleId: module.id,
            className: BaseEditorView.CLASS_NAME + ' commandeditor-form-stats',

            initialize: function() {
                BaseEditorView.prototype.initialize.apply(this, arguments);

                this.children.aggregatesContainer = new AggregatesContainerView({
                    model: {
                        command: this.model.command,
                        commandPristine: this.model.commandPristine
                    },
                    fieldPickerItems: this.getFieldPickerItems()
                });

                this.children.rowCount = new RowCountView({
                    model: {
                        command: this.model.command,
                        commandPristine: this.model.commandPristine
                    }
                });

                this.children.splitByContainer = new SplitByContainerView({
                    model: {
                        command: this.model.command,
                        commandPristine: this.model.commandPristine
                    },
                    fieldPickerItems: this.getFieldPickerItems()
                });
            },

            startListening: function(options) {
                BaseEditorView.prototype.startListening.apply(this, arguments);
                this.listenTo(this.model.command, 'functionsChange', this.updateButtonStates);
                this.listenTo(this.model.command, 'aggregatesChange editorValuesChange', function() {
                    this.model.command.updateRequiredColumns();
                });
            },

            handleApply: function(options) {
                var currentColumnsClone = this.model.commandPristine.columns.clone(),
                    previousCommand = this.model.table.commands.getPreviousCommand(this.model.commandPristine);

                // We need to pass the previous command through to updateSPL so that generateSPL and other methods in
                // the model have context about what the columns were called before we blew them away.
                options = $.extend(true, {}, options, {
                    updateSPLOptions: {
                        previousCommand: previousCommand
                    }
                });
                this.model.command.columns.reset();

                this.addColumnsFromEditorValues(currentColumnsClone);
                this.addColumnsFromAggregates(currentColumnsClone);
                this.addRowCountColumn(currentColumnsClone);

                BaseEditorView.prototype.handleApply.call(this, options);
            },

            // Each split becomes a column in the table
            addColumnsFromEditorValues: function(currentColumnsClone) {
                var previousCommand = this.model.table.commands.getPreviousCommand(this.model.commandPristine);

                this.model.command.editorValues.each(function(splitBy) {
                    var columnGuidForSplitBy = splitBy.get('columnGuid'),
                        columnName = this.model.commandPristine.getPreviousCommandFieldNameFromGuid(columnGuidForSplitBy),
                        existingColumnInCollection = currentColumnsClone.findWhere({ name: columnName }),
                        existingColumnInPreviousColumnCollection = previousCommand.columns.findWhere({ name: columnName }),
                        idToUse;

                    if (this.model.commandPristine.isComplete() && existingColumnInCollection) {
                        idToUse = existingColumnInCollection.id;
                    }

                    this.model.command.columns.add({
                        id: idToUse,
                        name: columnName,
                        type: existingColumnInPreviousColumnCollection.get('type')
                    });
                }, this);
            },

            // Each aggregate's function becomes a column in the table
            addColumnsFromAggregates: function(currentColumnsClone) {
                this.model.command.aggregates.each(function(aggregate) {
                    var columnGuidForAggregate = aggregate.get('columnGuid');

                    aggregate.functions.each(function(func) {
                        var columnName = this.model.commandPristine.getFunctionDisplayName({
                                func: func.get('value'),
                                columnGuid: columnGuidForAggregate
                            }),
                            existingColumnInCollection = currentColumnsClone.findWhere({ name: columnName }),
                            idToUse;

                        // We only want to preserve IDs if the command has been applied before.
                        // If the user just so happened to have a field called "avg(foo)" before ever doing stats,
                        // we wouldn't want to carry that guid over.
                        if (this.model.commandPristine.isComplete() && existingColumnInCollection) {
                            idToUse = existingColumnInCollection.id;
                        }

                        this.model.command.columns.add({
                            id: idToUse,
                            name: columnName,
                            type: ColumnModel.TYPES.NUMBER
                        });
                    }, this);
                }, this);
            },

            // "count" can also be a column in the table
            addRowCountColumn: function(currentColumnsClone) {
                var countColumn,
                    idToUse;

                if (splunkUtils.normalizeBoolean(this.model.command.get('rowCount'))) {
                    countColumn = currentColumnsClone.findWhere({ name: 'count' });

                    if (this.model.commandPristine.isComplete() && countColumn) {
                        idToUse = countColumn.get('id');
                    }

                    this.model.command.columns.add({
                        id: idToUse,
                        name: 'count',
                        type: ColumnModel.TYPES.NUMBER
                    });
                }
            },

            render: function() {
                if (!this.$el.html()) {
                    $(BaseEditorView.COMMANDEDITOR_SECTION).appendTo(this.$el);
                    this.$(BaseEditorView.COMMANDEDITOR_SECTION_SELECTOR).html(this.compiledTemplate({
                        _: _,
                        helpLink: this.getHelpLink('learnmore.about.stats')
                    }));

                    var scrollingDiv = this.$('.commandeditor-section-scrolling');

                    this.children.splitByContainer.activate({ deep: true }).render().prependTo(scrollingDiv);
                    this.children.rowCount.activate({ deep: true }).render().prependTo(scrollingDiv);
                    this.children.aggregatesContainer.activate({ deep: true }).render().prependTo(scrollingDiv);

                    this.appendButtons();

                }
                
                return this;
            },

            template: '\
                <a class="external commandeditor-help-link" target="_blank" href=<%- helpLink %>><%- _("Learn more").t() %></a>\
            '
        });
    }
);
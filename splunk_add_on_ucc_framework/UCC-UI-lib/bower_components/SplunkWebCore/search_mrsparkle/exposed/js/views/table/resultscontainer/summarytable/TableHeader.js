define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/datasettable/shared/TableHeader'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        TableHeaderView
        ) {
        return TableHeaderView.extend({

            initialize: function(options) {
                TableHeaderView.prototype.initialize.apply(this, arguments);
            },

            events: $.extend({}, TableHeaderView.prototype.events, {
                'click .col-header:not(":first-child"):not(".disabled")': function(e) {
                    var $target = $(e.currentTarget),
                        isCtrlClick = e.metaKey || e.ctrlKey || false,
                        isShiftClick = e.shiftKey || false;

                    this.handleColumnSelect($target, isCtrlClick, isShiftClick);
                },
                'mouseenter .col-header:first-child:not(".disabled")': function(e) {
                    this.$('.col-header').addClass('hover');
                    this.model.state.trigger('tableInteraction', 'hover', true);
                },
                'mouseleave .col-header:first-child:not(".disabled")': function(e) {
                    this.$('.col-header').removeClass('hover');
                    this.model.state.trigger('tableInteraction', 'hover', false);
                },
                'dragstart .col-header.column-selected': function(e) {
                    this.handleDragStart(e);
                },
                'dragenter .col-header': function(e) {
                    this.handleDragEnter(e);
                },
                'dragover .col-header': function(e) {
                    this.handleDragOver(e);
                },
                'dragend .col-header': function(e) {
                    this.handleDragEnd(e);
                },
                'drop .col-header': function(e) {
                    // Grab our column to drop, stop and prevent, and drop it into handle drop
                    var $column = $(e.currentTarget);
                    e.originalEvent.preventDefault();
                    e.originalEvent.stopPropagation();
                    this.handleDrop($column, true);
                }
            }),

            startListening: function(options) {
                TableHeaderView.prototype.startListening.apply(this, arguments);
                this.listenTo(this.model.state, 'cutSelection', this.handleCutSelection);
                this.listenTo(this.model.state, 'clearCutSelection', this.handleClearCutSelection);
                this.listenTo(this.model.state, 'columnInteraction', this.toggleClassForColumn);
                this.listenTo(this.model.state, 'columnSelection', this.handleColumnSelect);
            },

            toggleClassForColumn: function(index, className, add) {
                var $column = this.$('div[data-col-index=' + index + ']');

                if (add) {
                    $column.addClass(className);
                } else {
                    $column.removeClass(className);
                }
            },

            clearDragMarkers: function(shouldRemoveGrabbed) {
                var $allCols = this.$('.col-header');
                    $allCols.removeClass('over-right').removeClass('over-left');
                if (shouldRemoveGrabbed) {
                    $allCols.removeClass('grabbed');
                }
            },

            handleTableSelect: function($allColsSelected) {
                $allColsSelected.addClass('column-selected');

                TableHeaderView.prototype.handleTableSelect.apply(this, arguments);
            },

            addSelectedColumn: function($column) {
                var columnIndex = $column.data('col-index');

                $column.addClass('column-selected');
                this.model.state.trigger('columnInteraction', columnIndex, 'column-selected', true);
            },

            removeSelectedColumn: function($column) {
                var columnIndex = $column.data('col-index');

                if ($column.hasClass('column-selected')) {
                    $column.removeClass('column-selected');
                    this.model.state.trigger('columnInteraction', columnIndex, 'column-selected', false);
                }
            },

            handleCutSelection: function() {
                this.$('.col-header.column-selected').addClass('column-cut');
            },

            handleClearCutSelection: function() {
                this.$('.col-header.column-cut').removeClass('column-cut');
            },

            clearSelection: function() {
                this.$('.column-selected').removeClass('column-selected');
            },

            // Always happens after render to ensure elements are in the DOM
            setSelection: function() {
                var selectedColumns = this.model.dataset.selectedColumns,
                    selectedColumnInColumnsCollection,
                    selectedValueString,
                    selectedValue,
                    selectedColumnId,
                    selectedColumn,
                    selectedColumnTopValues,
                    selectionType = this.model.dataset.entry.content.get('dataset.display.selectionType'),
                    selectedText = this.model.dataset.entry.content.get('dataset.display.selectedText'),
                    currentCommandIndex = this.model.dataset.getCurrentCommandIdx(),
                    currentCommand = this.model.dataset.commands.at(currentCommandIndex),
                    $target,
                    triggerArgs;

                if (selectionType === 'column') {
                    selectedColumns.each(function (selectedColumn) {
                        selectedColumnInColumnsCollection = currentCommand.columns.get(selectedColumn.id);

                        // It's possible that the selected column doesn't exist in the table anymore
                        if (selectedColumnInColumnsCollection) {
                            $target = this.$('.col-header[data-field="' + selectedColumnInColumnsCollection.get('name') + '"]');
                            this.addSelectedColumn($target);
                            $target.attr("draggable", true);
                        }

                    }, this);

                } else if ((selectionType === 'cell') || (selectionType === 'text')) {
                    // If selected value is present in the summary top results, then tell TopResults view to
                    // render it as selected via the state model
                    selectedValueString = this.model.dataset.entry.content.get('dataset.display.selectedColumnValue');
                    selectedColumnId = selectedColumns && selectedColumns.length > 0 && selectedColumns.first().id;
                    selectedColumn = this.collection.columns.get(selectedColumnId);
                    selectedColumnTopValues = selectedColumn && this.model.summary.extractTopResults(selectedColumn.get('name'));
                    selectedValue = _.where(selectedColumnTopValues, { name: selectedValueString }) || [];

                    if (selectedValue.length === 1) {
                        triggerArgs = {
                            columnName: selectedColumn.get('name'),
                            selectedValue : selectedValueString
                        };
                        if (selectionType === 'text') {
                            // Is Text selection
                            _.extend(triggerArgs, {
                                selectedText: selectedText,
                                startIndex: this.model.dataset.entry.content.get('dataset.display.selectedStart'),
                                endIndex: this.model.dataset.entry.content.get('dataset.display.selectedEnd')
                            });
                        }

                        this.model.state.trigger('setValueSelection', triggerArgs);

                    } else {
                        // selected value is not present in top results. just select the column instead
                        $target = this.$('.col-header[data-field="' + selectedColumn.get('name') + '"]');
                        this.addSelectedColumn($target);
                    }
                } else if (selectionType === 'table') {
                    $target = this.$('.col-header');
                    this.handleTableSelect($target);
                }
            },

            toggleBarVisibility: function($column, metrics, metricName, barClass) {
                var $bar = $column.find('.' + barClass),
                    metric = _.findWhere(metrics, { key: metricName }),
                    showMetric = metric && !metric.isZero,
                    barWidth = metric && metric.value;
                if (metrics.length) {
                    if (barClass === 'loading') {
                        this._toggle$BarVisibility($bar, false);
                    } else {
                        this._toggle$BarVisibility($bar, showMetric, barWidth);
                    }
                } else {
                    if (barClass === 'loading') {
                        this._toggle$BarVisibility($bar, true, '0');
                    } else {
                        this._toggle$BarVisibility($bar, false);
                    }
                }
            },

            _toggle$BarVisibility: function($bar, showMetric, barWidth) {
                if (showMetric) {
                    $bar.show();
                    $bar.css('flex', '1 1 ' + barWidth);
                    // If any bar is shown, hide the empty bar
                    this.$('.bar.empty').hide();
                } else {
                    $bar.hide();
                }
            },

            enableSelection: function(enable) {
                if (enable) {
                    this.$('.col-header').removeClass('disabled');
                } else {
                    this.$('.col-header').addClass('disabled');
                }
            },

            render: function(options) {
                TableHeaderView.prototype.render.apply(this, arguments);

                var currentCommandModel = this.model.dataset.getCurrentCommandModel(),
                    shouldDisableSelection = !currentCommandModel.isComplete() || !currentCommandModel.isValid(),
                    metrics, colName, $column;

                if (!this.$el.html() || (options && options.columnsAreDifferent)) {
                    this.$el.html(this.compiledTemplate({
                        columns: this.collection.columns
                    }));
                }

                this.collection.columns.each(function(column) {
                    metrics = this.model.resultJsonRows.extractMetrics(column);
                    colName = column.get("name");
                    $column = this.$('.col-header[data-field="' + colName + '"]');
                    this.toggleBarVisibility($column, metrics, 'MatchedType', 'match');
                    this.toggleBarVisibility($column, metrics, 'MismatchedType', 'mismatch');
                    this.toggleBarVisibility($column, metrics, 'NullValues', 'null');
                    this.toggleBarVisibility($column, metrics, undefined, 'loading');
                }, this);

                this.delegateEvents();

                this.enableSelection(!shouldDisableSelection);

                return this;
            },

            template: '\
                <div class="dataset-table-head">\
                    <% if (columns.length > 0) { %>\
                        <div class="col-header all"><span class="name">*</span></div>\
                    <% } else { %>\
                        <div class="col-header placeholder">&nbsp;</th>\
                    <% } %>\
                    <% columns.each(function(column, index) { %>\
                        <% var colName = column.get("name"); %>\
                        <div class="col-header field type-<%- column.get("type") %>" data-col-index="<%- index %>" data-field="<%- colName %>" style="<%- column.get("display.width") ? "width: " + column.get("display.width") + "px; min-width: " + Math.max(column.get("display.width"), 200) + "px;": "" %>">\
                            <span class="name" title="<%- colName %>"><%- colName %></span>\
                            <i class="icon-<%- column.getIconName() %> field-type" data-type="<%- column.get("type") %>"></i>\
                            <div class="coverage" data-field="<%- colName %>">\
                                <div class="bar match"></div>\
                                <div class="bar mismatch"></div>\
                                <div class="bar null"></div>\
                                <div class="bar loading"></div>\
                                <div class="bar empty"></div>\
                            </div>\
                        </div>\
                    <% }, this); %>\
                </div>\
            '
        });
    }
);

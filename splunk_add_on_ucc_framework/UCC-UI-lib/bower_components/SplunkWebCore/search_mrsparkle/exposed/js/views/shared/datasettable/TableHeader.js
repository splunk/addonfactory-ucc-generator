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
            tagName: 'thead',

            initialize: function(options) {
                TableHeaderView.prototype.initialize.apply(this, arguments);
            },

            events: $.extend({}, TableHeaderView.prototype.events, {
                'mousedown .col-header:not(":first-child"):not(".disabled")': function(artificialEvent, originalEvent) {
                    // Actually a drag event
                    if ($(originalEvent.target).hasClass('resize')) {
                        this.handleColumnResizeDragStart(originalEvent);
                    }
                },
                'click .col-header:not(":first-child"):not(".disabled")': function(artificialEvent, originalEvent) {
                    var $target = $(artificialEvent.currentTarget),
                        // Sometimes, originalEvent is not passed in, which means we're in some weird state where
                        // the static table header wasn't made properly or something. Try to gracefully handle this.
                        isCtrlClick = originalEvent ? (originalEvent.metaKey || originalEvent.ctrlKey) : false,
                        isShiftClick = originalEvent ? originalEvent.shiftKey : false;

                    this.handleColumnSelect($target, isCtrlClick, isShiftClick);
                },
                'mouseenter .col-header:first-child:not(".disabled")': function(e) {
                    // We can't updateTableHeadStatic here, because we're mouseentered into it and doing so would
                    // cause a re-render, messing with the events. We'll just use the custom hook to add a class.
                    this.model.state.trigger('tableInteraction', 'hover', true);
                    this.model.state.trigger('addClassToTableHeadStatic', 'hover');
                },
                'mouseleave .col-header:first-child:not(".disabled")': function(e) {
                    // The classes never got added to the real DOM, so if we update here, everything is peachy-keen
                    this.model.state.trigger('tableInteraction', 'hover', false);
                    this.model.state.trigger('updateTableHeadStatic');
                },
                'dragstart th.column-selected-end:not(.resize):not(.disabled), th.column-selected:not(.resize):not(.disabled)': function(e, realEvent) {
                    this.handleDragStart(realEvent);
                },
                'dragenter th': function(e, realEvent) {
                    this.handleDragEnter(realEvent);
                },
                'dragover th': function(e, realEvent) {
                    this.handleDragOver(realEvent);
                },
                'dragend th': function(e, realEvent) {
                    this.handleDragEnd(realEvent);
                },
                'drop th': function(e, realEvent){
                    // Grab our column to drop, stop and prevent, and drop it into handle drop
                    var $closestTh = $(realEvent.target).closest('th');
                    realEvent.preventDefault();
                    realEvent.stopPropagation();
                    this.handleDrop($closestTh, false);
                }
            }),

            startListening: function(options) {
                TableHeaderView.prototype.startListening.apply(this, arguments);
                this.listenTo(this.model.state, 'cutSelection', this.handleCutSelection);
                this.listenTo(this.model.state, 'clearCutSelection', this.handleClearCutSelection);
            },

            clearDragMarkers: function(shouldRemoveGrabbed) {
                var $allTh = this.$('th.col-header'),
                    classesToRemove = ['over-left', 'over-right'];
                $allTh.removeClass('over-right').removeClass('over-left');
                if (shouldRemoveGrabbed) {
                    $allTh.removeClass('grabbed');
                    classesToRemove.push('grabbed');
                }
                this.model.state.trigger('removeClassesFromTableHeadStatic', classesToRemove);
            },

            handleColumnSelect: function($target, isCtrlClick, isShiftClick) {
                TableHeaderView.prototype.handleColumnSelect.apply(this, arguments);
                this.model.state.trigger('updateTableHeadStatic');
            },

            handleTableSelect: function($allThs) {
                $allThs.not(':last-child').addClass('column-selected');
                $allThs.filter(':last-child').addClass('column-selected-end');

                TableHeaderView.prototype.handleTableSelect.apply(this, arguments);

                this.model.state.trigger('updateTableHeadStatic');
            },

            addSelectedColumn: function($column) {
                var columnIndex = $column.data('col-index'),
                    $previousColumn = this.$('.col-header[data-col-index=' + (columnIndex-1) +']'),
                    $nextColumn = this.$('.col-header[data-col-index=' + (columnIndex+1) +']');


                // We need to check with the previous and next columns' selection states in order to ensure the
                // selection border doesn't appear between two adjacent items.
                if ($previousColumn.hasClass('column-selected-end')) {
                    // The previous column used to be an end, and now it needs to not be an end, since we're selected
                    $previousColumn.removeClass('column-selected-end').addClass('column-selected');
                    this.model.state.trigger('columnInteraction', columnIndex-1, 'column-selected-end', false);
                    this.model.state.trigger('columnInteraction', columnIndex-1, 'column-selected', true);
                }
                if ($nextColumn.hasClass('column-selected') || $nextColumn.hasClass('column-selected-end')) {
                    // The next column is selected, so we're not the end
                    $column.addClass('column-selected');
                    this.model.state.trigger('columnInteraction', columnIndex, 'column-selected', true);
                } else {
                    // Otherwise, we are the new end
                    $column.addClass('column-selected-end');
                    this.model.state.trigger('columnInteraction', columnIndex, 'column-selected-end', true);
                }
            },

            removeSelectedColumn: function($column) {
                var columnIndex = $column.data('col-index'),
                    $previousColumn = this.$('.col-header[data-col-index=' + (columnIndex-1) +']');

                // We're essentially going to reverse the work done in addSelectedColumn for the previous column.
                if ($previousColumn.hasClass('column-selected')) {
                    // The previous column becomes an end now
                    $previousColumn.removeClass('column-selected').addClass('column-selected-end');
                    this.model.state.trigger('columnInteraction', columnIndex-1, 'column-selected', false);
                    this.model.state.trigger('columnInteraction', columnIndex-1, 'column-selected-end', true);
                }
                if ($column.hasClass('column-selected')) {
                    $column.removeClass('column-selected');
                    this.model.state.trigger('columnInteraction', columnIndex, 'column-selected', false);
                } else if ($column.hasClass('column-selected-end')) {
                    $column.removeClass('column-selected-end');
                    this.model.state.trigger('columnInteraction', columnIndex, 'column-selected-end', false);
                }
            },

            handleColumnResizeDragStart: function(e) {
                e.preventDefault();

                var clientWidth,
                    actualWidth;

                this.resizeStartPosition = e.pageX;
                this.$staticTable = $(e.currentTarget).closest('.table-results');
                this.$staticHeading = $(e.currentTarget).closest('.col-header');

                clientWidth = this.$staticHeading[0].clientWidth;
                actualWidth = $(this.$staticHeading[0]).width();

                this.resizeStartColWidth = clientWidth - (clientWidth - actualWidth);
                this.resizeStartTableWidth = this.$staticTable[0].clientWidth;
                this.resizeMinChange = this.options.minColumnWidth - this.resizeStartColWidth;

                $('html').on('mousemove.resize', this.handleColumnResizeDrag.bind(this));
                $('html').on('mouseup.resize', this.handleColumnResizeDragEnd.bind(this));
            },

            handleColumnResizeDrag: function(e) {
                var change = Math.max(e.pageX - this.resizeStartPosition, this.resizeMinChange),
                    $realTable = this.$el.closest('.table-results'),
                    $realHeading = this.$('.col-header[data-field="' + this.$staticHeading.data('field') + '"]');

                this.$staticHeading.width(this.resizeStartColWidth + change);
                this.$staticTable.width(this.resizeStartTableWidth + change);
                $realHeading.width(this.resizeStartColWidth + change);
                $realTable.width(this.resizeStartTableWidth + change);
            },

            handleColumnResizeDragEnd: function(e) {
                var currentCommandModel = this.model.dataset.getCurrentCommandModel(),
                    currentColumns = currentCommandModel.columns,
                    columnToModify = currentColumns.find(function(column) {
                        return column.get('name') === this.$staticHeading.data('field');
                    }, this);

                $('html').off('.resize');

                columnToModify.set({
                    'display.width': this.$staticHeading[0].clientWidth
                });

                // Use the fastRoute to not re-render the entire UI when we update the size of a column
                this.model.state.set('fastRoute', true);
                this.model.dataset.trigger('applyAction', currentCommandModel, this.model.dataset.commands);
            },

            handleFadeDraggedColumns: function(colIdxs, fadeOut) {
                var elementGetterFn = function($tableHeadStaticContainer) {
                        var $ths = $tableHeadStaticContainer.find('table > thead > tr > th'),
                            $elements = [];
                        _.each(colIdxs, function(idx) {
                            if ($ths[idx + 1]) {
                                $elements.push($ths[idx + 1]); // + 1 to offset leftmost 'all' column at index 0
                            }
                        }, this);
                        return $elements;
                    },
                    opacity = fadeOut ? 0.4 : 1;

                this.model.state.trigger('updateTableHeadStaticStyles', elementGetterFn, { opacity: opacity});
            },

            handleCutSelection: function() {
                this.$('.col-header.column-selected').addClass('column-cut');
                this.$('.col-header.column-selected-end').addClass('column-cut-end');
                this.model.state.trigger('updateTableHeadStatic');
            },

            handleClearCutSelection: function() {
                this.$('.col-header.column-cut, .col-header.column-cut-end').removeClass('column-cut column-cut-end');
                this.model.state.trigger('updateTableHeadStatic');
            },

            clearSelection: function() {
                this.$lastColumn = null;
                this.$('.col-header.column-selected, .col-header.column-selected-end').removeClass('column-selected column-selected-end');
                this.model.state.trigger('updateTableHeadStatic');
            },

            // Always happens after render to ensure elements are in the DOM
            setSelection: function() {
                var selectedColumns = this.model.dataset.selectedColumns,
                    selectedColumnInColumnsCollection,
                    selectionType = this.model.dataset.entry.content.get('dataset.display.selectionType'),
                    currentCommandIndex = this.model.dataset.getCurrentCommandIdx(),
                    currentCommand = this.model.dataset.commands.at(currentCommandIndex),
                    $target;

                if (selectionType === 'column' || selectionType === 'cell' || selectionType === 'text') {
                    selectedColumns.each(function(selectedColumn, idx) {
                        selectedColumnInColumnsCollection = currentCommand.columns.get(selectedColumn.id);

                        // It's possible that the selected column doesn't exist in the table anymore
                        if (selectedColumnInColumnsCollection) {
                            $target = this.$('.col-header[data-field="' + selectedColumnInColumnsCollection.get('name') + '"]');
                            this.addSelectedColumn($target);
                            this.$lastColumn = $target;

                            $target.attr("draggable", true);

                            // SPL-116067: If it's a cell/text selection, then preview table highlights that column,
                            // because there is no way to select the cell/text reliably. As such,
                            // we must modify the actual selection attributes to reflect the column highlight state.
                            if (selectionType === 'cell' || selectionType === 'text') {
                                this.model.dataset.setSelectionTypeToColumn();
                            }
                        }
                    }, this);
                } else if (selectionType === 'table') {
                    $target = this.$('.col-header');
                    this.handleTableSelect($target);
                    this.$lastColumn = $target.last();
                }
                this.model.state.trigger('updateTableHeadStatic');
            },

            enableSelection: function(enable) {
                if (enable) {
                    this.$('.col-header').removeClass('disabled');
                    this.$('span.name').after($('<span class="resize"></span>'));
                } else {
                    this.$('.col-header').addClass('disabled');
                    this.$('.resize').remove();
                }
                this.model.state.trigger('updateTableHeadStatic');
            },

            render: function() {
                TableHeaderView.prototype.render.apply(this, arguments);

                var currentCommandModel,
                    shouldDisableSelection = true;

                if (this.model.dataset.isTable() && this.options.editingMode) {
                    currentCommandModel = this.model.dataset.getCurrentCommandModel();
                    shouldDisableSelection = !currentCommandModel.isComplete() || !currentCommandModel.isValid();
                }

                this.$el.html(this.compiledTemplate({
                    columns: this.collection.columns
                }));

                this.delegateEvents();

                $.when(this.model.state.rowsRenderedDfd).always(function() {
                    if (this.hasFields() && this.options.editingMode) {
                        this.highlightFields();
                        this.setSelection();
                    } else {
                        this.model.state.trigger('updateTableHeadStatic');
                    }
                }.bind(this));

                this.enableSelection(!shouldDisableSelection);
                return this;
            },

            template: '\
                <tr class="dataset-table-head">\
                    <% if (columns.length > 0) { %>\
                        <th class="col-header all">*</th>\
                    <% } else { %>\
                        <th class="col-header placeholder">&nbsp;</th>\
                    <% } %>\
                    <% columns.each(function(column, index) { %>\
                        <th class="col-header field type-<%- column.get("type") %>" data-col-index="<%- index %>" data-field="<%- column.get("name") %>" title="<%- column.get("name") %>" style="<%- column.get("display.width") ? "width: " + column.get("display.width") + "px;" : "" %>">\
                            <span class="name"><%- column.get("name") %></span>\
                            <i class="icon-<%- column.getIconName() %> field-type" data-type="<%- column.get("type") %>"></i>\
                        </th>\
                    <% }, this); %>\
                </tr>\
            '
        });
    }
);

define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'collections/datasets/Columns',
        'models/datasets/commands/Base'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        ColumnsCollection,
        BaseCommand
        ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);

                var defaults = {
                    minColumnWidth: 40
                };
                _.defaults(options, defaults);
            },

            events: {
                'mouseenter .col-header:not(":first-child"):not(".disabled")': function(e) {
                    this.model.state.trigger('columnInteraction', $(e.currentTarget).data('col-index'), 'hover', true);
                },
                'mouseleave .col-header:not(":first-child"):not(".disabled")': function(e) {
                    this.model.state.trigger('columnInteraction', $(e.currentTarget).data('col-index'), 'hover', false);
                },
                'mousedown .col-header:first-child:not(".disabled")': function(e) {
                    this.model.state.trigger('clearSelection');
                    this.handleTableSelect(this.$('.col-header'));
                }
            },

            startListening: function() {
                this.listenTo(this.model.state, 'clearSelection', this.clearSelection);
                this.listenTo(this.model.state, 'clearDragability', this.clearDragability);
            },

            clearDragability: function() {
                this.$('.col-header').removeClass('draggable').attr("draggable", false);
            },

            handleDragStart: function(e) {
                var realEvent = e.originalEvent,
                    $columns = this.$('.col-header.column-selected, .col-header.column-selected-end'),
                    colIdxs = _.map($columns, function(col) {
                        return $(col).data('col-index');
                    });

                $columns.addClass('grabbed');

                //set column being dragged
                this.model.state.set('drag.startingIdxs', colIdxs);

                this.handleFadeDraggedColumns(colIdxs, true);

                realEvent.dataTransfer.effectAllowed = 'move';
                realEvent.dataTransfer.dropEffect = 'move';

                // This enables drop in FireFox (Not needed for Chrome, IE, Safari).  So the text and format are arbitrary,
                // but a value needs to be set on the data transfer object to make it draggable
                // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
                realEvent.dataTransfer.setData('text/plain', 'move');

                /*
                    Other known browser drag and drop inconsistencies:
                    - Chrome: cursor does not stay in 'grabbing' state while in motion.
                    - Safari: does not allow any DOM manipulation in dragStart handler, otherwise drag and drop breaks
                    completely (dragEnd event fires immediately).
                    - No browsers show the correct 'ghost image' while multiple columns are being dragged, due to the event
                    target being just 1 column.
                */
            },

            handleDragOver: function(e) {
                // Enable drag over for the column header
                e.originalEvent.preventDefault();
            },

            handleDragEnd: function(e) {
                var colIdxs = this.model.state.get('drag.startingIdxs');
                // Clean up our drag opacity and markers
                this.clearDragMarkers(true);

                this.handleFadeDraggedColumns(colIdxs, false);
            },

            handleDragEnter: function(e) {
                var currentLocation = e.originalEvent.clientX,
                    $column = $(e.currentTarget),
                    width = $column.outerWidth(),
                    columnOffset = $column.offset().left,
                    offsetInColumn = currentLocation - columnOffset,
                    currentIdx = $column.data('col-index'),
                    startingIdxs = this.model.state.get('drag.startingIdxs'),
                    i;

                if (_.isUndefined(currentIdx) || _.isUndefined(startingIdxs) || !startingIdxs.length) {
                    return false;
                }

                // If user is trying to move cols into the same position as one of those cols, then bail.
                for (i = 0; i < startingIdxs.length; i++) {
                    if (startingIdxs[i] === currentIdx) {
                        return false;
                    }
                }

                // If the column has neither class, we need to remove the markers from any other columns
                if (!$column.hasClass('over-right') && !$column.hasClass('over-left')) {
                    this.clearDragMarkers();
                }

                // If user is trying to drag the column/s to the right half of a destination column
                if (offsetInColumn > width / 2) {
                    if (startingIdxs[0] - currentIdx !== 1) {
                        // Make sure we display a target border on the right side of the destination column
                        // unless the destination column is directly to the left of the leftmost dragged column.
                        if (!$column.hasClass('over-right')) {
                            $column.addClass('over-right').removeClass('over-left');
                        }
                    } else {
                        this.clearDragMarkers();
                    }
                // If user is trying to drag the column/s to the left half of a destination column
                } else {
                    if (currentIdx - startingIdxs[startingIdxs.length - 1] !== 1) {
                        // Make sure we display a target border on the left side of the destination column
                        // unless the destination column is directly to the right of the rightmost dragged column.
                        if (!$column.hasClass('over-left')) {
                            $column.addClass('over-left').removeClass('over-right');
                        }
                    } else {
                        this.clearDragMarkers();
                    }
                }
            },

            handleDrop: function($column, shouldFastRoute) {
                var selectedColIdxs = _(this.model.state.get('drag.startingIdxs')).sortBy(function(num) {
                        // Sort in ascending order
                        return num;
                    }),
                    newColIdx = $column.data('col-index') || 0,
                    rightSideInsert = $column.hasClass('over-right'),
                    currentCommand = this.model.dataset.getCurrentCommandModel(),
                    columnsCopy = new ColumnsCollection(currentCommand.columns.toJSON()),
                    selectedColIds = columnsCopy.pluck('id'),
                    modelsToMove = new ColumnsCollection(),
                    hasCorrectedIndex = false,
                    modelToMove;

                // Iterate over selected cols from left to right and move each one into its new position
                _.each(selectedColIdxs, function(idx) {
                    // As long as we are not moving the column to its existing position,
                    // it is safe to remove it in preparation to re-insert it.
                    if (idx !== newColIdx) {
                        modelToMove = columnsCopy.remove(columnsCopy.where({ id: selectedColIds[idx] }));
                        modelsToMove.add(modelToMove);
                    }
                    // Column moved to right
                    if (idx < newColIdx) {
                        // If the insert border is sitting on the left side, the insertion index is actually -1
                        if (!rightSideInsert && (newColIdx !== 0)) {
                            columnsCopy.add(modelToMove, {at: newColIdx - 1});
                        } else {
                            columnsCopy.add(modelToMove, {at: newColIdx});
                        }
                    }
                    // Column moved to left
                    if (idx > newColIdx) {
                        // If the insert border is on the right side of a column, the insertion index is actually +1
                        if (!hasCorrectedIndex) {
                            rightSideInsert && newColIdx++;
                            hasCorrectedIndex = true;
                            columnsCopy.add(modelToMove, {at: newColIdx});
                        } else {
                            newColIdx++; // Always increment for the next col being moved to current col's direct right
                            columnsCopy.add(modelToMove, {at: newColIdx});
                        }
                    }
                }, this);

                currentCommand.columns.reset(columnsCopy.toJSON());
                this.model.dataset.selectedColumns.reset(modelsToMove.toJSON());
                // fast route if the consumer wants it
                this.model.state.set("fastRoute", !!shouldFastRoute);
                // trigger the change on the table
                this.model.dataset.trigger('applyAction', currentCommand, this.model.dataset.commands);

                this.model.state.trigger('removeClassesFromTableHeadStatic', 'hover');
                this.$('.col-header').removeClass('hover');
            },

            handleColumnSelect: function($target, isCtrlClick, isShiftClick) {
                var currentSelectionType = this.model.dataset.entry.content.get('dataset.display.selectionType'),
                    selectedColumns = this.model.dataset.selectedColumns,
                    columnIndex = $target.data('col-index'),
                    currentCommandIndex = this.model.dataset.getCurrentCommandIdx(),
                    columnGuid = this.model.dataset.commands.at(currentCommandIndex).getGuidForColIndex(columnIndex),
                    lastColumnIndex,
                    $allColumns,
                    $columnsInRange,
                    indices,
                    selectedColumnGuids;

                // Handle shift key clicks. We add all columns between the last one and the currently clicked one
                // to the list of selected columns.
                if (isShiftClick && this.$lastColumn && currentSelectionType === 'column') {
                    //Clear draggable attributes
                    this.$('.col-header').attr("draggable", false);

                    lastColumnIndex = this.$lastColumn.data('col-index');
                    $allColumns = $target.parent().children();
                    // Columns are one off due to the first column being the "all" column with row numbers
                    $columnsInRange = $allColumns.slice(Math.min(columnIndex, lastColumnIndex) + 1, Math.max(columnIndex, lastColumnIndex) + 2);
                    indices = _($columnsInRange).map(function(column) {
                        return $(column).data('col-index');
                    }, this);
                    selectedColumnGuids = _(indices).map(function(idx) {
                        currentCommandIndex = this.model.dataset.getCurrentCommandIdx();
                        columnGuid = this.model.dataset.commands.at(currentCommandIndex).getGuidForColIndex(idx);
                        return {
                            id: columnGuid
                        };
                    }.bind(this));
                    _($columnsInRange).each(function(el) {
                        this.addSelectedColumn($(el));
                    }, this);
                    this.model.dataset.selectedColumns.set(selectedColumnGuids);

                    $columnsInRange.attr("draggable", true);

                // Handle control/command key clicks
                } else if (isCtrlClick && this.$lastColumn && currentSelectionType === 'column') {

                    if (selectedColumns.get(columnGuid)) {
                        // If the column is in the selected columns list, we either remove it (if there will still be
                        // a valid selection afterwards), or do nothing (leave it selected). This handles the first case.
                        if (selectedColumns.length >= 2) {
                            this.removeSelectedColumn($target);
                            this.model.dataset.selectedColumns.remove(columnGuid);
                            $target.attr("draggable", false);
                        } else {
                            $target.attr("draggable", true);
                        }
                    // If the column clicked on isn't in selected columns at all, then we can add it.
                    } else {
                        this.addSelectedColumn($target);
                        this.$lastColumn = $target;
                        this.model.dataset.selectedColumns.add({
                            id: columnGuid
                        });
                        $target.attr("draggable", true);
                    }

                // Otherwise, it's just a normal click
                } else {
                    //Clear draggable attributes
                    this.$('.col-header').attr("draggable", false);

                    this.model.state.trigger('clearSelection');
                    this.addSelectedColumn($target);
                    this.$lastColumn = $target;
                    this.model.dataset.selectedColumns.add({
                        id: columnGuid
                    });

                    $target.attr("draggable", true);
                }

                this.model.dataset.entry.content.set('dataset.display.selectionType', 'column');
            },

            addSelectedColumn: function() {
                throw new Error('Must define addSelectedColumn method.');
            },

            removeSelectedColumn: function() {
                throw new Error('Must define removeSelectedColumn method.');
            },

            clearDragMarkers: function() {
                throw new Error('Must define clearDragMarkers method.');
            },

            hasFields: function() {
                var fields = this.model.resultJsonRows.get('fields');
                return !!(fields && fields.length);
            },

            handleTableSelect: function() {
                this.$('.col-header').attr("draggable", false);
                this.model.dataset.entry.content.set('dataset.display.selectionType', 'table');
                this.model.state.trigger('tableInteraction', 'column-selected', true);
            },

            highlightFields: function() {
                var currentModel = this.model.dataset.getCurrentCommandModel(),
                    currentType = currentModel.get('type'),
                    modifiedFields;

                if (!currentModel.isComplete() || currentType === BaseCommand.INITIAL_DATA) {
                    return;
                }

                modifiedFields = this.model.ast.getModifiedFieldsNameList() || [];
                if (modifiedFields.length) {
                    this.handleColumnHighlight(modifiedFields);
                }
            },

            handleColumnHighlight: function(fields) {
                for (var i = 0; i < fields.length; i++) {
                    var $field = this.$('.col-header[data-field="' + fields[i] + '"]');
                    $field.addClass('column-highlighted');
                    this.model.state.trigger('columnInteraction', $field.data('col-index'), 'column-highlighted', true);
                }
            },

            // Adjusts the opacity of the table header to reflect column drag status (faded for mid-drag, full opacity for post-drag)
            handleFadeDraggedColumns: function(colIdxs, fadeOut) {
                var $headers = this.$('.col-header');

                _.each(colIdxs, function(idx) {
                    if (fadeOut) {
                        if ($headers[idx + 1]) {
                            $headers[idx + 1].style.opacity = '0.4'; // + 1 to offset leftmost 'all' column at index 0
                        }
                    } else {
                        if ($headers[idx + 1]) {
                            $headers[idx + 1].style.opacity = '1';
                        }
                    }
                }, this);
            },

            render: function() {
                this.model.state.rowsRenderedDfd = $.Deferred();
            }
        });
    }
);

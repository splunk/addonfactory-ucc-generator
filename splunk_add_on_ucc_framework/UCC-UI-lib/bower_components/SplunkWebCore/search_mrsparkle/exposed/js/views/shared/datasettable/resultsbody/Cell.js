define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/datasettable/shared/TableCell',
        'util/math_utils',
        'splunk.time',
        'bootstrap.tooltip'
    ],
    function(
        _,
        $,
        module,
        BaseTableCell,
        mathUtils,
        splunkTime,
        undefined
    ) {
        return BaseTableCell.extend({
            moduleId: module.id,
            tagName: 'td',
            className: 'value',

            attributes: function() {
                return {
                    'data-is-multivalued': this.model.cell.get('isMultivalued'),
                    'data-field': this.model.cell.get('field'),
                    'data-value': this.model.cell.get('values'),
                    'data-row-index': this.options.rowIdx,
                    'data-col-index': this.model.cell.get('idx')
                };
            },

            initialize: function(options) {
                BaseTableCell.prototype.initialize.apply(this, arguments);
            },

            events: $.extend({}, BaseTableCell.prototype.events, {
                'click .show-more-text': function(e) {
                    // Expand this text
                    this.updateExpandState($(e.target), true);
                    e.preventDefault();
                },
                'click .show-less-text': function(e) {
                    // Collapse this text
                    this.updateExpandState($(e.target), false);
                    e.preventDefault();
                }
            }),

            formatValues: function() {
                var values = this.model.cell.get('values'),
                    timezone;

                if (this.model.column.isSplunkTime()) {
                    // This line is very expensive, so be sure to get the timezone once
                    timezone = new splunkTime.SplunkTimeZone(this.model.config.get('SERVER_ZONEINFO'));
                    this.$el.addClass('epoch-time');
                    // partial bind the time argument to the formatTime function for mapping each value
                    values = values.map(_.partial(this.formatTime, _, timezone));
                }

                // Truncate all values
                return values.map(function(value) {
                    return {
                        truncatedValue: this.truncateValue(value),
                        fullValue: value
                    };
                }.bind(this));
            },

            formatTime: function(value, splunkTimeZone) {
                var epoch, dateTime;

                // convert the epoch time to an ISO
                epoch = mathUtils.strictParseFloat(value);
                dateTime = new splunkTime.DateTime(epoch).toTimeZone(splunkTimeZone);

                return dateTime.toString();
            },

            truncateValue: function(value) {
                // Initialize in case it's null/undefined
                value = value || "";
                    // Get the width for this column
                var fieldWidth = this.model.column.getWidth(),
                    // get our truncating width by doing a 1 to 1 ratio of characters to pixels:
                    // for multivalue cells, it's number of text characters divided by 3
                    // non multivalue cells are just the number of text characters
                    maxTextWidth = this.model.cell.get('isMultivalued') ? Math.floor(fieldWidth/3) : fieldWidth,
                    // escape here because we are going to inject some html
                    fullHtml = _.template(this.realTextTemplate, {
                        text: value
                    });

                if (maxTextWidth && value.length > maxTextWidth) {
                    if (this.shouldExpandValue(value)) {
                        fullHtml += _.template(this.showLessTemplate, {
                            _: _
                        });
                    } else {
                        fullHtml = _.template(this.realTextTemplate, {
                            text: value.substring(0, maxTextWidth)
                        });
                        fullHtml += _.template(this.showMoreTemplate, {
                            _: _
                        });
                    }
                }
                return fullHtml;
            },

            updateExpandState: function($target, shouldExpand) {
                // Get parent and actual span text
                var $cell = $target.closest(this.REAL_TEXT_WRAPPER_CLASS),
                    // had to use .attr instead of .data, because jquery was
                    // parsing json strings from introspection into json objects
                    value = $target.closest('.multivalue').attr('data-value');
                if (this.model.column.isSplunkTime()) {
                    value = this.formatTime(value);
                }

                // Update cells stored in cUrl and update the cell's html
                this.updateOpenCells(shouldExpand, value);
                $cell.html(this.truncateValue(value));
            },

            // Uses the current row index, cell value, and the field as a composite key to determine
            // if a cell is open or closed
            shouldExpandValue: function(value) {
                var openCells = this.getOpenCells(),
                    currentField = openCells[this.model.cell.get('field')] || {};
                return !_.isUndefined(value) && currentField[this.options.rowIdx] === value;
            },

            updateOpenCells: function(isExpanding, value) {
                var openCells = this.getOpenCells(),
                    currentField = this.model.cell.get('field'),
                    hasCellValue = this.shouldExpandValue(value);

                // If this is being collapsed, we need to remove it from the object hash
                //  for the current field's column, as stored in the entry content model
                if (!isExpanding) {
                    hasCellValue && delete openCells[currentField][this.options.rowIdx];
                // If the cell is not contained in the object hash for the field's column
                // and we are expanding, we need to add the object hash stored in the entry content model
                } else if (!hasCellValue) {
                    openCells[currentField] = openCells[currentField] || {};
                    openCells[currentField][this.options.rowIdx] = value;
                }

                // Save our update to the entry content model
                this.model.dataset.entry.content.set({
                    'dataset.display.openCells': JSON.stringify(openCells)
                });
            },

            getOpenCells: function() {
                return JSON.parse(this.model.dataset.entry.content.get('dataset.display.openCells') || "{}");
            },

            enableSelection: function(enable) {
                if (enable) {
                    this.$el.removeClass('disabled');
                } else {
                    this.$el.addClass('disabled');
                }
            },

            render: function() {
                var values = this.formatValues(),
                    currentCommandModel,
                    shouldDisableSelection = true,
                    isNull = this.model.cell.isNull(),
                    cellMismatchMessage = this.model.cell.getTypeMismatchMessage();

                if (this.model.dataset.isTable() && this.options.editingMode) {
                    currentCommandModel = this.model.dataset.getCurrentCommandModel();
                    shouldDisableSelection = !currentCommandModel.isComplete() || !currentCommandModel.isValid();
                }

                this.$el.html(this.compiledTemplate({
                    _: _,
                    values: values,
                    isMultivalued: this.model.cell.get('isMultivalued'),
                    cell: this.model.cell,
                    index: this.model.cell.get('idx'),
                    field: this.model.cell.get('field'),
                    rowNum: this.options.rowIdx,
                    isNull: isNull
                }));

                this.enableSelection(!shouldDisableSelection);
                
                if (cellMismatchMessage) {
                    // Prevent multiple tooltips from stacking up on page
                    $('body').find('.tooltip').remove();
                    this.$el.addClass('mismatched-type');
                    this.$el.tooltip({animation:false, title: cellMismatchMessage, container: $('body')});
                }
                
                isNull && this.$el.addClass('null-cell');

                return this;
            },

            template: '' +
                '<% _.each(values, function(value) { %>' +
                    '<div class="multivalue selection-container" data-is-multivalued="<%= isMultivalued %>" data-field="<%- field %>" data-value="<%- value.fullValue %>" data-row-index="<%- rowNum %>" data-col-index="<%- index %>">' +
                        '<div class="real-text-wrapper">' +
                            '<% if (isNull) { %>' +
                                'null' +
                            '<% } else { %>' +
                                '<%= value.truncatedValue %>' +
                            '<% } %>' +
                        '</div>' +
                    '</div>' +
                '<% }) %>',

            realTextTemplate: '<span class="real-text"><%- text %></span>',
            showMoreTemplate: '<span class="show-more-prefix">&nbsp;&nbsp;...</span><a href="#" class="show-more-text"><%= _("More").t() %></a>',
            showLessTemplate: '<span class="show-less-prefix">&nbsp;&nbsp;</span><a href="#" class="show-less-text"><%= _("Less").t() %></a>'
        });
    }
);

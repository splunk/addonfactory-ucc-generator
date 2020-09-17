define([
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/controls/Control',
        'views/shared/controls/colors/ColorRangeControlRow',
        'models/Base',
        'collections/Base',
        'util/color_utils'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        Control,
        ColorRangeControlRow,
        BaseModel,
        BaseCollection,
        colorUtils
        ) {

        return Control.extend({
            className: 'tab-pane clearfix',
            moduleId: module.id,
            DEFAULT_COLOR: '0x555555',

            initialize: function() {
                Control.prototype.initialize.apply(this, arguments);
                this.rangeValuesName = this.options.modelAttribute;
                this.rangeColorsName = this.options.rangeColorsName;
                this.defaultColors = this.options.defaultColors || ['0x84E900', '0xFFE800', '0xBF3030'];
                this.defaultRanges = this.options.defaultRangeValues || [0, 30, 70, 100];
                this.displayMinMaxLabels = this.options.displayMinMaxLabels;
                this.paletteColors = this.options.paletteColors;

                // In-mem collection to keep track of ranges and colours being edited before being written
                this.collection = {};
                this.collection.rows = new BaseCollection();

                this.maxModel = new BaseModel({
                    value: 'max',
                    color: this.DEFAULT_COLOR
                });

                this.collection.rows.on('change color-picker-apply', function() {
                    this.updateInPlace();
                }, this);
                this.maxModel.on('color-picker-apply', function() {
                    this.maxColor = this.maxModel.get('color');
                    this.updateInPlace();
                }, this);
                this.initRowsFromModel();
            },

            events: {
                'click .add-color-range': function(e) {
                    e.preventDefault();
                    var newRowView,
                        i = this.collection.rows.length,
                        model = new BaseModel({
                            value: parseFloat(this.collection.rows.last().get('value')) * 2,
                            color: colorUtils.replaceSymbols(this.getRandomColor(), '0x')
                        });
                    this.collection.rows.add(model);
                    newRowView = this.createRow(this.collection.rows.at(i - 1), model, model.cid);

                    if (this.displayMinMaxLabels) {
                        // Redraw max row as the fromModel has changed
                        this.children.rangeRow_max.remove();
                        this.createRow(model, this.maxModel, 'max', true);
                    }
                    this.render();
                    newRowView.$('input.input-value:first').focus();
                }
            },

            updateInPlace: function() {
                // Find the currently focused element, but only if it's within this view.
                var $focused = this.$(document.activeElement);
                this.render();
                // Put the focus back where it was before the re-render.
                $focused.focus();
            },

            initRowsFromModel: function() {
                var modelRanges = this.model.rangesValuesToArray(this.rangeValuesName),
                    modelColors = this.model.deserializeColorArray(this.rangeColorsName),
                    model;

                this.ranges = modelRanges.length > 0 ? modelRanges: this.defaultRanges;
                this.colors = modelColors.length > 0 ? modelColors : this.defaultColors;

                // First, create a row for all provided ranges
                _(this.ranges).each(function(range, i) {
                    var offset = this.displayMinMaxLabels ? 0 : 1,
                        value = this.ranges[i],
                        color;
                    // The first range of a gauge does not get its own color
                    if (!this.displayMinMaxLabels && i === 0) {
                        color = '';
                    } else {
                        // If there are excess ranges with no matching color, assign default grey color
                        color = this.colors[i - offset] || this.DEFAULT_COLOR;
                    }

                    model = new BaseModel({
                        value: value,
                        color: colorUtils.replaceSymbols(color, '0x')
                    });
                    this.collection.rows.add(model);
                }, this);

                // Then, if there are any additional colors that were not included into a row
                // by being matched with a range value, create rows for those additional colors too
                _(this.colors).each(function(color, i) {
                    if (i > this.ranges.length - 1) {
                        if (this.displayMinMaxLabels && i === this.colors.length - 1) {
                            // last color - this will become the max row, so don't add it to the collection as its own row
                            this.maxColor = color;
                        } else {
                            model = new BaseModel({
                                value: '',
                                color: colorUtils.replaceSymbols(color, '0x')
                            });
                            this.collection.rows.add(model);
                        }
                    }
                }, this);

                this.drawRows();
            },

            drawRows: function() {
                this.collection.rows.each(function(model, i) {
                    if (this.displayMinMaxLabels) {
                        if (i === 0) {
                            var minModel = new BaseModel({
                                value: 'min'
                            });
                            this.createRow(minModel, model, model.cid, true);
                        } else if (i < this.collection.rows.length) {
                            this.createRow(this.collection.rows.at(i - 1), model, model.cid);
                        }
                    } else {
                        if (i === 1) {
                            this.createRow(this.collection.rows.at(i - 1), model, model.cid, true);
                        } else if (i > 0) {
                            this.createRow(this.collection.rows.at(i - 1), model, model.cid);
                        }
                    }
                }, this);

                // Add max row at the end, if necessary
                if (this.displayMinMaxLabels) {
                    // There are more colors than ranges, and so we must set the maxModel to the last color
                    if (this.maxColor) {
                        this.maxModel.set('color', this.maxColor);
                    }
                    // Need an additional row for max row
                    this.createRow(this.collection.rows.last(), this.maxModel, 'max', true);
                }
            },

            createRow: function(fromModel, toModel, id, hideRemoveButton) {
                var row = this.children['rangeRow_' + id] = new ColorRangeControlRow({
                    model: toModel,
                    fromModel: fromModel,
                    collection: this.collection.rows,
                    displayMinMaxLabels: this.displayMinMaxLabels,
                    hideRemoveButton: hideRemoveButton,
                    paletteColors: this.paletteColors
                });
                this.listenTo(row, 'removeRange', function(model) {
                    var rowToRemove = this.children['rangeRow_' + model.cid];
                    var removedRowIndex = rowToRemove.$el.index();
                    rowToRemove.remove();
                    // Remove view from children hash to prevent re-rendering in render()
                    delete this.children['rangeRow_' + model.cid];
                    this.collection.rows.remove(this.collection.rows.get({ cid: model.cid }));
                    // Redraw all row views because the fromModels have changed
                    this.drawRows();
                    this.render();
                    // The call to drawRows() will have re-created all child views, so we can't rely on any previous DOM references.
                    // If there was a row after the one that was just removed, focus it.  Otherwise, focus the previous row.
                    // There is guaranteed to be a previous row, because the first row can't be removed.
                    var $rowEls = this.$('.color-range-row-placeholder').children();
                    var rowIndexToFocus = ($rowEls.length > removedRowIndex) ? removedRowIndex : removedRowIndex - 1;
                    $rowEls.eq(rowIndexToFocus).find('input.input-value:last').focus();
                });
                return row;
            },

            getRandomColor: function() {
                return this.paletteColors[Math.floor((Math.random() * this.paletteColors.length))];
            },

            syncModel: function() {
                var rangeValues = this.collection.rows.pluck('value'),
                    rangeValuesStr = JSON.stringify(rangeValues),
                    // Always normalize back to '0x' hex color format when persisting
                    rangeColorList = this.collection.rows
                        .pluck('color')
                        .filter(function(value){
                            return value !== "";
                        })
                        .map(function(color) {
                            return colorUtils.replaceSymbols(color, '0x');
                        }),
                    rangeColors;

                if (this.displayMinMaxLabels) {
                    rangeColorList.push(this.maxModel.get('color'));
                }
                rangeColors = JSON.stringify(rangeColorList);

                if (this.rangeValuesName) {
                    this.model.set(this.rangeValuesName, rangeValuesStr);
                }
                if (this.rangeColorsName) {
                    this.model.set(this.rangeColorsName, rangeColors);
                }
            },

            render: function() {
                // Only sync with the model if it is not a gauge in "auto mode", since syncing can mutate the model (SPL-80658)
                // In other words, sync with the model if it is a manual mode Gauge, a Single Value, or a Gauge in Pivot (when "auto mode" is undefined)
                if (this.model.get('autoMode') === undefined || this.model.get('display.visualizations.type') === 'singlevalue' || !this.model.gaugeIsInAutoMode()) {
                    this.syncModel();
                }
                if (!this.el.innerHTML) {
                    this.el.innerHTML = this.compiledTemplate({});
                }
                var $colorRangePlaceholder = this.$('.color-range-row-placeholder');
                // Detach all children so that their listeners are preserved when we empty their container.
                _(this.children).invoke('detach');
                $colorRangePlaceholder.empty();
                _.each(this.children, function(childRow) {
                    childRow.render().appendTo($colorRangePlaceholder);
                }, this);
                // Make sure max row gets rendered at the bottom
                if (this.displayMinMaxLabels) {
                    this.children.rangeRow_max.detach();
                    this.children.rangeRow_max.appendTo($colorRangePlaceholder);
                }
                return this;
            },

            remove: function() {
                this.maxModel.off(null, null, this);
                return Control.prototype.remove.apply(this, arguments);
            },

            template: '\
                <div class="color-range-row-placeholder"></div>\
                <div class="color-range-control-container">\
                    <div class="add-color-range-btn">\
                        <a href="#" class="add-color-range btn pull-right"> + <%- _("Add Range").t() %></a>\
                    </div>\
                </div>\
            '
        });

    });
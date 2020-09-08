define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/PopTart',
        'models/shared/TimeRange',
        'util/time',
        'splunk.util',
        'splunk.i18n'
    ],
    function(
        _,
        $,
        module,
        PopTart,
        TimeRangeModel,
        time_utils,
        splunkUtil,
        i18n
    ) {
        var ResultsTableDrilldownPopTart = PopTart.extend({
            moduleId: module.id,
            className: 'dropdown-menu dropdown-menu-medium',
            initialize: function(options) {
                PopTart.prototype.initialize.apply(this, arguments);
                
                this.model.spanTimeRange = new TimeRangeModel();
                this.constraints = {keys: [], values: []};
                this.fields = this.model.results.getDataFields();
                this.isTimeSpan = _.has(this.options.clickMeta, '_span');
                this.fieldClicked = _.has(this.options.clickMeta, 'name2') ? this.options.clickMeta.name2 : this.options.clickMeta.name;
                this.fieldValueClicked = _.has(this.options.clickMeta, 'value2') ? this.options.clickMeta.value2 : this.options.clickMeta.value;

                this.fieldMetadataResults = this.convertResultFieldsToMetadata();

                this.metaDataHasGroupByOrSplitBy = !_.isUndefined(_.find(this.fieldMetadataResults, function(fieldMetaData) {
                    return (fieldMetaData.groupby_rank || fieldMetaData.splitby_field);
                }));

                this.fieldClickedMetaData = this.fieldMetadataResults[this.fieldClicked] || {};
                this.cellDrilldownable = this.isCellDrilldownable();

                this.hasRenderedDeferred = $.Deferred();


                if (this.cellDrilldownable) {
                    this.splitbyField = this.fieldClickedMetaData ? this.fieldClickedMetaData.splitby_field : undefined;
                    this.splitbyValue = this.splitbyField ? this.fieldClickedMetaData.splitby_value : undefined;
                    
                    // SPL-85875
                    if (this.isTimeSpan && !this.splitbyField && !this.splitbyValue) {
                        this.splitbyField = this.fieldClicked;
                        this.splitbyValue = this.fieldValueClicked;
                    }

                    this.fieldClickedRank = this.metaDataHasGroupByOrSplitBy ? this.fieldClickedMetaData.groupby_rank : this.fields.indexOf(this.fieldClicked).toString();
                }
                this.metaDataHasGroupByOrSplitBy ? this.buildConstraintsByGroupBy() : this.buildConstraintsByFieldIndex();


                if (this.isTimeSpan) {
                    this.timeSpanDfd = this.model.spanTimeRange.save({
                        'earliest': this.options.clickMeta.value,
                        'latest': (parseFloat(this.options.clickMeta.value) + this.options.clickMeta._span).toFixed(3)
                    });
                }
            },
            convertResultFieldsToMetadata: function() {
                var metadata = {},
                    fields = this.model.results.get('fields');

                _(fields).each(function(fieldObj) {
                    // Depending on data format parameters, the field list can contains simple string names,
                    // which we interpret as no metadata available.
                    if (_.isObject(fieldObj)) {
                        metadata[fieldObj.name] = _(fieldObj).omit('name');
                    }
                });
                return metadata;
            },
            stripClickMetaToTimeRange: function() {
                return _.extend(
                    _(this.options.clickMeta).omit('name2', 'value2'),
                    {
                        rowContext: _(this.options.clickMeta).pick('row._time')
                    }
                );
            },
            stripClickMetaToColumnOnly: function() {
                var clickMeta = this.options.clickMeta;
                if (clickMeta.name2) {
                    return _(clickMeta).omit('name', 'value', '_span');
                }
                return $.extend(true, {}, this.options.clickMeta);
            },
            isCellDrilldownable: function() {
                if ((this.options.clickMeta.type === 'row') ||
                        (this.fieldClicked === "_time")) {
                    return false;
                }

                //if (this.fieldClickedMetaData)
                if (this.metaDataHasGroupByOrSplitBy) {
                    if (!this.fieldClickedMetaData || (!this.fieldClickedMetaData.groupby_rank && !this.fieldClickedMetaData.splitby_field)) {
                        return false;
                    }
                } else {
                    if (this.fieldClickedMetaData) {
                        var type_special = this.fieldClickedMetaData.type_special;
                        if (type_special === "count" || type_special === "percent") {
                            return false;
                        }
                    }
                }

                return true;
            },
            /**
            *    If this.fieldClickedRank is a defined, then only constraints with a rank less than or equal to 
            *    this.fieldClickedRank will be returned else all constrants will be returned.
            **/
            buildConstraintsByGroupBy: function() {
                for (var i = 0; i < this.fields.length; i++) {
                    var key = this.fields[i],
                        fieldMetaData = this.fieldMetadataResults[key],
                        groupbyRank;
                    if (fieldMetaData && fieldMetaData.groupby_rank) {
                        groupbyRank = parseInt(fieldMetaData.groupby_rank, 10);
                        if (!this.fieldClickedRank || (groupbyRank < this.fieldClickedRank)) {
                            this.constraints.keys.push(key);
                            this.constraints.values.push(this.options.clickMeta.rowContext['row.' + key]);
                        } else if (this.fieldClickedRank && (groupbyRank == this.fieldClickedRank)) {
                            //selected constraint added sep. due to multi-value
                            this.constraints.keys.push(key);
                            this.constraints.values.push(this.fieldValueClicked);
                        } else {
                            break;
                        }
                    }
                }
            },
            /**
            *    If this.fieldClickedRank is a defined, then only constraints with a rank less than or equal to 
            *    this.fieldClickedRank will be returned else all constrants will be returned.
            **/
            buildConstraintsByFieldIndex: function() {
                var maxIndex = _.isUndefined(this.fieldClickedRank) ? this.fields.length : this.fieldClickedRank,
                    i = 0;

                for (; i < maxIndex; i++ ) {
                    var fieldKey = this.fields[i];
                    if (this.fieldMetadataResults && this.fieldMetadataResults[fieldKey]) {
                        var type_special = this.fieldMetadataResults[fieldKey].type_special;
                        if (type_special === 'count' || type_special === 'percent') {
                            continue;
                        }
                    }
                    this.constraints.keys.push(fieldKey);
                    this.constraints.values.push(this.options.clickMeta.rowContext['row.' + fieldKey]);
                }
                if (i == this.fieldClickedRank) {
                    this.constraints.keys.push(this.fields[i]);
                    this.constraints.values.push(this.fieldValueClicked);
                }
            },
            events: {
                // timechart row drilldown-view events
                // Handles:
                //     "view events" for row drilldown for timechart results
                //     "view events" for row drilldown for fieldvalue results when _time is the first column
                //     "view events" for cell drilldown into the time cell of timechart results
                //     "view events" for cell drilldown into the time cell of fieldvalue results
                'click .time_span': function(e) {
                    var clickMeta = _.extend({}, this.options.clickMeta, { type: 'row' });
                    this.fieldDrilldown(e, clickMeta);
                },
                // timechart row drilldown-narrow time span
                // Handles:
                //     "narrow to ..." for row drilldown for timechart results
                //     "narrow to ..." for cell drilldown into the time cell of timechart results
                'click .time_span_reporting': function(e) {
                    this.fieldDrilldown(e, this.stripClickMetaToTimeRange(), { stripReportsSearch: false });
                },

                // timechart/chart cell drilldown-view events
                // Handles:
                //     "view events" for cell drilldown into timechart/chart results
                'click .splitby_curr_inc_cell': function(e) {
                    this.fieldDrilldown(e, this.options.clickMeta);
                },
                // timechart/chart cell drilldown-view events
                // Handles:
                //     "exclude from results" for cell drilldown into timechart/chart results
                //     "exclude from results" for single-constraint drilldown into fieldvalue results
                'click .curr_exc_cell': function(e) {
                    this.fieldDrilldown(e, this.stripClickMetaToColumnOnly(), {
                        stripReportsSearch: false,
                        negate: true
                    });
                },

                // fieldvalue/row-view events
                // Handles:
                //    "view events" for row drilldown into fieldvalue results
                //    "view events" for single-constraint cell drilldown into fieldvalue results
                //    "view events" for cell drilldown into a non-groupby column of fieldvalue results
                'click .curr_inc_val': function(e) {
                    var strippedClickMeta = this.stripClickMetaToColumnOnly(),
                        columnName = strippedClickMeta.name2 || strippedClickMeta.name,
                        columnMeta = columnName && this.fieldMetadataResults[columnName];

                    // If the column is not the result of a group-by, drill into the whole row
                    if ((!columnMeta || !columnMeta.hasOwnProperty('groupby_rank')) && !this.cellDrilldownable) {
                        strippedClickMeta.type = 'row';
                    }
                    this.fieldDrilldown(e, strippedClickMeta);
                },
                // fieldvalue/row-other events
                // Handles:
                //    "other events" for row drilldown into fieldvalue results
                //    "other events" for single-constraint cell drilldown into fieldvalue results
                //    "other events" for cell drilldown into a non-groupby column of fieldvalue results
                'click .curr_exc_val': function(e) {
                    var strippedClickMeta = this.stripClickMetaToColumnOnly(),
                        columnName = strippedClickMeta.name2 || strippedClickMeta.name,
                        columnMeta = columnName && this.fieldMetadataResults[columnName];

                    // If the column is not the result of a group-by, drill into the whole row
                    if (!columnMeta || !columnMeta.hasOwnProperty('groupby_rank')) {
                        strippedClickMeta.type = 'row';
                    }
                    this.fieldDrilldown(e, strippedClickMeta, { negate: true });
                },
                // fieldvalue-new search
                // Handles:
                //     "new search" for single-constraint cell drilldown into fieldvalue results
                'click .only_val': function(e) {
                    this.fieldDrilldown(e, this.stripClickMetaToColumnOnly(), {
                        newSearch: true
                    });
                },
                // constraints-view events
                // Handles:
                //    "view events" for multi-constraint cell drilldown into fieldvalue results
                'click .curr_inc_con': function(e) {
                    this.fieldDrilldown(e, this.options.clickMeta, {
                        fields: this.constraints.keys,
                        values: this.constraints.values
                    });
                },
                // constraints-other events
                // Handles:
                //    "other events" for multi-constraint cell drilldown into fieldvalue results
                'click .curr_exc_con': function(e) {
                    this.fieldDrilldown(e, this.options.clickMeta, {
                        fields: this.constraints.keys,
                        values: this.constraints.values,
                        negate: true
                    });
                }
            },
            fieldDrilldown: function(e, clickInfo, options) {
                e.preventDefault();
                options = options || {};
                options.drilldownNewTab = $(e.currentTarget).hasClass('secondary-link');
                this.trigger('drilldown', clickInfo, options);
                this.hide();
            },
            show: function($toggle, $focus) {
                $.when(this.hasRenderedDeferred).then(function() {
                    PopTart.prototype.show.call(this, $toggle, $focus);
                }.bind(this));
            },
            render: function() {
                $.when(this.timeSpanDfd).then(function () {
                    this.$el.html(PopTart.prototype.template_menu);

                    var template,
                        fieldClicked,
                        showMilliseconds = !this.model.spanTimeRange.isRangeSnappedToSeconds(),
                        timeFormat = showMilliseconds ? 'YYYY-MM-dd HH:mm:ss.TTT' : 'YYYY-MM-dd HH:mm:ss',
                        earliest = i18n.format_date(time_utils.isoToDateObject(
                            this.model.spanTimeRange.get('earliest_iso')), timeFormat),
                        latest = i18n.format_date(time_utils.isoToDateObject(
                            this.model.spanTimeRange.get('latest_iso')), timeFormat);

                    if (this.isTimeSpan) {
                        this.$el.addClass('time-span-drilldown');
                        if (showMilliseconds) {
                            this.$el.removeClass('dropdown-menu-medium').addClass('dropdown-menu-wide');
                        }
                        if (this.cellDrilldownable) {
                            template = this.splitby_cell_template;
                        } else {
                            template = this.time_span_row_template;
                        }
                    } else {
                        if (this.cellDrilldownable) {
                            if (this.splitbyField) {
                                template = this.splitby_cell_template;
                            } else {
                                template = this.cell_template;
                            }
                        } else {
                            template = this.row_template;
                        }
                    }
                    var compliledTemplate = this.compileTemplate(template);
                    this.$el.append(compliledTemplate(
                        {
                            _: _,
                            showConstraints: this.fieldClickedRank != "0" && !_.isEmpty(this.constraints.keys),
                            constraintKeys: this.constraints.keys,
                            constraintValues: this.constraints.values,
                            earliest: earliest,
                            latest: latest,
                            isTimeSpan: this.isTimeSpan,
                            splitbyField: this.splitbyField,
                            splitbyValue: this.splitbyValue,
                            fieldClicked: this.fieldClicked,
                            fieldValueClicked: this.fieldValueClicked,
                            splunkUtil: splunkUtil
                        }
                    ));

                    this.hasRenderedDeferred.resolve();
                }.bind(this));
                return this;
            },
            time_span_row_template: '\
                <ul>\
                    <li class="info">\
                        <%- splunkUtil.sprintf("%s to %s", earliest, latest) %>\
                    </li>\
                    <li>\
                        <a class="time_span primary-link" href="#"><%- _("View events").t() %></a>\
                        <a class="time_span secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                    <li>\
                        <a class="time_span_reporting primary-link" href="#"><%- _("Narrow to this time range").t() %></a>\
                        <a class="time_span_reporting secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                </ul>\
            ',
            splitby_cell_template: '\
                <% var text = splunkUtil.sprintf("%s = %s", splitbyField, splitbyValue); %>\
                <ul>\
                    <li class="info">\
                        <span class="field-value" title="<%- text %>"><%- text %></span>\
                    </li>\
                    <li>\
                        <a class="curr_exc_cell primary-link" href="#"><%- _("Exclude from results").t() %></a>\
                        <a class="curr_exc_cell secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                    <li class="info">\
                        <% var splitText; %>\
                        <% if (isTimeSpan) { %>\
                            <% splitText = splunkUtil.sprintf("%s to %s", earliest, latest) %>\
                        <% } else { %>\
                            <% splitText = splunkUtil.sprintf("%s = %s", constraintKeys[0], constraintValues[0]) %>\
                        <% } %>\
                        <span class="field-value" title="<%- splitText %>"><%- splitText %></span>\
                        <span class="field-value" title="<%- text %>"><%- text %></span>\
                    </li>\
                    <li>\
                        <a class="splitby_curr_inc_cell primary-link" href="#"><%- _("View events").t() %></a>\
                        <a class="splitby_curr_inc_cell secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                </ul>\
            ',
            row_template: '\
                <ul>\
                <% if (showConstraints) { %>\
                    <li class="info">\
                    <% for(var i = 0; i < constraintKeys.length; i++) { %>\
                        <%\
                            var key = constraintKeys[i],\
                                value = constraintValues[i],\
                                text = splunkUtil.sprintf("%s = %s", key, _.isArray(value) ? value.join(" | ") : value);\
                        %>\
                        <span class="field-value" title="<%- text %>"><%- text %></span>\
                    <% } %>\
                    </li>\
                <% } %>\
                    <li>\
                        <a class="curr_inc_val primary-link" href="#"><%- _("View events").t() %></a>\
                        <a class="curr_inc_val secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                <% if (showConstraints) { %>\
                    <li>\
                        <a class="curr_exc_val primary-link" href="#"><%- _("Other events").t() %></a>\
                        <a class="curr_exc_val secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                <% } %>\
                </ul>\
            ',
            cell_template: '\
                <ul>\
                <% if (fieldClicked) { %>\
                    <li class="info">\
                        <% var fieldInfoText = splunkUtil.sprintf("%s = %s", fieldClicked, fieldValueClicked); %>\
                        <span class="field-value" title="<%- fieldInfoText %>"><%- fieldInfoText %>\
                    </li>\
                <% } %>\
                \
                    <li>\
                        <a class="curr_inc_val primary-link" href="#"><%- _("View events").t() %></a>\
                        <a class="curr_inc_val secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                    <li>\
                        <a class="curr_exc_val primary-link" href="#"><%- _("Other events").t() %></a>\
                        <a class="curr_exc_val secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                    <li>\
                        <a class="curr_exc_cell primary-link" href="#"><%- _("Exclude from results").t() %></a>\
                        <a class="curr_exc_cell secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                    <li>\
                        <a class="only_val primary-link" href="#"><%- _("New search").t() %></a>\
                        <a class="only_val secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                \
                <% if (showConstraints) { %>\
                    <li class="info">\
                    <% for(var i = 0; i < constraintKeys.length; i++) { %>\
                        <%\
                            var key = constraintKeys[i],\
                                value = constraintValues[i],\
                                text = splunkUtil.sprintf("%s = %s", key, _.isArray(value) ? value.join(" | ") : value);\
                        %>\
                        <span class="field-value" title="<%- text %>"><%- text %></span>\
                    <% } %>\
                    </li>\
                    <li>\
                        <a class="curr_inc_con primary-link" href="#"><%- _("View events").t() %></a>\
                        <a class="curr_inc_con secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                    <li>\
                        <a class="curr_exc_con primary-link" href="#"><%- _("Other events").t() %></a>\
                        <a class="curr_exc_con secondary-link" href="#"><i class="icon-external"></i></a>\
                    </li>\
                <% } %>\
                </ul>\
            '
        });
        return ResultsTableDrilldownPopTart;
    }
);
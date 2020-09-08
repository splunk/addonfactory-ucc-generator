define([
        'underscore',
        'models/services/search/jobs/ResultJsonRows',
        'models/datasets/Column',
        'util/math_utils'
    ],
    function(
        _,
        ResultJsonRows,
        ColumnModel,
        mathUtil
    ) {

        return ResultJsonRows.extend({

            MATCHED_TYPE: 'MatchedType',
            MISMATCHED_TYPE: 'MismatchedType',
            NULL_VALUES: 'NullValues',
            MIN_LINE_COUNT: 'MinLineCount',
            MAX_LINE_COUNT: 'MaxLineCount',
            AVERAGE_LINE_COUNT: 'AverageLineCount',
            MINIMUM: 'Minimum',
            MAXIMUM: 'Maximum',
            AVERAGE: 'Average',
            MEDIAN: 'Median',
            MODE: 'Mode',
            STANDARD_DEVIATION: 'StandardDeviation',
            AVERAGE_VALUE_COUNT: 'AverageValueCount',
            MULTIVALUE: 'Multivalue',
            SINGLE_VALUE: 'SingleValue',
            UNIQUE_VALUES: 'UniqueValues',
            MAX_VALUE_COUNT: 'MaxValueCount',
            MIN_VALUE_COUNT: 'MinValueCount',
            MODE_VALUE_COUNT: 'ModeValueCount',
            MEDIAN_VALUE_COUNT: 'MedianValueCount',
            EARLIEST: 'Earliest',
            LATEST: 'Latest',
            COUNT_TRUE: 'CountTrue',
            COUNT_FALSE: 'CountFalse',

            initialize: function() {
                ResultJsonRows.prototype.initialize.call(this, arguments);
            },

            extractMetrics: function(column) {
                var fields = this.get('fields'),
                    rows = this.get('rows'),
                    columnMetrics = [],
                    columnMetric,
                    fieldComponents,
                    metricValue,
                    isZero,
                    multivalueIsZero = false;

                this.columnType = column.get('type');
                this.columnName = column.get('name');

                if ((fields && fields.length) && (rows && rows.length)) {
                    _.each(fields, function(field, i) {
                        fieldComponents = this.parseFieldName(field);
                        if (fieldComponents) {
                            if (fieldComponents.fieldName === this.columnName) {
                                metricValue = this.enforceNumeric(rows[0][i], fieldComponents.metricName);
                                isZero = (parseInt(metricValue, 10) === 0);
                                // This logic makes the assumption that Multivalue field always precedes MaxValueCount, MinValueCount, etc.,
                                // which it should because that is the order in which the search defines the fields.
                                if (fieldComponents.metricName === this.MULTIVALUE && isZero) {
                                    multivalueIsZero = true;
                                }
                                if (multivalueIsZero &&
                                    (fieldComponents.metricName === this.MAX_VALUE_COUNT ||
                                    fieldComponents.metricName === this.MIN_VALUE_COUNT ||
                                    fieldComponents.metricName === this.MODE_VALUE_COUNT ||
                                    fieldComponents.metricName === this.MEDIAN_VALUE_COUNT ||
                                    fieldComponents.metricName === this.AVERAGE_VALUE_COUNT)
                                ) {
                                    return;
                                }
                                columnMetric = {
                                    key: fieldComponents.metricName,
                                    value: this.formatValue(fieldComponents.metricName, metricValue, this.columnName),
                                    label: this.parseLabelFromKey(fieldComponents.metricName),
                                    className: 'summary-' + fieldComponents.metricName.toLowerCase(),
                                    isZero: isZero
                                };
                                if (this.insertNewlineAfter(fieldComponents.metricName)) {
                                    columnMetric['breakAfter'] = true;
                                }
                                columnMetrics.push(columnMetric);
                            }
                        }
                    }, this);
                }
                return columnMetrics;
            },

            parseFieldName: function(fullFieldName) {
                var fieldComponents = fullFieldName.split(':');
                if (fieldComponents.length === 2) {
                    return {
                        fieldName: fieldComponents[0],
                        metricName: fieldComponents[1]
                    };
                }
            },

            calculateTotalCount: function(columnName) {
                // if field value is null, treat as 0 so that we get a correct totalCount sum
                var matchedTypeCount = parseInt(this.getFieldValue(this.MATCHED_TYPE, columnName), 10),
                    mismatchedTypeCount = parseInt(this.getFieldValue(this.MISMATCHED_TYPE, columnName), 10),
                    nullValuesCount = parseInt(this.getFieldValue(this.NULL_VALUES, columnName), 10),
                    totalCount = matchedTypeCount + mismatchedTypeCount + nullValuesCount;
                return totalCount;
            },

            getFieldValue: function(metricName, columnName) {
                var rows = this.get('rows'),
                    fields = this.get('fields');
                if (rows.length) {
                    var i = _.indexOf(fields, this.getFullFieldName(metricName, columnName));
                    return this.enforceNumeric(rows[0][i]);
                }
            },

            getFullFieldName: function(metricName, columnName) {
                return columnName + ':' + metricName;
            },

            enforceNumeric: function(metricValue, metricName) {
                // We do not allow non-numeric metric values other than epochTime-typed fields, so we default to 0
                if (metricName !== 'Earliest' && metricName !== 'Latest' && (metricValue === null || isNaN(metricValue))) {
                     return '0';
                } else {
                    return metricValue;
                }
            },

            formatValue: function(key, value, columnName) {
                var totalCount = this.calculateTotalCount(columnName);
                if (key === 'Earliest' || key === 'Latest') {
                    return value;
                } else if (key === this.MATCHED_TYPE || key === this.MISMATCHED_TYPE || key === this.NULL_VALUES) {
                    // Always round to 2 d.p.
                    if (totalCount === 0) {
                        return _("0%").t();
                    }
                    return (mathUtil.convertToTwoDecimalPercentage(value, totalCount) + '%');
                } else {
                    // Round to 2 d.p. if longer than that
                    return mathUtil.roundToDecimal(parseFloat(value), -2);
                }
            },

            parseLabelFromKey: function(key) {
                // Convert field names to formatted, translated labels
                switch(key) {
                    case this.MATCHED_TYPE:
                        return _('Matched type').t();
                    case this.MISMATCHED_TYPE:
                        return _('Mismatched type').t();
                    case this.NULL_VALUES:
                        return _('Null values').t();
                    case this.MIN_LINE_COUNT:
                        return _('Min line count').t();
                    case this.MAX_LINE_COUNT:
                        return _('Max line count').t();
                    case this.AVERAGE_LINE_COUNT:
                        return _('Average line count').t();
                    case this.MINIMUM:
                        return _('Minimum').t();
                    case this.MAXIMUM:
                        return _('Maximum').t();
                    case this.AVERAGE:
                        return _('Average').t();
                    case this.MEDIAN:
                        return _('Median').t();
                    case this.MODE:
                        return _('Mode').t();
                    case this.STANDARD_DEVIATION:
                        return _('Standard deviation').t();
                    case this.MULTIVALUE:
                        return _('Multivalue').t();
                    case this.SINGLE_VALUE:
                        return _('Single value').t();
                    case this.UNIQUE_VALUES:
                        return _('Unique values').t();
                    case this.MAX_VALUE_COUNT:
                        return _('Max value count').t();
                    case this.MIN_VALUE_COUNT:
                        return _('Min value count').t();
                    case this.MODE_VALUE_COUNT:
                        return _('Mode value count').t();
                    case this.MEDIAN_VALUE_COUNT:
                        return _('Median value count').t();
                    case this.AVERAGE_VALUE_COUNT:
                        return _('Average value count').t();
                    case this.EARLIEST:
                        return _('Earliest').t();
                    case this.LATEST:
                        return _('Latest').t();
                    case this.COUNT_FALSE:
                        return _('Count false').t();
                    case this.COUNT_TRUE:
                        return _('Count true').t();
                    default:
                        throw new Error('Unable to generate data summary metric label from the provided metric type.');
                }
            },

            insertNewlineAfter: function(metricName) {
                if (metricName === this.NULL_VALUES) {
                    return true;
                }

                if (this.columnType === ColumnModel.TYPES._RAW) {
                    if (metricName === this.MIN_LINE_COUNT) {
                        return true;
                    }
                } else if (this.columnType === ColumnModel.TYPES.NUMBER) {
                    if (metricName === this.MINIMUM) {
                        return true;
                    }
                } else if (this.columnType === ColumnModel.TYPES.STRING) {
                    if (metricName === this.AVERAGE_VALUE_COUNT) {
                        return true;
                    }
                }
                return false;
            }
        });

    });
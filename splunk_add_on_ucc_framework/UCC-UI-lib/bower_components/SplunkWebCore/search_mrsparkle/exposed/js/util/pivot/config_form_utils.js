/**
 * @author sfishel
 *
 * A util package for working with pivot report element forms.
 *
 * Provides some centralized functions for translating report element property values into corresponding display strings.
 * These functions are shared by the pivot report element views and models to avoid duplicate code.
 */

define([
            'underscore',
            'util/time',
            'splunk.util',
            'splunk.i18n'
        ],
        function(
            _,
            timeUtils,
            splunkUtils,
            i18n
        ) {

    var MATCH_FILTER_LABELS = {
        is: _('%(fieldName)s is %(matchValue)s').t(),
        contains: _('%(fieldName)s contains %(matchValue)s').t(),
        isNot: _('%(fieldName)s is not %(matchValue)s').t(),
        doesNotContain: _('%(fieldName)s does not contain %(matchValue)s').t(),
        startsWith: _('%(fieldName)s starts with %(matchValue)s').t(),
        endsWith: _('%(fieldName)s ends with %(matchValue)s').t(),
        isNull: _('%(fieldName)s is null').t(),
        isNotNull: _('%(fieldName)s is not null').t(),
        'in': _('%(fieldName)s is in (%(matchValue)s)').t(),
        regex: _('%(fieldName)s matches %(matchValue)s').t(),
        '=': _('%(fieldName)s = %(matchValue)s').t(),
        '!=': _('%(fieldName)s != %(matchValue)s').t(),
        '<=': _('%(fieldName)s <= %(matchValue)s').t(),
        '<': _('%(fieldName)s < %(matchValue)s').t(),
        '>=': _('%(fieldName)s >= %(matchValue)s').t(),
        '>': _('%(fieldName)s > %(matchValue)s').t(),
        'true': _('%(fieldName)s is true').t(),
        'false': _('%(fieldName)s is false').t()
    };

    var FILTER_RULE_DISPLAY_NAMES = {
        is: _('is').t(),
        contains: _('contains').t(),
        isNot: _('is not').t(),
        doesNotContain: _('does not contain').t(),
        startsWith: _('starts with').t(),
        endsWith: _('ends with').t(),
        isNull: _('is null').t(),
        isNotNull: _('is not null').t(),
        'in': _('is in list').t(),
        regex: _('regex').t(),
        '=': _('=').t(),
        '!=': _('!=').t(),
        '<=': _('<=').t(),
        '<': _('<').t(),
        '>=': _('>=').t(),
        '>': _('>').t(),
        'true': _('is true').t(),
        'false': _('is false').t()
    };

    var LIMIT_FILTER_LABELS_LONG = {
        highest: _('Highest %(limitAmount)s %(fieldName)s by %(limitBy)s').t(),
        lowest: _('Lowest %(limitAmount)s %(fieldName)s by %(limitBy)s').t()
    };

    var LIMIT_FILTER_LABELS_SHORT = {
        highest: _('Highest %(limitAmount)s %(fieldName)s').t(),
        lowest: _('Lowest %(limitAmount)s %(fieldName)s').t()
    };

    var FILTER_LIMIT_TYPE_DISPLAY_NAMES = {
        highest: _('Highest').t(),
        lowest: _('Lowest').t()
    };

    var CELL_VALUE_LABELS = {
        'list': _('Values of %(fieldName)s').t(),
        'values': _('Distinct Values of %(fieldName)s').t(),
        'first': _('First Value of %(fieldName)s').t(),
        'last': _('Last Value of %(fieldName)s').t(),
        'earliest': _('Earliest Value of %(fieldName)s').t(),
        'latest': _('Latest Value of %(fieldName)s').t(),
        'count': _('Count of %(fieldName)s').t(),
        'dc': _('Distinct Count of %(fieldName)s').t(),
        'sum': _('Sum of %(fieldName)s').t(),
        'avg': _('Average of %(fieldName)s').t(),
        'max': _('Max of %(fieldName)s').t(),
        'min': _('Min of %(fieldName)s').t(),
        'stdev': _('Standard Deviation of %(fieldName)s').t(),
        'median': _('Median of %(fieldName)s').t(),
        'duration': _('Duration').t(),
        'listDistinct': _('Distinct Values of %(fieldName)s').t()
    };

    var CELL_VALUE_DISPLAY_NAMES = {
        'list': _('List Values').t(),
        'values': _('List Distinct Values').t(),
        'first': _('First Value').t(),
        'last': _('Last Value').t(),
        'count': _('Count').t(),
        'dc': _('Distinct Count').t(),
        'sum': _('Sum').t(),
        'avg': _('Average').t(),
        'max': _('Max').t(),
        'min': _('Min').t(),
        'stdev': _('Standard Deviation').t(),
        'median': _('Median').t(),
        'duration': _('Duration').t(),
        'earliest': _('Earliest').t(),
        'latest': _('Latest').t(),
        'listDistinct': _('List Distinct Values').t()
    };

    var CELL_VALUE_OUTPUT_TYPES = {
        'list': 'dimension',
        'values': 'dimension',
        'first': 'dimension',
        'last': 'dimension',
        'count': 'metric',
        'dc': 'metric',
        'sum': 'metric',
        'avg': 'metric',
        'max': 'metric',
        'min': 'metric',
        'stdev': 'metric',
        'median': 'metric',
        'duration': 'metric',
        'earliest': 'dimension',
        'latest': 'dimension',
        'listDistinct': 'dimension'
    };

    var SPLIT_MODE_DISPLAY_NAMES = {
        'all': _('All Values').t(),
        'ranges': _('Value Ranges').t()
    };

    var sampleDate = new Date(2011, 0, 31, 23, 1, 1),
        formatSampleDate = function(granularity) {
            return i18n.format_date(sampleDate, timeUtils.RESULTS_TIMESTAMP_FORMATS[granularity]);
        };

    var SPLIT_TIME_PERIOD_DISPLAY_NAMES = {
        'auto': _('Auto').t(),
        'year': splunkUtils.sprintf(_('Years (%(sampleDate)s)').t(), { sampleDate: formatSampleDate('year') }),
        'month': splunkUtils.sprintf(_('Months (%(sampleDate)s)').t(), { sampleDate: formatSampleDate('month') }),
        'day': splunkUtils.sprintf(_('Days (%(sampleDate)s)').t(), { sampleDate: formatSampleDate('day') }),
        'hour': splunkUtils.sprintf(_('Hours (%(sampleDate)s)').t(), { sampleDate: formatSampleDate('hour') }),
        'minute': splunkUtils.sprintf(_('Minutes (%(sampleDate)s)').t(), { sampleDate: formatSampleDate('minute') }),
        'second': splunkUtils.sprintf(_('Seconds (%(sampleDate)s)').t(), { sampleDate: formatSampleDate('second') })
    };

    var SPLIT_TIME_PERIOD_DISPLAY_NAMES_SHORT = {
        'auto': _('Auto').t(),
        'year': _('Years').t(),
        'month': _('Months').t(),
        'day': _('Days').t(),
        'hour': _('Hours').t(),
        'minute': _('Minutes').t(),
        'second': _('Seconds').t()
    };

    /**
     * @param dict
     * @param key
     * @return the corresponding value of the key in the dict, or the key itself if it is not in the dict
     */
    var dictValueOrKey = function(dict, key) {
        return dict.hasOwnProperty(key) ? dict[key] : key;
    };

    var quoteIfContainsSpacesOrCommas = function(str) {
        if (/\s|,/.test(str)) {
            return '"' + str + '"';
        }
        return str;
    };

    var prettyPrintArrayForLabel = function(values) {
        return _(values).map(quoteIfContainsSpacesOrCommas).join(', ');
    };

    return ({

        getMatchFilterLabel: function(fieldName, ruleKey, matchValue) {
            if (_.isArray(matchValue)) {
                matchValue = prettyPrintArrayForLabel(matchValue);
            }
            return splunkUtils.sprintf(
                MATCH_FILTER_LABELS[ruleKey],
                { fieldName: fieldName, matchValue: matchValue }
            );
        },

        filterRuleToDisplay: function(rule) {
            return FILTER_RULE_DISPLAY_NAMES[rule];
        },

        getLimitFilterLabel: function(fieldName, limitType, limitAmount, limitBy) {
            if(limitBy) {
                return splunkUtils.sprintf(
                    LIMIT_FILTER_LABELS_LONG[limitType],
                    { fieldName: fieldName, limitAmount: limitAmount, limitBy: limitBy }
                );
            }
            return splunkUtils.sprintf(
                LIMIT_FILTER_LABELS_SHORT[limitType],
                { fieldName: fieldName, limitAmount: limitAmount }
            );
        },

        filterLimitTypeToDisplay: function(limitType) {
            return FILTER_LIMIT_TYPE_DISPLAY_NAMES[limitType];
        },

        cellValueToDisplay: function(valueType) {
            return CELL_VALUE_DISPLAY_NAMES[valueType];
        },

        getCellValueLabel: function(fieldName, valueKey) {
            return splunkUtils.sprintf(CELL_VALUE_LABELS[valueKey], { fieldName: fieldName });
        },

        cellValueToOutputType: function(valueType, dataType) {
            if(dataType === 'objectCount' || dataType === 'childCount') {
                return 'metric';
            }
            return CELL_VALUE_OUTPUT_TYPES[valueType];
        },

        splitModeToDisplay: function(mode) {
            return dictValueOrKey(SPLIT_MODE_DISPLAY_NAMES, mode);
        },

        splitTimePeriodToDisplay: function(period, showSamples) {
            if(showSamples) {
                return dictValueOrKey(SPLIT_TIME_PERIOD_DISPLAY_NAMES, period);
            }
            return dictValueOrKey(SPLIT_TIME_PERIOD_DISPLAY_NAMES_SHORT, period);
        },

        booleanFieldNameLabel: function(fieldName, isTrue) {
            return isTrue ?
                splunkUtils.sprintf(_('is %(fieldName)s').t(), { fieldName: fieldName }) :
                splunkUtils.sprintf(_('is not %(fieldName)s').t(), { fieldName: fieldName });
        }

    });

});
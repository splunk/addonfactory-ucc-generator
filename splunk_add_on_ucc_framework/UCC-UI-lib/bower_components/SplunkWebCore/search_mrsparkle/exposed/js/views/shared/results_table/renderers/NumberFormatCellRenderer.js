define(function(require, exports, module) {

    var _ = require('underscore');
    var BaseCellRenderer = require('./BaseCellRenderer');
    var EnumProperty = require('jg/properties/EnumProperty');
    var MPropertyTarget = require('jg/properties/MPropertyTarget');
    var Property = require('jg/properties/Property');
    var NumberUtil = require('jg/utils/NumberUtil');
    var StringUtil = require('jg/utils/StringUtil');
    var DataUtil = require('splunk/utils/DataUtil');
    var numeral = require('util/numeral');

    var _repeatString = function(str, count) {
        var repeated = '';
        for (var i = 0; i < count; i++) {
            repeated += str;
        }
        return repeated;
    };

    return BaseCellRenderer.extend(_.extend({}, MPropertyTarget, {

        // Public Properties

        precision: new Property('precision', Number, 2)
            .writeFilter(function(value) {
                return (value <= Infinity) ? NumberUtil.minMax(Math.floor(value), 0, 20) : 0;
            })
            .setter(function(value) {
                if (value !== this._precision) {
                    this._precision = value;
                    this.trigger('change');
                }
            }),

        useThousandSeparators: new Property('useThousandSeparators', Boolean, true)
            .setter(function(value) {
                if (value !== this._useThousandSeparators) {
                    this._useThousandSeparators = value;
                    this.trigger('change');
                }
            }),

        unit: new Property('unit', String, '')
            .writeFilter(function(value) {
                return value || '';
            })
            .setter(function(value) {
                if (value !== this._unit) {
                    this._unit = value;
                    this.trigger('change');
                }
            }),

        unitPosition: new EnumProperty('unitPosition', String, ['before', 'after'], 'after')
            .setter(function(value) {
                if (value !== this._unitPosition) {
                    this._unitPosition = value;
                    this.trigger('change');
                }
            }),

        // Private Properties

        _precision: 2,
        _useThousandSeparators: true,
        _unit: '',
        _unitPosition: 'after',

        // Public Methods

        canRender: function(cellData) {
            var value = DataUtil.parseNumber(cellData.value);
            return ((value > -Infinity) && (value < Infinity));
        },

        render: function($td, cellData) {
            var formatString = '0';
            var value = DataUtil.parseNumber(cellData.value);
            var useThousandSeparators = this._useThousandSeparators;
            var precision = this._precision;
            var unit = this._unit;
            var unitPosition = this._unitPosition;

            if (useThousandSeparators) {
                formatString += ',0';
            }

            if (precision > 0) {
                formatString += '.' + _repeatString('0', precision);
            }

            value = numeral(value).format(formatString);

            if (unit) {
                value = (unitPosition === 'before' ) ? [unit, value].join(' ') : [value, unit].join(' ');
            }

            $td.html(StringUtil.escapeHTML(value));
        }

    }));

});

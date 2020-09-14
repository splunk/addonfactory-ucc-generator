define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'util/math_utils'
    ],
    function(
        $,
        _,
        BaseCommand,
        ColumnModel,
        mathUtils
    ) {
        var TIME_SCALE_UNITS = [
            {value: 's', label: _('Seconds').t()},
            {value: 'm', label: _('Minutes').t()},
            {value: 'h', label: _('Hours').t()},
            {value: 'mon', label: _('Months ').t()}
            //TODO: microseconds (us), milliseconds (ms), centiseconds (cs), or deciseconds (ds)?
        ];

        var Bucket = BaseCommand.extend({
            _displayName: _("Bucket").t(),
            _placeholderSPL: "bin",

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL'
            },

            defaults: function() {
                return Bucket.getDefaults();
            },

            validateSPL: function() {
                var errorString = this.validateForTypes(this.getWhitelistedTypes()),
                    timeCount = this.get('timeCount'),
                    timeScaleUnit = this.get('timeScaleUnit');

                if (!this.hasValidRequiredColumn()) {
                    return _('You must select at least one field to bucket.').t();
                }

                if (errorString) {
                    return errorString;
                }

                if (!mathUtils.isInteger(timeCount) || timeCount < 1) {
                    return _('Provide a positive number of time units.').t();
                }

                if (!_.where(TIME_SCALE_UNITS, {value: timeScaleUnit}).length) {
                    return _('Provide a valid time scale unit.').t();
                }
            },

            generateSPL: function(options) {
                options = options || {};

                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Bucket must be in a valid state before you can generate SPL.');
                }

                var requiredField = this.requiredColumns.first(),
                    requiredFieldGuid = requiredField && requiredField.get('id'),
                    fieldName = this.getFieldNameFromGuid(requiredFieldGuid, { doubleQuoteWrap: true }),
                    timeCount = this.get('timeCount'),
                    timeScaleUnit = this.get('timeScaleUnit');

                return 'bin ' + fieldName + ' span=' + timeCount + timeScaleUnit;
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.COLUMN,
                    types: [ ColumnModel.TYPES.STRING, ColumnModel.TYPES._RAW,
                        ColumnModel.TYPES.BOOLEAN, ColumnModel.TYPES.IPV4,
                        ColumnModel.TYPES.NUMBER ] },
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.BUCKET,
                    timeScaleUnit: 's'
                }, BaseCommand.getDefaults());
            },
            TIME_SCALE_UNITS: TIME_SCALE_UNITS
        });

        return Bucket;
    }
);

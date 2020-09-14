define(
    [
        'underscore',
        'models/Base',
        'models/datasets/Column',
        'util/dataset_utils'
    ],
    function(
        _,
        BaseModel,
        ColumnModel,
        datasetUtils
    ) {
        // Import the ColumnModel's types for consistency
        var TYPES = ColumnModel.TYPES;

        return BaseModel.extend({
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            // Returns true if the type of the cell is incompatible with the type of the column
            getTypeMismatchMessage: function() {
                // The type of the cell is determined by its first value (probably wrong, good enough for V1)
                var value = this.get('values')[0],
                    columnType = this.get('columnType');

                // Empty string and null are never a type mismatch
                if (_.isNull(value) || value === "") {
                    return undefined;
                }

                // No matter what we decide the type of a cell as, if the column is raw, _time, or string,
                // then the cell is not a mismatch.
                if ((columnType === TYPES._RAW) || (columnType === TYPES.STRING) || (columnType === TYPES._TIME)) {
                    return undefined;
                } else if (columnType === TYPES.EPOCH_TIME) {
                    if (!datasetUtils.isEpochTime(value)) {
                        return _('This field is type Epoch Time. A field with this type expects values like: 246925704.000, 905293704, etc.').t();
                    }
                } else if (columnType === TYPES.NUMBER) {
                    if (!datasetUtils.isNumber(value)) {
                        return _('This field is type Number. A field with this type expects values like: 7245, -24, 3.1415, 6.022e23, etc.').t();
                    }
                } else if (columnType === TYPES.BOOLEAN) {
                    if (!datasetUtils.isBoolean(value)) {
                        return _('This field is type Boolean. A field with this type expects values: true, false.').t();
                    }
                } else if (columnType === TYPES.IPV4) {
                    if (!datasetUtils.isIPV4(value)) {
                        return _('This field is type IPv4. A field with this type expects values like: 192.0.2.0, 203.0.113.0, etc.').t();
                    }
                }

                return undefined;
            },

            isNull: function() {
                var values = this.get('values') || [];
                return values.length ? _.isNull(values[0]) : true;
            },

            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Cell model');
            }
        }, {
            TYPES: TYPES
        });
    }
);

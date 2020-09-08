define(
    [
        'jquery',
        'underscore',
        'models/Base',
        'util/model_utils'
    ],
    function(
        $,
        _,
        BaseModel,
        modelUtils
    ) {
        var TYPES = {
                // Generic Types
                EPOCH_TIME: 'epochTime',
                NUMBER: 'number',
                STRING: 'string',
                BOOLEAN: 'boolean',
                IPV4: 'ipv4',

                // Unique Data Types
                // - Users cannot assign these types to other fields
                // - Users cannot change the types of these fields
                // - If field is duplicated, assign 'epoch' or 'string' generic types
                _RAW: 'raw',
                _TIME: 'timestamp'
            },
            TYPE_LABELS = {
                'epochTime': _('Epoch Time').t(),
                'number': _('Number').t(),
                'string': _('String').t(),
                'boolean': _('Boolean').t(),
                'ipv4': _('IPv4').t(),
                'raw': _('Raw').t(),
                'timestamp': _('Timestamp').t()
            },
            WIDTH_SELECT_ALL = 60,
            WIDTH_DEFAULT = 200,
            WIDTH_DEFAULT_RAW = 600;

        return BaseModel.extend({
            initialize: function(attributes, options) {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            
            defaults: function() {
                return {
                    id: modelUtils.generateUUID(),
                    type: TYPES.STRING
                };
            },
            
            validation: {
                name: function(value) {
                    if (!value) {
                        throw new Error('You cannot set on a column without a name.');
                    }
                }
            },
            
            sync: function(method, model, options) {
                throw new Error('sync not allowed for the Column model');
            },
            
            isTouchedByComparison: function(comparisonColumn, options) {
                options = options || {};
                var currentName = options.previousColumnName || this.get('name'),
                    comparisonName = comparisonColumn.get('name');
                
                if (this.id !== comparisonColumn.id) {
                    throw new Error('You cannot compare columns with different ids!');
                }
                
                return (currentName !== comparisonName);
            },
            
            getIconName: function() {
                var type = this.get('type');
                
                if (type === TYPES._RAW) {
                    return 'greater';
                }
                
                if (this.isEpochTime()) {
                    return 'clock';
                }
                
                // Other type icons have the same names as the types themselves
                return type;
            },

            isEpochTime: function() {
                var type = this.get('type');
                return ((type === TYPES.EPOCH_TIME) || (type === TYPES._TIME));
            },
            
            isSplunkTime: function() {
                var type = this.get('type');
                return (type === TYPES._TIME);
            },

            getWidth: function() {
                var customSetWidth = parseFloat(this.get('display.width'));

                if (customSetWidth && !_.isNaN(customSetWidth)) {
                    return customSetWidth;
                } else {
                    return this.get('type') === TYPES._RAW ? WIDTH_DEFAULT_RAW : WIDTH_DEFAULT;
                }
            }
        }, {
            TYPES: TYPES,
            TYPE_LABELS: TYPE_LABELS,
            WIDTH_SELECT_ALL: WIDTH_SELECT_ALL,
            WIDTH_DEFAULT: WIDTH_DEFAULT,
            WIDTH_DEFAULT_RAW: WIDTH_DEFAULT_RAW
        });
    }
);

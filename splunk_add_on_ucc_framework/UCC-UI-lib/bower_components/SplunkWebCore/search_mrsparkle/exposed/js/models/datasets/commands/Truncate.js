define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'util/dataset_utils'
    ],
    function(
        $,
        _,
        BaseCommand,
        datasetUtils
    ) {
        var Truncate = BaseCommand.extend({
            _displayName: _("Limit Rows").t(),
            _placeholderSPL: "head",
            isSearchPoint: true,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            validation: {
                spl: 'validateSPL'
            },

            defaults: function() {
                return Truncate.getDefaults();
            },
            
            validateSPL: function(value, attr, options) {
                var limit = this.get('limit');

                if (limit) {
                    if (!datasetUtils.isNumber(limit)) {
                        return _("Max rows must be a number.").t();
                    } else if (limit < 0) {
                        return _("Max rows must be greater than or equal to zero.").t();
                    }
                }
            },

            generateSPL: function(options) {
                options = options || {};
            
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Truncate must be in a valid state before you can generate SPL.');
                }
            
                var limit = this.get('limit'),
                    spl = 'head ';
                return limit ? spl + limit : spl.trim();
            },

            setFromCommandJSON: function(jsonPayload, options) {
                options = options || {};
                options.skipClone = true;
                BaseCommand.prototype.setFromCommandJSON.call(this, jsonPayload, options);
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.COLUMN },
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TEXT }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}),  {
                    type: BaseCommand.TRUNCATE,
                    isComplete: true
                }, BaseCommand.getDefaults());
            }
        });

        return Truncate;
    }
);

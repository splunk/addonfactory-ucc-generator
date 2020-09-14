define(
    [
        'jquery',
        'underscore',
        'models/datasets/commands/Base',
        'models/datasets/Column'
    ],
    function(
        $,
        _,
        BaseCommand,
        ColumnModel
    ) {
        var Rex = BaseCommand.extend({
            _displayName: _('Extract').t(),
            _placeholderSPL: 'rex',
            _advancedCommand: BaseCommand.ADVANCED_REX,
            isModalized: true,

            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);
            },

            setInitialState: function(initialStateOptions) {
                initialStateOptions = initialStateOptions || {};

                this.editorValues.add({
                    startPosition: initialStateOptions.startPosition,
                    endPosition: initialStateOptions.endPosition,
                    fullText: initialStateOptions.fullText,
                    selectedText: initialStateOptions.selectedText
                });
            },

            defaults: function() {
                return Rex.getDefaults();
            },

            validation: {
                spl: 'validateSPL'
            },

            // While there are other attributes on this command that are required to generate the SPL, since they're
            // forced to be added through the modal, we don't need to check their existence here.
            validateSPL: function(value, attr, option) {
                var errorString = this.validateForTypes(this.getWhitelistedTypes( { selectionType: BaseCommand.SELECTION.TEXT })),
                    invalidFieldNameMessage = this.validateRexFieldName(this.get('newFieldName'));

                if (!this.hasValidRequiredColumn()) {
                    // This will happen when someone removes the field that this rex previously operated on.
                    // In the future, we need to have a way to re-select the field to get us out of error state.
                    return _('Remove this command. The field the command operated on has been changed or removed.').t();
                }

                if (invalidFieldNameMessage) {
                    return invalidFieldNameMessage;
                }

                if (errorString) {
                    return errorString;
                }
            },

            generateSPL: function(options) {
                options = options || {};
            
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('Rex must be in a valid state before you can generate SPL.');
                }
                
                var regExpStarting = this.get('regExpStarting'),
                    requiredColumn = this.requiredColumns.at(0),
                    regex = this.generateRegex();

                return 'rex field=' + this.getFieldNameFromGuid(requiredColumn.id, { doubleQuoteWrap: true }) + ' "' + regex + '"';
            },

            getAdvancedCommandAttributes: function() {
                return {
                    regex: this.generateRegex()
                };
            },

            generateRegex: function() {
                var regExpStarting = this.get('regExpStarting'),
                    newFieldName = this.get('newFieldName'),
                    regExpExtraction = this.get('regExpExtraction'),
                    regExpStopping = this.get('regExpStopping');

                return regExpStarting + '(?<' + newFieldName + '>' + regExpExtraction + ')' + regExpStopping;
            },

            hasRegexRules: function() {
                return !_.isUndefined(this.get('regExpStarting')) &&
                    !_.isUndefined(this.get('regExpExtraction')) &&
                    !_.isUndefined(this.get('regExpStopping'));
            }
        }, {
            blacklist: [
                { selection: BaseCommand.SELECTION.CELL },
                { selection: BaseCommand.SELECTION.COLUMN },
                { selection: BaseCommand.SELECTION.MULTICOLUMN },
                { selection: BaseCommand.SELECTION.TABLE },
                { selection: BaseCommand.SELECTION.TEXT,
                    types: [ ColumnModel.TYPES.EPOCH_TIME, ColumnModel.TYPES._TIME, ColumnModel.TYPES.BOOLEAN, ColumnModel.TYPES.NUMBER ]
                }
            ],
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.REX
                }, BaseCommand.getDefaults());
            }
        });
        
        return Rex;
    }
);

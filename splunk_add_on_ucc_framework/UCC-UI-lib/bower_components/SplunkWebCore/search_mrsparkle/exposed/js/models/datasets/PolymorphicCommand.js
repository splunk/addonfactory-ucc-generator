define(
    [
        'backbone',
        'models/datasets/commands/Base',
        'models/datasets/commands/InitialData',
        'models/datasets/commands/Rename',
        'models/datasets/commands/Sort',
        'models/datasets/commands/Truncate',
        'models/datasets/commands/Join',
        'models/datasets/commands/Replace',
        'models/datasets/commands/Dedup',
        'models/datasets/commands/ExtractDateTime',
        'models/datasets/commands/RemoveFields',
        'models/datasets/commands/Rex',
        'models/datasets/commands/FilterValues',
        'models/datasets/commands/RemoveNonNumericalValues',
        'models/datasets/commands/FillValues',
        'models/datasets/commands/Eval',
        'models/datasets/commands/EvalExistingField',
        'models/datasets/commands/Rangemap',
        'models/datasets/commands/Search',
        'models/datasets/commands/Concatenate',
        'models/datasets/commands/Duplicate',
        'models/datasets/commands/Stats',
        'models/datasets/commands/ChangeCase',
        'models/datasets/commands/FilterRegex',
        'models/datasets/commands/AdvancedRex',
        'models/datasets/commands/Coalesce',
        'models/datasets/commands/Where',
        'models/datasets/commands/Split',
        'models/datasets/commands/CalculateField',
        'models/datasets/commands/Round',
        'models/datasets/commands/Bucket'
    ],
    function(
        Backbone,
        BaseCommand,
        InitialData,
        RenameCommand,
        SortCommand,
        TruncateCommand,
        JoinCommand,
        ReplaceCommand,
        DedupCommand,
        ExtractDateTimeCommand,
        RemoveCommand,
        RexCommand,
        FilterValuesCommand,
        RemoveNonNumericalValuesCommand,
        FillValuesCommand,
        EvalCommand,
        EvalExistingFieldCommand,
        RangemapCommand,
        SearchCommand,
        ConcatenateCommand,
        DuplicateCommand,
        StatsCommand,
        ChangeCaseCommand,
        FilterRegexCommand,
        AdvancedRexCommand,
        CoalesceCommand,
        WhereCommand,
        SplitCommand,
        CalculateFieldCommand,
        RoundCommand,
        BucketCommand
    ) {
        var getModel = function(attributes) {
            var Model;
            if (attributes) {
                if (attributes.type === BaseCommand.INITIAL_DATA) {
                    Model = InitialData;
                } else if (attributes.type === BaseCommand.RENAME) {
                    Model = RenameCommand;
                } else if (attributes.type === BaseCommand.SORT) {
                    Model = SortCommand;
                } else if (attributes.type === BaseCommand.TRUNCATE) {
                    Model = TruncateCommand;
                } else if (attributes.type === BaseCommand.JOIN) {
                    Model = JoinCommand;
                } else if (attributes.type === BaseCommand.REPLACE) {
                    Model = ReplaceCommand;
                } else if (attributes.type === BaseCommand.DEDUP) {
                    Model = DedupCommand;
                } else if (attributes.type === BaseCommand.EXTRACT_DATE_TIME) {
                    Model = ExtractDateTimeCommand;
                } else if (attributes.type === BaseCommand.REMOVE) {
                    Model = RemoveCommand;
                } else if (attributes.type === BaseCommand.REX) {
                    Model = RexCommand;
                } else if (attributes.type === BaseCommand.FILTER_VALUES) {
                    Model = FilterValuesCommand;
                } else if (attributes.type === BaseCommand.REMOVE_NON_NUMERICAL_VALUES) {
                    Model = RemoveNonNumericalValuesCommand;
                } else if (attributes.type === BaseCommand.FILL_VALUES) {
                    Model = FillValuesCommand;
                } else if (attributes.type === BaseCommand.EVAL) {
                    Model = EvalCommand;
                } else if (attributes.type === BaseCommand.EVAL_EXISTING_FIELD) {
                    Model = EvalExistingFieldCommand;
                } else if (attributes.type === BaseCommand.RANGEMAP) {
                    Model = RangemapCommand;
                } else if (attributes.type === BaseCommand.SEARCH) {
                    Model = SearchCommand;
                } else if (attributes.type === BaseCommand.CONCATENATE) {
                    Model = ConcatenateCommand;
                } else if (attributes.type === BaseCommand.DUPLICATE) {
                    Model = DuplicateCommand;
                } else if (attributes.type === BaseCommand.STATS) {
                    Model = StatsCommand;
                } else if (attributes.type === BaseCommand.CHANGE_CASE) {
                    Model = ChangeCaseCommand;
                } else if (attributes.type === BaseCommand.FILTER_REGEX) {
                    Model = FilterRegexCommand;
                } else if (attributes.type === BaseCommand.ADVANCED_REX) {
                    Model = AdvancedRexCommand;
                } else if (attributes.type === BaseCommand.COALESCE) {
                    Model = CoalesceCommand;
                } else if (attributes.type === BaseCommand.WHERE) {
                    Model = WhereCommand;
                } else if (attributes.type === BaseCommand.SPLIT) {
                    Model = SplitCommand;
                } else if (attributes.type === BaseCommand.CALCULATE_FIELD) {
                    Model = CalculateFieldCommand;
                } else if (attributes.type === BaseCommand.ROUND) {
                    Model = RoundCommand;
                } else if (attributes.type === BaseCommand.BUCKET) {
                    Model = BucketCommand;
                }
            }
            return Model;
        };

        var PolymorphicCommand = Backbone.Model.extend({
            
            constructor: function(attributes, options) {
                /* 
                 * 
                 * Commands are going to be created by their type attribute.
                 * This means that type must be immutable because you cannot change the
                 * object type once constructed.
                 *
                 */
                var Model = getModel(attributes);

                if (!Model) {
                    throw new Error("You must define a valid attributes.type for command construction!");
                }
                
                return new Model(attributes, options);
            }
        }, {
            getBlacklist: function(attributes) {
                var Model = getModel(attributes);
                return Model && Model.blacklist || [];
            }
        });

        return PolymorphicCommand;
    }
);

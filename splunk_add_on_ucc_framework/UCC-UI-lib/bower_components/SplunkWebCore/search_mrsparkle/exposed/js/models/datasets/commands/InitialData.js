define(
    [
        'underscore',
        'jquery',
        'models/datasets/commands/Base',
        'models/datasets/Column',
        'collections/Base',
        'splunk.util'
    ],
    function(
        _,
        $,
        BaseCommand,
        Column,
        BaseCollection,
        splunkUtil
    ) {
        var InitialData = BaseCommand.extend({
            _displayName: _('Initial Data').t(),
            _placeholderSPL: 'from',
            isSearchPoint: true,
            
            initialize: function(attributes, options) {
                BaseCommand.prototype.initialize.apply(this, arguments);

                this.setUseAST();
                this.on('change:selectedMethod', this.setUseAST, this);
            },

            defaults: function() {
                return InitialData.getDefaults();
            },
            
            validation: {
                selectedMethod: {
                    required: true
                },
                spl: 'validateSPL'
            },

            setUseAST: function() {
                this._useAST = (this.get('selectedMethod') === InitialData.METHODS.SEARCH);
            },
            
            validateSPL: function(value, attr, options) {
                var selectedMethod = this.get('selectedMethod'),
                    spl = this.get('spl'),
                    selectedDatasetName,
                    selectedDatasetType;
                
                if (selectedMethod === InitialData.METHODS.DATASET) {
                    selectedDatasetName = this.get('selectedDatasetName');
                    selectedDatasetType = this.get('selectedDatasetType');

                    if (!selectedDatasetName || !selectedDatasetType) {
                        return _('Select a dataset.').t();
                    }
                    
                } else if (selectedMethod === InitialData.METHODS.INDEXES_AND_SOURCETYPES) {
                    if (this.editorValues.length === 0) {
                        return _('Select one or more indexes or source types.').t();
                    }
                } else if (selectedMethod === InitialData.METHODS.SEARCH) {
                    if (_.isEmpty(this.get('baseSPL'))) {
                        return _('Provide a search string.').t();
                    } else if (this.ast) {
                        if (this.ast.hasError()) {
                            return _('Search syntax is incorrect: ').t() + this.ast.error.get('messages')[0].text;
                        }
                        if (this.ast.get('ast') && !this.ast.isTableable()) {
                            return _('This search is not valid for the Table Editor.').t();
                        }
                    }
                } else {
                    return _('Initial data method is required.').t();
                }
            },
            
            /**
            * Because of circular dependencies in the PolymorphicDatasetModel we cannot instantiate
            * a PolymorphicDatasetModel in this file. You must create it outside of this file and set it
            * here. This has one huge caveat, any listeners that are setup on the selectedDataset will be broken
            * at this time, and listeners on the selectedDataset cannot be created after this BaseSearchCommand model has been
            * instantiated. Circular dependencies may not be an issue when we move to Webpak. See: SPL-112705
            */
            resetSelectedDataset: function(selectedDataset, options) {
                this.clearSelectedDataset();

                this.associated = this.associated || {};
                this.selectedDataset = selectedDataset.clone();
                this.associated.selectedDataset = this.selectedDataset;

                this.set({
                    selectedDatasetType: this.selectedDataset.getFromType(),
                    selectedDatasetName: this.selectedDataset.getFromName(),
                    selectedDatasetDisplayName: this.selectedDataset.getFormattedName()
                }, options);

                if (this.selectedDataset.commands && this.selectedDataset.commands.length) {
                    // When the selectedDataset has commands then we know that the commands will define columns.
                    // The last command's columns will be migrated into this command.
                    // At the moment, only Tables have dataset.commands.
                    this.columns.reset(this.selectedDataset.commands.at(this.selectedDataset.commands.length - 1).columns.toJSON(), options);
                } else if (this.selectedDataset.isFixedFields() || (this.selectedDataset.getEAIType() === 'inputlookup-table')) {
                    // If the selectedDataset has fixed fields then we should simply use that fixed fields list as the
                    // columns for this command.
                    // TODO: SPL-118609 We don't get the fields back from inputlookup-table files. getTypedFields()
                    // will just return an empty array, which isn't great, but all we can do for now.
                    this.columns.reset(this.selectedDataset.getTypedFields(), options);
                } else {
                    // This shouldn't happen. All frommable datasets (as of now) have fixed fields (or are weird
                    // inputlookup-table files).
                    throw new Error('The from dataset doesn\'t have fixed fields as it should!');
                }
            },

            clearSelectedDataset: function(options) {
                this.set({
                    selectedDatasetName: undefined,
                    selectedDatasetType: undefined
                }, options);

                if (this.selectedDataset) {
                    this.selectedDataset.stopListening();
                    delete this.selectedDataset;
                }
            },
            
            // Override for running the AST when validating the command's SPL
            getASTSearchSPL: function() {
                return splunkUtil.addLeadingSearchCommand(this.generateBaseSearchSPL(), true);
            },

            generateSPL: function(options) {
                options = options || {};
                
                if (!options.skipValidation && !this.isValid(true)) {
                    throw new Error('InitialData must be in a valid state before you can generate SPL.');
                }
                
                var baseSearchSPL = this.generateBaseSearchSPL(),
                    baseFieldsSPL = this.generateBaseFieldsSPL();
                
                if (baseSearchSPL && baseFieldsSPL) {
                    return baseSearchSPL + ' | ' + baseFieldsSPL;
                }
            },

            generateBaseSearchSPL: function(options) {
                var selectedMethod = this.get('selectedMethod'),
                    spl = this.get('baseSPL'),
                    selectedDatasetName,
                    selectedDatasetType,
                    index,
                    sourcetypes;

                if (selectedMethod === InitialData.METHODS.DATASET) {
                    selectedDatasetName = this.get('selectedDatasetName');
                    selectedDatasetType = this.get('selectedDatasetType');

                    if (selectedDatasetName && selectedDatasetType) {
                        spl =  '| from ' + selectedDatasetType + ':"' + selectedDatasetName + '"';
                    }
                } else if (selectedMethod === InitialData.METHODS.INDEXES_AND_SOURCETYPES) {
                    if (this.editorValues.length) {
                        spl = '((';

                        this.editorValues.each(function(indexAndSourcetypesModel, i) {
                            index = indexAndSourcetypesModel.get('index');

                            if (i > 0) {
                                spl += ' OR ((';
                            }

                            if (_.isArray(index)) {
                                _.each(index, function(index, k) {
                                    if (k > 0) {
                                        spl += ' OR ';
                                    }
                                    spl += 'index="' + index + '"';
                                }, this);

                                spl += ') (';
                            } else {
                                spl += 'index="' + index + '") (';
                            }

                            sourcetypes = indexAndSourcetypesModel.get('sourcetypes');
                            _.each(sourcetypes, function(sourcetype, j) {
                                if (j > 0) {
                                    spl += ' OR ';
                                }
                                spl += 'sourcetype="' + sourcetype + '"';
                            }, this);

                            spl += '))';

                        }, this);
                    } else {
                        spl = '';
                    }
                }
                
                return spl && spl.trim().replace(/\s+/g, ' ');
            },

            generateBaseFieldsSPL: function(options) {
                var columnGuids, fieldsStr;
                
                if (this.columns.length) {
                    columnGuids = this.columns.pluck('id');
                    fieldsStr = this.convertGuidsToFields(columnGuids, { doubleQuoteWrap: true }).join(', ');
                    
                    if (fieldsStr) {
                        return 'fields ' + fieldsStr;
                    }
                }
            },

            clearUnchosenAttributes: function() {
                switch (this.get('selectedMethod')) {
                    case InitialData.METHODS.DATASET:
                        this.editorValues.reset();
                        this.unset('baseSPL');
                        break;
                    case InitialData.METHODS.INDEXES_AND_SOURCETYPES:
                        this.clearSelectedDataset();
                        this.unset('baseSPL');
                        break;
                    case InitialData.METHODS.SEARCH:
                        this.clearSelectedDataset();
                        this.editorValues.reset();
                        break;
                }
            }
        }, {
            METHODS: {
                DATASET: 'dataset',
                INDEXES_AND_SOURCETYPES: 'indexes_and_sourcetypes',
                SEARCH: 'search' 
            },
            STATES: {
                EDITING: 'editing',
                CANCELED: 'canceled'
            },
            getDefaults: function(overrides) {
                return _.defaults((overrides || {}), {
                    type: BaseCommand.INITIAL_DATA
                }, BaseCommand.getDefaults());
            }
        });

        return InitialData;
    }
);

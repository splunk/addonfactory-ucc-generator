define(
    [
        'jquery',
        'underscore',
        'models/datasets/Column',
        'util/splunkd_utils',
        'splunk.util',
        'splunk.i18n'
    ],
    function(
        $,
        _,
        ColumnModel,
        splunkDUtils,
        splunkUtil,
        i18n
    ) {
        /**
         * @mixin dataset
         *
         * The purpose of this mixin is to define a standard interface for dataset models.
         * The backend datasets combined endpoint does not provide a consistent response for 
         * all datasets because each one comes from separate, and legacy conf entities.
         * Attributes such as the available fields are going to be vastly different per type
         * of entity. By mixing in, and extending this interface, we can provide a standard
         * on the front end side.
         */
        var dataset = {
            /**
             * @returns The list of field objects from the dataset in the format of:
             * [{ name:<name1>, type:<type>, ... }, ..., { name:<nameN>, type:<type>, ... }]
             * The only required attribute is name.
             * 
             */
            getFields: function() {
                throw new Error('You must define a custom getFields for this dataset type that conforms to the standard!');
            },
            
            /**
             * @returns Ensures that the list of fields has the default type for each field in the format of:
             * [{ name:<name1>, type:<type>, ... }, ..., { name:<nameN>, type:<type>, ... }]
             * The only required attribute is name.
             * 
             */
            getTypedFields: function(options) {
                options = options || {};
                var fields = this.getFields(),
                    typedFields = _.each(fields, function(field) {
                        var type = ColumnModel.TYPES.STRING;
                        
                        if (field.name === '_time') {
                            type = ColumnModel.TYPES._TIME;
                        } else if (field.name === '_raw') {
                            type = ColumnModel.TYPES._RAW;
                        }
                        
                        _.defaults(field, {
                            type: type
                        });
                        
                        return field;
                    });
                
                if (options.withoutUnfixed) {
                    typedFields = _.filter(typedFields, function(typedField) {
                        return typedField.name !== '*';
                    });
                }

                return typedFields;
            },

            /**
             * @returns An object with two keys:
             *     fields: an array of the available field names
             *     containsStar: a boolean, true if the fields list contains the "*" wildcard, false if not
             */
            getFlattenedFieldsObj: function() {
                var flattenedFieldsObj = {
                        containsStar: false,
                        fields: []
                    },
                    fields = this.getFields();

                flattenedFieldsObj.fields = _.map(_.filter(fields, function(field) {
                    if (field.name === '*') {
                        flattenedFieldsObj.containsStar = true;
                        return false;
                    }

                    return true;
                }), function(field) {
                    return field.name;
                });

                return flattenedFieldsObj;
            },
            
            /**
             * @param {Object} options The options hash for the function
             *     options.numFieldsToShow: a number to limit how many fields are returned.
             *                              If any fields are truncated, "and more" is added to the end of the string.
             *                              Defaults to the total number of fields (aka shows all).
             *     options.showTotal: a boolean of whether or not to show the total number of fields in parentheses
             *                        before the entire list.
             *                        Defaults to false.
             * @returns The list of available fields as a single string to be displayed to the user
             *
             */
            getRenderableFieldsList: function(options) {
                var fields = this.getFields(),
                    flattenedFieldsObj = this.getFlattenedFieldsObj(),
                    numFields = flattenedFieldsObj.fields.length,
                    stringifiedFields = '',
                    flattenedFieldsToShow;

                options = options || {};
                _.defaults(options, {
                    numFieldsToShow: numFields,
                    showTotal: false
                });

                flattenedFieldsToShow = flattenedFieldsObj.fields.slice(0, options.numFieldsToShow);

                if (_.isEmpty(fields) || _.isEmpty(flattenedFieldsObj.fields)) {
                    return _('Unknown').t();
                }

                if (options.showTotal) {
                    stringifiedFields += splunkUtil.sprintf(i18n.ungettext('(%d) ', '(%s) ', numFields), numFields);
                }
                stringifiedFields += flattenedFieldsToShow.join(_(', ').t());
                
                if (flattenedFieldsObj.containsStar || flattenedFieldsToShow.length < numFields) {
                    return stringifiedFields + _(' and more').t();
                }
                
                return stringifiedFields;
            },
            
            /**
             * @returns The list of fields in the format for the search page to show the fields as selected
             */
            getSelectedFieldsString: function() {
                var fields = this.getFields(),
                    flattenedFields;
                
                flattenedFields = _.map(_.filter(fields, function(field) {
                    if (field.name === '*') {
                        return false;
                    }
                    
                    // Strip out underscore fields
                    if (field.name.charAt(0) === '_') {
                        return false;
                    }
                    
                    return true;
                }), function(field) { return field.name; });
                
                if (flattenedFields.length) {
                    return JSON.stringify(flattenedFields);
                }
            },
            
            /*
            * @returns if the fields are empty or contain a field named * then the set of fields is not fixed
            */
            isFixedFields: function() {
                var fields = this.getFields(),
                    starField;
                
                starField = _.find(fields, function(field) {
                    return field.name === '*';
                });
                
                if (_.isEmpty(fields) || starField) {
                    return false;
                }
                
                return true;
            },
            
            /*
            * @returns if the dataset can be extended in pivot
            */
            canPivot: function() {
                return this.isFixedFields();
            },
            
            /*
            * @returns if the dataset can be extended in search
            */
            canSearch: function() {
                return true;
            },
            
            /*
            * @returns if the dataset can be extended in the table ui
            */
            canTable: function() {
                return true;
            },

            /*
            * @returns if the dataset has an editable user readable description attribute
            */
            canEditDescription: function() {
                return true;
            },
            
            /*
            * @returns if the dataset has an editable permissions. This is not to be confused with
            * the question if the user has the rights to do so.
            */
            canEditPermissions: function() {
                return true;
            },
            
            /**
            * @returns The server known type of the dataset.
            */
            getEAIType: function() {
                return this.entry.content.get('eai:type');
            },
            
            /**
             * @returns a specific type that has been determined by more than the eai:type attribute when overridden.
             */
            getType: function() {
                return this.getEAIType();
            },
            
            /**
             * @returns the type that the from command expects to run this dataset.
             */
            getFromType: function() {
                return this.getEAIType();
            },
            
            /**
             * @returns the name that the from command expects to run this dataset.
             */
            getFromName: function() {
                return this.entry.get('name');
            },
            
            /**
             * @returns an i18n'd string of the type to the user. The model being mixed into is responsible for this value.
             */
            getDatasetDisplayType: function() {
                throw new Error('You must define a custom getDisplayType!');
            },
            
            /**
             * We may have a special way of rendering the title of datasets that have dot notation for parent relationships.
             * This will allow custom formatting of the name.
             * 
             * @returns the name of the entity.
             * 
             */
            getFormattedName: function() {
                return this.entry.get('name');
            },
            
            /**
             * Data Model Objects and Data Models use description to define their JSON payloads and have no actual description.
             * This allows the model to override the standard accessor for description.
             * 
             * @returns the user entered description of the entity.
             * 
             */
            getDescription: function() {
                return this.entry.content.get('description');
            },

            /**
             * @returns an object containing the necessary k/v pairs to successfully route to the dataset viewing page
             */
            getRoutingData: function() {
                var data = {
                        name: this.entry.get('name'),
                        eaiType: this.getEAIType(),
                        eaiOwner: this.entry.acl.get('owner'),
                        eaiApp: this.entry.acl.get('app')
                    },
                    datasetType = this.entry.content.get('dataset.type');

                if (datasetType) {
                    data.datasetType = datasetType;
                }

                // TODO: It doesn't look like we can import PolymorphicDataset in this file (and maybe we shouldn't).
                // Is this the best way?
                if (this.getType() !== 'datamodel') {
                    data.linksAlternate = this.entry.links.get('alternate');
                }

                return data;
            },
            
            /**
             * Proves that the mixin has been applied to your model.
             * 
             * @returns true for all datasets.
             * 
             */
            isDataset: function() {
                return true;
            },

            /**
             * Returns true if the dataset is a table dataset (the table model overrides this to true).
             *
             * @returns false.
             *
             */
            isTable: function() {
                return false;
            },
            
            /**
             * Because there is no dedicated endpoint for a singular dataset we have to fake this by fetching
             * from the consolidation API with enough information to get only the dataset payload we want.
             * 
             * @returns bbXHR from a fetch to the datasets endpoint
             * 
             */
            fetchAsDataset: function(options) {
                options = options || {};

                if (!options.app && !options.owner) {
                    throw new Error('You must specify an app or owner because the datasets endpoint is not available on services.');
                } 
                
                var url = splunkDUtils.fullpath('datasets', {
                        app: options.app,
                        owner: options.owner
                    }),
                    search = 'name="' + this.entry.get('name') + '" AND eai:type="' + this.getEAIType() +
                        '" AND eai:acl.owner="' + this.entry.acl.get('owner') + '" AND eai:acl.app="' + this.entry.acl.get('app') + '"';
                
                options = $.extend(true, {}, {
                    url: url,
                    data: {
                        search: search
                    }
                }, options);
                
                return this.fetch(options);
            },

            /*
             * @returns a search that uses the from command to load the events, using the type and name as namespaces
             */
            getFromSearch: function() {
                return '| from ' + this.getFromType() + ':"' + this.getFromName() + '"';
            },


            /*
             * @returns true if this is a data summary or transforming dataset
             */
            canLimitEvents: function(isTransforming) {
                return (this.isTable() && !this.isTableMode()) || isTransforming;
            },

            /*
             * @returns an array of pipes to be appended to the search string based on the chosen diversity
             */
            getDiversitySearchComponent: function(options) {
                options = options || {};
                // use the diversity setting to determine the search string
                var diversity = this.entry.content.get('dataset.display.diversity'),
                    pipes = [];


                if (this.canLimitEvents(options.isTransforming)) {
                    // No sampling if we are limiting events
                    return [];
                }

                if (diversity === dataset.DIVERSITY.RANDOM) {
                    // random is going to be based on the sampling ratio of 1:100
                    this.entry.content.set('dataset.display.sample_ratio', '100');
                    pipes.push('head 50');

                // latest is the default
                } else {
                    // no sampling ratio for latest
                    this.entry.content.set('dataset.display.sample_ratio', '1');
                    pipes.push('head 50');
                }

                return pipes;
            },

            getDispatchRatio: function(options) {
                options = options || {};
                if (this.canLimitEvents(options.isTransforming)) {
                    return '1';
                }

                return this.entry.content.get('dataset.display.sample_ratio');
            },

            /*
             * @param {Object} options The options hash for the function
             * @param {string} options.isTranforming If the dataset is transforming or non transforming
             * @returns {Number} a integer value of events to limit on
             */
            getEventLimit: function(options) {
                options = options || {};
                var limit = parseInt((this.entry.content.get('dataset.display.limiting')), 10);
                if (_.isFinite(limit) && this.canLimitEvents(options.isTransforming)) {
                    return limit;
                }
                return 0;
            },

            DIVERSITY: {
                LATEST: 'latest',
                RANDOM: 'random'
            }
        };

        return dataset;
    }
);
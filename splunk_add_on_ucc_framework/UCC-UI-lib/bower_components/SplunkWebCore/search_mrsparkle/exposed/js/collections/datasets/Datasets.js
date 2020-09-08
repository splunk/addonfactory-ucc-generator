define(
    [
        'underscore',
        'collections/services/datasets/Datasets',
        'models/datasets/PolymorphicDataset'
    ],
    function (
        _,
        BaseDatasetsCollection,
        DatasetsPolymorphicDatasetModel
    ) {
        var OPERATION = {
                CLONE: 'clone',
                EXTEND: 'extend'
            },
            DatasetsCollection = BaseDatasetsCollection.extend({
            model: DatasetsPolymorphicDatasetModel,

            initialize: function() {
                BaseDatasetsCollection.prototype.initialize.apply(this, arguments);
            },
            
            sync: function(method, model, options) {
                switch (method) {
                    case 'read' :
                        options = options || {};
                        if (!options.forceSearchData) {
                            options.data = options.data || {};
                            // TODO: this will currently filter out all transforms until (SPL-113898) is fixed.
                            // Also, if even geo/external lookup table and definitions produce results with the from command we should revisit this (SPL-113158).
                            
                            var search = '(' + DatasetsCollection.DATASETS_SEARCH_STRING + ')';
                            if (options.data.search) {
                                search += ' AND (' + options.data.search + ')';
                            }
                            options.data.search = search;
                        }
                        
                        break;
                }
                return BaseDatasetsCollection.prototype.sync.apply(this, arguments);
            },
            
            getFieldPickerItems: function() {
                return this.map(function(dataset) {
                    return {
                        label: dataset.getFormattedName(),
                        value: dataset.id
                    };
                });
            }
        }, {
            DATASETS_SEARCH_STRING: '((eai:type = "inputlookup-table") AND (name != "*.kmz" AND name != "*.kml")) OR ((eai:type = "inputlookup-transform") AND (type != "geo") AND (type != "external")) OR (eai:type = "datamodel")',
            TABLES_ONLY_SEARCH_STRING: 'eai:type = "datamodel" AND dataset.type = "table"',
            OPERATION: OPERATION
        
        });
        
        return DatasetsCollection;
    }
);
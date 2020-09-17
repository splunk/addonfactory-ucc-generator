define(
    [
        'jquery',
        'underscore',
        'models/SplunkDBase'
    ],
    // TODO [JCS] Fill out attributes
    function(
        $,
        _,
        SplunkDBaseModel
    ) {
        var TransformLookup = SplunkDBaseModel.extend({
            url: 'data/transforms/lookups',

            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            
            getFieldsList: function() {
                var fieldsList = this.entry.content.get("fields_array");

                if (_(fieldsList).isArray()) {
                    return fieldsList;
                } else if (fieldsList != "" && !_(fieldsList).isUndefined()) {
                    return fieldsList.split(",");
                } else {
                    return [];
                }
            },
            
            getDatasetDisplayType: function() {
                return TransformLookup.DATASET_DISPLAY_TYPES.LOOKUP_TRANSFORM;
            },
            
            getFromType: function() {
                return TransformLookup.DATASET_FROM_TYPES.INPUTLOOKUP;
            },
            
            getFields: function() {
                var fieldsList = this.getFieldsList();
                
                return _.map(fieldsList, function(field) {
                    return {
                        name: field
                    };
                });
            },
            
            canEditDescription: function() {
                return false;
            },
            
            canClone: function() {
                //TODO: determine how the cloning of lookup definitions does not conform to other EAI endpoints and enable this
                return false;
            }
        }, {
            DATASET_FROM_TYPES: {
                INPUTLOOKUP: 'inputlookup'
            },
            DATASET_DISPLAY_TYPES: {
                LOOKUP_TRANSFORM: _('lookup definition').t()
            }
        });
        
        return TransformLookup;
    }
);

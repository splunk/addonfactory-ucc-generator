define(
    [
        'jquery',
        'underscore',
        'models/SplunkDBase',
        'models/services/datamodel/private/Object'
    ],
    function(
        $,
        _,
        SplunkDBaseModel,
        PrivateDataModelObjectModel
    ) {
        var DataModelObect = SplunkDBaseModel.extend({
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            
            initializeAssociated: function() {
                SplunkDBaseModel.prototype.initializeAssociated.apply(this, arguments);
                
                // do a dynamic lookup of the current constructor so that this method is inheritance-friendly
                var RootClass = this.constructor;
                this.associated = this.associated || {};
                
                this.parsedObject = this.parsedObject || new RootClass.PrivateDataModelObject();
                this.associated.parsedObject = this.parsedObject;
            },
            
            parse: function(response, options) {
                var parsedObject;
                
                this.initializeAssociated();
                
                response = $.extend(true, {}, response);
                
                var response_entry = response.entry[0];
                                
                if (response_entry.content && response_entry.content.description) {
                    parsedObject = this.parsedObject.parse(JSON.parse(response_entry.content.description), options);
                    this.parsedObject.set(parsedObject, options);
                }
                
                response = SplunkDBaseModel.prototype.parse.apply(this, arguments);
                
                return response;
            },
            
            getDatasetDisplayType: function() {
                return DataModelObect.DATASET_DISPLAY_TYPES.DATA_MODEL;
            },
            
            /**
            * Data Model Objects do not have a description attribute that is human readable. If you want
            * to access the JSON description do it directly.
            */
            getDescription: function() {
                return undefined;
            },
            
            getFormattedName: function() {
                return this.entry.content.get('displayName') || this.entry.get('name');
            },
            
            getFromName: function() {
                return this.entry.content.get('from_name');
            },
            
            /**
            * Because these models cannot be sync'd they can also not be cloned.
            */
            canClone: function() {
                return false;
            },
            
            canEditPermissions: function() {
                return false;
            },
            
            canEditDescription: function() {
                return false;
            },
            
            canPivot: function() {
                return true;
            },
            
            canSearch: function() {
                return true;
            },
            
            canTable: function() {
                return true;
            },
            
            getFields: function() {
                var fields = this.parsedObject.getAllSearchFields(),
                    fieldsWithoutHidden = _.where(fields, { hidden: false });
                
                return _.map(fieldsWithoutHidden, function(field) {
                    return {
                        name: field.fieldName,
                        type: field.type
                    };
                });
            },
            
            getTypedFields: function() {
                return this.getFields();
            },
            
            isFixedFields: function() {
                return true;
            }
            
        }, {
            
            PrivateDataModelObject: PrivateDataModelObjectModel,
            DATASET_DISPLAY_TYPES: {
                DATA_MODEL: _('data model').t()
            }
        });
        
        return DataModelObect;
    }
);

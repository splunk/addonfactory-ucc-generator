define([
            'underscore',
            'collections/Base',
            'constants/pivot',
            'models/Base'
        ],
        function(
            _,
            BaseCollection,
            pivotConstants,
            BaseModel
        ) {

    var FieldModel = BaseModel.extend({

        idAttribute: 'fieldName',
        defaults: {
            type: pivotConstants.STRING
        }

    });

    var FieldCollection = BaseCollection.extend({

        model: FieldModel,

        comparator: function(field) {
            // objectCount fields come before the others, followed by childCount,
            // then sort is alphabetical by field display name (case-insensitive)
            var displayNameLower = (field.get('displayName') || '').toLowerCase();
            if(field.type === pivotConstants.OBJECT_COUNT) {
                return 'a' + displayNameLower;
            }
            if(field.type === pivotConstants.CHILD_COUNT) {
                return 'b' + displayNameLower;
            }
            return 'c' + displayNameLower;
        }

    });

    var PivotableDataTable = BaseModel.extend({

        initialize: function() {
            BaseModel.prototype.initialize.apply(this, arguments);
            this.fields = this.associated.fields = new FieldCollection();
        },

        getFieldList: function() {
            return this.fields.invoke('toJSON');
        },

        getGroupedFieldList: function() {
            var groups = _(this.getFieldList()).groupBy(function(field) {
                if(field.type === pivotConstants.TIMESTAMP) {
                    return 'timestamp';
                }
                if(field.type === pivotConstants.OBJECT_COUNT || field.type === pivotConstants.CHILD_COUNT) {
                    return 'objectCount';
                }
                return 'other';
            });
            groups.objectCount = groups.objectCount || [];
            groups.timestamp = groups.timestamp || [];
            groups.other = groups.other || [];
            return groups;
        },

        getIndexTimeField: function() {
            return this.fields.findWhere({ fieldName: '_time', type: pivotConstants.TIMESTAMP });
        },

        hasIndexTimeField: function() {
            return !!this.getIndexTimeField();
        },

        getFieldByName: function(fieldName) {
            var field = this.fields.get(fieldName);
            if (!field) {
                return null;
            }
            return field.toJSON();
        },

        isAccelerated: function() {
            return !!this.get('accelerationNamespace');
        },

        convertToFullyQualifiedName: function(fieldName) {
            return this.getFieldByName(fieldName).fullyQualifiedName;
        },

        getSampleValuesModel: function(fieldName, fetchOptions) {
            throw new Error('Implementation required!');
        },

        hasParentDataModel: function() {
            return false;
        },

        getDataModelName: function() {
            throw new Error('This data table is not associated with a data model.');
        },

        getDataModelId: function() {
            throw new Error('This data table is not associated with a data model.');
        }

    },
    {
        createFromDataModelObject: function(dataModelObject, dataModel) {
            return PivotableTableFromDataModelObject.create(dataModelObject, dataModel);
        },

        createFromDataset: function(dataset, dataSetNameObject) {
            return PivotableTableFromDataset.create(dataset, dataSetNameObject);
        }
    });

    var PivotableTableFromDataModelObject = PivotableDataTable.extend({

        initialize: function(attributes, options) {
            PivotableDataTable.prototype.initialize.apply(this, arguments);
            options = options || {};
            this.dataModelObject = options.dataModelObject;
            if (!this.dataModelObject) {
                throw new Error('dataModelObject is a required option');
            }
            this.dataModel = options.dataModel || null;
        },

        getSampleValuesModel: function(fieldName, fetchOptions) {
            var dataModelObjectField = this.dataModelObject.getFieldByName(fieldName);
            return this.dataModelObject.getSampleValuesModel(
                dataModelObjectField.fieldName,
                dataModelObjectField.owner,
                fetchOptions
            );
        },

        hasParentDataModel: function() {
            if (this.dataModel) {
                return true;
            }
            return PivotableDataTable.prototype.hasParentDataModel.apply(this, arguments);
        },

        getDataModelName: function() {
            if (this.dataModel) {
                return this.dataModel.entry.content.get('displayName');
            }
            return PivotableDataTable.prototype.getDataModelName.apply(this, arguments);
        },

        getDataModelId: function() {
            if (this.dataModel) {
                return this.dataModel.id;
            }
            return PivotableDataTable.prototype.getDataModelId.apply(this, arguments);
        }

    },
    {
        create: function(dataModelObject, dataModel) {
            var dataTable = new PivotableTableFromDataModelObject(
                {
                    accelerationNamespace: dataModelObject.get('tsidxNamespace'),
                    displayName: dataModelObject.get('displayName'),
                    baseSearch: dataModelObject.get('objectSearch'),
                    id: dataModelObject.get('objectName')
                },
                {
                    dataModelObject: dataModelObject,
                    dataModel: dataModel
                }
            );

            var dataTableFields = _(dataModelObject.getReportFields()).map(function(field) {
                var dataTableField = _(field).pick('fieldName', 'displayName', 'type', 'owner');
                dataTableField.fullyQualifiedName = dataModelObject.addLineagePrefix(field.fieldName, field.owner);
                return dataTableField;
            });

            if (dataModel) {
                dataTable.set({ fullyQualifiedId: dataModel.id });
            }

            dataTable.fields.set(dataTableFields);

            return dataTable;
        }
    });

    var PivotableTableFromDataset = PivotableTableFromDataModelObject.extend({}, {

        create: function(dataModelObject, dataSetNameObject) {
            var dataTable = PivotableTableFromDataModelObject.create(dataModelObject);
            dataTable.set({ fullyQualifiedId: dataSetNameObject.fullyQualifiedId, displayName: dataSetNameObject.displayName });

            return dataTable;
        }

    });

    return PivotableDataTable;

});
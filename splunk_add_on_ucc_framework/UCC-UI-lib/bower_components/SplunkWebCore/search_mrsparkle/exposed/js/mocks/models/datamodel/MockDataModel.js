/**
 * @author sfishel
 *
 * A mock for the "models/services/datamodel/DataModel" model
 */

define([
            'underscore',
            'mocks/models/MockSplunkD',
            'mocks/models/datamodel/MockDataModelObject'
        ],
        function(
            _,
            MockModel,
            MockObject
        ) {

    return MockModel.extend({

        idAttribute: 'modelName',

        initialize: function(attrs) {
            MockModel.prototype.initialize.call(this, attrs);
            this.objectByName = _.memoize(this.objectByName);
            this.entry.content.acceleration = new MockModel(); 
            sinon.spy(this, 'objectByName');
        },

        objectByName: function(name) {
            var objAttrs = _(this.get('objects')).find(function(obj) { return (obj.objectName === name ); });
            return new MockObject(objAttrs);
        },

        getObjectCount: function() {
            return this.get('objects').length;
        },

        getFlattenedHierarchy: function() {
            return this.flattenedHierarchy;
        },

        setFlattenedHierarchy: function(hierarchy) {
            this.flattenedHierarchy = hierarchy;
        },

        isTemporary: function() {
            return false;
        }

    });

});

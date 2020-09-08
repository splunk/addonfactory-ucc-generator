define(['mocks/models/MockModel'], function(MockModel) {

    return MockModel.extend({

        // this method is hard-coded to match how it will be used in routers/PivotRouter.js
        getFieldByName: function(name, owner) {
            return ({
                fieldName: name,
                owner: owner || this.get('objectName'),
                displayName: name,
                type: (name === '_time' ? 'timestamp' : 'objectCount')
            });
        },

        // this method is hard-coded to match how it will be used in routers/PivotRouter.js
        getIndexTimeField: function() {
            return ({
                fieldName: '_time',
                owner: this.get('objectName'),
                displayName: '_time',
                type: 'timestamp'
            });
        },

        addLineagePrefix: function(field, owner) {
            return owner + '.' + field;
        },

        getSampleValuesModel: function() {
            var model = new MockModel();
            model.fetch();
            return model;
        }

    });

});

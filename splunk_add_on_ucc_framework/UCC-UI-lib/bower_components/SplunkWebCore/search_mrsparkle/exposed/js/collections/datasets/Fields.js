define(
    [
        'collections/Base',
        'models/datasets/Field',
        'splunk.util'
    ],
    function(
        BaseCollection,
        FieldModel,
        splunkUtils
        ) {
        return BaseCollection.extend({
            model: FieldModel,
            
            initialize: function() {
                BaseCollection.prototype.initialize.apply(this, arguments);
            },
            
            sync: function() {
                throw new Error('sync not allowed for the Fields collection');
            },
            
            fieldListToString: function() {
                return splunkUtils.fieldListToString(this.map(function(field) {
                    return field.get('name'); 
                }));
            }
        });
    }
);

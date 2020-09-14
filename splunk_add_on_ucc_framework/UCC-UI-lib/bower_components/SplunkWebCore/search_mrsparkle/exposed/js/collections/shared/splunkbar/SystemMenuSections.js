define([
    'models/shared/splunkbar/SystemMenuSection',
    'collections/Base'
],
function(
    SystemMenuSectionModel,
    BaseCollection
){
    return BaseCollection.extend({
        model: SystemMenuSectionModel,
        initialize: function() {
            BaseCollection.prototype.initialize.apply(this, arguments);
        },
        comparator: function(a, b){
            var x = a.get('order'),
                y = b.get('order');
            if(x === y){
                return 0;
            }
            return x > y ? 1 : -1;
        }
    });
});
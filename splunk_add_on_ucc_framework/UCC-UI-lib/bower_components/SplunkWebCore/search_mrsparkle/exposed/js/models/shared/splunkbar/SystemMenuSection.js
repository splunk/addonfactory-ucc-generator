define([
    'models/Base'
],
function(
    BaseModel
){
    return BaseModel.extend({
        initialize: function(){
            BaseModel.prototype.initialize.apply(this, arguments);
            
            //TODO lame...
            if( !this.get('items') ){
                this.set({items: []});
            }
        }
    });
});
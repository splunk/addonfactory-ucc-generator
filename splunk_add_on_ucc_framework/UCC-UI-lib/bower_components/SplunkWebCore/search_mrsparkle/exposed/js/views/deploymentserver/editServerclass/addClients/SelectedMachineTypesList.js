define(
	['module', 
         'views/Base', 
         'views/deploymentserver/editServerclass/addClients/SelectedMachineTypeElement'
        ], 
	function(
            module, 
            BaseView, 
            SelectedMachineTypeElement
         ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                this.collection.on('add remove reset', this.render, this); 
            }, 
            render: function() {
                this.$el.html(""); 
                var that = this; 
                this.collection.each(function(model){
                    var newMachineType = new SelectedMachineTypeElement({model: model}); 
                    newMachineType.on('itemRemoved', that.removeMachineType, that); 
                    that.$el.append(newMachineType.render().el);  
                });     
                return this; 
            }, 
            removeMachineType: function(machineTypeModel) {
                this.collection.remove(machineTypeModel); 
            }

     });
});

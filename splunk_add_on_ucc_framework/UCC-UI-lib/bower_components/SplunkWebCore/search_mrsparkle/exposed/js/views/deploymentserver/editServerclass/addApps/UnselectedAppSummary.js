define(
    ['module', 'views/Base', 'util/console', 'underscore'],
          function(module, BaseView, console, _) {
 
         return BaseView.extend({
            moduleId: module.id,
            tagName: 'span',
            className: 'appSummary', 
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);

                 this.collection.on('reset', function() { 
                     this.render(); 
                 }, this); 

                 this.model.on('change', function() { 
                     this.render(); 
                 }, this); 
            }, 
            render: function() {
                this.computeNumUnselectedApps(); 
                var summaryStr = ""; 
                if (!this.numUnselectedApps)
                    summaryStr = _("Unselected Apps").t(); 
                else if (this.numUnselectedApps == 1)
                    summaryStr = _("1 Unselected App").t(); 
                else 
                    summaryStr += this.numUnselectedApps + _(" Unselected Apps").t();        
                 
                this.trigger("appUnselected", this.numUnselectedApps); 
                this.$el.html(summaryStr); 
                return this; 
            },
            computeNumUnselectedApps: function() {
                var numUnselectedApps = 0;
                var that = this; 
                this.collection.each(function(app){ 
                    if (!that.model.get(app.entry.get("name"))) numUnselectedApps++;  
                }); 
                this.numUnselectedApps = numUnselectedApps; 
            } 
        }); 
});







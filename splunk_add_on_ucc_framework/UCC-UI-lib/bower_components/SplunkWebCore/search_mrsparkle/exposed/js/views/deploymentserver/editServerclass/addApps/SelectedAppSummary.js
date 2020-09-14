//
// collection: collection of all deployment server apps
// model: dictionary of (app, isSelected) mappings. 
//
// Iterates through all apps in the collection and counts the number of selected apps
// Triggers an "appSelected" event every time the number of selected apps is recomputed 
// 

define(
    ['module', 'views/Base', 'underscore'],
          function(module, BaseView, _) { 
 
         return BaseView.extend({
            moduleId: module.id,
            tagName: 'span',
            className: 'appSummary', 
            initialize: function() {
                 BaseView.prototype.initialize.apply(this, arguments);
                 this.numSelectedApps = 0; 

                 this.collection.on('reset', function() { 
                     this.render(); 
                 }, this); 

                 this.model.on('change', function() { 
                     this.render(); 
                 }, this); 
            }, 
            render: function() {
                this.computeNumSelectedApps(); 
                var summaryStr = ""; 
                if (!this.numSelectedApps)
                    summaryStr = _("Selected Apps").t(); 
                else if (this.numSelectedApps == 1)
                    summaryStr = _("1 Selected App").t(); 
                else 
                    summaryStr += this.numSelectedApps + _(" Selected Apps").t();        

                this.trigger("appSelected", this.numSelectedApps); 
                 
                this.$el.html(summaryStr); 
                return this; 
            },
            computeNumSelectedApps: function() {
                var numSelectedApps = 0;
                var that = this; 
                this.collection.each(function(app){ 
                    if (that.model.get(app.entry.get("name"))) numSelectedApps++;  
                }); 
                this.numSelectedApps = numSelectedApps; 
            } 
        }); 
});







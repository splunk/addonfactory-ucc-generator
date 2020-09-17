/*
 *  This View extends the Applications view to include a serverclass model.  All search queries are prepended with the serverclass name
 */

define(
    [
        'module', 
        'backbone', 
        'underscore', 
        'views/shared/controls/SyntheticSelectControl',
        'views/deploymentserver/Clients' 
    ], 
    function(
        module, 
        Backbone, 
        _, 
        SyntheticSelectControl, 
        ClientsView
    ) { 
              return  ClientsView.extend({
                    moduleId: module.id,
		    initialize: function() {
                        ClientsView.prototype.initialize.apply(this, arguments); 

                    this.model.app.on('change', function() {
                        
                        this.renderSCFilter(); 
                    }, this);

                    }, 
                    renderSCFilter: function() {
                        // Filter by serverclasses 
                        var items = []; 
                        var serverclasses = this.model.app.entry.content.get('serverclasses'); 
                        for (var i =0; i < serverclasses.length; i++) {
                             var curItem = {'value': serverclasses[i], 'label': _('Server Class: ').t() + serverclasses[i]}; 
                             items.push(curItem); 
                        }
                        items.push( {'value': 'All', 'label': _('Server Class: All').t()}); 

                        this.children.serverclassFilter = new SyntheticSelectControl({
                            menuWidth: "narrow",
                            className: "btn-group pull-left",
                            items: items,  
                            model: this.model.filters, 
                            toggleClassName: 'btn-pill', 
                            modelAttribute: 'sc_filter'
                        });
                        this.model.filters.set('sc_filter', 'All'); 
 
                        //Stitching the serverclasses filter with paginator 
                        this.model.filters.on('change:sc_filter', function(){
                            var data = this.model.paginator.get('data') || {}; 
                            if (this.model.filters.get('sc_filter') == 'All'){
                                delete data.serverclasses; 
                            } else { 
                                data.serverclasses = this.model.filters.get('sc_filter'); 
                            }
                            this.model.paginator.set('data', data);  
                            this.model.paginator.trigger('change:data'); 
                        }, this);
                

                        this.$('.filtersContainer').prepend(this.children.serverclassFilter.render().el); 

                     }
		});
              
});



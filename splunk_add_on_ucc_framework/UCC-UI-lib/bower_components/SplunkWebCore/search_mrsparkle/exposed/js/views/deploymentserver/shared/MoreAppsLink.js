define(
    [
       'jquery',
       'module', 
       'views/Base', 
       'backbone', 
       'views/deploymentserver/shared/CollectionModal', 
       'views/deploymentserver/shared/CollectionModalContent', 
       'underscore'
    ], 
    function(
        $,
        module, 
        BaseView, 
        Backbone,  
        CollectionModal, 
        CollectionModalContent,  
        _ 
    ) { 
              return  BaseView.extend({
                    moduleId: module.id,
                    tagName: 'a',
                    className: 'moreAppsLink', 
		    initialize: function() {
			BaseView.prototype.initialize.apply(this, arguments); 
		    },
                    events: {
                        'click': function() {
                             this.showModal(); 
                             return false; 
                        }
                    }, 
		    render: function() {
			//this.$el.empty(); 
                        //this.delegateEvents(); 
			this.$el.append(_('more apps').t()); 
			return this; 
		    }, 
                    showModal: function() {
                        //Needs a paginator model
                        this.children.modalContent = new CollectionModalContent({
                            model: {
                                paginator: this.model.paginator,  
                                filters: this.model.filters 
                            }, 
                            collection: this.collection
                        });  
                        this.children.modalDialog = new CollectionModal({id: "modal_delete", parent: this});
                        this.children.modalDialog.settings.set("titleLabel",_("Apps").t());
                        var contentHTML = this.children.modalContent.render().el; 
                        this.children.modalDialog.setContent(contentHTML);
                        $("body").append(this.children.modalDialog.render().el);
                        this.children.modalDialog.show();
                     
                    }
		});
              
});








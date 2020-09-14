define(
    ['module',
     'backbone',
     'views/Base',
     'views/deploymentserver/editServerclass/SelectedClientsView',
     'views/deploymentserver/editServerclass/DefaultAddClientsPrompt'
    ],
    function(
        module,
        Backbone,
        BaseView,
        SelectedClientsView,
        DefaultAddClientsView
    ) {

        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.defaultAddClientsView = new DefaultAddClientsView({
                    model: this.model, 
                    configViolations: this.collection.configViolations,  
                    application: this.options.application
                });

                this.children.selectedClientsView = new SelectedClientsView({
                    model: this.model,
                    collection: {
                        clients: this.collection.clients 
                    }, 
                    isReadOnly: this.options.isReadOnly, 
                    application: this.options.application
                });
            },
            render: function() {
		        var html = this.compiledTemplate();
                this.$el.html(html);
                if (this.collection.clients.length > 0) {
                    this.$('#selectedClientsView').html(this.children.selectedClientsView.render().el);
                } else {
                    this.$('#defaultClientsView').html(this.children.defaultAddClientsView.render().el);
                }
                return this;
            },
            template: '\
                <div id="defaultClientsView"></div>\
                <div id="selectedClientsView"></div>\
            '
        });

});



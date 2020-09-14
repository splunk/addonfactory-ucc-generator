define(
    ['module',
     'views/Base',
     'underscore', 
     'backbone',
     'views/deploymentserver/editServerclass/addClients/Filter',
     'views/deploymentserver/editServerclass/addClients/SelectedClientsTab',
     'uri/route',
     'views/deploymentserver/Clients'
    ],
    function(
        module,
        BaseView,
        _, 
        Backbone,
        FilterView,
        SelectedClientsTab,
        route,
        ClientsView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 

                var paginatorModel = new Backbone.Model();
                this.children.clientsView = new ClientsView({
                    model: {
                        filters: new Backbone.Model(),
                        paginator: paginatorModel
                    },
                    collection: this.collection.clients, 
                    application: this.options.application
                });

                    var data = paginatorModel.get('data') || {};
                    data.serverclasses = this.model.entry.get('name');
                    paginatorModel.set('data', data);
                    paginatorModel.trigger('change:data');

            },
            render: function() {
                var html = this.compiledTemplate();
                this.$el.html(html);
                this.$('#client_section').html(this.children.clientsView.render().el);
                return this;
            },
            events: {
                "click #clients_edit_link" : function() {
                     if (this.options.isReadOnly) {
                        //Read-only mode: disable click logic
                        return; 
                     }
                    window.location.href = route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'), 'deploymentserver_add_clients', {data: {id: this.model.id}});
                    return false;
                 }
            },
            template: '\
                <div class="dashboard-header">\
                     <h3 class="dashboard-title"><%-_("Clients").t()%></h3>\
                     <a href="#" class="btn-pill" id="clients_edit_link"><%-_("Edit").t()%></a>\
                </div>\
                <div class="main_edit_section padded-table" id="client_section"></div>\
            '
        });
});




define(
    ['module',
     'backbone',
     'underscore', 
     'views/Base',
     'uri/route',
     'views/deploymentserver/editServerclass/Applications'
    ],
    function(
        module,
        Backbone,
        _, 
        BaseView,
        route,
        AppsView
    ) {

        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 

                var paginatorModel = new Backbone.Model();
            this.children.appsView = new AppsView({
                    model: {
                        serverclass: this.model,
                        filters: new Backbone.Model(),
                        paginator: paginatorModel
                    },
                    collection: {
                        deploymentApps: this.collection.apps,
                        serverClients: this.collection.clients
                    }, 
                    isReadOnly: this.options.isReadOnly, 
                    application: this.options.application
                });

                // When the serverclass model loads, filter the app list by serverclass name
                    var data = paginatorModel.get('data') || {};
                    data.search = 'serverclasses="'+this.model.entry.get('name') + '"';
                    paginatorModel.set('data', data);
                    paginatorModel.trigger('change:data');

            },
            render: function() {
        var html = this.compiledTemplate();
                this.$el.html(html);
                this.$('#app_section').html(this.children.appsView.render().el);
                return this;
            },
            events: {
                "click #apps_edit_link" : function() {
                     if (this.options.isReadOnly) {
                        //Read-only mode: disable click logic
                        return; 
                     }
                    window.location.href = route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'), 'deploymentserver_add_apps', {data: {id: this.model.id}});
                    return false;
                 }
            },
            template: '\
                    <div class="dashboard-header">\
                        <h3 class="dashboard-title"><%-_("Apps").t()%></h3>\
                        <a href="#" id="apps_edit_link" class="btn-pill"><%-_("Edit").t()%></a>\
                    </div>\
                    <div class="padded-table" id="app_section"></div>\
            '
        });

});



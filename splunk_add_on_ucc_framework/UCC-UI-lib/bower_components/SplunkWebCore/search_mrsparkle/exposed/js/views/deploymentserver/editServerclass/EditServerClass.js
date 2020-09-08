define(
    ['module',
     'backbone',
     'underscore', 
     'views/Base',
     'views/deploymentserver/editServerclass/EditAppsSection',
     'views/deploymentserver/editServerclass/EditClientsSection',
     'views/deploymentserver/editServerclass/ServerClassName',
     'views/deploymentserver/editServerclass/ServerClassSummary',
     'views/deploymentserver/editServerclass/EditServerClassesLink',
     'views/deploymentserver/shared/ReadOnlyMessage',
     'views/shared/FlashMessages',
     'uri/route',
     'contrib/text!views/deploymentserver/editServerclass/EditServerClass.html',
     './EditServerClass.pcss',
     '../shared.pcss'
    ],
    function(
        module,
        Backbone,
        _, 
        BaseView,
        EditAppsSection,
        EditClientsSection,
        ServerClassName,
        SummaryView,
        EditLink,
        ReadOnlyMessage,
        FlashMessages,
        route,
        editServerClassTemplate,
        css,
        cssShared) {

        return BaseView.extend({
            moduleId: module.id,
            template: editServerClassTemplate,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 
                this.children.serverClassName = new ServerClassName({model: this.model});
                this.children.summaryView = new SummaryView({model: this.model, collection: this.collection});
                this.children.readOnlyMsg = new ReadOnlyMessage({model: {application: this.options.application}}); 

                this.children.editAppsSection = new EditAppsSection({model: this.model, collection: this.collection, isReadOnly: this.options.isReadOnly, application: this.options.application});
                this.children.editClientsSection = new EditClientsSection({model: this.model, collection: this.collection, isReadOnly: this.options.isReadOnly, application: this.options.application});
                this.children.editLinkView = new EditLink({
                                model: {
                                     serverclass: this.model
                                },
                                collection: {allApps: this.collection.allApps},
                                isReadOnly: this.options.isReadOnly, 
                                application: this.options.application
                 });

                this.children.flashMessagesView = new FlashMessages({model: this.model});
            },
            render: function() {
 
                var docUrl = route.docHelp(
                    this.options.application.get("root"),
                    this.options.application.get("locale"),
                    'manager.deployment.fm.serverclass'
                );

                var html = this.compiledTemplate({
                    _:_, 
                    serverClass: this.model,
                    docUrl: docUrl, 
                    redirect_url: route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'),  'deploymentserver', {'data':{'t':1}})
                });
                this.$el.html(html);

                 if (this.options.isReadOnly) {
                     //Read-only mode 
                     this.$el.addClass('read-only'); 
                 }

                this.$('#serverClassSummary').append(this.children.summaryView.render().el);
                this.$('#serverClassName').append(this.children.serverClassName.render().el);
                this.$('#read-only-msg-container').append(this.children.readOnlyMsg.render().el);
                this.$('#add_apps_prompt').append(this.children.editAppsSection.render().el);
                this.$('#add_clients_prompt').append(this.children.editClientsSection.render().el);
                this.$('.section-header .btn-group').prepend(this.children.editLinkView.render().el);

                this.$(".flash-messages-placeholder").append(this.children.flashMessagesView.render().el);
                return this;
            }
        });
});






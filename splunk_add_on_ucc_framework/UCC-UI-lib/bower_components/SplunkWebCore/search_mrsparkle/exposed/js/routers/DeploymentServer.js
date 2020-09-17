define(
    [
        'underscore',
        'jquery',
        'routers/Base',
        'models/services/server/ServerInfo',
        'util/splunkd_utils', 
        'views/shared/Paywall',
        'views/deploymentserver/DeploymentServer',
        'views/deploymentserver/shared/ErrorMessage',
        'models/services/AppLocal',
        'collections/services/deploymentserver/DeploymentServerClients',
        'collections/services/deploymentserver/DeploymentServerClasses',
        'collections/services/deploymentserver/DeploymentServer',
        'collections/services/deploymentserver/DeploymentApplications',
        'collections/services/deploymentserver/ConfigViolations',
        'models/classicurl',
        'bootstrap.tab'
    ],
    function(
        _,
        $,
        BaseRouter,
        ServerInfo,
        splunkd_utils,
        Paywall,
        DeploymentServerView,
        ErrorMessageView,
        AppLocalModel,
        DeploymentServerClientsCollection,
        DeploymentServerClassesCollection,
        DeploymentServerCollection,
        DeploymentAppsCollection,
        ConfigViolationsCollection,
        classicurlModel,
        bootstrapTab
    ){
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.setPageTitle(_('Forwarder Management').t());
                //Models
                this.appLocalModel = new AppLocalModel();

                this.fetchUser = true;
                this.enableAppBar = false;
            },
            page: function(locale, app, page) {
                BaseRouter.prototype.page.apply(this, arguments);

                //collections
                var serverClientsCollection = new DeploymentServerClientsCollection();
                var clientsWithUnknownStatus = new DeploymentServerClientsCollection();
                var serverClassesCollection = new DeploymentServerClassesCollection();
                var deploymentAppsCollection = new DeploymentAppsCollection();
                var deploymentServerCollection = new DeploymentServerCollection();
                var configViolations = new ConfigViolationsCollection();

                this.deferreds.configViolations = configViolations.fetch();
                this.deferreds.clients = serverClientsCollection.fetch({data:{count: 10, offset: 0}});
                this.deferreds.clientsWithUnknownStatus = clientsWithUnknownStatus.fetch({data:{count: 1, offset: 0, action:'Download'}});
                this.deferreds.serverclasses = serverClassesCollection.fetch({data:{count: 10, offset: 0}});
                this.deferreds.apps = deploymentAppsCollection.fetch({data:{count: 10, offset: 0}});
                this.deferreds.classicurlModel = classicurlModel.fetch();


                this.deferreds.config = deploymentServerCollection.fetch({data:{app:'system', owner:'nobody'},
                   error: function(model, response) {
                        //There was an error loading the UI.  Two possibilities: User has a free license or there is a syntax error in his serverclass.conf
                        if (response.status == 402) {
                            this.payWallView = new Paywall({model:this.model, title: "Forwarder management"});

                            this.deferreds.pageViewRendered.done(function() {
                                this.pageView.$('.main-section-body').append(this.payWallView.render().el);
                            }.bind(this));
                        } else {   // Case 2: User has a syntax error in serverclass.conf
                            this.errorView = new ErrorMessageView();
                            this.deferreds.pageViewRendered.done(function() {
                                this.pageView.$('.main-section-body').append(this.errorView.render().el);
                            }.bind(this));
                        }
                  }.bind(this)
              });

                $.when(
                    this.deferreds.clients,
                    this.deferreds.clientsWithUnknownStatus,
                    this.deferreds.serverclasses,
                    this.deferreds.apps,
                    this.deferreds.config,
                    this.deferreds.pageViewRendered,
                    this.deferreds.classicurlModel,
                    this.deferreds.configViolations
                ).then(function(){
                    this.deploymentServerView = new DeploymentServerView({
                            collection: {
                                serverClients: serverClientsCollection,
                                serverClasses: serverClassesCollection,
                                deploymentApps: deploymentAppsCollection,
                                deploymentServers: deploymentServerCollection,
                                clientsWithUnknownStatus: clientsWithUnknownStatus
                            },
                            model: {classicUrlModel: classicurlModel},
                            isReadOnly: configViolations.length > 0,
                            application: this.model.application
                        });
                        this.pageView.$('.main-section-body').append(this.deploymentServerView.render().el);
                }.bind(this));

                this.deferreds.pageViewRendered.done(function() {
                    $('.preload').replaceWith(this.pageView.el);
                }.bind(this));
            }
        });
    }
);

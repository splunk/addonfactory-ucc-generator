define(
    [
        'underscore',
        'backbone',
        'module',
        'models/search/Dashboard',
        'views/shared/MultiStepModal',
        'views/shared/reportcontrols/dialogs/createreport/Create',
        'views/shared/reportcontrols/dialogs/createreport/Success',
        'views/shared/reportcontrols/dialogs/dashboardpanel/Create',
        'views/shared/reportcontrols/dialogs/dashboardpanel/Success',
        'util/splunkd_utils'
    ],
    function(_, Backbone, module, DashboardModel, MultiStepModal, Create, Success, CreateDashboardPanel, SuccessDashboardPanel, splunkd_utils){
            return MultiStepModal.extend({
                /**
                 * @param {Object} options {
                 *  model:{
                 *      report: <models.services.SavedSearch>,
                 *      application: <models.Application>,
                 *      searchJob: <models.services.search.Job> (optional),
                 *      user: <models.service.admin.user>
                 *  },
                 *  collection:{
                 *      searchBNFs: <collections/services/configs/SearchBNFs> (Optional) Only needed if the showSearchField is true.
                 *      appLocals: <collections/services/localapps> (Optional) Only needed if the showSearchField is true.
                 *  }
                 *  chooseVisualizationType {Boolean} whether to offer the user a choice of visualization type
                 *                                    defaults to true
                 *  preventSidReuse {Boolean} prevent the exiting sid from being used to view the report, default false
                 *  showSearchField {Boolean} whether to display a field to the user for entering the search string.
                 *                                    defaults to false
                 *  showSuccessModal {Boolean} whether to display the success modal after creating a report.
                 *                                    defaults to true
                 *  setDispatchUIArgs {Boolean} whether to set request.ui_dispatch_* values.
                 *                                    defaults to true
                 *
                 */
                moduleId: module.id,
                initialize: function() {
                    MultiStepModal.prototype.initialize.apply(this, arguments);
                    _.defaults(this.options, {setDispatchUIArgs: true});

                    var chooseVisualizationType = this.options.hasOwnProperty('chooseVisualizationType') ?
                            this.options.chooseVisualizationType : true;
                    var showSearchField = this.options.hasOwnProperty('showSearchField') ?
                            this.options.showSearchField : false;
                    var showSuccessModal = this.options.hasOwnProperty('showSuccessModal') ?
                            this.options.showSuccessModal : true;

                    var searchBNFs = (this.collection && this.collection.searchBNFs) ? this.collection.searchBNFs : null,
                        appLocals = (this.collection && this.collection.appLocals) ? this.collection.appLocals : null;

                    this.model.inmem = this.model.report.clone();

                    //cleanup of the report (no matter what the type)
                    this.model.inmem.unset(this.model.inmem.idAttribute);
                    this.model.inmem.stripAlertAttributes();
                    this.model.inmem.entry.content.set({
                        // for backwards compatibility
                        'action.email.useNSSubject': '1',
                        //new reports should not be accelerated
                        'auto_summarize': '0'
                    });

                    if (this.options.setDispatchUIArgs) {
                        this.model.inmem.entry.content.set({
                            'request.ui_dispatch_app': this.model.application.get('app'),
                            'request.ui_dispatch_view': 'search'
                        });
                    }

                    this.model.dashboardToSave = new DashboardModel();
                    this.model.dashboardInmem = new Backbone.Model({
                        dashPerm: "private",
                        panelContent: "table",
                        dashCreateType: "new",
                        panelInline: true
                    });

                    this.children.create = new Create({
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            inmem: this.model.inmem,
                            user: this.model.user
                        },
                        collection: {
                            searchBNFs: searchBNFs,
                            appLocals: appLocals
                        },
                        chooseVisualizationType: chooseVisualizationType,
                        showSearchField: showSearchField
                    });

                    if (showSuccessModal) {
                        this.children.success = new Success({
                            model: {
                                application: this.model.application,
                                inmem: this.model.inmem,
                                searchJob: this.options.preventSidReuse ? undefined : this.model.searchJob,
                                user: this.model.user
                            }
                        });

                        this.children.createDashboardPanel = new CreateDashboardPanel({
                            model: {
                                report: this.model.inmem,
                                application: this.model.application,
                                searchJob: this.model.searchJob,
                                dashboardToSave: this.model.dashboardToSave,
                                inmem: this.model.dashboardInmem,
                                user: this.model.user,
                                serverInfo: this.model.serverInfo
                            },
                            chooseVisualizationType: chooseVisualizationType
                        });

                        if (showSuccessModal) {
                            this.children.successDashboardPanel = new SuccessDashboardPanel({
                                model: {
                                    dashboardToSave: this.model.dashboardToSave,
                                    inmem: this.model.dashboardInmem,
                                    application: this.model.application
                                }
                            });
                        }
                    }

                    if (showSuccessModal) {
                        this.model.inmem.on('createSuccess', function(){
                            this.stepViewStack.setSelectedView(this.children.success);
                            this.children.success.focus();
                        }, this);

                        this.model.dashboardInmem.on('createSuccess', function(){
                            this.stepViewStack.setSelectedView(this.children.successDashboardPanel);
                            this.children.successDashboardPanel.focus();
                        }, this);

                        this.children.success.on('addToDashboardPanel', function(){
                            this.stepViewStack.setSelectedView(this.children.createDashboardPanel);
                        }, this);
                    } else {
                        this.model.inmem.on('createSuccess', function(){
                            this.hide();
                            this.trigger('reportSaved');
                        }, this);
                    }

                    this.on("hidden", function() {
                        if (!this.model.inmem.isNew()) {
                            this.model.report.fetch({url: splunkd_utils.fullpath(this.model.inmem.id)});
                        }
                    }, this);
                },
                getStepViews: function() {
                    var showSuccessModal = this.options.hasOwnProperty('showSuccessModal') ?
                            this.options.showSuccessModal : true;
                    if (showSuccessModal) {
                        return ([
                            this.children.create,
                            this.children.success,
                            this.children.createDashboardPanel,
                            this.children.successDashboardPanel
                        ]);
                    } else {
                        return ([this.children.create]);
                    }
                }
        });
    }
);

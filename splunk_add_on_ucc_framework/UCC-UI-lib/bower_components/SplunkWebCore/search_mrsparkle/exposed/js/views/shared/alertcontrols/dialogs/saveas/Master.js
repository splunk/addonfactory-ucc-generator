define(
    [
        'underscore',
        'backbone',
        'module',
        'models/search/Alert',
        'views/shared/Modal',
        'views/shared/MultiStepModal',
        'views/shared/alertcontrols/dialogs/shared/Save',
        'views/shared/alertcontrols/dialogs/shared/SuccessWithAdditionalSettings',
        'views/shared/alertcontrols/dialogs/shared/CanNotEdit',
        'util/splunkd_utils'
    ],
    function(
        _,
        Backbone,
        module,
        AlertModel,
        ModalView,
        MultiStepModal,
        SaveView,
        SuccessView,
        CanNotEditView,
        splunkd_utils
    ){
    return MultiStepModal.extend({
        /**
         * @param {Object} options {
         *     model: {
         *         report: <models.search.Report>,
         *         reportPristine: <models.search.Report>,
         *         user: <models.services.admin.User>,
         *         application: <models.Application>,
         *         serverInfo: <models.services.server.ServerInfo>
         *     },
         *     collection: {
         *         times: <collections.services.data.ui.Times> (optional, if not passed in it is fetched)
         *         searchBNFs: <collections/services/configs/SearchBNFs> (Optional) Only needed if the showSearchField is true.
         *         appLocals: <collections/services/localapps> (Optional) Only needed if the showSearchField is true.
         *     }
         *     showSearchField: <Boolean> - Should search field be shown to user. Defaults to false
         *     showSuccessModal: <Boolean> - Should success step be shown to user. Defaults to true.
         *     setDispatchUIArgs: <Boolean> - Whether to set the request.ui_dispatch_app and request.ui_dispatch_view. Defaults to true.
         * }
         */
        moduleId: module.id,
        className: ModalView.CLASS_NAME + ' ' + ModalView.CLASS_MODAL_WIDE + ' alert-save-as',
        initialize: function() {
            MultiStepModal.prototype.initialize.apply(this, arguments);
            _.defaults(this.options, {setDispatchUIArgs: true});

            //model
            this.model.inmem = this.model.report.clone();
            
            //for case where times collection is not passed in
            this.collection = this.collection || {};

            var showSearchField = this.options.hasOwnProperty('showSearchField') ?
                    this.options.showSearchField : false;
            var showSuccessModal = this.options.hasOwnProperty('showSuccessModal') ?
                    this.options.showSuccessModal : true;

            if (!this.model.inmem.isNew() && this.model.inmem.isAlert()) {
                //SPL-68947 reset earliest time latest time incase timerange picker was change
                if (this.model.reportPristine && !this.model.reportPristine.isNew()) {
                    this.model.inmem.entry.content.set({
                        'dispatch.earliest_time': this.model.reportPristine.entry.content.get('dispatch.earliest_time'),
                        'dispatch.latest_time': this.model.reportPristine.entry.content.get('dispatch.latest_time')
                    });
                }
            }
            
            this.model.alert = new AlertModel({}, {splunkDPayload: this.model.inmem.toSplunkD({withoutId: true})});
            
            if (this.model.alert.canNotEditInUI()) {
                this.children.canNotEdit = new CanNotEditView({
                    model: {
                        alert: this.model.inmem,
                        application: this.model.application
                    }
                });
            } else {
                if (this.options.setDispatchUIArgs) {
                    this.model.alert.entry.content.set({
                        'request.ui_dispatch_app': this.model.application.get('app'),
                        'request.ui_dispatch_view': this.model.application.get('page')
                    });
                }

                this.children.save = new SaveView({
                    model:  {
                        alert: this.model.alert,
                        application: this.model.application,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        times: this.collection.times,
                        searchBNFs: this.collection.searchBNFs,
                        appLocals: this.collection.appLocals
                    },
                    showSearch: this.options.showSearch,
                    title: this.options.title,
                    showSearchField: showSearchField
                });

                if (showSuccessModal) {
                    this.children.success = new SuccessView({
                        model: {
                            alert: this.model.alert,
                            application: this.model.application,
                            user: this.model.user
                        }
                    });
          
                    this.listenTo(this.model.alert, 'saveSuccess', function() {
                        this.stepViewStack.setSelectedView(this.children.success);
                        this.children.success.focus();
                    });
                } else {
                    this.listenTo(this.model.alert, 'saveSuccess', function() {
                            this.hide();
                            this.trigger('alertSaved');
                    });
                }

                this.on("hidden", function() {
                    if (!this.model.alert.isNew()) {
                        this.model.report.fetch({url: splunkd_utils.fullpath(this.model.alert.id)});
                    }
                }, this);
            }
        },
        getStepViews: function() {
            if (this.model.alert.canNotEditInUI()) {
                return([this.children.canNotEdit]);
            }
            var showSuccessModal = this.options.hasOwnProperty('showSuccessModal') ?
                    this.options.showSuccessModal : true;
            if (showSuccessModal) {
                return ([
                    this.children.save,
                    this.children.success
                ]);
            } else {
                return ([this.children.save]);
            }
        }
    });
});

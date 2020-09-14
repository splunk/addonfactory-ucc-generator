define([
            'underscore',
            'module',
            'models/shared/Application',
            'models/shared/User',
            'models/search/Job',
            'models/pivot/PivotReport',
            'models/pivot/PivotSearch',
            'models/services/datamodel/DataModel',
            'models/datamodel/CreateDataModel',
            'views/extensions/DeclarativeDependencies',
            'views/shared/Modal',
            'views/shared/reportcontrols/dialogs/dashboardpanel/Create',
            './DataModelNameControls',
            'util/pivot/pivot_dialog_utils'
        ],
        function(
            _,
            module,
            Application,
            User,
            Job,
            PivotReport,
            PivotSearch,
            DataModel,
            CreateDataModel,
            DeclarativeDependencies,
            Modal,
            Create,
            DataModelNameControls,
            pivotDialogUtils
        ) {

    var CreateDashboardPanelAndDataModel = Create.extend({

        moduleId: module.id,

        initialize: function() {
            Create.prototype.initialize.apply(this, arguments);
            this.model.inmemDataModel = this.model.dataModel.clone();
            pivotDialogUtils.prepareInmemDataModel(this.model.inmemDataModel);
            this.model.pivotSearch = new PivotSearch();
            this.model.createDataModel = new CreateDataModel();

            this.children.flashMessage.flashMsgHelper.register(this.model.inmemDataModel);
            this.children.flashMessage.flashMsgHelper.register(this.model.pivotSearch);
            this.children.flashMessage.flashMsgHelper.register(this.model.createDataModel);

            this.children.dataModelNameControls = new DataModelNameControls({
                model: {
                    createDataModel: this.model.createDataModel
                }
            });
        },

        submit: function() {
            if(this.model.createDataModel.isValid(true)) {
                if(this.model.dataModel.isTemporary()) {
                    this.model.inmemDataModel.entry.content.set(this.model.createDataModel.pick('modelName', 'displayName'));
                    var dataModelSave = pivotDialogUtils.saveDataModel(
                        this.model.dataModel,
                        this.model.inmemDataModel,
                        this.model.pivotSearch,
                        this.model.report,
                        this.model.application.pick('app', 'owner')
                    );
                    dataModelSave.done(_(function() {
                        this.children.dataModelNameControls.disable();
                        Create.prototype.submit.call(this);
                    }).bind(this));
                }
                else {
                    Create.prototype.submit.call(this);
                }
            }
        },

        render: function() {
            Create.prototype.render.apply(this, arguments);
            var $bodyForm = this.$(Modal.BODY_FORM_SELECTOR);
            $bodyForm.append(_(this.extraFormTemplate).template({}));
            this.children.dataModelNameControls.render().appendTo($bodyForm);
            return this;
        },

        extraFormTemplate: '\
            <hr />\
            <div class="save-data-model-message">\
                <%- _("You must save the original search as a data model. This will power the Dashboard Panel.").t() %>\
            </div>\
        '

    },
    {
        apiDependencies: {
            report: PivotReport,
            application: Application,
            searchJob: Job,
            user: User,
            dataModel: DataModel
        }
    });

    return DeclarativeDependencies(CreateDashboardPanelAndDataModel);

});
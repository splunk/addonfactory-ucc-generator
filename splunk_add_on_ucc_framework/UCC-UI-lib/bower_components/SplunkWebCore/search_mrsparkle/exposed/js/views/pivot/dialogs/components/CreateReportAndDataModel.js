define([
            'underscore',
            'module',
            'models/pivot/PivotSearch',
            'models/datamodel/CreateDataModel',
            'views/shared/reportcontrols/dialogs/createreport/Create',
            'views/shared/Modal',
            './DataModelNameControls',
            'util/pivot/pivot_dialog_utils'
        ],
        function(
            _,
            module,
            PivotSearch,
            CreateDataModel,
            Create,
            Modal,
            DataModelNameControls,
            pivotDialogUtils
        ) {

    return Create.extend({

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
                        this.model.inmem,
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
                <%- _("You must save the original search as a data model. This will power the report.").t() %>\
            </div>\
        '
        
    });
    
});
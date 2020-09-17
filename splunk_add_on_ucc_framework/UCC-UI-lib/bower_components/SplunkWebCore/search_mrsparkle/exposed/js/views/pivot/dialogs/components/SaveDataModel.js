define([
            'underscore',
            'module',
            'models/shared/Application',
            'models/pivot/PivotReport',
            'models/pivot/PivotSearch',
            'models/services/datamodel/DataModel',
            'models/datamodel/CreateDataModel',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'views/shared/Modal',
            'views/shared/FlashMessages',
            './DataModelNameControls',
            'util/pivot/pivot_dialog_utils'
        ],
        function(
            _,
            module,
            Application,
            PivotReport,
            PivotSearch,
            DataModel,
            CreateDataModel,
            DeclarativeDependencies,
            BaseView,
            Modal,
            FlashMessages,
            DataModelNameControls,
            pivotDialogUtils
        ) {

    var SaveDataModel = BaseView.extend({

        moduleId: module.id,

        events: {
            'click .modal-btn-primary': function(e) {
                e.preventDefault();
                this.submit();
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.inmemDataModel = this.model.dataModel.clone();
            pivotDialogUtils.prepareInmemDataModel(this.model.inmemDataModel);
            this.model.pivotSearch = new PivotSearch();
            this.model.createDataModel = new CreateDataModel();

            this.children.flashMessages = new FlashMessages({
                model: {
                    inmemDataModel: this.model.inmemDataModel,
                    pivotSearch: this.model.pivotSearch,
                    createDataModel: this.model.createDataModel
                }
            });

            this.children.dataModelNameControls = new DataModelNameControls({
                model: {
                    createDataModel: this.model.createDataModel
                }
            });
        },

        submit: function() {
            if(this.model.createDataModel.isValid(true)) {
                this.model.inmemDataModel.entry.content.set(this.model.createDataModel.pick('modelName', 'displayName'));
                var dataModelSave = pivotDialogUtils.saveDataModel(
                    this.model.dataModel,
                    this.model.inmemDataModel,
                    this.model.pivotSearch,
                    this.model.report,
                    this.model.application.pick('app', 'owner')
                );
                dataModelSave.done(_(this.trigger).bind(this, 'saveSuccess'));
            }
        },

        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Save Data Model').t());
            var $modalBody = this.$(Modal.BODY_SELECTOR);
            this.children.flashMessages.render().appendTo($modalBody);
            $modalBody.append(Modal.FORM_HORIZONTAL);
            this.children.dataModelNameControls.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
            return this;
        }

    },
    {
        apiDependencies: {
            dataModel: DataModel,
            report: PivotReport,
            application: Application
        }
    });

    return DeclarativeDependencies(SaveDataModel);

});
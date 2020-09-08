define([
            'underscore',
            'module',
            'models/shared/Application',
            'models/services/datamodel/DataModel',
            'views/shared/Modal',
            'views/shared/reportcontrols/dialogs/dashboardpanel/Success',
            'views/extensions/DeclarativeDependencies',
            'uri/route',
            'splunk.util'
        ],
        function(
            _,
            module,
            Application,
            DataModel,
            Modal,
            Success,
            DeclarativeDependencies,
            route,
            splunkUtils
        ) {

    var DashboardPanelAndDataModelSuccess = Success.extend({

        moduleId: module.id,

        initialize: function() {
            Success.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.dataModel, 'change:' + this.model.dataModel.idAttribute, this.render);
        },

        render: function() {
            Success.prototype.render.apply(this, arguments);
            var dataModelDisplayName = this.model.dataModel.entry.content.get('displayName');
            var dataModelEditorUrl = route.data_model_editor(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                this.model.application.get('app'),
                { data: { model: this.model.dataModel.id } }
            );
            this.$(Modal.BODY_SELECTOR).append(_(this.extraBodyTemplate).template({
                dataModelSuccessMessage: splunkUtils.sprintf(
                    'The data model, %s, has also been created.',
                    '<a href="' + dataModelEditorUrl + '">' + dataModelDisplayName + '</a>'
                )
            }));
            return this;
        },

        extraBodyTemplate: '\
            <p class="data-model-success-message">\
                <%= dataModelSuccessMessage %>\
            </p>\
        '

    },
    {
        apiDependencies: {
            application: Application,
            dataModel: DataModel
        }
    });

    return DeclarativeDependencies(DashboardPanelAndDataModelSuccess);

});
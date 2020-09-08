define([
            'underscore',
            'module',
            'models/shared/Application',
            'models/shared/User',
            'models/services/datamodel/DataModel',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'views/shared/Modal',
            'uri/route'
        ],
        function(
            _,
            module,
            Application,
            User,
            DataModel,
            DeclarativeDependencies,
            BaseView,
            Modal,
            route
        ) {

    var DataModelSuccess = BaseView.extend({

        moduleId: module.id,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.dataModel, 'change:' + this.model.dataModel.idAttribute, this.render);
        },

        render: function() {
            var dataModelEditorUrl = _(function(qsArgs) {
                qsArgs = _.extend({ model: this.model.dataModel.id }, qsArgs);
                return route.data_model_editor(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    { data: qsArgs }
                );
            }).bind(this);
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Your Data Model Has Been Saved').t());
            this.$(Modal.BODY_SELECTOR).append(this.compiledTemplate({
                canChangePermissions: this.model.dataModel.canChangePermissions(),
                canAccelerate: this.model.user.canAccelerateDataModel() && this.model.dataModel.canAccelerate(),
                editAccelerationHref: dataModelEditorUrl({ dialog: 'acceleration' }),
                editPermissionsHref: dataModelEditorUrl({ dialog: 'permissions' })
            }));
            this.$(Modal.FOOTER_SELECTOR).append(
                '<a href="#" class="btn pull-left" data-dismiss="modal">' + _('Continue').t() + '</a>'
            );
            this.$(Modal.FOOTER_SELECTOR).append(
                '<a href="' + dataModelEditorUrl() + '" class="btn btn-primary modal-btn-primary">' + _('Edit Data Model').t() + '</a>'
            );
            return this;
        },

        'template': '\
            <p>\
                <%- _("You may now edit your Data Model, or continue with your Pivot.").t() %>\
            </p>\
            <% if(canAccelerate || canChangePermissions) { %>\
                <p>\
                    <%- _("Additional Settings:").t() %>\
                    <ul>\
                        <% if(canAccelerate) { %>\
                            <li><a href="<%- editAccelerationHref %>"><%- _("Acceleration").t() %></a></li>\
                        <% } %>\
                        <% if(canChangePermissions) { %>\
                            <li><a href="<%- editPermissionsHref %>"><%- _("Permissions").t() %></a></li>\
                        <% } %>\
                    <ul>\
                </p>\
            <% } %>\
        '

    },
    {
        apiDependencies: {
            dataModel: DataModel,
            user: User,
            application: Application
        }
    });

    return DeclarativeDependencies(DataModelSuccess);

});
define([
            'underscore',
            'module',
            'views/shared/reportcontrols/dialogs/createreport/Success',
            'views/shared/Modal',
            'uri/route'
        ],
        function(
            _,
            module,
            Success,
            Modal,
            route
        ) {
    
    return Success.extend({
    
        moduleId: module.id,

        initialize: function() {
            Success.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.dataModel, 'change:' + this.model.dataModel.idAttribute, this.render);
        },
    
        render: function() {
            Success.prototype.render.apply(this, arguments);
            var dataModelEditorUrl = _(function(qsArgs) {
                qsArgs = _.extend({ model: this.model.dataModel.id }, qsArgs);
                return route.data_model_editor(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    { data: qsArgs }
                );
            }).bind(this);

            this.$(Modal.BODY_SELECTOR).append(_(this.extraBodyTemplate).template({
                user: this.model.user,
                dataModel: this.model.dataModel,
                editObjectsHref: dataModelEditorUrl(),
                editAccelerationHref: dataModelEditorUrl({ dialog: 'acceleration' }),
                editPermissionsHref: dataModelEditorUrl({ dialog: 'permissions' })
            }));
            return this;
        },

        extraBodyTemplate: '\
            <p class="additional-settings">\
                <%- _("Data Model Settings:").t() %>\
                <ul>\
                    <li><a href="<%- editObjectsHref %>"><%- _("Edit Datasets").t() %></a></li>\
                    <% if(user.canAccelerateDataModel() && dataModel.canAccelerate()) { %>\
                        <li><a href="<%- editAccelerationHref %>"><%- _("Acceleration").t() %></a></li>\
                    <% } %>\
                    <% if(dataModel.canChangePermissions()) { %>\
                        <li><a href="<%- editPermissionsHref %>"><%- _("Permissions").t() %></a></li>\
                    <% } %>\
                <ul>\
            </p>\
        '
        
    });
    
});
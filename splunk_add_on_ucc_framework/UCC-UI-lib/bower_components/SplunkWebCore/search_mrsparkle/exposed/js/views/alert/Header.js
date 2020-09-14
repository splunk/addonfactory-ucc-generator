define([
    'underscore',
    'views/Base',
    'module',
    'views/shared/alertcontrols/details/Master'
    ],
    function(
        _,
        BaseView,
        module,
        DetialsView
    ) {
    return BaseView.extend({
        moduleId: module.id,
        /**
         * @param {Object} options {
         *      model: {
         *         savedAlert: <models.Report>,
         *         application: <models.Application>,
         *         appLocal: <models.services.AppLocal>,
         *         user: <models.services.admin.User>,
         *         serverInfo: <models.services.server.ServerInfo>
         *     },
         *     collection: {
         *         roles: <collections.services.authorization.Roles>,
         *         alertActions: <collections.shared.ModAlertActions>
         *     }
         * }
         */
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.detailsView = new DetialsView({
                model: {
                    savedAlert: this.model.savedAlert,
                    application: this.model.application,
                    appLocal: this.model.appLocal,
                    user: this.model.user,
                    serverInfo: this.model.serverInfo
                },
                collection: {
                    roles: this.collection.roles,
                    alertActions: this.collection.alertActions
                },
                twoColumn: true,
                displayApp: true
            });
            this.activate();
        },
        startListening: function() {
            this.listenTo(this.model.savedAlert.entry, 'change:name', this.render);
            this.listenTo(this.model.savedAlert.entry.content, 'change:description', this.render);
        },
        render: function() {
            this.$el.html(this.compiledTemplate({
                name: this.model.savedAlert.entry.get('name'),
                description: this.model.savedAlert.entry.content.get('description')
            }));
            this.children.detailsView.render().appendTo(this.$el);
            return this;
        },
        template: '\
            <h2 class="section-title"><%- name %></h2>\
            <% if(description) { %>\
                <p class="section-description">\
                    <%- description %>\
                </p>\
            <% } %>\
        '
    });
});

define(
    [
        'module',
        'views/Base',
        'views/shared/datasetcontrols/details/Master'
    ],
    function(
        module,
        BaseView,
        DetailView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'more-info',

            /**
             * @param {Object} options {
             *     model: {
             *         dataset: <models.Dataset>,
             *         application: <models.Application>,
             *         appLocal: <models.services.AppLocal>,
             *         user: <models.service.admin.user>
             *     },
             *     collection: {
             *          roles: <collections.services.authorization.Roles>,
             *          apps: <collections.services.AppLocals>
             *     },
             *     index: <index_of_the_row>,
             *     alternateApp: <alternate_app_to_open>
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((this.options.index % 2) ? 'even' : 'odd').css('display', 'none');
                this.children.details = new DetailView({
                    model: {
                        dataset: this.model.dataset,
                        application: this.model.application,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles,
                        apps: this.collection.apps
                    },
                    alternateApp: this.options.alternateApp
                });
                
            },

            startListening: function() {
                this.listenTo(this.model.dataset.entry.content, 'change:description', this.render);
            },
            
            render: function() {
                this.$el.html(this.compiledTemplate({
                    description: this.model.dataset.getDescription()
                }));

                this.children.details.render().appendTo(this.$('td.details'));
                return this;
            },

            template: '\
                <td class="details" colspan="6">\
                <% if (description) { %>\
                    <p class="description">\
                        <%- description %>\
                    </p>\
                <% } %>\
                </td>\
            '
        });
    }
);

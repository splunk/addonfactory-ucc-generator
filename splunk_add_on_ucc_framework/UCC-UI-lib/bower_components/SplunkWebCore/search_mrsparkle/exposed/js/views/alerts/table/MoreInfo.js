define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/alertcontrols/details/Master'

    ],
    function(
        _,
        module,
        BaseView,
        DetailsView
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'more-info',
            /**
             * @param {Object} options {
             *     model: {
             *         savedAlert: <models.Report>,
             *         application: <models.Application>,
             *         appLocal: <models.services.AppLocal>
             *         user: <models.services.admin.User>
             *     },
             *     collection: {
             *         roles: <collections.services.authorization.Roles>,
             *         alertActions: <collections.shared.ModAlertActions>
             *     },
             *     index: <index_of_the_row>
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.$el.addClass((this.options.index % 2) ? 'event' : 'odd').css('display', 'none');

                this.children.detailsView = new DetailsView({
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
                    }
                });
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.savedAlert.entry.content, 'change:description', this.renderDescription);
            },
            renderDescription: function() {
                var $descriptionElement = this.$('p.description'),
                    descriptionText = this.model.savedAlert.entry.content.get('description');
                if ($descriptionElement.length === 0 && descriptionText) {
                    this.$('td.details').prepend('<p class="description">' + descriptionText + '</p>');
                    return;
                }
                if ($descriptionElement.length !== 0 && !descriptionText) {
                   $descriptionElement.remove();
                   return;
                }
                $descriptionElement.text(descriptionText);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    description: this.model.savedAlert.entry.content.get('description'),
                    cols: 4 + ((this.model.user.canUseApps()) ? 1 : 0)
                }));

                this.children.detailsView.render().appendTo(this.$('td.details'));

                return this;
            },
            template: '\
                <td class="details" colspan="<%= cols %>">\
                <% if(description) { %>\
                    <p class="description">\
                        <%- description %>\
                    </p>\
                <% } %>\
                </td>\
            '
        });
    }
);

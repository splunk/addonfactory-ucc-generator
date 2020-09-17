define(
    [
        'module',
        'views/Base',
        'views/shared/reportcontrols/details/Master',
        'uri/route'
    ],
    function(
        module,
        BaseView,
        DetailView,
        route
    )
    {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'more-info',
            /**
             * @param {Object} options {
             *     model: {
             *         report: <models.Report>,
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
                        report: this.model.report,
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
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.report.entry.content, 'change:description', this.renderDescription);
            },
            renderDescription: function() {
                var $descriptionElement = this.$('p.description'),
                    descriptionText = this.model.report.entry.content.get('description');
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
                    description: this.model.report.entry.content.get('description'),
                    cols: 5 + ((this.model.user.canUseApps()) ? 1 : 0)
                }));
                this.children.details.render().appendTo(this.$('td.details'));
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

define(
    [
        'underscore',
        'jquery',
        'module',
        'models/services/datamodel/DataModel',
        'views/Base',
        'views/shared/datasetcontrols/editmenu/Master',
        'views/shared/datasetcontrols/extendmenu/Master',
        'uri/route',
        'util/splunkd_utils'
    ],
    function(
        _,
        $,
        module,
        DataModel,
        BaseView,
        EditDropDown,
        ExtendMenu,
        route,
        splunkd_utils
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'expand',

            /**
             * @param {Object} options {
             *     model: {
             *          dataset: <models.Report>,
             *          application: <models.Application>,
             *          state: <Backbone.Model>,
             *          appLocal: <models.services.AppLocal>,
             *          user: <models.service.admin.user>
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
                this.$el.addClass((this.options.index % 2) ? 'even' : 'odd');
                
                this.editdropdown = new EditDropDown({
                    model: {
                        application: this.model.application,
                        dataset: this.model.dataset,
                        user: this.model.user,
                        appLocal: this.model.appLocal,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        roles: this.collection.roles
                    },
                    button: false,
                    fetchDelete: true
                });

                this.extendMenu = new ExtendMenu({
                   model: {
                       application: this.model.application,
                       dataset: this.model.dataset,
                       user: this.model.user
                   },
                    collection: {
                        apps: this.collection.apps
                    }
                });
                
            },

            startListening: function() {
                this.listenTo(this.model.dataset, 'updateCollection', function() {
                    this.model.state.trigger('change:search');
                });
                this.listenTo(this.model.dataset.entry.acl, 'change:sharing', this.updateSharing);
            },

            updateSharing: function () {
                var sharing = this.model.dataset.entry.acl.get('sharing');
                var sharingLabel = splunkd_utils.getSharingLabel(sharing);

                this.$('td.sharing').text(sharingLabel);
            },

            render: function() {
                var datasetName = this.model.dataset.getFormattedName(),
                    type = this.model.dataset.getType(),
                    datasetDisplayType = this.model.dataset.getDatasetDisplayType(),
                    appName = this.model.dataset.entry.acl.get('app'),
                    datasetApp = _.find(this.collection.apps.models, function (app) {
                        return app.entry.get('name') === appName;
                    }),
                    app = datasetApp && datasetApp.entry.content.get("visible") ? appName : this.options.alternateApp,
                    datasetLink = route.dataset(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app"),
                        { data: this.model.dataset.getRoutingData() }
                    );

                this.$el.html(this.compiledTemplate({
                    datasetName: datasetName,
                    datasetDisplayType: datasetDisplayType,
                    datasetLink: datasetLink,
                    app: this.model.dataset.entry.acl.get('app'),
                    owner: this.model.dataset.entry.acl.get('owner'),
                    canUseApps: this.model.user.canUseApps()
                }));

                this.updateSharing();

                this.editdropdown.render().prependTo(this.$('.actions-edit'));

                this.extendMenu.render().appendTo(this.$('.actions-edit'));

                return this;
            },

            template: '\
                <td class="expands">\
                    <a href="#"><i class="icon-triangle-right-small"></i></a>\
                </td>\
                <td class="title">\
                    <a href="<%= datasetLink %>" title="<%- datasetName %>" class=""><%- datasetName %></a>\
                </td>\
                <td class="type">\
                    <%- datasetDisplayType %>\
                </td>\
                <td class="actions actions-edit">\
                </td>\
                <td class="owner"><%- owner %></td>\
                <% if (canUseApps) { %>\
                    <td class="app"><%- app %></td>\
                <% } %>\
                <td class="sharing">Global</td>\
            '
        });
    }
);

define([
        'underscore',
        'jquery',
        'module',
        'models/datasets/PolymorphicDataset',
        'models/datasets/TableAST',
        'views/Base',
        'views/shared/documentcontrols/details/App',
        'views/shared/documentcontrols/details/Permissions',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'views/shared/reportcontrols/details/Creator',
        'util/general_utils',
        'splunk.util',
        'uri/route'
    ],
    function(
        _,
        $,
        module,
        PolymorphicDatasetModel,
        TableASTModel,
        BaseView,
        AppView,
        PermissionsView,
        PermissionsDialogView,
        SavedSearchCreatorView,
        generalUtils,
        splunkUtil,
        route
    ) {
        return BaseView.extend({
            moduleId: module.id,
            showLinks: true,

            /**
             * @param {Object} options {
            *       model: {
            *           dataset: <models.Dataset>,
            *           application: <models.Application>,
            *           appLocal: <models.services.AppLocal>,
            *           user: <models.service.admin.user>
            *           serverInfo: <models.services.server.ServerInfo>
            *       },
            *       collection: {
            *          roles: <collections.services.authorization.Roles>,
            *          apps: <collections.services.AppLocals> (Optional for creator view)
            *       },
            *       alternateApp: <alternate_app_to_open>
            * }
            */
            initialize: function(options) {
                var datasetType = this.model.dataset.getType();
            
                BaseView.prototype.initialize.apply(this, arguments);
                
                this.model.tableAST = new TableASTModel();
                this.tableASTFetchDeferred = new $.Deferred();

                if (options.showLinks !== undefined) {
                    this.showLinks = generalUtils.normalizeBoolean(options.showLinks);
                }

                this.children.appView = new AppView({ model: this.model.dataset });

                this.children.permissionsView = new PermissionsView({
                    model: {
                        report: this.model.dataset,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    }
                });
            },
            
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }
                
                var datasetType = this.model.dataset.getType();
                
                if (datasetType === PolymorphicDatasetModel.TABLE) {
                    this.model.tableAST.set({
                        spl: splunkUtil.addLeadingSearchCommand(this.model.dataset.getSearch(), true)
                    });
                    
                    this.tableASTFetchDeferred = this.model.tableAST.fetch();
                } else {
                    this.tableASTFetchDeferred.reject();
                }
                
                return BaseView.prototype.activate.apply(this, arguments);
            },
            
            events: {
                'click a.edit-permissions': function(e) {
                    this.children.permissionsDialog = new PermissionsDialogView({
                        model: {
                            document: this.model.dataset,
                            nameModel: this.model.dataset.entry,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo,
                            application: this.model.application
                        },
                        collection: this.collection.roles,
                        onHiddenRemove: true,
                        nameLabel: this.model.dataset.getDatasetDisplayType()
                    });

                    this.children.permissionsDialog.render().appendTo($("body"));
                    this.children.permissionsDialog.show();
                    e.preventDefault();
                }
            },
            
            render: function() {
                var canWrite = this.model.dataset.canWrite();

                this.el.innerHTML = this.compiledTemplate({
                    _: _,
                    isLite: this.model.serverInfo.isLite(),
                    fields: this.model.dataset.getRenderableFieldsList({
                        numFieldsToShow: this.options.numFieldsToShow,
                        showTotal: this.options.showTotal
                    }),
                    canShowCreator: this.canShowCreator,
                    type: this.model.dataset.getDatasetDisplayType()
                });

                if (this.canShowCreator) {
                    this.children.creatorView.render().appendTo(this.$('dd.creator'));
                }

                this.children.appView.render().appendTo(this.$('dd.app'));
                this.children.permissionsView.render().appendTo(this.$('dd.permissions'));

                if (this.showLinks && canWrite && this.model.dataset.canEditPermissions()) {
                    // Only show if user has perm to change perms
                    if (this.model.dataset.entry.acl.get('can_change_perms')) {
                        this.$('dd.permissions').append(_.template(this.permissionsTemplate));
                    }
                }
                
                $.when(this.tableASTFetchDeferred).then(function() {
                    var datasetPayloads = this.model.tableAST.getFromCommandObjectPayloads(),
                        extendedNames = [],
                        currentModel,
                        datasetLink;
                    
                    if (datasetPayloads && datasetPayloads.length) {
                        this.$('.list-dotted').append(_.template(this.extendsTemplate));
                        
                        // TODO: figure out how to show the type of each dataset that has been extended
                        _.each(datasetPayloads, function(datasetPayload) {
                            if (datasetPayload.eai) {
                                currentModel = new PolymorphicDatasetModel(datasetPayload.eai, { parse: true });
                                datasetLink = route.dataset(
                                    this.model.application.get('root'),
                                    this.model.application.get('locale'),
                                    this.model.application.get('app'),
                                    { data: currentModel.getRoutingData() }
                                );

                                extendedNames.push('<a class="extended-link" href="' + datasetLink + '">' + currentModel.getFormattedName() + '</a>');
                            } else {
                                extendedNames.push(datasetPayload.dataset);
                            }
                            
                        }.bind(this));
                        
                        this.$('.extended-datasets').html(extendedNames.join(' > '));
                    }
                
                }.bind(this));
                
                return this;
            },

            template: '\
                <dl class="list-dotted">\
                    <dt class="type"><%- _("Dataset type").t() %></dt>\
                        <dd class="type"><%- type %></dd>\
                    <% if (!isLite) { %>\
                        <% if (canShowCreator) { %>\
                            <dt class="creator"><%- _("Creator").t() %></dt>\
                                <dd class="creator"></dd>\
                        <% } %>\
                        <dt class="app"><%- _("App").t() %></dt>\
                            <dd class="app"></dd>\
                    <% } %>\
                    <dt class="permissions"><%- _("Permissions").t() %></dt>\
                        <dd class="permissions"></dd>\
                    <dt class="fields"><%- _("Fields").t() %></dt>\
                        <dd class="fields"><%- fields %></dd>\
                </dl>\
            ',
            
            permissionsTemplate: '\
                <a class="edit-permissions" href="#"><%- _("Edit").t() %></a>\
            ',
            
            extendsTemplate: '\
                <dt class="extends"><%- _("Extends").t() %></dt>\
                    <dd class="extended-datasets"></dd>\
            '
        });
    }
);

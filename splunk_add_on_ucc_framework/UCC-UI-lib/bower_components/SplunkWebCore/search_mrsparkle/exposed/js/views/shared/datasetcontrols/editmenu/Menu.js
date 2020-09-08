define(
    [
        'module',
        'jquery',
        'underscore',
        'models/services/datamodel/DataModel',
        'models/services/datasets/PolymorphicDataset',
        'views/shared/PopTart',
        'views/shared/datasetcontrols/editmenu/FetchDeleteDialog',
        'views/shared/documentcontrols/dialogs/TitleDescriptionDialog',
        'views/shared/documentcontrols/dialogs/DeleteDialog',
        'views/shared/documentcontrols/dialogs/permissions_dialog/Master',
        'uri/route'
    ],
    function(
        module,
        $,
        _,
        DataModel,
        PolymorphicDatasetModel,
        PopTartView,
        FetchDeleteDialog,
        TitleDescriptionDialog,
        DeleteDialog,
        PermissionsDialog,
        route
    ) {
        return PopTartView.extend({
            moduleId: module.id,
            className: 'dropdown-menu dropdown-menu-narrow',

            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);

                var defaults = {
                    button: true,
                    deleteRedirect: false,
                    fetchDelete: false
                };

                _.defaults(this.options, defaults);
            },

            events: {
                'click a.edit-description': function(e) {
                    this.hide();
                    this.children.titleDescriptionDialog = new TitleDescriptionDialog({
                        model: {
                            report: this.model.dataset
                        },
                        onHiddenRemove: true
                    });

                    this.children.titleDescriptionDialog.render().appendTo($("body")).show();

                    e.preventDefault();
                },
                
                'click a.delete': function(e) {
                    this.hide();
                    this.children.deleteDialog = new DeleteDialog({
                        model: {
                            dataset: this.model.dataset,
                            application: this.model.application
                        },
                        deleteRedirect: this.options.deleteRedirect,
                        onHiddenRemove: true
                    });

                    this.children.deleteDialog.render().appendTo($("body"));
                    this.children.deleteDialog.show();

                    e.preventDefault();
                },

                'click a.fetch-delete': function(e) {
                    this.hide();
                    this.children.fetchDeleteDialog = new FetchDeleteDialog({
                        model: {
                            dataset: this.model.dataset,
                            application: this.model.application
                        },
                        deleteRedirect: this.options.deleteRedirect,
                        onHiddenRemove: true
                    });

                    this.children.fetchDeleteDialog.render().appendTo($("body"));
                    this.children.fetchDeleteDialog.show();

                    e.preventDefault();
                },
                
                'click a.edit-permissions': function(e) {
                    this.hide();
                    this.children.permissionsDialog = new PermissionsDialog({
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
                var canWrite = this.model.dataset.canWrite(),
                    canClone = this.model.dataset.canClone(),
                    canDelete = this.model.dataset.canDelete(),
                    canTable = this.model.dataset.canTable() && this.model.user.canAccessSplunkDatasetExtensions(),
                    canEditDescription = this.model.dataset.canEditDescription(),
                    canEditPermission = this.model.dataset.canEditPermissions(),
                    type = this.model.dataset.getType(),
                    datasetName = this.model.dataset.getFromName(),
                    fromType = this.model.dataset.getFromType(),
                    canFetchDelete = this.options.fetchDelete && (type !== PolymorphicDatasetModel.DATAMODEL),
                    fromQuery = '| from ' + fromType + ':"' + datasetName + '"',
                    extendTableLink = route.table(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        { data: {
                            bs: fromQuery
                        }
                    }),
                    datasetLink = route.dataset(
                        this.model.application.get("root"),
                        this.model.application.get("locale"),
                        this.model.application.get("app"),
                        { data: this.model.dataset.getRoutingData() }
                    ),
                    editLink,
                    editType;
                
                if (type === DataModel.DOCUMENT_TYPES.TABLE) {
                    if (canTable) {
                        editType = _('Edit Table').t();
                        editLink = route.table(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            this.model.application.get('app'),
                            {
                                data: {
                                    t: this.model.dataset.id
                                }
                            }
                        );
                    }
                    
                } else if (type === PolymorphicDatasetModel.LOOKUP_TRANSFORM) {
                    editType = _('Edit Lookup Definition').t();
                    editLink = route.managerEdit(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        ['data', 'transforms', 'lookups', this.model.dataset.entry.content.get('name')],
                        this.model.dataset.id
                    );
                    
                } else if (type === PolymorphicDatasetModel.LOOKUP_TABLE) {
                    editType = _('Edit Lookup Table Files').t();
                    editLink = route.manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        ['data', 'lookup-table-files']
                    );
                    
                } else if (type === PolymorphicDatasetModel.DATAMODEL) {
                    editType = _('Edit Data Model').t();
                    
                    editLink = route.data_model_editor(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        {
                            data: {
                                model: this.model.dataset.entry.content.get('parent.link')
                            }
                        }
                    );
                }
                
                this.$el.html(PopTartView.prototype.template_menu);
                this.$el.append(this.compiledTemplate({
                    _: _,
                    button: this.options.button,
                    dataset: this.model.dataset,
                    user: this.model.user,
                    editLink: editLink,
                    editType: editType
                }));

                if (canWrite) {
                    if (editLink) {
                        this.$('.edit_actions').append('<li><a class="edit-link" href="' + editLink + '">' + editType + '</a></li>');
                    }
                    if (canEditDescription) {
                        this.$('.edit_actions').append('<li><a class="edit-description" href="#">' + _("Edit Description").t() + '</a></li>');
                    }
                    if (canEditPermission && this.model.dataset.entry.acl.get('can_change_perms')) {
                        this.$('.edit_actions').append('<li><a class="edit-permissions" href="#">' + _("Edit Permissions").t() + '</a></li>');
                    }
                } else {
                    this.$('.edit_actions').remove();
                }

                if (canDelete) {
                    this.$('.other_actions').append('<li><a href="#" class="delete">' + _("Delete").t() + '</a></li>');
                } else if (canFetchDelete) {
                    this.$('.other_actions').append('<li><a href="#" class="fetch-delete">' + _("Delete").t() + '</a></li>');
                }
                
                if (canTable) {
                    this.$('.other_actions').append('<li><a href="' + extendTableLink + '" class="extend">' + _("Extend in Table").t() + '</a></li>');
                }
                
                if (!canFetchDelete && !canDelete && !canTable) {
                    this.$('.other_actions').remove();
                }
                
                return this;
            },

            template: '\
                <ul class="edit_actions">\
                </ul>\
                <ul class="other_actions">\
                </ul>\
            '
        });
    }
);

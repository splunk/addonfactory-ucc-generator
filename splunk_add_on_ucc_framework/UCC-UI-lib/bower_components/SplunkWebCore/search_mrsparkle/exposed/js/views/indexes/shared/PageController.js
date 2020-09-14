/**
 * @author lbudchenko / jszeto
 * @date 2/6/15
 *
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'collections/services/AppLocals',
        'controllers/BaseManagerPageControllerFiltered',
        'collections/indexes/cloud/Archives',

        './DeleteIndexDialog',
        'views/shared/basemanager/EnableDialog',
        'views/shared/basemanager/DisableDialog',
        './AddEditWaitIndexDialog',
        './DeleteWaitIndexDialog',
        './GridRow',
        './NewButtons',
        'views/shared/pcss/basemanager.pcss',
        './PageController.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        AppsCollection,
        BaseController,
        ArchivesCollection,

        DeleteIndexDialog,
        EnableDialog,
        DisableDialog,
        AddEditWaitIndexDialog,
        DeleteWaitIndexDialog,
        GridRow,
        NewButtons,
        cssBaseManager,
        css
    ) {

        var IndexesController = BaseController.extend({
            moduleId: module.id,

            initialize: function(options) {
                this.deferreds = {};

                // Create models and collections
                this.model = this.model || {};
                // The controller model is passed down to all subviews and serves as the event bus for messages between
                // the controller and views.
                this.model.controller = this.model.controller || new Backbone.Model();


                if (this.options.isCloud) {
                    this.model.controller.set('mode', 'cloud');
                } else {
                    this.model.controller.set('mode', 'local');
                }

                if (this.options.isSingleInstanceCloud) {
                    this.model.controller.set('singleInstance', true);
                }
                if (this.options.isCloudLight) {
                    this.model.controller.set('cloudLight', true);
                }

                if (this.options.isCloud) {
                    this.collection.archives = new ArchivesCollection();
                    this.deferreds.archives = this.fetchArchivesCollection();
                }

                var showWaitSaveDialog = this.options.isCloud && !this.options.isSingleInstanceCloud,
                    showWaitDeleteDialog = this.options.isCloud && !this.options.isSingleInstanceCloud,
                    pageDesc = _("A repository for data in Splunk Enterprise. Indexes reside in flat files on the Splunk Enterprise instance known as the indexer.").t();
                if (this.model.serverInfo) {
                    if (this.model.serverInfo.isLite()){
                        pageDesc = _("A repository for data in Splunk Light. Indexes reside in flat files on the Splunk Light instance.").t();
                    }
                    else if (this.model.serverInfo.isCloud()){
                        pageDesc = _("A repository for data in Splunk Cloud. Indexes reside in flat files on the Splunk Cloud instance known as the indexer.").t();
                    }
                }
                this.model.controller.set('showWaitSaveDialog', showWaitSaveDialog);
                this.model.controller.set('showWaitDeleteDialog', showWaitDeleteDialog);

                options.enableNavigationFromUrl = true;
                options.fragments = ['data', 'indexes'];
                options.entitySingular = _('Index').t();
                options.entitiesPlural = _('Indexes').t();
                options.header = {
                    pageTitle: _('Indexes').t(),
                    pageDesc: pageDesc,
                    learnMoreLink: 'manager.indexes.about'
                };
                options.model = this.model;
                options.collection = this.collection;
                options.deferreds = this.deferreds;
                options.entitiesCollectionClass = this.options.indexesCollectionClass;
                options.entityModelClass = this.options.indexModelClass;
                options.entityFetchDataClass = this.options.indexesFetchDataClass;
                options.grid = {
                    showAppFilter: !this.options.showAppFilter,
                    showOwnerFilter: false,
                    showSharingColumn: false
                };
                options.actions = {
                    confirmEnableDisable: true
                };
                options.customViews = {
                    AddEditDialog: this.options.addEditDialogClass,
                    GridRow: GridRow,
                    NewButtons: NewButtons
                };

                BaseController.prototype.initialize.call(this, options);
            },

            fetchArchivesCollection: function() {
                if (this.collection.archives && this.model.user.canViewArchives()) {
                    return this.collection.archives.fetch({
                        data: {
                            count: -1
                        }
                    });
                } else {
                    var theDeferred = $.Deferred();
                    theDeferred.resolve();
                    return theDeferred;
                }
            },

            /* Create/Edit action */
            // editIndex->onEditEntity->showAddEditDialog->onEntitySaved->showWaitSaveIndexDialog->onEditDialogHidden->
            // ->onWaitSaveDialogHidden->navigate
            onEntitySaved: function(index) {
                // Show save waiting dialog if enabled.
                if (this.model.controller.get('showWaitSaveDialog') && this.children.editDialog.options.isNew){
                    this.showWaitSaveIndexDialog(index);
                }
                this.fetchEntitiesCollection();
            },
            showWaitSaveIndexDialog: function(index){
                // Build save waiting dialog. Refresh data when dialog is hidden.
                this.children.waitSaveIndexDialog = new AddEditWaitIndexDialog({ model: index.clone() });
                this.listenTo(this.children.waitSaveIndexDialog, "hidden", this.onWaitSaveDialogHidden);
                this.children.waitSaveIndexDialog.render().appendTo($("body"));
                this.children.waitSaveIndexDialog.show();
            },
            onEditDialogHidden: function() {
                BaseController.prototype.onEditDialogHidden.apply(this, arguments);
                this.stopListening(this.children.editDialog, "entitySaved", this.showWaitSaveIndexDialog);
            },
            onWaitSaveDialogHidden: function() {
                this.fetchEntitiesCollection();
                this.stopListening(this.children.waitSaveIndexDialog, "hidden", this.onWaitSaveDialogHidden);
            },

            /* Delete action */
            /**
             * Respond to the deleteIndex event by displaying a waiting dialog
             * @param indexModel - the model to delete
             */
            onDeleteEntity: function(indexModel) {
                this.children.deleteIndexDialog = new DeleteIndexDialog({
                    model: indexModel.clone(),
                    showSpinner: this.model.controller.get('showWaitDeleteDialog')
                });

                // Show save confirmation dialog if enabled.
                if (this.model.controller.get('showWaitDeleteDialog')){
                    this.listenTo(this.children.deleteIndexDialog, "deleteIndexConfirmed", this.showWaitDeleteIndexDialog);
                }
                else {
                    this.listenTo(this.children.deleteIndexDialog, "deleteIndexConfirmed", this.fetchEntitiesCollection);
                }

                this.listenTo(this.children.deleteIndexDialog, "hidden", this.onDeleteDialogHidden);
                this.children.deleteIndexDialog.render().appendTo($("body"));
                this.children.deleteIndexDialog.show();
            },
            onDeleteDialogHidden: function() {
                // Stop listening to deleteIndexConfirmed and hidden
                this.stopListening(this.children.deleteIndexDialog, "deleteIndexConfirmed", this.fetchEntitiesCollection);
                this.stopListening(this.children.deleteIndexDialog, "deleteIndexConfirmed", this.showWaitDeleteIndexDialog);
                this.stopListening(this.children.deleteIndexDialog, "hidden", this.onDeleteDialogHidden);
                this.children.deleteIndexDialog.remove();
            },
            showWaitDeleteIndexDialog: function(indexModel){
                // Build save waiting dialog. Refresh data when dialog is hidden.
                this.children.waitDeleteIndexDialog = new DeleteWaitIndexDialog({ model: indexModel.clone() });
                this.listenTo(this.children.waitDeleteIndexDialog, "hidden", this.onWaitDeleteDialogHidden);
                this.children.waitDeleteIndexDialog.render().appendTo($("body"));
                this.children.waitDeleteIndexDialog.show();
            },
            onWaitDeleteDialogHidden: function() {
                this.onDeleteDialogHidden();
                this.fetchEntitiesCollection();
                if (this.children.waitDeleteIndexDialog){
                    this.stopListening(this.children.waitDeleteIndexDialog, "hidden", this.onWaitDeleteDialogHidden);
                }
            },

            remove: function() {
                BaseController.prototype.remove.apply(this, arguments);
                this.children.masterView.remove();
            }

        });

        return IndexesController;

    });

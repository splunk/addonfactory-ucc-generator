/**
 * @author jszeto
 * @date 3/18/15
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'collections/services/AppLocals',
        //'collections/services/data/vix/Providers',
        'collections/indexes/cloud/Archives',
        'collections/services/data/vix/Indexes',
        'controllers/Base',
        './AddEditArchiveDialog',
        './DeleteArchiveDialog',
        './DeleteArchiveErrorDialog',
        './ArchivesView',
        'models/classicurl',
        'models/indexes/cloud/Archive',
        //'models/indexes/cloud/ArchiveFetchData'
        'models/shared/EAIFilterFetchData',
        './ArchivesController.pcss'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        AppsCollection,
        ArchivesCollection,
        IndexesCollection,
        BaseController,
        AddEditArchiveDialog,
        DeleteArchiveDialog,
        DeleteArchiveErrorDialog,
        ArchivesView,
        classicUrl,
        Archive,
        ArchiveFetchData,
        css
    ) {

        var ArchivesController = BaseController.extend({
            moduleId: module.id,

            initialize: function(options) {
                BaseController.prototype.initialize.apply(this, arguments);

                // Create models and collections
                this.model = this.model || {};
                // The controller model is passed down to all subviews and serves as the event bus for messages between
                // the controller and views.
                this.model.controller = new Backbone.Model({fetching:false});
                this.listenTo(this.model.controller, "fetchCollection", this.fetchArchivesCollection);
                this.listenTo(this.model.controller, "editArchive", this.onEditArchive);
                this.listenTo(this.model.controller, "deleteArchive", this.onDeleteArchive);
                this.listenTo(this.model.controller, "createArchive", this.onCreateArchive);

                this.archiveCollectionFetchData = new ArchiveFetchData({count:'20', offset:0});
                this.listenTo(this.archiveCollectionFetchData, "change:nameFilter", this.onNameFilterChanged);

                this.collection = this.collection || {};
                this.collection.archives = new ArchivesCollection(null, {fetchData:this.archiveCollectionFetchData});
                this.collection.apps = new AppsCollection();
                this.collection.virtualIndexes = new IndexesCollection();

                this.listenTo(this.collection.archives, "request", this.onArchivesCollectionRequest);
                this.listenTo(this.collection.archives, "sync", this.onArchivesCollectionSync);
                this.listenTo(this.collection.archives, "error", this.onArchivesCollectionSync);

                // Fetch the list of archives
                var archivesDeferred = this.fetchArchivesCollection();

                // Fetch the list of apps
                var appsDeferred = this.collection.apps.fetch({
                    data: {
                        sort_key: 'name',
                        sort_dir: 'desc',
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        search: 'visible=true AND disabled=0',
                        count: -1
                    }
                });

                // Create View after the collections are fetched
                $.when(appsDeferred).then(_(function() {
                    this.children.archivesView = new ArchivesView({
                        model: this.model,
                        collection: this.collection
                    });
                    this.debouncedRender();
                }).bind(this));
            },

            onNameFilterChanged: function(model, value, options) {
                // If our search filter changes, then reset the offset to 0
                model.set("offset", 0);
            },

            // Set the fetching state to true when we make a request
            onArchivesCollectionRequest: function() {
                this.model.controller.set("fetching", true);
            },

            // Set the fetching state to false when we get our response from the server
            onArchivesCollectionSync: function() {
                this.model.controller.set("fetching", false);
            },

            fetchArchivesCollection: function() {
                //this.collection.archives.set(this.collection.archives.generateArchives());
                //
                //var theDeferred = $.Deferred();
                //theDeferred.resolve();
                //
                //return theDeferred;

                // TODO [JCS] Add subsearch for archives with isInternal = false
                return this.collection.archives.fetch();

            },

            showAddEditDialog: function(isNew, archiveModel) {
                var dialogOptions = {};
                dialogOptions.isNew = isNew;
                dialogOptions.model = {
                    application: this.model.application
                };
                if (!isNew) {
                    dialogOptions.model.archiveModel = archiveModel;
                }

                this.children.editArchiveDialog = new AddEditArchiveDialog(dialogOptions);
                this.listenTo(this.children.editArchiveDialog, "archiveSaved", this.onArchiveSaved);
                this.listenTo(this.children.editArchiveDialog, "hidden", this.onSaveDialogHidden);
                this.children.editArchiveDialog.render().appendTo($("body"));
                this.children.editArchiveDialog.show();
            },


            onEditArchive: function(archiveModel) {
                this.showAddEditDialog(false, archiveModel);
            },
            /**
             * Respond to the deleteArchive event by displaying a confirmation dialog
             * @param archiveModel - the model to delete
             */
            onDeleteArchive: function(archiveModel) {
                var archiveName = archiveModel.entry.get("name");
                // Find any virtual indexes that point to the archive we are trying to delete. If we find any, then show an
                // error dialog
                $.when(this.collection.virtualIndexes.fetch({data:{count:0,
                                                            search: "vix.output.buckets.from.indexes vix.provider=" + archiveName,
                                                            sort_key: "vix.output.buckets.from.indexes"
                                                           }})).done(_(function() {
                    if (this.collection.virtualIndexes.length == 0) {
                        this.children.DeleteArchiveDialog = new DeleteArchiveDialog({model: archiveModel});
                    } else {
                        this.children.DeleteArchiveDialog = new DeleteArchiveErrorDialog({model:archiveModel, collection:this.collection.virtualIndexes});
                    }
                    this.listenTo(this.children.DeleteArchiveDialog, "deleteArchiveConfirmed", this.onDeleteArchiveConfirmed);
                    this.listenTo(this.children.DeleteArchiveDialog, "hidden", this.onDeleteDialogHidden);
                    this.children.DeleteArchiveDialog.render().appendTo($("body"));
                    this.children.DeleteArchiveDialog.show();
                }).bind(this));
            },
            onDeleteArchiveConfirmed: function(archiveModel) {
                this.fetchArchivesCollection();
            },
            onDeleteDialogHidden: function() {
                // Stop listening to deleteArchiveConfirmed and hidden
                this.stopListening(this.children.DeleteArchiveDialog, "deleteArchiveConfirmed", this.onDeleteArchiveConfirmed);
                this.stopListening(this.children.DeleteArchiveDialog, "hidden", this.onDeleteDialogHidden);
            },

            onCreateArchive: function() {
                this.showAddEditDialog(true, null);
            },
            onArchiveSaved: function(archiveName) {
                // onSaveDialogHidden will handle removing the archiveSaved listener
                this.fetchArchivesCollection();
            },
            onSaveDialogHidden: function() {
                // TODO [JCS] Clean up the archive dialog to avoid memory leak
                this.stopListening(this.children.editArchiveDialog, "archiveSaved", this.onArchiveSaved);
                this.stopListening(this.children.editArchiveDialog, "hidden", this.onSaveDialogHidden);
            },

            remove: function() {
                BaseController.prototype.remove.apply(this, arguments);
                this.children.archivesView.remove();
            },

            render: function() {
                if (this.children.archivesView) {
                    this.children.archivesView.detach();
                }

                // Attach children and render them
                if (this.children.archivesView) {
                    this.children.archivesView.render().appendTo(this.$el);
                }

                return this;
            }

        });

        return ArchivesController;

    });

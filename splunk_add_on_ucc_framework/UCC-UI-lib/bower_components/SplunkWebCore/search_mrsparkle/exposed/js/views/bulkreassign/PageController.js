/**
 * All Configurations page controller
 * @author nmistry
 * @date 09/08/2016
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'controllers/BaseManagerPageController',
    'collections/services/admin/Directories',
    'models/services/admin/Directory',
    'models/services/admin/DirectoryFetchData',
    './GridRow',
    './CustomFilters',
    './ReassignDialog',
    'splunk.util',
    'views/shared/pcss/basemanager.pcss'
], function(
    $,
    _,
    Backbone,
    module,
    BaseController,
    DirectoriesCollection,
    DirectoryModel,
    DirectoryFetchData,
    GridRow,
    CustomFiltersView,
    ReassignDialog,
    splunk_utils,
    cssShared
) {
    return BaseController.extend({
        moduleId: module.id,

        initialize: function(options) {
            this.collection = this.collection || {};
            this.model = this.model || {};
            this.deferreds = this.deferreds || {};
            this.learnMoreTag = 'learnmore.reassign.object';

            //MODELS
            this.model.controller = new Backbone.Model();
            this.model.metadata = new DirectoryFetchData(this.getFetchData());

            // Collection
            this.collection.entities = new DirectoriesCollection(null, {isLite: this.model.serverInfo.isLite(), fetchData: this.model.metadata});
            this.deferreds.entities = this.collection.entities.fetch();

            // Grid options
            options.hideNewButton = true;
            options.entitiesPlural = _('Knowledge Objects').t();
            options.entitySingular = _('Knowledge Object').t();
            options.header = {
                pageTitle: _('Reassign Knowledge Objects').t(),
                pageDesc: _("Select knowledge objects and reassign them to another user. ").t(),
                learnMoreLink: this.learnMoreTag
            };

            options.model = this.model;
            options.collection = this.collection;
            options.entitiesCollectionClass = DirectoriesCollection;
            options.entityModelClass = DirectoryModel;
            options.entityFetchDataClass = DirectoryFetchData;
            options.customViews = {
                GridRow: GridRow,
                Filters: CustomFiltersView
            };

            options.grid = {
                showOwnerFilter: true,
                appFilterModelAttribute: 'app',
                showSharingColumn: false,
                showStatusColumn: true,
                statusColumnSortKey: 'disabled',
                showAllApps: true
            };

            options.bulkedit = {
                enable: true,
                actions: [
                    {label: _('Reassign').t(), fires: 'reassignSelected'}
                ]
            };

            BaseController.prototype.initialize.call(this, options);

            this.listenTo(this.model.metadata, 'change', this.saveToUrl);
            this.listenTo(this.model.controller, 'bulkReassignOwner', this.onBulkReassignOwner);
            this.listenTo(this.model.controller, 'reassignEntity', this.onReassignSingleEntity);
        },

        saveToUrl: function (model, options) {
            var params = {};
            params.app = model.get('app');
            params.count = model.get('count');
            params.offset = model.get('offset');
            params.sortKey = model.get('sortKey');
            params.sortDir = model.get('sortDir');
            params.orphaned = splunk_utils.normalizeBoolean(model.get('orphaned'));
            params.configType = model.get('configType');
            params.appOnly = splunk_utils.normalizeBoolean(model.get('appOnly'));

            params.owner = model.get('ownerSearch');
            params.search = model.get('nameFilter');

            this.model.classicurl.save(params, {replaceState: true});
        },

        getFetchData: function () {
            var defaults = {
                sort_mode: 'natural',
                sortKey: undefined,
                sortDirection: undefined,
                app: this.model.application.get('app'),
                owner: '-',
                ownerSearch: undefined,
                orphaned: false,
                configType: 'All',
                appOnly: false,
                count: 10,
                offset: 0
            };
            var urlOwner = this.model.classicurl.get('owner');
            var classicurlData = {
                sortKey: this.model.classicurl.get('sortKey'),
                sortDirection: this.model.classicurl.get('sortDir'),
                count: this.model.classicurl.get('count'),
                offset: this.model.classicurl.get('offset'),
                app: this.model.classicurl.get('app'),
                orphaned: splunk_utils.normalizeBoolean(this.model.classicurl.get('orphaned')),
                ownerSearch: urlOwner === '-' ? undefined : urlOwner,
                nameFilter: this.model.classicurl.get('search'),
                configType: this.model.classicurl.get('configType'),
                appOnly: splunk_utils.normalizeBoolean(this.model.classicurl.get('appOnly'))
            };
            return $.extend(true, {}, defaults, classicurlData);
        },

        onReassignSingleEntity: function (entity) {
            var collection = new DirectoriesCollection();
            collection.add(entity);
            this.onReassignSelectedClick('reassignSingleEntity', collection, 'singleEntity');
        },

        onReassignSelectedClick: function (action, collection, mode) {
            mode = mode || 'multipleEntities';
            collection = collection || this.collection.selectedEntities;
            if (this.children.reassignDialog) {
                this.stopListening(this.children.reassignDialog);
            }
            this.children.reassignDialog = new ReassignDialog({
                model: this.model,
                collection: {
                    selectedEntities: collection,
                    users: this.collection.users,
                    usersSearch: this.collection.usersSearch.clone()
                },
                mode: mode,
                learnMoreTag: this.learnMoreTag
            });
            $('body').append(this.children.reassignDialog.render().el);
            this.children.reassignDialog.show();
            this.listenToOnce(this.children.reassignDialog, "resetBulkSelection", _.bind(function () {
                this.resetBulkSelection();
            }, this));
        },

        onBulkReassignOwner: function (newOwner, collection, mode) {
            mode = mode || 'multipleEntities';
            collection.trigger('bulkreassign:start');
            return collection.reassign(newOwner)
                    .done(_.bind(function () {
                        collection.trigger('bulkreassign:complete');
                        if (mode === 'singleEntity') {
                            this.children.reassignDialog.hide();
                            this.children.reassignDialog.remove();
                        }
                    }, this))
                    .fail(_.bind(function() {
                        collection.trigger('bulkreassign:complete');
                    }, this))
                    .always(_.bind(function () {
                        this.fetchEntitiesCollection();
                    }, this));
        }
    });
});

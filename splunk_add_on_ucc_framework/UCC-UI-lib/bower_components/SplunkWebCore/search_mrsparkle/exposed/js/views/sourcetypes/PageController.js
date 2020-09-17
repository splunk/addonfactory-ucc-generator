/**
 * @author lbudchenko
 * @date 5/12/2015
 * Page controller for Sourcetype manager page.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'controllers/BaseManagerPageController',
        'collections/knowledgeobjects/Sourcetypes',
        'models/knowledgeobjects/SourcetypeFetchData',
        'models/knowledgeobjects/Sourcetype',
        './EditDialog',
        './GridRow',
        './Filters',
        'splunk.util',
        'views/shared/pcss/basemanager.pcss',
        './PageController.pcss'

    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseController,
        SourcetypesCollection,
        EAIFilterFetchData,
        SourcetypeModel,
        AddEditDialog,
        GridRow,
        Filters,
        splunkUtils,
        cssShared,
        css
    ) {

        return BaseController.extend({
            moduleId: module.id,

            initialize: function(options) {
                this.collection = this.collection || {};
                this.model = this.model || {};
                this.deferreds = this.deferreds || {};

                //MODELS
                this.model.controller = new Backbone.Model();

                this.model.metadata = new EAIFilterFetchData({
                    sortKey: 'name',
                    sortDirection: 'asc',
                    count: '20',
                    offset: 0,
                    ownerSearch: "*",
                    visible: false,
                    pulldown: 1
                });

                //COLLECTIONS
                //this sourcetype collection is used for the category drop down
                this.collection.sourcetypesCategories = new SourcetypesCollection();
                this.collection.sourcetypesCategories.fetchData.set({count: 1000});
                this.deferreds.sourcetypesCategories = this.collection.sourcetypesCategories.fetch({
                    search: 'pulldown_type=1',
                    app: "-",
                    owner: "-"
                });

                options.entitiesPlural = _('Source Types').t();
                options.entitySingular = _('Source Type').t();
                options.header = {
                    pageDesc: _("Source types are used to assign configurations like timestamp recognition, event breaking, and field extractions to data indexed by Splunk. ").t(),
                    learnMoreLink: 'learnmore.adddata.sourcetypes'
                    };
                options.model = this.model;
                options.collection = this.collection;
                options.deferreds = [this.deferreds.sourcetypesCategories];  // wait on all deferreds
                options.entitiesCollectionClass = SourcetypesCollection;
                options.entityModelClass = SourcetypeModel;
                options.customViews = {
                    AddEditDialog: AddEditDialog,
                    GridRow: GridRow,
                    Filters: Filters
                };
                options.grid = {
                    showOwnerFilter: false,
                    showSharingColumn: false,
                    showStatusColumn: false
                };
                
                BaseController.prototype.initialize.call(this, options);
            },

            entityDeleteConfirmation: function(entityToDelete) {
                return splunkUtils.sprintf(
                    _("Deleting a source type can result in data being indexed incorrectly. Configurations that the source type used, such as field extractions and index-time filtering, will be irretrievably lost.  Once you perform this action, it cannot be undone.<br><br>Are you sure you want to delete source type %s?").t(), '<em>' + _.escape(entityToDelete.entry.get('name')) + '</em>');
            }

        });
    });

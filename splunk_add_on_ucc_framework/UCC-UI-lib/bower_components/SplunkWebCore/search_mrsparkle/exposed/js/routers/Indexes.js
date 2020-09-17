/**
 * @author jszeto
 * @date 2/5/15
 *
 * Router for Index Manager
 *
 *
 */
define([
    'jquery',
    'underscore',
    './IndexesBase',
    'models/services/data/Indexes',
    'collections/services/data/Indexes',
    'models/indexes/shared/IndexFetchData',
    'views/indexes/core/AddEditIndexDialog',
    'views/indexes/shared/PageController',
    'contrib/text!views/indexes/core/GridRow.html'
    ],
    function(
        $,
        _,
        BaseIndexesRouter,
        IndexModel,
        IndexesCollection,
        IndexFetchData,
        AddEditIndexDialog,
        IndexesController,
        IndexesGridRowTemplate
    ){
    return BaseIndexesRouter.extend({
        createController: function(model, collection) {
            return new IndexesController({
                model: model || this.model,
                router: this,
                collection: collection || this.collection,
                archivesCollectionClass: undefined,
                indexModelClass: IndexModel,
                indexesCollectionClass: IndexesCollection,
                indexesFetchDataClass: IndexFetchData,
                addEditDialogClass: AddEditIndexDialog,
                showAppFilter: true,
                showConfirmSaveDialog: false,
                showConfirmDeleteDialog: false,
                templates: {
                    gridRow: IndexesGridRowTemplate
                }
            });
        }
    });
});
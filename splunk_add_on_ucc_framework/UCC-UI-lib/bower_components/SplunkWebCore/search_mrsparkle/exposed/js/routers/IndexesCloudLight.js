/**
 * @author jszeto
 * @date 2/5/15
 *
 * Router for Cloud Index Manager
 *
 *
 */

define(
    [
        'underscore',
        './IndexesBase',
        'models/services/data/Indexes',
        'collections/services/data/Indexes',
        'models/indexes/shared/NoInternalIndexFetchData',
        'views/indexes/cloud/AddEditIndexDialog',
        'views/indexes/shared/PageController',
        'contrib/text!views/indexes/cloud/GridRow.html'
    ],
    function(
        _,
        IndexesRouter,
        IndexModel,
        IndexesCollection,
        IndexFetchData,
        AddEditIndexDialog,
        IndexesController,
        IndexesGridRowTemplate
    ) {
        return IndexesRouter.extend({
            createController: function(model, collection) {
                return new IndexesController({
                    model: model || this.model,
                    router: this,
                    isCloud: true,
                    isCloudLight: true,
                    indexModelClass: IndexModel,
                    collection: collection || this.collection,
                    archivesCollectionClass: undefined,
                    indexesCollectionClass: IndexesCollection,
                    indexesFetchDataClass: IndexFetchData,
                    addEditDialogClass: AddEditIndexDialog,
                    templates: {
                        gridRow: IndexesGridRowTemplate
                    }
                });
            }

        });
    }
);
define(['routers/SavedSearches', 'util/router_utils'], function(SavedSearchesRouter, router_utils) {
    var savedSearchesRouter = new SavedSearchesRouter();
    router_utils.start_backbone_history();
});

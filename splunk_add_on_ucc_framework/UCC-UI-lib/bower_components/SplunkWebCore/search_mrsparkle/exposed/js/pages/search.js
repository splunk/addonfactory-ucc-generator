define(['routers/Search', 'util/router_utils'], function(SearchRouter, router_utils) {
    var searchRouter = new SearchRouter();
    router_utils.start_backbone_history();
});

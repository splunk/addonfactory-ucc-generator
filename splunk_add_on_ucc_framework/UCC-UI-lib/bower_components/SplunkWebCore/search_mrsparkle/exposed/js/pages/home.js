define(['routers/Home', 'util/router_utils'], function(HomeRouter, router_utils) {
    var homeRouter = new HomeRouter();
    router_utils.start_backbone_history();
});

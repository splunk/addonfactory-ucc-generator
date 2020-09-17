define(['routers/Error', 'util/router_utils'], function(ErrorRouter, router_utils) {
    var errorRouter = new ErrorRouter();
    router_utils.start_backbone_history();
});

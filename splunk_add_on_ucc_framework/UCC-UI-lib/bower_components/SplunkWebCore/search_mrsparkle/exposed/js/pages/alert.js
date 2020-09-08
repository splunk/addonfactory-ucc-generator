define(['routers/Alert', 'util/router_utils'], function(AlertRouter, router_utils) {
    var alertRouter = new AlertRouter();
    router_utils.start_backbone_history();
});

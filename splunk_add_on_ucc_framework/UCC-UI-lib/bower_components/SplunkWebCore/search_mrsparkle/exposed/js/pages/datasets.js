define(['routers/Datasets', 'util/router_utils'], function(DatasetsRouter, router_utils) {
    var datasetsRouter = new DatasetsRouter();
    router_utils.start_backbone_history();
});

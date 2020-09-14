define(['routers/Dataset', 'util/router_utils'], function(DatasetRouter, router_utils) {
    var datasetRouter = new DatasetRouter();
    router_utils.start_backbone_history();
});

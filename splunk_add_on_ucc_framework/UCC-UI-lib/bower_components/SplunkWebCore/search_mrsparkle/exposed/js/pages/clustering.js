
define(['jquery', 'routers/Clustering', 'util/router_utils'], function($, ClusteringRouter, router_utils) {
    var clusteringRouter = new ClusteringRouter();
    router_utils.start_backbone_history();
});


define(['jquery', 'routers/ClusteringPush', 'util/router_utils'], function($, ClusteringPushRouter, router_utils) {
    var clusteringPushRouter = new ClusteringPushRouter();
    router_utils.start_backbone_history();
});

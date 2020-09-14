define(['jquery', 'routers/VirtualIndexes', 'util/router_utils'], function($, VixRouter, router_utils) {
    var vixRouter = new VixRouter();
    router_utils.start_backbone_history();
});

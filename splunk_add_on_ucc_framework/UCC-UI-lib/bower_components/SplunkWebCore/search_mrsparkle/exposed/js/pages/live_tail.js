define(['routers/LiveTail', 'util/router_utils'], function(LiveTailRouter, router_utils) {
    var liveTailRouter = new LiveTailRouter();
    router_utils.start_backbone_history();
});

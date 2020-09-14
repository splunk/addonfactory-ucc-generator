define(['routers/VixIndexNew', 'util/router_utils'], function(VixIndexNewRouter, router_utils) {
    var vixIndexNewRouter = new VixIndexNewRouter();
    router_utils.start_backbone_history();
});

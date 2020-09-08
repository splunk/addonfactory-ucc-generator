define(['routers/VixProviderNew', 'util/router_utils'], function(VixProviderNewRouter, router_utils) {
    var vixProviderNewRouter = new VixProviderNewRouter();
    router_utils.start_backbone_history();
});

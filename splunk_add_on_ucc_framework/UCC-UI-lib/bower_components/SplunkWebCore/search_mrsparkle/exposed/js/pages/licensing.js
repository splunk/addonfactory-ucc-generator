define(['routers/Licensing', 'util/router_utils'], function(LicensingRouter, router_utils) {
    var licensingRouter = new LicensingRouter();
    router_utils.start_backbone_history();
});

define(['routers/AppsLocal', 'util/router_utils'], function(AppsLocalRouter, router_utils) {
    var appsLocalRouter = new AppsLocalRouter();
    router_utils.start_backbone_history();
});

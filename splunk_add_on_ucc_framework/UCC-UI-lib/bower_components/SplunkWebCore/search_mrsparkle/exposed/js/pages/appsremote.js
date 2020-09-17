define(['jquery', 'routers/AppsRemote', 'util/router_utils'], function($, AppsRemoteRouter, router_utils) {
    var appsRemoteRouter = new AppsRemoteRouter();
    router_utils.start_backbone_history();
});

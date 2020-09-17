define(['routers/Report', 'util/router_utils'], function(ReportRouter, router_utils) {
    var reportRouter = new ReportRouter();
    router_utils.start_backbone_history();
});

define(['routers/Dashboards', 'util/router_utils'], function(DashboardsRouter, router_utils) {
    var dashboardRouter = new DashboardsRouter();
    router_utils.start_backbone_history();
});

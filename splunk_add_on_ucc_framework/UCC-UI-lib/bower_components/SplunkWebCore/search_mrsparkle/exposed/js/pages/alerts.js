define(['routers/Alerts', 'util/router_utils'], function(AlertsRouter, router_utils) {
    var alertsRouter = new AlertsRouter();
    router_utils.start_backbone_history();
});

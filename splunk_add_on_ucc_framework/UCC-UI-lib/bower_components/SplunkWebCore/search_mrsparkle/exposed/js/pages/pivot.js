define(['routers/PivotRouter', 'util/router_utils', './pivot.pcss'], function(PivotRouter, routerUtils) {
    var pivotRouter = new PivotRouter();
    routerUtils.start_backbone_history();
});

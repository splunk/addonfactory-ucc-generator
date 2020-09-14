define(['backbone', 'routers/DeploymentServerEdit', 'util/router_utils'], function(Backbone, DeploymentServerEditRouter, routerUtils) {
    var deploymentServerEditRouter = new DeploymentServerEditRouter();
    routerUtils.start_backbone_history();
});

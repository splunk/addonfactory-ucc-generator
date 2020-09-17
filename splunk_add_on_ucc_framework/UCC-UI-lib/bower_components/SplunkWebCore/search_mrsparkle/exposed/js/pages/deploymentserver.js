define(['backbone', 'routers/DeploymentServer', 'util/router_utils'], function(Backbone, DeploymentServerRouter, routerUtils) {
    var deploymentServerRouter = new DeploymentServerRouter();
    routerUtils.start_backbone_history();
});

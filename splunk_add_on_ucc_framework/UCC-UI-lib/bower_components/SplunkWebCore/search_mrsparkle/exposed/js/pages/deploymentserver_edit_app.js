define(['backbone', 'routers/DeploymentServerEditApp', 'util/router_utils'], function(Backbone, DeploymentServerEditAppRouter, routerUtils) {
    var deploymentServerEditAppRouter = new DeploymentServerEditAppRouter();
    routerUtils.start_backbone_history();
});


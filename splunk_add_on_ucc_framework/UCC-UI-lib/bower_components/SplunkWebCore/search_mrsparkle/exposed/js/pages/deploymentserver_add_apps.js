define(['backbone', 'routers/DeploymentServerAddApps', 'util/router_utils'], function(Backbone, DeploymentServerAddAppsRouter, routerUtils) {
    var deploymentServerAddAppsRouter = new DeploymentServerAddAppsRouter();
    routerUtils.start_backbone_history();
});


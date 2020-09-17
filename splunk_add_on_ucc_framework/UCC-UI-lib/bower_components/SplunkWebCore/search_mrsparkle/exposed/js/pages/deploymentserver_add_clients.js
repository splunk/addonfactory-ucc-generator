define(['backbone', 'routers/DeploymentServerAddClients', 'util/router_utils'], function(Backbone, DeploymentServerAddClientsRouter, routerUtils) {
    var deploymentServerAddClientsRouter = new DeploymentServerAddClientsRouter();
    routerUtils.start_backbone_history();
});

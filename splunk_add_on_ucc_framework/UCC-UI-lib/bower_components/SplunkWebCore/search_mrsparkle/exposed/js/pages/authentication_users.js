define(['routers/AuthenticationUsers', 'util/router_utils'], function(AuthenticationUsersRouter, routerUtils) {
    var authenticationUsersRouter = new AuthenticationUsersRouter();
    routerUtils.start_backbone_history();
});

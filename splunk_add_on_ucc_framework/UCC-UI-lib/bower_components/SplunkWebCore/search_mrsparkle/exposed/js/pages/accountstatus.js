define(['routers/AccountStatus', 'util/router_utils'], function(AccountStatusRouter, router_utils) {
    var accountStatusRouter = new AccountStatusRouter();
    router_utils.start_backbone_history();
});

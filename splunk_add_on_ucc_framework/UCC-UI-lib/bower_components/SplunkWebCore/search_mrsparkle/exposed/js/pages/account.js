define(['routers/Account', 'util/router_utils'], function(AccountRouter, router_utils) {
    var accountRouter = new AccountRouter();
    router_utils.start_backbone_history({ ignoreFragment:true });
});

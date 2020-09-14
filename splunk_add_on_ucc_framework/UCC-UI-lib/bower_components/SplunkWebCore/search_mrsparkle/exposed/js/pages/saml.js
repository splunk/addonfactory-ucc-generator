define(['routers/SAML', 'util/router_utils'], function(SAMLRouter, router_utils) {
    var samlRouter = new SAMLRouter();
    router_utils.start_backbone_history();
});

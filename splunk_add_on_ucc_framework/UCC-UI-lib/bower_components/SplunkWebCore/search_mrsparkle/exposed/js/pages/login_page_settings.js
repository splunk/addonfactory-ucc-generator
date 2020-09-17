/**
 * @author ahebert
 * @date 5/20/16
 *
 * Creates the login page settings page.
 */
require([
        'routers/LoginPageSettings',
        'util/router_utils'
    ],
    function(
        LoginPageSettingsRouter,
        router_utils
    ){
        var loginPageSettingsRouter = new LoginPageSettingsRouter();
        router_utils.start_backbone_history();
    }
);
require([
    'app/util/webpack',
    'app/util/configManager',
    'app/router/PageRouter',
    'util/router_utils'
], function (
    {generatePublicPath},
    {configManager},
    PageRouter,
    RouterUtils
) {
    const render = () => {
        // No need to check whether appName really exist since configManager already checked it using JSON schema
        const {unifiedConfig: {meta: {name: appName}}} = configManager;
        __webpack_public_path__ = generatePublicPath(appName);
    };

    configManager.init(render);
    // Start the router
    new PageRouter();
    RouterUtils.start_backbone_history();
});

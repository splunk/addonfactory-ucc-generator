require([
    'jquery',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/ConfigurationPage',
    'app/util/webpack',
    'app/util/configManager'
], function (
    $,
    Backbone,
    HeaderView,
    ConfigurationPageView,
    {generatePublicPath},
    {configManager}
) {
    const render = () => {
        // No need to check whether appName really exist since configManager already checked it using JSON schema
        const {unifiedConfig: {meta: {name: appName}}} = configManager;
        __webpack_public_path__ = generatePublicPath(appName);

        new HeaderView({
            id: 'header',
            section: 'dashboards',
            el: $('.preload'),
            acceleratedAppNav: true
        }).render();
        document.title = 'Configuration';
        new ConfigurationPageView().render();
    };

    configManager.init(render);
});

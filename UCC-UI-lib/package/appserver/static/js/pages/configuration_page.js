require([
    'jquery',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/Pages/ConfigurationPage',
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
        const {unifiedConfig} = configManager;
        const appName = unifiedConfig && unifiedConfig.name;

        __webpack_public_path__ = generatePublicPath(appName || 'Splunk_TA_crowdstrike');
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

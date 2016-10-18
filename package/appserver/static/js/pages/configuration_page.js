require([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/ConfigurationPage',
    'app/util/webpack',
    'app/util/script',
    'app/util/configManager'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    ConfigurationPageView,
    {generatePublicPath},
    {loadGlobalConfig},
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
        var configurationPageView = new ConfigurationPageView();
        configurationPageView.render();
        // $(".addonContainer").html(configurationPageView.el);
    }

    if (__CONFIG_FROM_FILE__) {
        configManager.init(require('app/config/globalConfig'));
        render();
    } else {
        loadGlobalConfig(() => {
            configManager.init(window.globalConfig);
            render();
        })
    }

});

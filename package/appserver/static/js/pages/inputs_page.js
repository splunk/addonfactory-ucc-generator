require([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/InputsPage',
    'app/util/webpack',
    'app/util/configManager'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    InputsPageView,
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
        document.title = 'Inputs';
        var inputsPageView = new InputsPageView();
        inputsPageView.render();
        $(".addonContainer").html(inputsPageView.el);
    };

    configManager.init(render);
});

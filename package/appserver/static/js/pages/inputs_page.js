require([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/InputsPage',
    'app/util/webpack',
    'app/util/script'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    InputsPageView,
    {generatePublicPath},
    {loadGlobalConfig}
) {
    let globalConfig;
    const render = () => {
        const appName = globalConfig && globalConfig.name;
        __webpack_public_path__ = generatePublicPath(appName || 'Splunk_TA_crowdstrike');
        new HeaderView({
            id: 'header',
            section: 'dashboards',
            el: $('.preload'),
            acceleratedAppNav: true
        }).render();
        // Set the title
        document.title = 'Inputs';
        var inputsPageView = new InputsPageView();
        inputsPageView.render();
        $(".addonContainer").html(inputsPageView.el);
    }

    if (__CONFIG_FROM_FILE__) {
        globalConfig = require('app/config/globalConfig');
        render();
    } else {
        loadGlobalConfig(() => {
            globalConfig = window.globalConfig;
            render();
        })
    }
});

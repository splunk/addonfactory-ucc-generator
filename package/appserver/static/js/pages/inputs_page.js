require([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/InputsPage',
    'app/util/webpack'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    InputsPageView,
    {generatePublicPath}
) {
    var globalConfig = null;
    if (__CONFIG_FROM_FILE__) {
        globalConfig = require('app/config/GlobalConfig');
    } else {
        globalConfig = window.globalConfig;
    }
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
});

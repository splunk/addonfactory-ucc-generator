require([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/ConfigurationPage',
    'app/util/webpack'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    ConfigurationPageView,
    {generatePublicPath}
) {
    const appName = window.globalConfig && window.globalConfig.name;
    __webpack_public_path__ = generatePublicPath(appName || 'Splunk_TA_crowdstrike');
    new HeaderView({
        id: 'header',
        section: 'dashboards',
        el: $('.preload'),
        acceleratedAppNav: true
    }).render();

    //Set the title
    document.title = 'Configuration';

    new ConfigurationPageView().render();
});

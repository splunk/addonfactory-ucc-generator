/*global require*/
require([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/ConfigurationPage',
    'app/util/Util'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    ConfigurationPageView,
    Util
) {
    Util.injectPublicPath('Splunk_TA_crowdstrike');
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

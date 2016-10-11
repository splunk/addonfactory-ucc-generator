/*global require*/
require([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/ConfigurationPage'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    ConfigurationPageView
) {
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

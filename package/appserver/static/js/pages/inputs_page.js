/*global require,document*/
require([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/InputsPage',
    'app/util/Util'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    InputsPageView,
    Util
) {
    Util.injectPublicPath('Splunk_TA_crowdstrike');
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

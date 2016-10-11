/*global require,document*/
require([
    'jquery',
    'underscore',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/TestPage'
], function (
    $,
    _,
    Backbone,
    HeaderView,
    TestPageView
) {
    // Common header
    new HeaderView({
        id: 'header',
        section: 'dashboards',
        el: $('.preload'),
        acceleratedAppNav: true
    }).render();
    // Set the title
    document.title = 'Test';
    var testPageView = new TestPageView();
    testPageView.render();
    $(".addonContainer").html(testPageView.el);
});

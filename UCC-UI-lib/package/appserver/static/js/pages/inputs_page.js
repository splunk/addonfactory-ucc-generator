require([
    'jquery',
    'backbone',
    'splunkjs/mvc/headerview',
    'app/views/pages/InputsPage',
    'app/util/webpack',
    'app/util/configManager'
], function (
    $,
    Backbone,
    HeaderView,
    InputsPageView,
    {generatePublicPath},
    {configManager}
) {
    const render = () => {
        // No need to check whether appName really exist since configManager already checked it using JSON schema
        const {unifiedConfig: {meta: {name: appName}}} = configManager;
        __webpack_public_path__ = generatePublicPath(appName);

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

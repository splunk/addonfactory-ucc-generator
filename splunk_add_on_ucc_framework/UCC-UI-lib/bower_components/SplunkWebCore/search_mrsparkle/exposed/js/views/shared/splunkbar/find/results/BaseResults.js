define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/Icon',
        'contrib/text!views/shared/splunkbar/find/results/Results.html',
        './BaseResults.pcssm'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        IconView,
        ResultsTemplate,
        css
    ){
        return BaseView.extend({
            moduleId: module.id,
            template: ResultsTemplate,
            css: css,
            addIcons: function ($elements, icon, size) {
                for (var i = 0; i < $elements.length; i++) {
                    this.children['icon' + icon + i] || (this.children['icons'  + icon + i] = new IconView());
                    this.children['icons' + icon + i].set({icon: icon, size: (size || 1)}).prependTo($elements.eq(i));
                }
            },
            getViewingPageRoute: function(modelRoute, app, openInApp, model) {
                return modelRoute(
                    app.get('root'),
                    app.get('locale'),
                    openInApp,
                    {data: {s: model.id }});
            }
        });
    });
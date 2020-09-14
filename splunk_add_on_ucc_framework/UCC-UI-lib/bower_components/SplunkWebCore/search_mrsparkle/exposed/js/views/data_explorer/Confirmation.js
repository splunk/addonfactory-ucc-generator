/**
 * @author jszeto
 * @date 7/7/14
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'contrib/text!views/data_explorer/Confirmation.html',
    'uri/route'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        ConfirmationTemplate,
        route
        ) {

        return BaseView.extend({
            moduleId: module.id,
            template: ConfirmationTemplate,

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
            },
            render: function() {

                // Detach children
                var index = this.model.explorerState.get('selectedVixName'),
                    source = this.model.explorerState.get('selectedSource'),
                    sourcetype = this.model.explorerState.get('selectedSourceType');

                // TODO [JCS] Use replace instead of split/join
                if (source)
                    source = source.split("...").join("*");
                var search_string = 'search index="' + index + '" source="' + source + '"';
                //if the user inserted ellipses to indicate wildcards and wants to search, replace all  "..." with "*" for proper search syntax
                // Use template
                // TODO [JCS] Move routes from html into this class
                this.$el.html(this.compiledTemplate({
                    route: route,
                    root: this.model.application.get('root'),
                    locale: this.model.application.get('locale'),
                    app: this.model.application.get('app'),
                    searchapp: this.model.explorerState.get('appName'),
                    system: 'system',
                    search: search_string
                }));

                // Attach children and render them
                return this;
            }
        });

    });


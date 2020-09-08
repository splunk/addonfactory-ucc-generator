define([
    'jquery',
    'module',
    'views/Base',
    'contrib/text!views/virtual_indexes/NoLicense.html',
    'uri/route'
],
    function(
        $,
        module,
        BaseView,
        Template,
        route
        ) {
        return BaseView.extend({
            moduleId: module.id,
            template: Template,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
            },

            events: {
                'click .primary-button': function(e) {
                    e.preventDefault();
                }
            },
            makeDocLink: function(location) {
                return route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    location
                );
            },
            render: function() {
                var html = this.compiledTemplate({
                    docLink: this.makeDocLink('manager.virtualindex.dashboard'),
                    learnMoreLink: this.makeDocLink('learnmore.virtualindex.overview')
                });
                this.$el.html(html);
            }
        });

    });

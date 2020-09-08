define(
    [
        'underscore',
        'jquery',
        'module',
        'models/Base',
        'views/Base',
        'views/shared/tabcontrols/TabBar',
        'views/shared/tabcontrols/TabBase',
        '../Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseModel,
        BaseView,
        TabBarView,
        TabBaseView,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.tabs = new TabBarView({
                    data: [
                        new TabBaseView({
                            label: 'Selected',
                            selected: true,
                            enabled: true
                        }),
                        new TabBaseView({
                            label: 'Not Selected',
                            selected: false,
                            enabled: true
                        }),
                        new TabBaseView({
                            label: 'Disabled',
                            selected: false,
                            enabled: false
                        })
                    ]
                });
            },

            render: function() {
                this.$el.html(this.template);
                this.tabs.render().appendTo(this.$('.docs-example'));

                return this;
            },

            template: '\
                <div class="section" id="navigation">\
                    <h2>Navigation</h2>\
                    <h3>Tabs</h3>\
                    <div class=docs-example></div>\
                </div>\
            '
        });
    }
);

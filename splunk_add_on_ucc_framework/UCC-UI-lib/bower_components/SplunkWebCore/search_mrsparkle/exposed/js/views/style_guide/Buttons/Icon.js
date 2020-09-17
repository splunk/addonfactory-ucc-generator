define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/Button.js',
        '../Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        ControlGroupView,
        ButtonView,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            events: {
                'click .content a': function(e) {
                    e.preventDefault();
                }
            },
            initialize: function() {
                BaseView.prototype.initialize.apply(this,arguments);
                this.buttons = [
                    new ButtonView({
                        className: 'btn',
                        icon: 'info'
                    }),
                    new ButtonView({
                        className: 'btn',
                        icon: 'bulb'
                    }),
                    new ButtonView({
                        className: 'btn',
                        icon: 'cloud'
                    }),
                    new ButtonView({
                        className: 'btn',
                        icon: 'rotate'
                    })
                ];

            },
            render: function() {
               this.$el.html(this.compiledTemplate());
               var renderedButtons = this.buttons.map(function(button) {
                    return button.render().$el;
               });
               this.$('#group1').append(renderedButtons);
                return this;
            },
            template: '<div class="btn-group" id="group1"></div><div class="btn-group" id="group2"></div>'
        });
    }


);

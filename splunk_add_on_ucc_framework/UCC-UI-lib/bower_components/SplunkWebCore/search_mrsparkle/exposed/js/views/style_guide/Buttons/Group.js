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
                this.buttons1 = [
                    new ButtonView({
                        className: 'btn',
                        label: '1'
                    }),
                    new ButtonView({
                        className: 'btn',
                        label: '2'
                    }),
                    new ButtonView({
                        className: 'btn',
                        label: '3'
                    })
                ];
                this.buttons2 = [
                    new ButtonView({
                        className: 'btn',
                        label: '4'
                    }),
                    new ButtonView({
                        className: 'btn',
                        label: '5'
                    }),
                    new ButtonView({
                        className: 'btn',
                        label: '6'
                    })
                ];

            },
            render: function() {
               this.$el.html(this.compiledTemplate());
               var renderedButtons1 = this.buttons1.map(function(button) {
                    return button.render().$el;
               });
               var renderedButtons2 = this.buttons2.map(function(button) {
                    return button.render().$el;
               });
               this.$('#group1').append(renderedButtons1);
               this.$('#group2').append(renderedButtons2);
                return this;
            },
            template: '<div class="btn-group" id="group1"></div><div class="btn-group" id="group2"></div>'
        });
    }


);

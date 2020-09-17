define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/Button.js',
        '../Master.pcss'
    ],
    function(
        _,
        $,
        module,
        BaseView,
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
                        label : 'btn default'
                    }),
                    new ButtonView({
                        label : 'btn primary',
                        style : 'primary'
                    }),
                    new ButtonView({
                        label : 'btn pill',
                        style : 'pill'
                    }),
                    new ButtonView({
                        label : 'btn default',
                        icon  : 'print',
                        iconSize : '1.5'
                    }),
                    new ButtonView({
                        label : 'btn primary',
                        style : 'primary',
                        icon  : 'share',
                        iconSize : '1.5'
                    }),
                    new ButtonView({
                        label : 'btn pill',
                        style : 'pill',
                        icon  : 'share',
                        iconSize : '1.5'
                    })
                ];
            this.actives = [
                    new ButtonView({
                        label : 'active'
                    }),
                    new ButtonView({
                        label : 'active',
                        style : 'primary'
                    }),
                    new ButtonView({
                        label : 'active',
                        style : 'pill'
                    }),
                    new ButtonView({
                        label : 'active',
                        icon  : 'print',
                        iconSize : '1.5'
                    }),
                    new ButtonView({
                        label : 'active',
                        style : 'primary',
                        icon  : 'share',
                        iconSize : '1.5'
                    }),
                    new ButtonView({
                        label : 'active',
                        style : 'pill',
                        icon  : 'share',
                        iconSize : '1.5'
                    })
            ];
                this.disableds = [
                    new ButtonView({
                        enabled : false,
                        label : 'disabled'
                    }),
                    new ButtonView({
                        enabled : false,
                        label : 'disabled',
                        style : 'primary'
                    }),
                    new ButtonView({
                        enabled : false,
                        label : 'disabled',
                        style : 'pill'
                    }),
                    new ButtonView({
                        enabled : false,
                        label : 'disabled',
                        icon  : 'print',
                        iconSize : '1.5'
                    }),
                    new ButtonView({
                        enabled : false,
                        label : 'disabled',
                        style : 'primary',
                        icon  : 'share',
                        iconSize : '1.5'
                    }),
                    new ButtonView({
                        enabled : false,
                        label : 'disabled',
                        style : 'pill',
                        icon  : 'share',
                        iconSize : '1.5'
                    })
                ];
            },
           render: function() {
               var renderedButtons = this.buttons.map(function(button){
                    button.set('enabled',false);
                   return button.render().$el;
               });
               var activeButtons = this.actives.map(function(button) {
                    return button.render().$el;
               });
               var disabledButtons = this.disableds.map(function(button) {
                    return button.render().$el;
               });
               this.$el.append(renderedButtons);
               this.$el.append('<br><br><br>');
               this.$el.append(activeButtons);
               this.$el.append('<br><br><br>');
               this.$el.append(disabledButtons);
               return this;
            }
        });
    }


);

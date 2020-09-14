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
                this.larges = [
                    new ButtonView({
                        label: 'btn large',
                        size: 'large'
                    }),
                    new ButtonView({
                        label: 'btn large',
                        style: 'primary',
                        size: 'large'
                    }),
                    new ButtonView({
                        label: 'btn large',
                        style: 'pill',
                        size: 'large'
                    })
                ];
                this.smalls = [
                    new ButtonView({
                        label: 'btn small',
                        size: 'small'
                    }),
                    new ButtonView({
                        label: 'btn small',
                        style: 'primary',
                        size: 'small'
                    }),
                    new ButtonView({
                        label: 'btn small',
                        style: 'pill',
                        size: 'small'
                    })
                ];
                this.minis = [
                    new ButtonView({
                        label: 'btn mini',
                        size: 'mini'
                    }),
                    new ButtonView({
                        label: 'btn mini',
                        style: 'primary',
                        size: 'mini'
                    }),
                    new ButtonView({
                        label: 'btn mini',
                        style: 'pill',
                        size: 'mini'
                    })
                ];
            },
           render: function() {
               var largeButtons = this.larges.map(function(button){
                   return button.render().$el;
               });
               var smallButtons = this.smalls.map(function(button) {
                    return button.render().$el;
               });
               var miniButtons = this.minis.map(function(button) {
                    return button.render().$el;
               });
               this.$el.append(largeButtons);
               this.$el.append('<br>');
               this.$el.append('<br>');
               this.$el.append(smallButtons);
               this.$el.append('<br>');
               this.$el.append('<br>');
               this.$el.append(miniButtons);
               return this;
            }
        });
    }


);

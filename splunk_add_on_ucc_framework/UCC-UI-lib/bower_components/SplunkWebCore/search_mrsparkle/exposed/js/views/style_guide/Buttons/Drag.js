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
                        style : 'primary',
                        menui : true
                    })                ];

            },
           render: function() {
               var renderedButtons = this.buttons.map(function(button){
                    button.set('enabled',false);
                   return button.render().$el;
               });
               this.$el.append(renderedButtons);
               return this;
            }
        });
    }


);

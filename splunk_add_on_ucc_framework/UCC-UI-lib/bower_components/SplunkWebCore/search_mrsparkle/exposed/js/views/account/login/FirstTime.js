define(
    [
        'module',
        'underscore',
        'views/Base',
        'contrib/text!./FirstTime.html'
    ],
    function(module, _, BaseView, template) {
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            attributes: {
                style: 'display: none'
            },
            show: function() {
                if (this.easing) {
                    return;
                }
                this.easing = true;
                setTimeout(function() {
                    this.$el.slideDown({
                        duration: '200',
                        easing: 'linear',
                        complete: function() {
                            delete this.easing;
                        }.bind(this)
                    });
                }.bind(this), 1000);
            },
            render: function() {
                this.$el.html(this.compiledTemplate({_: _}));
                return this;
            }
        });
    }
);

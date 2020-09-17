define(
    [
        'module',
        'views/shared/Button',
        './Button.pcssm'
    ],
    function(
        module,
        Button,
        css
    ){
        return Button.extend({
            moduleId: module.id,
            css: css,
            className: css.view,
            initialize: function(options) {
                Button.prototype.initialize.apply(this, arguments);
//                this.options.menu = true;
//                this.options.action = 'toggle';
            }
        });
    });

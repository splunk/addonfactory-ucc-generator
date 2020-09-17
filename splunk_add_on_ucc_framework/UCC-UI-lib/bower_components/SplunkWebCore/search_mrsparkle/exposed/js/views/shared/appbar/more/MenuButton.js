define(
    [
        'module',
        '../../splunkbar/MenuButton',
        './MenuButton.pcssm'
    ],
    function(
        module,
        MenuButtonView,
        css
    ){
        return MenuButtonView.extend({
            moduleId: module.id,
            constructor: function(options) {
                MenuButtonView.apply(this, arguments);
                this.css = css;
                this.className = this.css.view;
            },
            initialize: function() {
                MenuButtonView.prototype.initialize.apply(this, arguments);
                this.options.menu = false;
            }
        });
    });

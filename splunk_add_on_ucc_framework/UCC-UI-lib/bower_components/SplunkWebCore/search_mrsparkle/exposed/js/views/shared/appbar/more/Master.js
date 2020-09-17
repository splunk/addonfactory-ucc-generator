define(
[
    'module',
    'views/shared/Menu',
    './MenuButton',
     '../../appbar/SlideNav',
    './Master.pcssm'
],
function(
    module,
    MenuView,
    MenuButtonView,
    MenuContentsView,
    css
){
    return MenuView.extend({
        moduleId: module.id,
        css: css,
        initialize: function(options) {
            this.options.mode = 'dialog';
            this.options.contentView = new MenuContentsView({
                model: this.model,
                navData: this.options.navData
            });
            this.options.toggleView = new MenuButtonView({
                label:  '',
                model: this.model
            });
            MenuView.prototype.initialize.apply(this, arguments);
        }
    });
});

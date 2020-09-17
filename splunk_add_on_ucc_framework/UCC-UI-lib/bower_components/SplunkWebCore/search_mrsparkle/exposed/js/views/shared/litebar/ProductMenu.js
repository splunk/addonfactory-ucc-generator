define(
[
    'module',
    'underscore',
    'views/shared/splunkbar/product/Master',
    './ProductMenu.pcssm'
],
function(
    module,
    _,
    ProductMenuView,
    css
){
    return ProductMenuView.extend({
        moduleId: module.id,
        css: css,
        initialize: function() {
            ProductMenuView.prototype.initialize.apply(this, arguments);
            this.options.toggleView.set({label: ' '});
        }
    });
});

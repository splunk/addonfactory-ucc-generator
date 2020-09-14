define([
    'module',
    'views/shared/Menu',
    './Menu.pcssm'
],
function(
    module,
    MenuView,
    css
) {
    return MenuView.extend({
        moduleId: module.id,
        css: css
    });
});

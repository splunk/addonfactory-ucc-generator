define(
    [
        'module',
        'views/shared/MenuDialog',
        './MenuDialog.pcssm'
    ],
    function(
        module,
        MenuDialog,
        css
    ){
        return MenuDialog.extend({
            moduleId: module.id,
            css: css
        });
    });

define(
    [
        'module',
        'views/shared/FindInput',
        './Input.pcssm'
    ],
    function(
        module,
        FindInputView,
        css
    ){
        return FindInputView.extend({
            moduleId: module.id,
            useLocalClassNames: true,
            css: css
        });
    });

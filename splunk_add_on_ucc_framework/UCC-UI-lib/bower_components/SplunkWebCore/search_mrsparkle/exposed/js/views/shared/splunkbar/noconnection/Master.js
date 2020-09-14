define([
    'underscore',
    'module',
    'views/shared/ModalLocalClassNames',
    './Contents',
    './Master.pcssm'
],
    function(
        _,
        module,
        ModalView,
        ContentsView,
        css
        ){

        return ModalView.extend({
            moduleId: module.id,
            css: _.extend({}, ModalView.css, css),
            initialize: function(){
                this.options.showCloseButton = false;
                this.options.closeOnEscape = false;
                this.options.bodyView = new ContentsView();
                ModalView.prototype.initialize.apply(this, arguments);
            }
        });
    });

define([
    'lodash',
    'views/Base',
    'views/shared/ModalLocalClassNames',
    'app/views/component/SavingDialogContent'
], function(
    _,
    BaseView,
    ModalView,
    SavingDialogContent
){
    return ModalView.extend({
        initialize: function(){
            this.options.showCloseButton = false;
            this.options.closeOnEscape = false;
            this.options.bodyView = new SavingDialogContent();
            ModalView.prototype.initialize.apply(this, arguments);
        }
    });
});

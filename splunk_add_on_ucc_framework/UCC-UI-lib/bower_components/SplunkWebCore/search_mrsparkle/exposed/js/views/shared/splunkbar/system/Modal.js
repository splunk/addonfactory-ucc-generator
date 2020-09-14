define(
    [
         'jquery',
         'underscore',
         'module',
         'views/shared/ModalLocalClassNames',
         'views/shared/Button',
         './ModalBody',
         'uri/route'
     ],
     function($, _, module, ModalView, ButtonView, ModalBody, route) {
        return ModalView.extend({
            moduleId: module.id,
            initialize: function() {
                this.options.bodyView = new ModalBody({
                    model: {application: this.model.application}
                });
                this.options.title = _('Show All Settings').t();
                this.options.buttonsLeft = [new ButtonView({label: _('Cancel').t(), action: 'close-modal'})];
                this.options.buttonsRight = [new ButtonView({label:  _('Show').t(), action: 'show-more', style: 'primary'})];
                this.options.buttonsRight[0].on('click', this.submit.bind(this));

                ModalView.prototype.initialize.apply(this, arguments);
            },
            submit: function() {
                $.when(this.collection.managers.showMore()).then(function() {
                    this.collection.sections.reset();
                }.bind(this));
                this.hide();
            }
        });
    }
);

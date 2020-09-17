define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/Modal'
],
function(
    $,
    _,
    Backbone,
    module,
    Modal
){
    return Modal.extend({
        moduleId: module.id,
        className: Modal.CLASS_NAME + ' confirm-wrapper',
        initialize: function(options) {
            //TODO find better place for this hack to live
            $.fn.modal.Constructor.prototype.enforceFocus = function(){};
            Modal.prototype.initialize.call(this, arguments);

            this.on('hidden', function(){
                this.remove();
            });
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-ok': function(){
                this.hide();
                this.trigger('confirmed', true);
            },
            'click .modal-btn-cancel': function(){
                this.hide();
                this.trigger('confirmed', false);
            }
        }),
        render: function() {

            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.title || '');
            this.$(Modal.BODY_SELECTOR).show();
            this.$(Modal.BODY_SELECTOR).text(this.options.message || '');
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary btn-ok">'+_('OK').t()+'</a>');

            this.show();
            return this;
        }
    });
});

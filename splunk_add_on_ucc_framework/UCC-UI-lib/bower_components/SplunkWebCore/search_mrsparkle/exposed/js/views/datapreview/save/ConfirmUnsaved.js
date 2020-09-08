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
        className: Modal.CLASS_NAME,
        initialize: function(options) {
            this.title =  _("Save changes?").t();
            this.options = this.options || {};
            this.options.backdrop = 'static';
            this.options.keyboard = false;
            this.options.show = true;
            Modal.prototype.initialize.call(this, arguments);
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-save': function(){
                this.trigger('confirmed', true);
                this.remove();
            },
            'click .btn-dontsave': function(){
                this.trigger('confirmed', false);
                this.remove();
            }
        }),
        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.BODY_SELECTOR).show();
            this.$(Modal.BODY_SELECTOR).append(_('You have not saved your source type changes, would you like save before continuing?').t());
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Save Source Type").t());
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary btn-dontsave">'+_('Proceed without saving').t()+'</a>');
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary btn-save">'+_('Save').t()+'</a>');
            return this;
        }
    });
});

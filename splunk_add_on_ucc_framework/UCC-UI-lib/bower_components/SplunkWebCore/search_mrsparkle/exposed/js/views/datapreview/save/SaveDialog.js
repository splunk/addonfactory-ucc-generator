define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/datapreview/save/Master',
    'views/shared/Modal'
],
function(
    $,
    _,
    Backbone,
    module,
    SaveView,
    Modal
){
    return Modal.extend({
        moduleId: module.id,
        className: Modal.CLASS_NAME,
        initialize: function(options) {
            Modal.prototype.initialize.call(this, arguments);
            this.children.save = new SaveView({
                model: this.model,
                collection: this.collection
            });

            this.children.save.on('savedSourcetype', function(sourcetypeId){
                this.remove();
                this.trigger('savedSourcetype', sourcetypeId);
            }.bind(this));
        },
        events: $.extend({}, Modal.prototype.events, {
            'click .btn-save': function(){
                this.children.save.save();
            }
        }),
        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.BODY_SELECTOR).show();
            this.$(Modal.BODY_SELECTOR).append(this.children.save.render().el);
            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Save Source Type").t());
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary btn-save">'+_('Save').t()+'</a>');
            this.show();
            return this;
        }
    });
});

define(
[
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/Modal',
    'views/clustering/searchhead/AddEditClusterSuccess',
    'views/shared/FlashMessages'
],
function(
    $,
    _,
    Backbone,
    module,
    Modal,
    SuccessView,
    FlashMessagesView
){
    return Modal.extend({
        moduleId: module.id,
        template: '<div>'+_('Are you sure you would like to remove cluster ').t()+ '<b><%-decodeURIComponent( name )%></b>' + _(' from being searched by this search head?').t()+'</div>',
        initialize: function() {
            Modal.prototype.initialize.apply(this, arguments);
            this.children.flashMessages = new FlashMessagesView({ model: this.model });
            this.model.on('sync', this.render, this);
            return this;
        },
        events: {
            'click .btn-primary': 'deleteSearchhead'
        },
        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$el.show();

            this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Remove Cluster").t());
            this.$(Modal.BODY_SELECTOR).append(this.children.flashMessages.render().el);
            this.$(Modal.BODY_SELECTOR).append(this.compiledTemplate({name:this.model.entry.get('name')}));
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">'+_('Remove').t()+'</a>');

            return this;
        },
        deleteSearchhead: function(e) {
            var self = this;
            this.model.destroy().done(function(){
                self.hide();
                self.children.successView = new SuccessView({});
                $('body').append(self.children.successView.render().$el);
                self.children.successView.show();
                self.trigger('stepDone');
            });
        }
    });
});

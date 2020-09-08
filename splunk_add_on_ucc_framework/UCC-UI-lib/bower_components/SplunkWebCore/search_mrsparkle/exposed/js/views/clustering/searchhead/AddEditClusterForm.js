define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup',
    'views/shared/FlashMessages'
],
function(
    $,
    _,
    Backbone,
    module,
    Modal,
    ControlGroup,
    FlashMessagesView
){
    return Modal.extend({
        moduleId: module.id,
        events: {
            'click .btn-primary': 'saveForm'
        },
        initialize: function() {
            Modal.prototype.initialize.apply(this, arguments);

            this.children.flashMessages = new FlashMessagesView({ model: this.model });

            this.model.on('sync ready', function(){
                if(!this.isSaving){
                    this.model.transposeFromRest();
                    this.render();
                }
            }, this);

            this.render();
        },
        render: function() {

            this.$el.html(Modal.TEMPLATE);

            var title = this.model.entry.get('name') ? _("Edit Configuration").t() : _("Add Cluster to be Searched").t();
            this.$(Modal.HEADER_TITLE_SELECTOR).html(title);
            this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

            var form = $('<div></div>');
            this.children.masteruri = new ControlGroup({
                className: 'cluster-masterip control-group',
                controlType: 'Text',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'ui.master_uri',
                    model: this.model,
                    save: false
                },
                label: _('Master URI').t(),
                help: _('E.g. https://10.152.31.202:8089 This can be found in the Master Node dashboard.').t()
            });

            this.children.secret = new ControlGroup({
                className: 'cluster-secret control-group',
                controlType: 'Text',
                controlClass: 'controls-block',
                controlOptions: {
                    modelAttribute: 'ui.secret',
                    model: this.model,
                    save: false,
                    password: true
                },
                label: _('Security Key').t(),
                help: _('This key authenticates communication between the master and the peers and search head.').t()
            });
            form.append(this.children.masteruri.render().$el);
            form.append(this.children.secret.render().$el);
            this.$(Modal.BODY_FORM_SELECTOR).append(form);

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_NEXT);

            this.$(Modal.BODY_FORM_SELECTOR).prepend(this.children.flashMessages.render().el);

            this.show();

            return this;
        },
        saveForm: function(e){
            var self = this;
            e.preventDefault();

            this.isSaving = true;
            this.model.transposeToRest();
            this.model.save().done(function(){
                self.trigger('stepDone');
                self.isSaving = false;
            });
        }
    });
});





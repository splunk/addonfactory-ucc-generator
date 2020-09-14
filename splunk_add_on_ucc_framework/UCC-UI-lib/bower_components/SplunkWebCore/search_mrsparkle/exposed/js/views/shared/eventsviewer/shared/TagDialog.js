define(
    [
        'jquery',
        'underscore',
        'module',
        'models/services/saved/FVTags',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages'
    ],
    function($, _, module, FVTags, Modal, ControlGroup, FlashMessage) {
        return Modal.extend({
            moduleId: module.id,
           initialize: function() {
                Modal.prototype.initialize.apply(this, arguments);
                
                this.children.flashMessage = new FlashMessage({ model: this.model.tags });

                this.children.field = new ControlGroup({
                    className: 'field-value control-group',
                    controlType: 'Textarea',
                    controlOptions: {
                        modelAttribute: 'name',
                        model: this.model.tags.entry.content,
                        save: false,
                        placeholder: 'Optional',
                        enabled: false
                    },
                    label: _('Field Value').t()
                });

                this.children.tags = new ControlGroup({
                    className: 'tags control-group',
                    controlType: 'Textarea',
                    controlOptions: {
                        modelAttribute: 'ui.tags',
                        model: this.model.tags.entry.content,
                        save: false,
                        placeholder: ''
                    },
                    label: _('Tag(s)').t(),
                    help: _('Comma or space separated list of tags.').t()
                });
            },
            events: $.extend(true, {}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    var data = this.model.application.getPermissions('private'),
                        tags = FVTags.tagStringtoArray(_.escape(this.model.tags.entry.content.get('ui.tags')));
                    
                    this.model.tags.resetTags(tags);
                    this.model.tags.entry.content.unset('ui.tags');
                    if(this.model.tags.id) {
                        data = {};
                        if (!tags.length) {
                            this.model.tags.destroy();
                            this.trigger('tags_saved');
                            this.hide();
                            e.preventDefault();
                            return;
                        }
                    }

                    this.model.tags.save({}, {
                        data:  data,
                        success: function(model, response) {
                            this.trigger('tags_saved');
                            this.hide();
                        }.bind(this)
                    });
                    e.preventDefault();
                }
            }),
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Create Tags").t());
                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.children.field.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.tags.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                return this;
            }
        }
    );
});


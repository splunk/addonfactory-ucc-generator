/**
 * @author lbudchenko
 * @date 8/13/15
 *
 * Popup dialog for editing  config
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/FlashMessages',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup'

],

    function(
        $,
        _,
        Backbone,
        module,
        FlashMessages,
        Modal,
        ControlGroup
        ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + ' edit-dialog-modal modal-wide',

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': 'onClickSave'
            }),

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                this.options = options || {};
                _(this.options).defaults({isNew:true});

                this.renderDfd = new $.Deferred();

                this.setTitle();
                this.setFormControls();
            },

            setTitle: function() {
                this.title = (this.options.isNew || this.options.isClone) ? _('Create New ').t() + this.options.entitySingular : (_('Edit: ').t() + ' ' + _.escape(this.model.entity.entry.get('name')));
            },

            setFormControls: function() {
                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({
                    model: this.model.entity,
                    helperOptions: {
                        removeServerPrefix: true
                    }
                });

                // Create the form controls
                this.children.name = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'name',
                        // we can only get the 'name' field from this.model.entity.entry
                        model: this.model.entity.entry
                    },
                    controlClass: 'controls-block',
                    label: _('Name').t()
                });
            },

            onClickSave: function(e) {
                e.preventDefault();
                var saveOptions = {};
                if (this.model.entity.isNew()) {
                    saveOptions.data = {
                        app: this.model.application.get('app'),
                        owner: 'nobody'
                    };

                    // set name only for new model or cloned model, otherwise server will return error saying something
                    // like "an object with name=blahblah already exists".
                    // In another word, "name" on entry.content is a special field which is used only
                    // when new model is created (from server perspective it is a new stanza in a conf file). It is the
                    // unique id for this resource. However, once the model is saved to the server, "name" is removed
                    // from its entry.content hash, instead, it appears directly under entry, that's why our
                    // Control component is using this.model.entity.entry instead of this.model.entity.entry.content
                    this.model.entity.entry.content.set({name: this.model.entity.entry.get('name')});
                }

                if (this.options.isClone){
                    this.model.entity.set('id', undefined);
                }

                var saveDfd = this.model.entity.save({}, saveOptions);
                if (saveDfd) {
                    saveDfd.done(function() {
                        this.trigger("entitySaved", this.model.entity.get("name"));
                        this.hide();
                    }.bind(this))
                        .fail(function() {
                            this.$el.find('.modal-body').animate({ scrollTop: 0 }, 'fast');
                        }.bind(this));
                }
                e.preventDefault();
            },

            renderFormControls: function($modalBodyForm) {
                $modalBodyForm.html(_(this.formControlsTemplate).template({}));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                // TODO: should we hide the input box or disable it? 
                if (this.options.isNew || this.options.isClone) {
                    this.children.name.render().appendTo(this.$(".name-placeholder"));
                }
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(this.title);
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.renderFormControls(this.$(Modal.BODY_FORM_SELECTOR));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                this.renderDfd.resolve();
                return this;
            },

            formControlsTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <div class="name-placeholder"></div>\
            '
        });
    });

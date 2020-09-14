/**
 * Dialog for 
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/Modal',
    'views/shared/controls/ControlGroup'
],

    function(
        $,
        _,
        Backbone,
        module,
        Modal,
        ControlGroup
        ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);
                this.state = new Backbone.Model();
                //defines the text area for props.conf name/value text
                this.children.snippet = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'text',
                        model: this.state
                    },
                    controlClass: 'controls-block',
                    label: _('Source').t(),
                    tooltip:  _("Edit the path to the data source. Note that if you change the path, you cannot go back in the wizard.").t(),
                    help:_("Example: /home/data/apache/.../logs/...").t()
                });
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.model.editSource.set('editedSource', this.state.get('text'));
                    this.hide();
                }
            }),

            setText: function() {
                this.textToShow = this.model.editSource.get('originalSource');
                this.state.set('text', this.textToShow);
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Edit Source').t());
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({}));
                this.children.snippet.render().appendTo(this.$(".source-text-placeholder"));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                this.setText();
                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="source-text-placeholder"></div>\
            '
        });
    });

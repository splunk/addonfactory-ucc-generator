/*
Defines the Modal instantiated when user clicks "Copy to Clipboard" link on advanced settings
panel of data preview (in Advanced.js). Accepts props.conf attribute names/values and source
type name parameters passed in from Advanced.js. Offers user non-editable text-only version
of props.conf attributes to copy/paste for use elsewhere.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/shared/Modal',
        'views/shared/controls/TextareaControl'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        Modal,
        TextareaControl
        ){
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + ' copyToClipboardDialog',
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);
                this.state = new Backbone.Model();
                //defines the text area for props.conf name/value text
                this.children.snippet = new TextareaControl({
                        spellcheck: false,
                        modelAttribute: 'text',
                        model: this.state
                    }
                );
            },

            /*Retrieves sourcetype name from this.model.sourcetypemodel.entry, if specified.
            Iterates over the JSON props.conf object (passed as this.model.intermediatemodel)
            and concatenates string object holding sourcetype name with one 'name = value'
            props.conf pair per line for display in modal textarea.
            */
            setText : function() {
                this.textToDisplay = this.model.intermediateModel.toJSON();
                var name = this.model.sourcetypeModel.entry.get('name');
                var sourcetypeName = name && name != 'default' ? name : '<SOURCETYPE NAME>';
                var textString = '[ ' + sourcetypeName + ' ]' + '\n';
                $.each(this.textToDisplay, function(key, value) {
                    if(typeof value !== 'undefined' && /* dont allow undefiend values */
                       String(value).length > 0) {  /* only allow if value is more than 0 characters */
                        textString += key + '=' + value + '\n';
                    }
                });
                this.state.set('text', textString);
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.BODY_SELECTOR).show();
                this.children.snippet.render().appendTo(this.$(Modal.BODY_SELECTOR));
                this.children.snippet.$el.find('textarea').prop('readonly', true);
                this.$(Modal.BODY_SELECTOR).append(this.textToDisplay);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Copy and paste this props.conf text:').t());
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.setText();
                return this;
            }
        });
    });

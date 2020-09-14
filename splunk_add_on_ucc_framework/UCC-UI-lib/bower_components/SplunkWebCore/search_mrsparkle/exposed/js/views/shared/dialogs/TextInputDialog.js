/**
 * Dialog that contains a single Text input and emits an event when the value has changed
 *
 * Inputs:
 *      options {Object}
 *              parent {Object} - reference to the object that will dispatch the "validate" event in response to
 *                                the "change:textInputValue" event
 *      setLabel(value) - set the label describing the what the text input represents
 *      setValue(value) - set the value of the text input
 *
 *
 * Events:
 *      change:textInputValue - triggered when the primary button is pressed. Returns the value of the text input
 *
 * Control Flow:
 *      When the primary button is pressed, the dialog emits a change:textInputValue event. The listener to this event
 *      must then dispatch a "validate" event back to this dialog. If that validate event has no errors, then the
 *      dialog will close. Otherwise, it will display the errors.
 *
 * TODO [JCS] What should happen if the value doesn't change? Should the save button be disabled?
 * TODO [JCS] Maybe use the existing TextInputControl (need to update it to not use a model)
 * @author jszeto
 * @date 10/18/12
 */

define(
    [
        'jquery',
        'underscore',
        'views/shared/dialogs/DialogBase',
        'views/shared/FlashMessages',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/TextControl',
        'module'
    ],
    function(
        $,
        _,
        DialogBase,
        FlashMessagesView,
        ControlGroup,
        TextControl,
        module
    )
{
        return DialogBase.extend({
            moduleId: module.id,
            _label: "",
            _value: "",
            MESSAGE_ID: "textInputError",
            initialize: function(options) {

                var defaults = {
                    updateModel: false,
                    modelAttribute: "",
                    model: undefined,
                    label: ""
                };
                _.defaults(this.options, defaults);

                DialogBase.prototype.initialize.call(this, options);

                // Set default values for the button labels
                this.settings.set("primaryButtonLabel",_("Save").t());
                this.settings.set("cancelButtonLabel",_("Cancel").t());

                this.textControl = new TextControl({modelAttribute: this.options.modelAttribute,
                                                    model: this.options.model,
                                                    updateModel: this.options.updateModel,
                                                    validate: true});
                this.children.textInputControl = new ControlGroup({controls: this.textControl,
                                                                   label: options.label});

                this.children.flashMessagesView = new FlashMessagesView({model: this.options.model});

            },
            primaryButtonClicked: function() {
                if (this.textControl.updateModel()) {
                    DialogBase.prototype.primaryButtonClicked.call(this);
                    this.hide();
                }
            },
            dialogShown: function() {
                DialogBase.prototype.dialogShown.call(this);
                // TODO [JCS] Set focus here into the TextControl
            },
            cleanup: function() {
                DialogBase.prototype.cleanup.call(this);
            },
            /**
             * Render the dialog body. Subclasses should override this function
             *
             * @param $el The jQuery DOM object of the body
             */
            renderBody : function($el) {
                $el.html(this.bodyTemplate);
                $el.find(".dialog-flashMessages-placeholder").append(this.children.flashMessagesView.render().el);
                $el.find(".dialog-text-input-placeholder").append(this.children.textInputControl.render().el);
            },
            bodyTemplate: '\
                <div class="dialog-flashMessages-placeholder"></div>\
                <div class="form form-horizontal dialog-text-input-placeholder"></div>\
            '
        });
    }
);

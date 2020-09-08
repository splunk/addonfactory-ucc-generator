/**
 * @author jszeto
 * @date 10/22/12
 */

define(
    [
        'jquery',
        'underscore',
        'views/shared/dialogs/DialogBase',
        'module', 
        'views/shared/FlashMessages'
    ],
    function(
        $,
        _,
        DialogBase,
        module, 
        FlashMessagesView
    )
    {

        var TextDialog = DialogBase.extend({ 
            moduleId: module.id,
            _text: "",
            initialize: function(options) {
                DialogBase.prototype.initialize.call(this, options);
                // Set default values for the button labels
                this.settings.set("primaryButtonLabel",_("Ok").t());
                this.settings.set("cancelButtonLabel",_("Cancel").t());
                if(this.options.flashModel) {
                    this.children.flashMessages = new FlashMessagesView({model: this.options.flashModel});
                    //reset flashmessages to clear pre-existing flash messages on 'cancel' or 'close' of dialog
                    this.on('hide', this.options.flashModel.error.clear, this.options.flashModel.error); 
                }
                this.on('hidden', this.remove, this); //clean up dialog after it is closed
                this.doDefault = true; 
            },
            primaryButtonClicked: function() {
                DialogBase.prototype.primaryButtonClicked.call(this);
                if (this.doDefault){
                    this.hide();
                }
            },
            setText : function(value) {
                this._text = value;
                this.debouncedRender();
            },
            closeDialog: function(){
            //if delete succeeds
                this.hide(); 
                this.remove(); 
            },
            preventDefault: function(){
                this.doDefault = false; 
            },
            /**
             * Render the dialog body. Subclasses should override this function
             *
             * @param $el The jQuery DOM object of the body
             */
            renderBody : function($el) {
                $el.html(this.bodyTemplate);
                $el.find(".text-dialog-placeholder").html(this._text);
                if(this.children.flashMessages){
                    $el.find(".text-dialog-placeholder").prepend(this.children.flashMessages.render().el);
                }
            },
            bodyTemplate: '\
                <span class="text-dialog-placeholder"></span>\
            '
        }, {
            confirm: function(message, options) {
                options || (options = {});
                var dialogOptions = {};
                if (options.id) {
                    dialogOptions.id = options.id;
                }
                var dialog = new TextDialog(dialogOptions);
                
                dialog.settings.set({
                    primaryButtonLabel: options.primaryButtonLabel || _("OK").t(),
                    cancelButtonLabel: options.cancelButtonLabel || _("Cancel").t(),
                    titleLabel: options.title || _("Confirm").t()
                });
                
                dialog.once('click:primaryButton', options.primaryAction);
                dialog.setText(message);
                dialog.render().$el.appendTo(document.body);
                dialog.show();
                
                return dialog;
            }
        });
        
        return TextDialog;
    }
);


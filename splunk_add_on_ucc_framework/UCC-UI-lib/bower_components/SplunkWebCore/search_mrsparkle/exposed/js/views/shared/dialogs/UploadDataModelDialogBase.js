/**
 * @author usaha
 * @date 2/27/14
 */

define(
    [
        'jquery',
        'underscore',
        'views/shared/dialogs/DialogBase',
        'module'
    ],
    function(
        $,
        _,
        DialogBase,
        module
    )
    {

        return DialogBase.extend({ 
            moduleId: module.id,
            _text: "",
            initialize: function(options) {
                DialogBase.prototype.initialize.call(this, options);
            },
            setFocus: function() {
                this.$('input:file:enabled:visible:first').focus();
            }
        });
    }
);


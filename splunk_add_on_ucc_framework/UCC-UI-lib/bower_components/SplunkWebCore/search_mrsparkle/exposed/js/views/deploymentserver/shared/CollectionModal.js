/**
 * @author jszeto
 * @date 10/22/12
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
            className: "modal",
            _text: "",
            initialize: function(options) {
                DialogBase.prototype.initialize.call(this, options);
            },
            primaryButtonClicked: function() {
                DialogBase.prototype.primaryButtonClicked.call(this);
                this.hide();
            },
            setContent : function(content) {
                this._modalContent = content;
                this.debouncedRender();
            },
            /**
             * Render the dialog body. Subclasses should override this function
             *
             * @param $el The jQuery DOM object of the body
             */
            renderBody : function($el) {
                $el.html(this.bodyTemplate);
                $el.find(".modal-dialog-placeholder").html(this._modalContent);
            },
            bodyTemplate: '\
                <div class="modal-dialog-placeholder"></div>\
            '
        });
    }
);


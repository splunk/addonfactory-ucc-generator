/**
 * @author ahebert
 * @date 7/21/16
 *
 * Confirm dialog content. See views/shared/ModalConfirmation/Master.js.
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        $,
        _,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'p',

            render: function() {
                this.$el.html(_.escape(this.options.text));
                return this;
            }
        });
    }
);

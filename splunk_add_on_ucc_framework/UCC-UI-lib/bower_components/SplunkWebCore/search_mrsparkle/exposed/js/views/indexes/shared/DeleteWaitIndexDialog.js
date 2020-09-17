/**
 * @author ecarillo
 * @date 8/6/15
 *
 * Confirmation dialog for deleting an index
 */

define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'splunk.util',
        'models/shared/LinkAction',
        'views/shared/FlashMessages',
        'views/shared/Modal'
    ],

    function(
        $,
        _,
        Backbone,
        module,
        splunkUtil,
        LinkAction,
        FlashMessages,
        Modal
    ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + " confirm-delete-index-dialog",
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-confirm': function(e) {
                    this.hide();
                }
            }),

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html( _('Deleting Index').t());
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({
                    message: splunkUtil.sprintf(_("Deleting index named <i>%s</i>. Depending on the server, " +
                        "it may take several minutes for this index to be removed from the list.").t(), this.model.entry.get("name"))
                }));

                var BUTTON_CONFIRM = '<a href="#" class="btn btn-primary modal-btn-confirm modal-btn-primary">' + _('Continue').t() + '</a>';
                this.$(Modal.FOOTER_SELECTOR).append(BUTTON_CONFIRM);
                return this;
            },

            dialogFormBodyTemplate: '\
                <i style="" class="big-warning icon-warning"></i>\
                <p class="confirm-text"><%= message %></p>\
            '
        });
    });

/**
 * @author jszeto
 * @date 8/5/15
 */

define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'splunk.util',
        'views/shared/FlashMessages',
        'views/shared/Modal'
    ],

    function(
        $,
        _,
        Backbone,
        module,
        splunkUtil,
        FlashMessages,
        Modal
    ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + " delete-archive-error-dialog",
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);

                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({model:this.model});
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html( _('Delete Archive').t());
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({
                  errorMessage: splunkUtil.sprintf(
                    _("You can not delete the archive <i>%s</i> until the following indexes are no longer archiving data to this archive:").t(),
                    this.model.entry.get("name")
                  ),
                  indexes: this.collection
                }));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <i style="" class="big-error icon-error"></i>\
                <p class="delete-text">\
                  <%= errorMessage %>\
                  <br/>\
                  <% indexes.each(function(index) { %>\
                      <br/><span class="index-name"><%= index.entry.content.get("vix.output.buckets.from.indexes") %></span>\
                  <% }) %>\
                  <br/>\
                </p>\
            '
        });
    });

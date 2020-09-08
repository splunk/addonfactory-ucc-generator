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
            className: Modal.CLASS_NAME + " delete-archive-dialog",
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);

                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({model:this.model});
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-delete': function(e) {
                    var archiveName = this.model.entry.get("name");
                    var deleteArchiveDeferred = this.model.destroy({wait:true});

                    $.when(deleteArchiveDeferred).done(_(function() {
                        this.trigger("deleteArchiveConfirmed", archiveName);
                        this.hide();
                    }).bind(this));
                }
            }),

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html( _('Delete Archive').t());
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({
                  confirmationMessage: splunkUtil.sprintf(
                    _("Are you sure you want to delete the archive named <i>%s</i>?").t(),
                    this.model.entry.get("name")
                  ),
                  noDeleteMessage: splunkUtil.sprintf(
                    _("The data in your S3 bucket <i>%s</i> will NOT be deleted.").t(),
                    this.model.entry.content.get("vix.fs.default.name")
                  )
                }));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL_PRIMARY);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DELETE_SECONDARY);
                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <!--<div class="pull-left">--><i style="" class="big-warning icon-warning"></i><!--</div>-->\
                <p class="delete-text"><%= confirmationMessage %>\
                <br/><br/><%= noDeleteMessage %> \
                </p>\
            '
        });
    });

/**
 * @author jszeto
 * @date 2/11/15
 */

define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'splunk.util',
        'views/shared/FlashMessages',
        'views/shared/Modal',
        'views/shared/waitspinner/Master'
    ],

    function(
        $,
        _,
        Backbone,
        module,
        splunkUtil,
        FlashMessages,
        Modal,
        Spinner
    ) {

        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME + " delete-index-dialog",
            initialize: function(options) {
                Modal.prototype.initialize.call(this, arguments);

                // Create flash messages view
                this.children.flashMessagesView = new FlashMessages({model:this.model});

                if (this.options.showSpinner){
                    // Show spinner to show feedback that index is being deleted.
                    var spinnerOptions = {
                        color: 'green',
                        size: 'medium',
                        frameWidth: 19
                    };
                    this.children.spinner = new Spinner(spinnerOptions);
                }
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .modal-btn-delete': function(e) {
                    if (this.children.spinner){
                        this.children.spinner.start();
                        this.children.spinner.$el.show();
                    }
                    var deleteIndexDeferred = this.model.destroy({wait:true});

                    $.when(deleteIndexDeferred).done(_(function() {
                        this.trigger("deleteIndexConfirmed", this.model);
                        this.hide();
                        if (this.children.spinner) {
                            this.children.spinner.stop();
                        }
                    }).bind(this));
                    $.when(deleteIndexDeferred).fail(_(function() {
                        if (this.children.spinner) {
                            this.children.spinner.$el.hide();
                            this.children.spinner.stop();
                        }
                    }).bind(this));
                }
            }),

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html( _('Delete Index').t());
                this.$(Modal.BODY_SELECTOR).show();
                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);
                this.$(Modal.BODY_FORM_SELECTOR).html(_(this.dialogFormBodyTemplate).template({
                  confirmationMessage: splunkUtil.sprintf(
                    _("Are you sure you want to delete the index named <i>%s</i>?").t(),
                    this.model.entry.get("name")
                  ),
                  deletionWarning: splunkUtil.sprintf(
                    _("Any data in index <i>%s</i> will be deleted and irrecoverable!").t(),
                    this.model.entry.get("name")
                  )
                }));
                this.children.flashMessagesView.render().appendTo(this.$(".flash-messages-view-placeholder"));
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL_PRIMARY);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DELETE_SECONDARY);
                if (this.children.spinner) {
                    this.$(Modal.FOOTER_SELECTOR).append(this.children.spinner.render().el);
                    this.children.spinner.$el.hide();
                }
                return this;
            },

            dialogFormBodyTemplate: '\
                <div class="flash-messages-view-placeholder"></div>\
                <!--<div class="pull-left">--><i style="" class="big-warning icon-warning"></i><!--</div>-->\
                <p class="delete-text">\
                  <%= confirmationMessage %>\
                  <br>\
                  <%= deletionWarning %>\
                </p>\
            '
        });
    });

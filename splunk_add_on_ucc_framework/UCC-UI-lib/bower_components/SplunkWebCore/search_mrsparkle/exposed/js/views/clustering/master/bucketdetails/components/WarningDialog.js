define(
    [
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/Modal',
        './SuccessDialog',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        Modal,
        SuccessDialog,
        splunkdUtils,
        splunkUtils
    ) {
        return Modal.extend({
            moduleId: module.id,

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    e.preventDefault();

                    $.ajax({
                        url: splunkdUtils.fullpath('cluster/master/buckets/' + this.options.bucketId + '/remove_all'),
                        type: 'POST',
                        contentType: 'application/json'
                    })
                    .done(function(response) {
                        this.hide();

                        var successDialog = new SuccessDialog({
                            title: _('Delete All Copies Operation Scheduled').t(),
                            message: _('Operation to delete all copies has been scheduled.').t(),
                            bucketId: this.options.bucketId,
                            peer: _('All Peers').t(),
                            onHiddenRemove: true
                        });
                        $('body').append(successDialog.render().$el);
                        successDialog.show();
                    }.bind(this));
                }
            }),

            render: function() {
                var message = splunkUtils.sprintf(_('Are you sure you want to delete all copies of bucket %s? This will permanently delete all data contained in this bucket.').t(), this.options.bucketId);
                
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Delete All Bucket Copies').t());
                this.$(Modal.BODY_SELECTOR).append(message);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">'+_('Delete All Copies').t()+'</a>');

                return this;
            }
        });
    }
);


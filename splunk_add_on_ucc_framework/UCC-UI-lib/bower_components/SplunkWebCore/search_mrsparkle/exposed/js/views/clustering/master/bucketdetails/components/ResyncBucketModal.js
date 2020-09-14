define([
        'jquery',
        'backbone',
        'underscore',
        'module',
        'collections/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        './SuccessDialog',
        'util/splunkd_utils',
        './ResyncBucketModal.pcss'
    ],
    function(
        $,
        backbone,
        _,
        module,
        FlashMessagesCollection,
        FlashMessagesLegacyView,
        Modal,
        ControlGroup,
        SuccessDialog,
        splunkdUtils,
        css
    ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);

                this.stateModel = new backbone.Model();

                this.children.peers = new ControlGroup({
                    controlType: 'SyntheticSelect',
                    className: 'peers control-group',
                    controlOptions: {
                        modelAttribute: 'peer',
                        model: this.stateModel,
                        items: options.peers,
                        popdownOptions: {
                            attachDialogTo: '.modal:visible',
                            scrollContainer: '.modal:visible .modal-body:visible'
                        }
                    },
                    controlClass: 'controls-block btn'
                });

                this.flashMessages = new FlashMessagesCollection();
                this.children.flashMessagesLegacy = new FlashMessagesLegacyView({
                    collection: this.flashMessages
                });
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    e.preventDefault();

                    var bucketId = this.options.bucketId;
                    var peer = this.stateModel.get('peer') || this.options.peers[0].value;
                    var data = {
                        peer: peer,
                        bucket_id: bucketId
                    };

                    $.ajax({
                        url: splunkdUtils.fullpath('cluster/master/control/control/resync_bucket_from_peer'),
                        type: 'POST',
                        contentType: 'application/json',
                        data: data
                    })
                    .done(function(response) {
                        this.hide();
                        
                        var successDialog = new SuccessDialog({
                            title: _('Resync Operation Scheduled').t(),
                            message: _('Operation resync has been scheduled.').t(),
                            bucketId: bucketId,
                            peer: peer,
                            onHiddenRemove: true
                        });
                        $('body').append(successDialog.render().$el);
                        successDialog.show();
                    }.bind(this))
                    .fail(function(response) {
                        var errorText = $($.parseXML(response.responseText)).find('msg').text();
                        this.flashMessages.reset([{
                            type: 'error',
                            html: errorText
                        }]);
                    }.bind(this));
                }
            }),

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Bucket:  ').t() + this.options.bucketId);
                this.$(Modal.BODY_SELECTOR).append(this.children.flashMessagesLegacy.render().el);
                this.$(Modal.BODY_SELECTOR).append(_('Resync the copy of this bucket on peer: ').t());
                this.$(Modal.BODY_SELECTOR).append(this.children.peers.render().el);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append('<a href="#" class="btn btn-primary modal-btn-primary">' + _('Resync').t() + '</a>');

                return this;
            }
        });
    });

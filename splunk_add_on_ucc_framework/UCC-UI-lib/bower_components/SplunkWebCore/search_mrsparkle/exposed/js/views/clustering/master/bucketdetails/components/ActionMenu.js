define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/PopTart',
        './BucketDetailsModal',
        './ResyncBucketModal',
        './DeleteBucketModal',
        './SuccessDialog',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        module,
        PopTart,
        BucketDetailsModal,
        ResyncBucketModal,
        DeleteBucketModal,
        SuccessDialog,
        splunkdUtils
    ) {
        return PopTart.extend({
            moduleId: module.id,
            className: 'dropdown-menu',

            events: {
                'click .action-details': function(e) {
                    e.preventDefault();

                    var bucketDetailsModal = new BucketDetailsModal({
                        bucketId: this.bucketId,
                        onHiddenRemove: true
                    });
                    $('body').append(bucketDetailsModal.render().$el);
                    bucketDetailsModal.show();
                },

                'click .action-roll': function(e) {
                    e.preventDefault();

                    var data = {
                      bucket_id: this.bucketId
                    };

                    $.ajax({
                        url: splunkdUtils.fullpath('cluster/master/control/control/roll-hot-buckets'),
                        type: 'POST',
                        contentType: "application/json",
                        data: data
                    }).done(function(response) {
                        var successDialog = new SuccessDialog({
                            title: _('Roll Operation Scheduled').t(),
                            message: _('Roll operation has been scheduled.').t(),
                            bucketId: this.bucketId,
                            peer: _('All').t(),
                            onHiddenRemove: true
                        });
                        $('body').append(successDialog.render().$el);
                        successDialog.show();
                    }.bind(this));
                },

                'click .action-resync': function(e) {
                    e.preventDefault();

                    var resyncBucketModal = new ResyncBucketModal({
                        bucketId: this.bucketId,
                        peers: this.peers,
                        onHiddenRemove: true
                    });
                    $('body').append(resyncBucketModal.render().$el);
                    resyncBucketModal.show();
                },

                'click .action-delete': function(e) {
                    e.preventDefault();

                    var deleteBucketModal = new DeleteBucketModal({
                        bucketId: this.bucketId,
                        peers: this.peers,
                        onHiddenRemove: true
                    });
                    $('body').append(deleteBucketModal.render().$el);
                    deleteBucketModal.show();
                }
            },

            initialize: function(options) {
                options = _.defaults(options, { mode: 'menu' });
                PopTart.prototype.initialize.call(this, options);

                this.bucketId = this.model.entry.get('name');
                this.peers = null;

                var data = {
                    output_mode: 'json'
                };
            
                $.ajax({
                    url: splunkdUtils.fullpath('cluster/master/buckets/' + this.bucketId),
                    type: 'GET',
                    contentType: "application/json",
                    data: data
                }).done(function(response) {
                    var peersObject = response.entry[0].content.peers;
                    var peersKeys = Object.keys(peersObject);
                    this.peers = peersKeys.map(function(peerKey) {
                        return {
                            label: peersObject[peerKey].server_name,
                            value: peerKey
                        };
                    }, this);
                }.bind(this));
            },

            render: function() {
                this.el.innerHTML = PopTart.prototype.template_menu;
                this.$el.append(this.compiledTemplate({
                    _: _
                }));
            
                return this;
            },
            
            template: '\
                <ul class="first-group">\
                    <li>\
                        <a href="#" class="action-details"><%- _("View Bucket Details").t() %></a>\
                    </li>\
                    <li>\
                        <a href="#" class="action-roll"><%- _("Roll").t() %></a>\
                    </li>\
                    <li>\
                        <a href="#" class="action-resync"><%- _("Resync").t() %></a>\
                    </li>\
                    <li>\
                        <a href="#" class="action-delete"><%- _("Delete Copy").t() %></a>\
                    </li>\
                </ul>\
            '
        });

    }
);

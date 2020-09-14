define([
        'jquery',
        'backbone',
        'underscore',
        'module',
        'views/shared/Modal',
        'util/splunkd_utils',
        'splunk.util'
    ],
    function(
        $,
        backbone,
        _,
        module,
        Modal,
        splunkdUtils,
        splunkUtils
    ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,

            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);

                this.bucketId = this.options.bucketId;
                var data = {
                    output_mode: 'json'
                };

                $.ajax({
                    url: splunkdUtils.fullpath('cluster/master/buckets/' + this.bucketId),
                    type: 'GET',
                    contentType: 'application/json',
                    data: data
                }).done(function(response) {
                    var content = response.entry[0].content;
                    this.$(Modal.BODY_SELECTOR).append(_.template(this.detailsTemplate, content));
                }.bind(this));
            },

            render: function() {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_('Bucket:  ').t() + this.bucketId);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CLOSE);

                return this;
            },

            detailsTemplate: '\
                <div>\
                    <h4> <%= _("Bucket Details").t() %> </h4>\
                    <div> <%= _("Bucket Size: ").t() %> <%- bucket_size ? bucket_size : "Unreported. Bucket might be hot." %> </div>\
                    <div> <%= _("Force Roll: ").t() %> <%= force_roll %> </div>\
                    <div> <%= _("Frozen: ").t() %> <%- frozen === 1 %> </div>\
                    <div> <%= _("Index: ").t() %> <%= index %> </div>\
                    <div> <%= _("Origin Site: ").t() %> <%= origin_site %> </div>\
                    <div> <%= _("Standalone: ").t() %> <%= standalone === 1%> </div>\
                    <h4> <%= _("Peers").t() %> </h4>\
                    <% _.each(peers, function(peer) { %> \
                            <div>\
                                <div> <%= _("Instance Name: ").t() %> <%= peer.server_name %> </div>\
                                <div> <%= _("Bucket Flags: ").t() %> <%= peer.bucket_flags %> </div>\
                                <div> <%= _("Bucket Size Vote: ").t() %> <%= peer.bucket_size_vote ? peer.bucket_size_vote : "N/A" %> </div>\
                                <div> <%= _("Status: ").t() %> <%= peer.status %> </div>\
                                <div> <%= _("Search State: ").t() %> <%= peer.search_state %> </div>\
                                <br/>\
                            </div>\
                    <% }) %>\
                    <h4> <%= _("Replication Count by Site").t() %> </h4>\
                    <% _.each(rep_count_by_site, function(value, key) { %> \
                        <div> <%= key + ": " + value %> </div>\
                    <% }) %>\
                    <h4> <%= _("Search Count by Site").t() %> </h4>\
                    <% _.each(search_count_by_site, function(value, key) { %> \
                        <div> <%= key + ": " + value %> </div>\
                    <% }) %>\
                </div>\
            '
        });
    });

define(
    [
        "jquery",
        "underscore",
        "views/Base",
        "splunk.util"
    ],
    function(
        $,
        _,
        BaseView,
        splunkUtil
    ) {
        return BaseView.extend({
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.product = this.model.user.serverInfo.getProductName();
                this.status = this.collection.appRemotes.error.attributes.status;
                this.err = '';
                switch (this.status) {
                    case 502:
                        // Error resolving: nodename nor servname provided, or not known
                        // (happens when internet connectivity is down)
                        this.err = splunkUtil.sprintf(_('Splunk server is unable to connect to splunkbase.splunk.com. Check internet connection for %s server, and try again.').t(), this.product);
                        break;
                    default:
                        // 400 Bad request
                        //  or
                        // Not a valid option(s) for product
                        //  or
                        // Invalid query field
                        this.err = splunkUtil.sprintf(_('Unable to fetch supported add-ons for %s. Try again at a later time. If this error persists, please contact customer support.').t(), this.product);
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate( {
                    error: this.err
                }));
                return this;
            },

            template: ' \
                <div class="section-padded section-header"> \
                    <h2 class="section-title"><%- _("Add-Ons").t() %></h2> \
                </div> \
                <div class="alert alert-error">\
                    <i class="icon-alert"></i>\
                    <%- error %>\
                </div>\
            '
        });
    }
);
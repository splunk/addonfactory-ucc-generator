define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/TouchJobModal',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        TouchModal,
        splunkd_utils
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'touch',
            tagName: 'li',
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a[class!="disabled"]': function(e) {
                    this.model.searchJob.fetch({
                        success: function(model, response) {
                            this.children.touchModal = new TouchModal({
                                model: {
                                    searchJob: this.model.searchJob,
                                    application: this.model.application,
                                    report: this.model.report,
                                    serverInfo: this.model.serverInfo
                                },
                                onHiddenRemove: true,
                                externalJobLinkPage: this.options.externalJobLinkPage
                            });

                            this.children.touchModal.render().appendTo($("body"));
                            this.children.touchModal.show();
                        }.bind(this),
                        error: function(model, response) {
                            if (response.status == splunkd_utils.NOT_FOUND) {
                                this.model.searchJob.trigger('jobControls:notFound', { title: _('Extend Job Lifetime').t() });
                            }
                        }.bind(this)
                    });

                    e.preventDefault();
                },
                'click a.disabled': function(e) {
                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html('<a href="#">' + _("Extend Job Expiration").t() + '</a>');
                var canWrite = this.model.searchJob.entry.acl.canWrite();
                if (!this.model.searchJob.entry.acl.canWrite()) {
                    this.$('a').addClass('disabled');
                }
                return this;
            }
        });
    }
);
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/jobcontrols/menu/EditModal'
    ],
    function($, _, module, BaseView, EditModal) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'edit',
            tagName: 'li',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a[class!="disabled"]': function(e) {
                    this.children.editModal = new EditModal({
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            report: this.model.report,
                            serverInfo: this.model.serverInfo
                        },
                        onHiddenRemove: true,
                        externalJobLinkPage: this.options.externalJobLinkPage
                    });

                    this.children.editModal.render().appendTo($("body"));
                    this.children.editModal.show();

                    e.preventDefault();
                },
                'click a.disabled': function(e) {
                    e.preventDefault();
                }
            },
            render: function() {
                this.$el.html('<a href="#">' + _("Edit Job Settings...").t() + '</a>');
                var canWrite = this.model.searchJob.entry.acl.canWrite();
                if (!this.model.searchJob.entry.acl.canWrite()) {
                    this.$('a').addClass('disabled');
                }
                return this;
            }
        }
    );
});

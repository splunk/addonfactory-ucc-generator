define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/jobcontrols/menu/DeleteModal'
    ],
    function($, _, module, BaseView, DeleteModal) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'delete',
            tagName: 'li',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a[class!="disabled"]': function(e) {
                    this.children.deleteModal = new DeleteModal({
                        model: this.model.searchJob,
                        onHiddenRemove: true
                    });

                    this.children.deleteModal.render().appendTo($("body"));
                    this.children.deleteModal.show();

                    e.preventDefault();
                },
                'click a.disabled': function(e) {
                    e.preventDefault();
                }
            },
            render: function() {
                var canWrite = this.model.searchJob.entry.acl.canWrite();
                if (canWrite){
                    this.$el.html('<a href="#">' + _("Delete Job").t() + '</a>');
                } else {
                    this.$el.html('<a href="#" class="disabled">' + _("Delete Job").t() + '</a>');
                }
                return this;
            }
        });
    }
);

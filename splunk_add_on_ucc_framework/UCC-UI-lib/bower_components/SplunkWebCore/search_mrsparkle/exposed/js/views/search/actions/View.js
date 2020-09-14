define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/reportcontrols/dialogs/ConfirmChanges',
        'uri/route',
        'util/general_utils'
    ],
    function($, _, module, Base, ConfirmChangesModal, route, util) {
        return Base.extend({
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            moduleId: module.id,
            className: 'view btn-pill',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.$el.html(_('View').t());
            },
            events: {
                'click': function(e) {
                    e.preventDefault();
                    var root = this.model.application.get('root'),
                        locale = this.model.application.get('locale'),
                        app = this.model.application.get("app"),
                        canWrite = this.model.report.canWrite(this.model.user.canScheduleSearch(), this.model.user.canRTSearch()),
                        isEmbedded = util.normalizeBoolean(this.model.report.entry.content.get('embed.enabled'));

                    if (!canWrite || isEmbedded) {
                        this.remove();
                        window.location = this.model.report.routeToViewReport(root, locale, app, undefined);
                    } else if (this.model.report.isDirty(this.model.reportPristine)) {
                        //open the dirty modal
                        this.children.confirmChangesModal = new ConfirmChangesModal({
                            model: {
                                report: this.model.report,
                                reportPristine: this.model.reportPristine,
                                searchJob: this.model.searchJob,
                                application: this.model.application
                            },
                            onHiddenRemove: true
                        });

                        this.children.confirmChangesModal.render().appendTo($('body')).show();
                    } else {
                        this.remove();
                        window.location = this.model.report.routeToViewReport(root, locale, app, this.model.searchJob.id);
                    }
                }
            },
            render: function() {
                return this;
            }
        });
    }
);
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/jobstatus/buttons/ExportResultsDialog',
        'bootstrap.tooltip'
    ],
    function($, _, module, Base, ExportDialog) {
        return Base.extend({
            moduleId: module.id,
            className: 'export btn-pill btn-square',
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                this.$el.html('<i class="icon-export"></i><span class="hide-text">' + _("Export").t() + '</span>');
                this.$el.tooltip({animation:false, title:_('Export').t(), container: this.$el});
                this.activate();
            },
            startListening: function() {
                this.listenTo(this.model.searchJob.entry.content, 'change:dispatchState', _.debounce(this.enableDisable, 0));
            },
            events: {
                'click': function(e) {
                    if(!this.$el.hasClass('disabled')) {
                        this.children.exportDialog = new ExportDialog({
                            model: {
                                searchJob: this.model.searchJob,
                                application: this.model.application,
                                report: this.model.report,
                                reportPristine: this.model.reportPristine
                            },
                            verifyJobExistsExport: this.options.verifyJobExistsExport,
                            onHiddenRemove: true
                        });

                        this.children.exportDialog.render().appendTo($("body"));
                        this.children.exportDialog.show();
                    }
                    e.preventDefault();
                }
            },
            enableDisable: function() {
                if (!this.model.searchJob.isDone()) {
                    this.$el.tooltip('hide');
                    this.$el.data('tooltip', false);
                    this.$el.tooltip({animation:false, title:_('Export - You can only export results for completed jobs.').t(), container: this.$el});
                    this.$el.addClass('disabled');
                } else {
                    this.$el.tooltip('hide');
                    this.$el.data('tooltip', false);
                    this.$el.tooltip({animation:false, title:_('Export').t(), container: this.$el});
                    this.$el.removeClass('disabled');
                }
            },
            render: function() {
                this.enableDisable();
                return this;
            }
        });
    }
);

define(
    [
        'jquery',
        'module',
        'views/Base',
        'views/shared/jobstatus/buttons/ShareButton',
        'views/shared/jobstatus/buttons/ExportButton',
        'views/shared/jobstatus/buttons/PrintButton',
        'views/shared/JobNotFoundModal'
    ],
    function(
        $,
        module,
        Base,
        ShareButton,
        ExportButton,
        PrintButton,
        JobNotFound
    ) {
        /**
         * View Hierarchy:
         *
         * Share
         * Export
         * Print
         */
        return Base.extend({
            moduleId: module.id,
            className: 'pull-left export-print-group',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.showExportResultsButton = this.model.user.canExportResults();

                //Share
                this.children.shareButton = new ShareButton({
                    model: {
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        report: this.model.report,
                        serverInfo: this.model.serverInfo
                    },
                    externalJobLinkPage: this.options.externalJobLinkPage
                });

                if (this.showExportResultsButton) {
                    //Export
                    this.children.exportButton = new ExportButton({
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            report: this.model.report,
                            reportPristine: this.model.reportPristine
                        },
                        verifyJobExistsExport: this.options.verifyJobExistsExport
                    });
                }

                //Print
                if (!this.options.hidePrintButton) {
                    this.children.printButton = new PrintButton();
                }

                this.activate();
            },
            
            startListening: function() {
                this.listenTo(this.model.searchJob, 'jobStatus:notFound', function(options) {
                    options = options || {};
                    this.children.jobNotFound = new JobNotFound({
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application
                        },
                        title: options.title,
                        onHiddenRemove: true
                    });
                    
                    this.children.jobNotFound.render().appendTo($("body"));
                    this.children.jobNotFound.show();
                });
            },
            
            render: function() {
                this.children.shareButton.render().appendTo(this.$el);
                
                if (!this.options.hidePrintButton) {
                    this.children.printButton.render().appendTo(this.$el);
                }
                
                if (this.showExportResultsButton) {
                    this.children.exportButton.render().appendTo(this.$el);
                }
                
                return this;
            }
        });
    }
);

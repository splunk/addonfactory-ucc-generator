define(
    [
        'module',
        'views/Base',
        'views/search/actions/LiveTail',
        'views/search/actions/SaveReport',
        'views/search/actions/savemenu/Master',
        'views/search/actions/View',
        'views/search/actions/Close',
        'views/search/actions/CreateTable',
        'util/splunkd_utils'
    ],
    function(
        module,
        Base,
        LiveTail,
        SaveReport,
        SaveControls,
        View,
        Close,
        CreateTable,
        splunkd_utils
    ) {
        /**
         * View Hierarchy:
         * Save (Report)
         *
         * Save As Controls +
         *      As Report
         *      As Dashboard Panel
         *      As Alert
         *      As EventType
         *
         * View
         * Close
         */
        return Base.extend({
            moduleId: module.id,
            className: 'document-controls',

            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.errorTypes = [splunkd_utils.FATAL, splunkd_utils.ERROR, splunkd_utils.NOT_FOUND, splunkd_utils.RISKY_COMMAND];
                this.canLiveTail = this.model.user.canLiveTail() &&
                                    this.model.uiPrefs &&
                                    this.model.uiPrefs.entry.content.get('display.prefs.livetail') === '1';

                if (this.canLiveTail) {
                    // live tail
                    this.children.liveTail = new LiveTail({
                        model:  {
                            report: this.model.report,
                            application: this.model.application,
                            searchJob: this.model.searchJob,
                            user: this.model.user,
                            serverInfo: this.model.serverInfo
                        },
                        searchString: this.model.report.entry.content.get("search") || ''
                    });
                }

                // Save Report button
                this.children.saveReport = new SaveReport({
                    model:  {
                        report: this.model.report,
                        reportPristine: this.model.reportPristine,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        user: this.model.user
                    }
                });

                // Save As Controls (dropdown menu)
                this.children.saveControls = new SaveControls({
                    model: {
                        report: this.model.report,
                        reportPristine: this.model.reportPristine,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        serverInfo: this.model.serverInfo
                    },
                    collection: {
                        times: this.collection.times
                    }
                });
                
                this.children.createTable = new CreateTable({
                    model: {
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application,
                        tableAST: this.model.tableAST
                    }
                });

                this.children.view = new View({
                    model: {
                        report: this.model.report,
                        reportPristine: this.model.reportPristine,
                        application: this.model.application,
                        searchJob: this.model.searchJob,
                        user: this.model.user
                    }
                });

                this.children.close = new Close({
                    model: {
                        report: this.model.report,
                        application: this.model.application
                    }
                });
            },

            render: function() {
                var search = this.model.report.entry.content.get("search");
                
                this.$el.html(this.template);

                var isError = splunkd_utils.messagesContainsOneOfTypes(this.model.report.error.get("messages"), this.errorTypes) ||
                        splunkd_utils.messagesContainsOneOfTypes(this.model.searchJob.error.get("messages"), this.errorTypes),
                        $btnGroup = this.$el;

                if ((!this.model.report.isNew() || search) && !isError && this.canLiveTail) {
                    this.children.liveTail.render().appendTo($btnGroup);
                }

                if (!this.model.report.isNew() && !isError) {
                    this.children.saveReport.render().prependTo(this.$el);
                }

                if ((!this.model.report.isNew() || search) && !isError) {
                    this.children.saveControls.render().appendTo($btnGroup);
                }

                if (!this.model.report.isNew() && !isError) {
                    this.children.view.render().appendTo($btnGroup);
                }
                
                if (this.model.user.canAccessSplunkDatasetExtensions() && ((!this.model.report.isNew() || search) && !isError)) {
                    this.children.createTable.render().appendTo($btnGroup);
                }

                if (!this.model.report.isNew() || search || isError) {
                    this.children.close.render().appendTo($btnGroup);
                }
                
                return this;
            },

            template: ''
        });
    }
);

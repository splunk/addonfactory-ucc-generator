define([
            'underscore',
            'module',
            'models/classicurl',
            'models/shared/Application',
            'models/shared/User',
            'models/pivot/PivotJob',
            'models/pivot/PivotReport',
            'models/pivot/PivotSearch',
            'models/services/AppLocal',
            'models/services/datamodel/DataModel',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'views/shared/jobstatus/Master',
            'uri/route',
            'bootstrap.tooltip'
        ],
        function(
            _,
            module,
            classicurl,
            Application,
            User,
            PivotJob,
            PivotReport,
            PivotSearch,
            AppLocal,
            DataModel,
            DeclarativeDependencies,
            Base,
            JobstatusMaster,
            route
            //tooltip
        ) {

    var JobActionBar = Base.extend({

        moduleId: module.id,

        events: {
            'click a.disabled': function(e) {
                e.preventDefault();
            },
            'click .export-button:not(.disabled)': function(e) {
                e.preventDefault();
                this.model.searchJob.trigger('export');
            },
            'click .print-button:not(.disabled)': function(e) {
                e.preventDefault();
                this.model.searchJob.trigger('print');
            },
            'click .share-button:not(.disabled)': function(e) {
                e.preventDefault();
                this.model.searchJob.trigger('share');
            },
            'click .inspect-button:not(.disabled)': function(e) {
                this.model.searchJob.trigger('inspect');
                e.preventDefault();
            }
        },

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         application: <models.shared.Application> the application model
         *         report: <models.pivot.PivotReport> the pivot report
         *         searchJob: <models.pivot.PivotJob> the current pivot job
         *         dataModel: <models.services.datamodel.DataModel> the current data model
         *         appLocal <models.services.AppLocal> the local splunk app
         *         pivotSearch <models.pivot.PivotSearch> the current pivot query,
         *         user: <models.services.admin.User> the user model
         *     }
         */

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            
            this.showExportResultsButton = this.model.user.canExportResults();

            this.children.jobstatus = new JobstatusMaster({
                enableSearchMode: false,
                enableSamplingMode: false,
                // reload button is only enabled for managed acceleration
                enableReload: this.model.searchJob.getAccelerationType() === PivotJob.MANAGED_ACCELERATION,
                showJobButtons: false,
                showJobMenu: false,
                model: {
                    application: this.model.application,
                    state: this.model.report.entry.content,
                    searchJob: this.model.searchJob,
                    appLocal: this.model.appLocal
                }
            });

            this.model.report.entry.content.on('change', _.debounce(this.updateOpenInSearch, 0), this);
            // our usage of the job status bar sometimes leaves space for a hidden spinner, fix that here
            this.model.searchJob.entry.content.on('change', function(jobContent) {
                if(jobContent.get('isDone') || jobContent.get('isPaused')) {
                    this.children.jobstatus.children.progress.$el.hide();
                }
                if(jobContent.get('isDone')) {
                    this.$('.export-button').removeClass('disabled');
                }
            }, this);
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
                showInspectButton: this.model.searchJob.getAccelerationType() === PivotJob.MANAGED_ACCELERATION,
                enableExport: this.model.searchJob.isDone(),
                showExportResultsButton: this.showExportResultsButton
            }));
            this.children.jobstatus.render().appendTo(this.$('.jobstatus-wrapper'));
            this.$('> .action-bar > a').tooltip({animation:false, container: 'body'});
            
            this.updateOpenInSearch();
            return this;
        },

        remove: function() {
            this.$('> .action-bar > a').tooltip({animation:false, container: 'body'});
            return Base.prototype.remove.apply(this, arguments);
        },

        updateOpenInSearch: function() {
            var reportContent = this.model.report.entry.content;

            if(!reportContent.has('search')) {
                return;
            }

            var $openInSearchButton = this.$('.open-in-search-button'),
                root = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                app = this.model.application.get('app'),
                urlAttrFilter = ['^(q|earliest|latest)$'].concat(PivotReport.REPORT_FORMAT_FILTER),
                qsArgs = classicurl.filterByWildcards(urlAttrFilter);

            if(this.model.dataModel.isTemporary()) {
                qsArgs.q = this.model.pivotSearch.get('openInSearch');
            }

            $openInSearchButton.attr('href', route.search(root, locale, app, { data: qsArgs })).removeClass('disabled');
        },

        template: '\
            <div class="action-bar pull-right">\
                <% if(showInspectButton) { %>\
                    <a href="#" class="inspect-button btn-pill btn-square" title="<%- _(\'Inspect\').t() %>">\
                        <i class="icon-info"></i><span class="hide-text"><%- _("Inspect").t() %></span>\
                    </a>\
                <% } %>\
                <a href="#" class="share-button btn-pill btn-square" title="<%- _(\'Share\').t() %>">\
                    <i class="icon-share"></i><span class="hide-text"><%- _("Share").t() %></span>\
                </a>\
                <% if (showExportResultsButton) { %>\
                    <a href="#" class="export-button btn-pill btn-square <%= enableExport ? \'\' : \'disabled\' %>" title="<%- _(\'Export\').t() %>">\
                        <i class="icon-export"></i><span class="hide-text"><%- _("Export").t() %></span>\
                    </a>\
                <% } %>\
                <a href="#" class="print-button btn-pill btn-square" title="<%- _(\'Print\').t() %>">\
                    <i class="icon-print"></i><span class="hide-text"><%- _("Print").t() %></span>\
                </a>\
                <a href="#" class="open-in-search-button btn-pill btn-square disabled" title="<%- _(\'Open in Search\').t() %>">\
                    <i class="icon-search"></i><span class="hide-text"><%- _("Open in Search").t() %></span>\
                </a>\
            </div>\
            <div class="jobstatus-wrapper <%- showInspectButton ? \'with-inspect-button\' : \'\' %>"></div>\
        '

    },
    {
        apiDependencies: {
            searchJob: PivotJob,
            report: PivotReport,
            application: Application,
            appLocal: AppLocal,
            dataModel: DataModel,
            pivotSearch: PivotSearch,
            user: User
        }
    });

    return DeclarativeDependencies(JobActionBar);

});
define([
            'underscore',
            'module',
            'models/shared/Application',
            'models/search/Job',
            'models/services/datamodel/DataModel',
            'models/pivot/PivotReport',
            'models/pivot/datatable/PivotableDataTable',
            'views/extensions/DeclarativeDependencies',
            'views/Base',
            'uri/route',
            'util/datamodel/acceleration_utils',
            'models/classicurl'
        ],
        function(
            _,
            module,
            Application,
            Job,
            DataModel,
            PivotReport,
            PivotableDataTable,
            DeclarativeDependencies,
            Base,
            route,
            accelerationUtils,
            classicUrl
        ) {

    var LOADING_MESSAGE = _('Loading').t();

    var DataSourceMenu = Base.extend({

        moduleId: module.id,
        className: 'data-source-menu dropdown-menu',

        events: {
            'click .rebuild-button': function(e) {
                this.model.searchJob.trigger('rebuildAcceleration');
                e.preventDefault();
            },
            'click .inspect-acceleration-button': function(e) {
                this.model.searchJob.trigger('inspectAcceleration');
                e.preventDefault();
            }
        },

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         application: <models/shared/Application> the application state model
         *         report: <models/pivot/PivotReport> the pivot report
         *         dataModel: <models/services/datamodel/DataModel> the data model being reported on
         *         searchJob: <models/pivot/PivotJob> the current pivot job
         *         collectJob: <models/search/Job> only defined if the pivot job is in adhoc acceleration mode,
         *                                  the collect job that is populating the acceleration namespace
         *         tstatsSummarization <models/services/summarization/TStatsSummarization>
         *                                  only defined if the pivot job is in managed acceleration model,
         *                                  the summarization info for the job's namespace
         *     }
         * }
         */

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            if(this.model.collectJob) {
                this.model.collectJob.on('sync', this.updateAdhocAcceleration, this);
            }
            else if(this.model.tstatsSummarization) {
                this.model.tstatsSummarization.on('sync', this.updateManagedAcceleration, this);
            }
        },

        render: function() {
            // Background info for the logic here.  There will always be a data model representation of the data table,
            // but it can either be a real data model that exists in the back end, or a generated data model for the
            // purposes of pivot.  Additionally, a generated data model can either be based on a different back end
            // object (e.g. a dataset), or can be a purely temporary construct.
            var root = this.model.application.get('root'),
                app = this.model.application.get('app'),
                locale = this.model.application.get('locale'),
                tableHasRealDataModel = this.model.dataTable.hasParentDataModel(),
                dataModelId = tableHasRealDataModel ? this.model.dataTable.getDataModelId() : null,
                dataModelName = tableHasRealDataModel ? this.model.dataTable.getDataModelName() : null,
                tableName = this.model.dataTable.get('displayName'),
                tableIsTemporary = this.model.dataModel.isTemporary(),
                viewDataModelHref = tableHasRealDataModel ?
                    route.pivot(root, locale, app, { data: { model: dataModelId } }) :
                    null,
                selectNewDatasetHref = route.datasets(root, locale, app);

            this.$el.html(this.compiledTemplate({
                tableHasRealDataModel: tableHasRealDataModel,
                dataModelName: dataModelName,
                tableName: tableName,
                tableIsTemporary: tableIsTemporary,
                viewDataModelHref: viewDataModelHref,
                selectNewDatasetHref: selectNewDatasetHref
            }));

            if(this.model.collectJob) {
                this.updateAdhocAcceleration();
            }
            else if(this.model.tstatsSummarization) {
                this.updateManagedAcceleration();
            }
            else {
                this.$('.acceleration-status-container').remove();
            }

            this.$("a.view-data-model-button").click(function(e) {
                e.preventDefault();
                classicUrl.clear().save({ model: dataModelId }, { trigger: true });
            });

            return this;
        },

        updateAdhocAcceleration: function() {
            var entry = this.model.collectJob.entry,
                content = entry.content,
                latestTime = this.model.collectJob.latestTimeSafe();

            this.$('.acceleration-status-container').html(_(this.adhocAccelerationTemplate).template({
                progressMessage: accelerationUtils.formatProgressMessage(content.get('doneProgress'), latestTime) || LOADING_MESSAGE,
                startedTimestamp: accelerationUtils.formatTimestamp(entry.get('published')) || LOADING_MESSAGE,
                earliestTimestamp: accelerationUtils.formatTimestamp(content.get('earliestTime')) || LOADING_MESSAGE
            }));
        },

        updateManagedAcceleration: function() {
            var content = this.model.tstatsSummarization.entry.content;
            this.$('.acceleration-status-container').html(_(this.managedAccelerationTemplate).template({
                statusMessage: accelerationUtils.formatProgressMessage(content.get('summary.complete')) || LOADING_MESSAGE,
                range: accelerationUtils.formatRange(content.get('summary.time_range')) || LOADING_MESSAGE,
                earliestTimestamp: accelerationUtils.formatTimestamp(content.get('summary.earliest_time')) || LOADING_MESSAGE
            }));
        },

        template: '\
            <div class="arrow"></div>\
            <% if (!tableIsTemporary) { %>\
                <% if (tableHasRealDataModel) { %>\
                    <ul>\
                        <li>\
                            <h4><%- dataModelName %></h4>\
                        </li>\
                        <li>\
                            <a class="view-data-model-button" href="<%- viewDataModelHref %>"><%- _("View Data Model").t() %></a>\
                        </li>\
                    </ul>\
                <% } %>\
                <ul>\
                    <li>\
                        <h4><%- tableName %></h4>\
                    </li>\
                    <li>\
                        <a href="<%- selectNewDatasetHref %>"><%- _("Select another Dataset").t() %></a>\
                    </li>\
                </ul>\
            <% } %>\
            <ul class="acceleration-status-container"></ul>\
        ',

        adhocAccelerationTemplate: '\
            <li>\
                <h4><%- _("Acceleration").t() %></h4>\
                <dl class="list-dotted">\
                    <dt><%- _("Progress").t() %></dt>\
                    <dd class="status-value"><%- progressMessage %></dd>\
                    <dt><%- _("Started").t() %></dt>\
                    <dd class="started-timestamp"><%- startedTimestamp %></dd>\
                    <dt><%- _("Earliest").t() %></dt>\
                    <dd class="latest-timestamp"><%- earliestTimestamp %></dd>\
                </dl>\
            </li>\
            <li><a href="#" class="rebuild-button"><%- _("Rebuild Acceleration").t() %></a></li>\
            <li><a href="#" class="inspect-acceleration-button"><%- _("Inspect Acceleration Job").t() %></a></li>\
        ',

        managedAccelerationTemplate: '\
            <li>\
                <h4><%- _("Acceleration").t() %></h4>\
                <dl class="list-dotted">\
                    <dt><%- _("Status").t() %></dt>\
                    <dd class="progress-value"><%- statusMessage %></dd>\
                    <dt><%- _("Range").t() %></dt>\
                    <dd class="range-value"><%- range %></dd>\
                    <dt><%- _("Earliest").t() %></dt>\
                    <dd class="latest-timestamp"><%- earliestTimestamp %></dd>\
                </dl>\
            </li>\
        '

    },
    {
        apiDependencies: {
            report: PivotReport,
            dataModel: DataModel,
            dataTable: PivotableDataTable,
            application: Application,
            searchJob: Job
        }
    });

    return DeclarativeDependencies(DataSourceMenu);

});

/**
 * @author sfishel
 *
 * The master view for the control bar above a statistical results table
 *
 * Child Views:
 *
 * formattingControls <views/shared/statscontrols/StatsFormattingControls> a set of control views that allow for updating the table format options
 * paginator <views/shared/SearchResultsPaginator> pagination controls
 */

define([
            'backbone',
            'module',
            'models/search/Job',
            'views/Base',
            './StatsFormattingControls',
            'views/shared/SearchResultsPaginator'
        ],
        function(
            Backbone,
            module,
            Job,
            BaseView,
            FormattingControls,
            Paginator
        ) {

    return BaseView.extend({

        moduleId: module.id,

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *         report <models/pivot/PivotReport> the report model
         *         job <models/search/Job.js> the search job generating the results (used by the paginator for total count)
         *         application <models/shared/Application.js> the application model
         *         user <models/shared/User> the user model
         *     }
         * }
         */

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            this.children.formattingControls = new FormattingControls({
                model: {
                    report: this.model.report,
                    application: this.model.application,
                    user: this.model.user
                },
                leftOffset: this.options.leftOffset || 0
            });

           this.children.paginator = new Paginator({
               mode: 'results_preview',
               model: {
                   state: this.model.report.entry.content,
                   searchJob: this.model.job
               },
               countKey: 'display.prefs.statistics.count',
               offsetKey: 'display.prefs.statistics.offset'
            });
        },

        render: function() {
            this.$el.append(this.children.formattingControls.render().el);
            this.$el.append(this.children.paginator.render().el);
            return this;
        }

    });

});
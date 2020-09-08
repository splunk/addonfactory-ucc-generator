import $ from 'jquery';
import _ from 'underscore';
import JobModel from 'models/search/Job';
import JobDispatchState from 'views/shared/JobDispatchState';

export default JobDispatchState.extend({
    moduleId: module.id,
    /**
      * @param {Object} options
      * @param {Backbone.Model} options.model The model to operate on
      * @param {String} options.mode The mode attribute is used to determine what attribute on the
      * search job should be used for resultCount. Values can be
      * events/results/results_preview/auto. Defaults to events.
      * @param {Object} options.jobDispatchStateMsgs Optional object to pass in
      * custom messages/functions for each job dispatch state.
      * @param {Object/String} options.jobDispatchStateMsgs.STATUS.msg Required attribute if
      * jobDispatchStateMsgs is provided.
      * @param {Boolean} options.jobDispatchStateMsgs.STATUS.escape Optional attribute to specify
      * if message should be escaped. Default value is true.
      *
      * This view extends views/shared/jobDispatchState and overrides the job dispatch messages
      * specific to the search views.
      */
    initialize(options, ...rest) {
        const defaults = {
            jobDispatchStateMsgs: {
                [JobModel.DONE]: {
                    msg: this.getDoneStateMessage.bind(this),
                },
            },
            mode: 'events',
        };
        /*
         * Here we are overriding the options before initializing the prototype because the
         * prototype's initialize calls activate and that requires 'jobDispatchStateMsgs' to be set.
         */
        this.options = $.extend(true, {}, defaults, (this.options || {}));
        JobDispatchState.prototype.initialize.call(this, options, ...rest);
    },
    /**
     * Custom function for 'DONE' job dispatch state message to determine
     * where to show increase time range suggestion
     * @returns {String} The job dispatch state message
     */
    getDoneStateMessage() {
        /*
         * Do not show 'Try expanding time range.' when :
         * - Search is over All time.
         * - Search is realtime.
         * - Search has no events but has results (in events tab) or
         *   Search has events but no results (in the Statistics or Visualization tab).
         */
        const eventModeCondition = (this.options.mode === 'events' &&
            this.model.searchJob.isUneventfulReportSearch());
        const resultModeCondition = (this.options.mode === 'results' ||
            this.options.mode === 'results_preview') &&
            (this.model.searchJob.entry.content.get('eventCount') > 0);
        if (this.model.searchJob.isOverAllTime() || this.model.searchJob.isRealtime() ||
            eventModeCondition || resultModeCondition) {
            return _('No results found.').t();
        }
        return _('No results found. Try expanding the time range.').t();
    },
});
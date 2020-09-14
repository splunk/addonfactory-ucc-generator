define(
    [
        'module',
        'jquery',
        'underscore',
        'backbone',
        'views/dashboard/Base',
        'splunk.util',
        'splunk.config',
        'models/search/Job',
        'views/shared/ProgressBar'
    ],
    function(module,
             $,
             _,
             Backbone,
             BaseDashboardView,
             SplunkUtil,
             splunkConfig,
             SearchJobModel,
             ProgressBar
         ) {

        return BaseDashboardView.extend({
            moduleId: module.id,
            className: 'splunk-progressbar',
            initialize: function(options) {
                BaseDashboardView.prototype.initialize.apply(this, arguments);
                this.bindToComponentSetting('managerid', this.onManagerChange, this);
                this.model = _.extend({ jobState: new Backbone.Model() }, this.model);
                var debouncedRender = _.debounce(this.render);
                this.model.jobState.on('change', debouncedRender, this);
                this.model.searchJob = new SearchJobModel();
                this.children.progressBar = new ProgressBar({
                    model: this.model.searchJob,
                    animateRealTime: false
                });
            },
            onManagerChange: function(ctxs, ctx) {
                if (this.manager) {
                    this.manager.off(null, null, this);
                }
                this.manager = ctx;
                if (!ctx) {
                    return;
                }
                this.model.jobState.clear();
                this.manager.on("search:start", this.onSearchStart, this);
                this.manager.on("search:progress search:done", this.onSearchProgress, this);
                this.manager.on("search:error", this.onSearchFail, this);
                this.manager.on("search:fail", this.onSearchFail, this);
                this.manager.on("search:cancelled", this.onSearchCancelled, this);
                this.manager.replayLastSearchEvent(this);
            },
            onSearchStart: function() {
                var sid = this.manager.getSid();
                this.model.searchJob.set("id", sid);
                this.model.jobState.set({ progress: true });
            },
            onSearchProgress: function(properties) {
                var content = properties.content || {};

                // Pass this progress event if we are not showing progress and
                // the job is not done.
                if (!this._shouldShowProgress() && !content.isDone) {
                    return;
                }

                this.model.searchJob.setFromSplunkD({ entry: [properties] });
                var dispatchState = content.dispatchState;

                if (dispatchState === undefined) {
                    this.model.jobState.clear();
                } else if (dispatchState === 'FAILED') {
                    this.model.jobState.clear();
                } else {

                    if (content.dispatchState === 'DONE') {
                        this.model.jobState.clear();
                    } else if (!this.manager.isRefresh()) {
                        this.model.jobState.set({
                            progress: true
                        });
                    }
                }
            },
            onSearchFail: function() {
                this.model.jobState.clear();
            },
            onSearchCancelled: function() {
                this.model.jobState.clear();
            },
            _shouldShowProgress: function() {
                var refreshDisplay = this.model.report.entry.content.get('dashboard.element.refresh.display');
                return refreshDisplay === 'none' ? !this.manager.isRefresh() : true;
            },
            render: function() {
                if (this.model.jobState.has('progress') && this.$el.is(':empty')) {
                    this.children.progressBar.render().prependTo(this.$el);
                }
                return this;
            },
            remove: function() {
                _(this.children).invoke('remove');
                _(this.model).invoke('off');
                if(this.manager) {
                    this.manager.off(null, null, this);
                }
                return BaseDashboardView.prototype.remove.call(this);
            }
        });
    }
);

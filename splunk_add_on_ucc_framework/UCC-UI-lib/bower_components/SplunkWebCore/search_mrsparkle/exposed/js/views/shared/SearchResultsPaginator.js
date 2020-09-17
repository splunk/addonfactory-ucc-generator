define([
            'jquery',
            'underscore',
            'contrib/text!views/shared/Paginator.html',
            'splunk.paginator',
            'module',
            'views/Base',
            'bootstrap.tooltip'
        ],
        function(
            $,
            _,
            template,
            splunkPaginator,
            module,
            Base,
            bootstrapTooltip
        ) {

    /**
     * Paginate twice it's a long way to the bay!
     */
    return Base.extend({
        className: 'pagination',
        template: template,
        moduleId: module.id,
        initialize: function(options) {
            Base.prototype.initialize.apply(this, arguments);
            this.maxPerPage = this.options.maxPerPage || 10;
            this.maxPages = this.options.maxPages || 10;
            this.offset = this.options.offset || 0;
            this.offsetKey = this.options.offsetKey || 'offset';
            this.countKey = this.options.countKey || 'count';
            this.timelineEarliestTimeKey = this.options.timelineEarliestTimeKey || 'display.events.timelineEarliestTime';
            this.timelineLatestTimeKey = this.options.timelineLatestTimeKey || 'display.events.timelineLatestTime';
            this.mode = this.options.mode || 'events'; //events || results || results_preview

            this.activate({noRender: true});
        },
        startListening: function() {
            this.listenTo(this.model.state, 'change:' + this.offsetKey, this.debouncedRender);
            this.listenTo(this.model.state, ' change:' + this.countKey, function() {
                this.model.state.set(this.offsetKey, 0);
                this.debouncedRender;
            });
            switch (this.mode) {
                case 'results_preview':
                    this.listenTo(this.model.searchJob.entry.content, 'change:resultPreviewCount', this.render);
                    if (this.model.results) {
                        this.listenTo(this.model.results, 'change:post_process_count', this.render);
                    }
                    break;
                case 'results':
                    this.listenTo(this.model.searchJob.entry.content, 'change:resultCount', this.render);
                    if (this.model.results) {
                        this.listenTo(this.model.results, 'change:post_process_count', this.render);
                    }
                    break;
                case 'events':
                    if (this.model.timeline && this.model.timeline.buckets) {
                        this.listenTo(this.model.timeline.buckets, 'reset', this.render);
                    }
                    this.listenTo(this.model.state, 'change:' + this.timelineEarliestTimeKey + ' change:' + this.timelineLatestTimeKey, this.render);
                    this.listenTo(this.model.searchJob.entry.content, 'change:eventAvailableCount change:eventCount', this.render);
                    break;
                default:
                    throw 'invalid mode';
            }
        },
        activate: function(options) {
            options || (options = {});
            if (this.active) {
                return Base.prototype.activate.apply(this, arguments);
            }
            
            //force a render to ensure we are in a proper state
            if (!options.noRender) {
                this.render();
            }

            return Base.prototype.activate.apply(this, arguments);
        },
        getResultsLength: function(countFieldName) {
            var length;
            if (this.model.results && _.isNumber(this.model.results.get("post_process_count"))) {
                length = this.model.results.get("post_process_count");
            }
            else {
                length = this.model.searchJob.entry.content.get(countFieldName);
            }
            return length;
        },

        events: {
            'click li:not(.disabled) a': function(e) {
                this.model.state.set(this.offsetKey, $(e.currentTarget).attr('data-offset'));
                e.preventDefault();
            }
        },
        render: function() {
            var length, timelineEarliestTime, timelineLatestTime, truncated;
            if (this.mode==='events') {
                timelineEarliestTime = this.model.state.get(this.timelineEarliestTimeKey);
                timelineLatestTime = this.model.state.get(this.timelineLatestTimeKey);
                if (this.model.searchJob.entry.content.get('statusBuckets') > 0 && timelineEarliestTime && timelineLatestTime) {
                    var ac_info = this.model.timeline.availableCount(timelineEarliestTime, timelineLatestTime);
                    length = ac_info.length;
                    truncated = ac_info.trunc;
                } else {
                    truncated = this.model.searchJob.entry.content.get('eventAvailableCount') < this.model.searchJob.entry.content.get('eventCount');
                    length = this.model.searchJob.entry.content.get('eventAvailableCount');
                }
            }
            if (this.mode==='results') {
                length = this.getResultsLength('resultCount');
            }
            if (this.mode=='results_preview') {
                length = this.getResultsLength('resultPreviewCount');
            }

            var options = {
                    max_items_page: this.model.state.get(this.countKey) || this.maxPerPage,
                    max_pages: this.maxPages,
                    item_offset: this.model.state.get(this.offsetKey) || this.offset
                },
                paginator = new splunkPaginator.Google(length || 0, options),
                template = this.compiledTemplate({
                    paginator: paginator,
                    pageListMode: this.options.pageListMode,
                    truncated: truncated,
                    _: _
                });

            /**
             * Correct the length value to round up to the nearest full page
             * -------------------------------------------------------------
             * e.g. 89 -> 100 when it is set to 20 results per page
             *
             */
            length = Math.ceil(length / options.max_items_page) * options.max_items_page;
            
            this.$el.html(template);
            this.$('.max-events-per-bucket span').tooltip({animation: false, title: 'Currently displaying the most recent ' +  length + ' events in the selected range.  Select a narrower range or zoom in to see more events.'});

            if (this.options.pageListMode === 'compact') {
                this.$el.addClass('pagination-compact');
            } else {
                this.$el.addClass('pull-right');
            }

            return this;
        }
    });

});

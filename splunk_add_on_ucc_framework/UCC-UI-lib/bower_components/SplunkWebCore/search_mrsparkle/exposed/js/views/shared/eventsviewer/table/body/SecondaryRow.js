 define(
    [
        'jquery',
        'module',
        'underscore',
        'views/Base',
        'views/shared/eventsviewer/shared/EventFields',
        'views/shared/eventsviewer/shared/RawField',
        'splunk.util',
        'util/keyboard'
    ],
    function($, module, _, BaseView, EventFields, RawField, util, keyboard) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tr',
            className: 'field-row tabbable-table-secondary-row',
            attributes: {
                tabindex: -1
            },
            /**
             * @param {Object} options {
             *      model: {
             *         result: <models.services.search.job.ResultsV2>,
             *         event: <models.services.search.job.ResultsV2.result[i]>,
             *         summary: <model.services.search.job.SummaryV2>
             *         state: <models.Base>,
             *         application: <models.Application>
             *     }
             *     collection: {
             *         selectedFields: <collections.SelectedFields>
             *         workflowActions: <collections.services.data.ui.WorkflowActions> 
             *     },
             *     selectableFields: true|false
             * } 
             */
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
                this.$el.addClass((!!(this.options.idx%2))?'even':'odd');
                
                this.showAllLines = 's' + this.options.idx;
                
                this.children.eventFields = new EventFields({
                    model: { 
                        event: this.model.event,
                        report: this.model.report,
                        summary: this.model.summary,
                        result: this.model.result,
                        state: this.model.state,
                        application: this.model.application,
                        searchJob: this.model.searchJob
                    },
                    collection: {
                        workflowActions: this.collection.workflowActions,
                        selectedFields: this.collection.selectedFields
                    },
                    selectableFields: this.options.selectableFields,
                    idx: this.options.idx,
                    clickFocus: 'tr.shared-eventsviewer-table-body-secondaryrow'
                });
                //event 
                this.children.raw = new RawField({
                    model: {
                        event: this.model.event,
                        state: this.model.state,
                        result: this.model.result,
                        report: this.model.report,
                        searchJob: this.model.searchJob,
                        application: this.model.application
                    },
                    segmentation: false,
                    idx: this.options.idx
                });

            },
            events: {
                'keydown': function(e) {
                    var keyCode = e.which;

                    if (keyCode === keyboard.KEYS.TAB && this.model.state.get('modalizedRow') === this.options.idx) {
                        keyboard.handleCircularTabbing([this.$el, this.$el.prev()], e);
                    }
                }
            },
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }
                
                BaseView.prototype.activate.apply(this, arguments);
                this.eventFetch();
                return this;
            },
            startListening: function() {                
                this.listenTo(this.model.result, 'tags-updated', function() { 
                    this.render(); 
                });
                
                this.listenTo(this.model.state, 'change:' + this.showAllLines, this.eventFetch);
                this.listenTo(this.model.report.entry.content, 'change:display.events.rowNumbers', this.render);
                this.listenTo(this.collection.selectedFields, 'reset add remove', function() {
                    this.$('.event').attr('colspan', this.model.event.keys().length);
                });            
            },
            eventFetch: function(showAll) {
                var postProcessSearch = '',
                    sortingSearch = this.model.report.getSortingSearch();
                if (this.model.report.entry.content.get('display.general.search.type') === 'postprocess') {
                    postProcessSearch = (this.model.report.entry.content.get('display.general.search.postProcessSearch') || '') + (sortingSearch || '');
                }
                this.model.event.set(this.model.event.idAttribute, this.model.searchJob.entry.links.get('events'));
                this.model.event.fetch({
                    data: $.extend(true, this.model.application.toJSON(), {
                        isRt: this.model.searchJob.isRealtime(),
                        search: postProcessSearch || sortingSearch,
                        earliest_time: this.model.report.entry.content.get('display.events.timelineEarliestTime'),
                        latest_time: this.model.report.entry.content.get('display.events.timelineLatestTime'),
                        segmentation:  'none',
                        max_lines: this.model.state.get(this.showAllLines) ? 0: this.model.report.getNearestMaxlines(),
                        offset: this.model.result.offset(this.options.idx) || 0
                    })     
                });
            },
            getCalculatedColSpan: function() {
                return this.collection.selectedFields.length + 1 +((util.normalizeBoolean(
                    this.model.report.entry.content.get("display.events.rowNumbers"))
                ) ? 1 : 0);
            
            },
            render: function() {
                var root = this.el;
                //rows are read only (innerHTML) for ie
                this.$el.find('> td').each(function(key, element) {
                    root.removeChild(element);
                });
                this.$el.append(this.compiledTemplate({
                    cspan: this.getCalculatedColSpan(), 
                    raw: this.model.event.getRawText()
                }));
                this.children.raw.render().appendTo(this.$('.event'));
                this.children.eventFields.render().appendTo(this.$('.event'));
                return this;
            },
            template: '\
                <td class="event" colspan="<%- cspan %>"></td>\
            '
        });
    }
);  

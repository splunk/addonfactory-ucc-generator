define(
    [
        'jquery',
        'underscore',
        'module',
        'models/Base',
        'models/services/search/jobs/Result',
        'models/services/search/IntentionsParser',
        'views/Base',
        'views/shared/eventsviewer/list/Master',
        'views/shared/eventsviewer/table/Master',
        'util/console',
        './Master.pcss'
    ],
    function($, _, module, BaseModel, ResultModel, IntentionsParser, BaseView, EventsListRawView, EventsTableView, console, css){
        var ROW_EXPAND_REX = /r\d+/;
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         result: <models.services.search.jobs.ResultsV2>,
             *         summary: <model.services.search.jobs.SummaryV2>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>,
             *         state: <models.BaseV2> (optional)
             *     },
             *     collection: {
             *         selectedFields: <collections.SelectedFields>
             *         workflowActions: <collections.services.data.ui.WorkflowActions>,
             *     },
             *     selectableFields: true|false,
             *     sortableFields: true|false (default true),
             *     headerMode: dock|static|none (default),
             *     headerOffset: integer (only applicable with headerMode=dock),
             *     allowRowExpand: true|false,
             *     allowModalize: true|false,
             *     showWarnings: true|false,
             *     highlightExtractedTime: true|false (caution: will disable segmentation/drilldown)
             * }
             */
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);

                this.options = $.extend(true, {
                    selectableFields: true,
                    sortableFields: true,
                    headerMode: 'dock',
                    headerOffset: 0,
                    allowRowExpand: true,
                    allowModalize: true,
                    showWarnings: false,
                    highlightExtractedTime: false,
                    scrollToTopOnPagination: false,
                    defaultDrilldown: true
                }, this.options);

                // highlightExtractedTime is used in listraw mode and will override
                // segmentation highlighting, aka drilldown. So should not use both.
                if (this.options.defaultDrilldown && this.options.highlightExtractedTime) {
                    console.warn('EventsViewer does not support defaultDrilldown and highlightExtractedTime');
                }

                this.rendered = {
                    listraw: false,
                    table: false
                };

                //CLONE RESULTS
                this.model._result = new ResultModel();
                if (!this.model.state) {
                    this.model.state = new BaseModel();
                    this.createdState = true;
                }
                this.model.listrawState = new BaseModel();
                this.model.tableState = new BaseModel();
                /*
                 * Due to mediation of info to/from the row level views regarding
                 * row expansion we need to store a rex that matches the structure
                 * of the rows expand key.
                 */
                this.model.tableState.ROW_EXPAND_REX = ROW_EXPAND_REX;
                if (!this.model.intentions) {
                    this.model.intentions = new IntentionsParser();
                    this.createdIntentions = true;
                }

                this.children.listraw = new EventsListRawView({
                    model: {
                        result: this.model._result,
                        summary: this.model.summary,
                        searchJob: this.model.searchJob,
                        report: this.model.report,
                        application: this.model.application,
                        state: this.model.listrawState
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    },
                    selectableFields: this.options.selectableFields,
                    headerMode: this.options.headerMode,
                    headerOffset: this.options.headerOffset,
                    allowRowExpand: this.options.allowRowExpand,
                    allowModalize: this.options.allowModalize,
                    showWarnings: this.options.showWarnings,
                    highlightExtractedTime: this.options.highlightExtractedTime,
                    clickFocus: 'tr.tabbable-list-row'
                });

                this.children.table = new EventsTableView({
                    model: {
                        result: this.model._result,
                        summary: this.model.summary,
                        searchJob: this.model.searchJob,
                        report: this.model.report,
                        application: this.model.application,
                        state: this.model.tableState
                    },
                    collection: {
                        selectedFields: this.collection.selectedFields,
                        workflowActions: this.collection.workflowActions
                    },
                    selectableFields: this.options.selectableFields,
                    sortableFields: this.options.sortableFields,
                    headerMode: this.options.headerMode,
                    headerOffset: this.options.headerOffset,
                    allowRowExpand: this.options.allowRowExpand,
                    allowModalize: this.options.allowModalize,
                    showWarnings: this.options.showWarnings
                });

                /*
                 * This is called in initialize purely for backwards compatibility. Eventually,
                 * this views activate should be slave to its parent invoking it.
                 */
                this.activate({stopRender: true});
            },
            startListening: function() {
                this.listenTo(this.model.result.results, 'reset', function() {
                    if (this.model.state.get('isModalized')) {
                        this.model.state.set('pendingRender', true);
                    } else {
                        var responseText = this.model.result.responseText ? JSON.parse(this.model.result.responseText) : {};
                        this.model._result.setFromSplunkD(responseText, {skipStoringResponseText: true});
                    }
                });

                /*
                 * A click on the docked controls needs to be mediated back
                 * down to unmodalize the table.
                 */
                this.listenTo(this.model.state, 'unmodalize', function() {
                    var key, state = this.getType() + 'State';

                    this.model[state].set('modalizedRow', false);

                    for (key in this.model[state].toJSON()) {
                        if (ROW_EXPAND_REX.test(key) && this.model[state].get(key)) {
                            this.model[state].set(key, false);
                            break;
                        }
                    }

                    this.handlePendingRender();
                });

                /*
                 * Proxy modalize state information up to the top-level state model
                 * to inform eventspane controls of the state change.
                 */
                this.listenTo(this.model.listrawState, 'change:isModalized', function(model, value) {
                    this.model.state.set('isModalized', value);
                });

                this.listenTo(this.model.tableState, 'change:isModalized', function(model, value) {
                    this.model.state.set('isModalized', value);
                });

                this.listenTo(this.model.state, 'change:isModalized', this.handlePendingRender);

                //Drilldown related handlers.....................
                if (this.createdIntentions) {
                    this.listenTo(this.model.intentions, 'change', function() {
                        var search = this.model.intentions.fullSearch();
                        this.model.state.trigger('unmodalize');
                        this.model.report.entry.content.set('search', search);
                    });
                }

                this.listenTo(this.model.tableState, 'drilldown', this.drilldownHandler);
                this.listenTo(this.model.listrawState, 'drilldown', this.drilldownHandler);

                this.listenTo(this.model.report.entry.content, 'change:display.events.type', function(model, value, options) {
                    var previousType = model.previousAttributes()['display.events.type'];
                    if (value === 'table' || previousType === 'table') {
                        this.manageStateOfChildren();
                    }
                });

                this.listenTo(this.model.state, 'change:fieldpicker', function() {
                    this.children.table && this.children.table.updateTableHead();
                });

                this.listenTo(this.model.report.entry.content, 'change:display.page.search.showFields', function() {
                    this.children.table.updateTableHead();
                    this.children.listraw.updateTableHead();
                });

                this.listenTo(this.model.report.entry.content, 'change:display.prefs.events.offset', function() {
                    if (this.options.scrollToTopOnPagination) {
                        var containerTop = this.$el.offset().top,
                            currentScrollPos = $(document).scrollTop(),
                            headerHeight = this.$el.children(':visible').find('thead:visible').height(),
                            eventControlsHeight = $('.events-controls-inner').height();
                        if (currentScrollPos > containerTop) {
                            $(document).scrollTop(containerTop - (headerHeight + eventControlsHeight));
                        }
                    }
                });
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;

                if (this.active) {
                    return BaseView.prototype.activate.call(this, clonedOptions);
                }

                this.model._result.setFromSplunkD(this.model.result.responseText ? JSON.parse(this.model.result.responseText) : {});

                BaseView.prototype.activate.call(this, clonedOptions);

                this.manageStateOfChildren(clonedOptions);

                return this;
            },
            deactivate: function(options) {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }

                //destroy the modalize state
                if (this.model.state.get('isModalized')){
                    this.model.state.trigger('unmodalize');
                    this.model.state.set('isModalized', false);
                }

                BaseView.prototype.deactivate.apply(this, arguments);

                //clear any stale attrs
                if (this.createdState) {
                    this.model.state.clear();
                }
                this.model._result.clear();
                if (this.createdIntentions) {
                    this.model.intentions.clear();
                }
                this.model.listrawState.clear();
                this.model.tableState.clear();
                return this;
            },
            drilldownHandler: function(drilldownInfo) {
                var drilldown = this.getDrilldownCallback(drilldownInfo.data, drilldownInfo.noFetch);

                if (this.options.defaultDrilldown) {
                    drilldown();
                }

                this.trigger('drilldown', drilldownInfo, drilldown);
            },
            getDrilldownCallback: function(data, noFetch) {
                var that = this;
                return function() {
                    if (noFetch) {
                        that.model.state.trigger('unmodalize');
                        that.model.report.entry.content.set(data);
                        return $.Deferred().resolve();
                    } else {
                        return that.model.intentions.fetch({ data: data });
                    }
                };
            },
            events: {
                'click .header-table-docked.disabled': function(e) {
                    this.model.state.trigger('unmodalize');
                    e.preventDefault();
                }
            },
            handlePendingRender: function() {
                if (this.model.state.get('pendingRender')) {
                    var responseText = this.model.result.responseText ? JSON.parse(this.model.result.responseText) : {};
                    this.model._result.setFromSplunkD(responseText, {clone: true});
                    this.model.state.set('pendingRender', false);
                }
            },
            getType: function() {
                var type = this.model.report.entry.content.get('display.events.type');
                return (type === 'table') ? 'table': 'listraw';
            },
            manageStateOfChildren: function(options) {
                options || (options = {});

                var type = this.getType();

                if(!options.stopRender) {
                    this._render(type);
                }

                switch (type) {
                    case 'listraw':
                        this.children.listraw.activate({deep: true}).$el.show();
                        this.children.table.deactivate({deep: true}).$el.hide();
                        break;
                    case 'table':
                        this.children.listraw.deactivate({deep: true}).$el.hide();
                        this.children.table.activate({deep: true}).$el.show();
                        break;
                    default:
                        this.children.listraw.deactivate({deep: true}).$el.hide();
                        this.children.table.deactivate({deep: true}).$el.hide();
                        break;
                }
            },
            updateTableHead: function() {
                this.children[this.getType()].updateTableHead();
            },
            updateContainerHeight: function(height) {
                // use this during 'static' header mode to update vertical scroll bars.
                // If no height argument set, this maxes out wrapper height to available window size
                this.children[this.getType()].updateContainerHeight(height);
            },
            _render: function(type) {
                if(!this.rendered[type]) {
                    this.children[type].render().appendTo(this.$el);
                    this.rendered[type] = true;
                }
            },
            render: function() {
                this._render(this.getType());
                return this;
            }
        });
    }
);

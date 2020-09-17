define(
    [
        'module',
        'underscore',
        'views/Base',
        'views/shared/eventsviewer/list/body/row/Master',
        'util/console'
    ],
    function(module, _, BaseView, Row, console){
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tbody',
            /**
             * @param {Object} options {
             *     model: {
             *         result: <models.services.search.job.ResultsV2>,
             *         summary: <model.services.search.job.SummaryV2>
             *         state: <models.BaseV2>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         application: <models.Application>
             *     },
             *     collection: {
             *         selectedFields: <collections.SelectedFields>,
             *         workflowActions: <collections.services.data.ui.WorkflowActions>
             *     },
             *     selectableFields: true|false,
             *     showWarnings: true|false,
             *     highlightExtractedTime: true|false (caution: will disable segmentation/drilldown)
             */
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);
            },
            startListening: function() {
                this.listenTo(this.model.result.results, 'reset', function() {
                    if (!this.model.state.get('isModalized')) {
                        this.debouncedCleanupAndRender();
                    }
                });
            },
            activate: function(options) {
                var clonedOptions = _.extend({}, (options || {}));
                delete clonedOptions.deep;
                
                if (this.active) {
                    return BaseView.prototype.activate.call(this, clonedOptions);
                }
                
                BaseView.prototype.activate.call(this, clonedOptions);
                
                this.synchronousCleanupAndDebouncedRender();
                
                return this;
            },
            synchronousCleanupAndDebouncedRender: function() {
                if (this.active) {
                    this.cleanup();
                    this.debouncedRender();
                }
            },
            debouncedCleanupAndRender: function() {
                if (!this._debouncedCleanupAndRender) {
                    this._debouncedCleanupAndRender = _.debounce(function() {
                        if (this.active) {
                            this.cleanup();
                            this.render();
                        }
                    }, 0);
                }
                this._debouncedCleanupAndRender.apply(this, arguments);
            },
            cleanup: function() {
                this.trigger('rows:pre-remove');
                this.eachChild(function(child){
                    child.deactivate({deep: true});
                    child.debouncedRemove({detach: true});
                }, this);
                this.children = {};
            },
            render: function() {
                if (_.isEmpty(this.children)) {
                    var fragment = document.createDocumentFragment(),
                        isRT = this.model.searchJob.entry.content.get('isRealTimeSearch'),
                        results = isRT ? this.model.result.results.reverse({mutate: false}) : this.model.result.results.models;
    
                    console.debug('Events Lister: rendering', results.length, 'events', isRT ? 'in real-time mode' : 'in historical mode');
                    _.each(results, function(event, idx) {
                        var lineNum,
                            id = 'row_' + idx;
                        if (isRT) {
                            lineNum = this.model.result.endOffset() - idx;
                        } else {
                            lineNum = this.model.result.get('init_offset') + idx + 1;
                        }
    
                        this.children[id] = new Row({ 
                            lineNum: lineNum,
                            model: {
                                state: this.model.state,
                                event: event,
                                result: this.model.result,
                                summary: this.model.summary,
                                report: this.model.report,
                                application: this.model.application,
                                searchJob: this.model.searchJob
                            },
                            collection: {
                                selectedFields: this.collection.selectedFields,
                                workflowActions: this.collection.workflowActions
                            },
                            idx: idx,
                            selectableFields: this.options.selectableFields,
                            allowRowExpand: this.options.allowRowExpand,
                            showWarnings: this.options.showWarnings,
                            highlightExtractedTime: this.options.highlightExtractedTime,
                            clickFocus: this.options.clickFocus
                        });
                        this.children[id].render().appendTo(fragment);
                        this.children[id].activate({deep:true});
                    }, this);
                    this.$el.append(fragment);
    
                    //bulk purge of remove mutex
                    _(this.model.state.toJSON()).each(function(value, key) {
                        if(key.indexOf('pendingRemove') === 0) {
                            this.model.state.unset(key);
                        }
                    },this);
                    
                    this.trigger('rows:added');
                }
                return this;
            }
        });
    }
);

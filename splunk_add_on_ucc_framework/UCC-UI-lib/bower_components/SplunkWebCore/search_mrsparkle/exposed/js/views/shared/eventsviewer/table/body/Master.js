define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/eventsviewer/table/body/PrimaryRow',
        'views/shared/eventsviewer/table/body/SecondaryRow',
        'util/console',
        'jquery.resize'
    ],
    function($, _, module, BaseView, PrimaryRow, SecondaryRow, console, jquery_resize){
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'tbody',
            /**
             * @param {Object} options {
             *     model: {
             *         result: <models.services.search.job.Results>,
             *         searchJob: <models.Job>,
             *         report: <models.services.SavedSearch>,
             *         summary: <model.services.search.job.Summary>,
             *         application: <models.Application>
             *     },
             *     collection: {
             *         selectedFields: <collections.SelectedFields>
             *         workflowActions: <collections.services.data.ui.WorkflowActions> 
             *     },
             *     selectableFields: true|false,
             *     showWarnings: true|false
             * } 
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            startListening: function() {
                this.listenTo(this.model.result.results, 'reset', this.debouncedCleanupAndRender);
                this.listenTo(this.collection.intersectedFields, 'reset', this.debouncedCleanupAndRender);
                this.listenTo(this.model.state, 'change', function(model, options) {
                    var key;
                    for (key in model.changed) {
                        //check if key changed matches row regex: r[idx]
                        var matchedKeys = this.model.state.ROW_EXPAND_REX.exec(key);
                        if (matchedKeys) {
                            var matchedKey = matchedKeys[0],
                                value, idx;

                                if (!this.model.state.has(matchedKey)) {
                                    break;
                                }

                                value = this.model.state.get(matchedKey);   
                                idx = /\d+/.exec(matchedKey);

                            if (value) {
                                this.children['fieldRow_' + idx].activate({deep: true}).$el.show();
                            } else {
                                this.children['fieldRow_' + idx].deactivate({deep: true}).$el.hide();
                            }
                            break;
                        }
                    }
                });
                this.$el.on('elementResize', function(e) {
                    this.invalidateReflow();
                }.bind(this));
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
            deactivate: function() {
                if (!this.active) {
                    return BaseView.prototype.deactivate.apply(this, arguments);
                }
                this.$el.off('elementResize');
                BaseView.prototype.deactivate.apply(this, arguments);
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
                        isRealTimeSearch = this.model.searchJob.entry.content.get('isRealTimeSearch'),
                        results = isRealTimeSearch ? this.model.result.results.reverse({mutate: false}) : this.model.result.results.models;
    
                    console.debug('Events Table: rendering', results.length, 'events', isRealTimeSearch ? 'in real-time mode' : 'in historical mode');
                    _.each(results, function(event, idx) {
                        var lineNum,
                            isPreviewEvent = event.isPreviewEvent();
    
                        if (this.model.searchJob.entry.content.get('isRealTimeSearch')) {
                            lineNum = this.model.result.endOffset() - idx;
                        } else {
                            lineNum = this.model.result.get('init_offset') + idx + 1;
                        }
    
                        this.children['masterRow_' + idx] = new PrimaryRow({ 
                            model: { 
                                event : event, 
                                report: this.model.report,
                                application: this.model.application,
                                searchJob: this.model.searchJob,
                                result: this.model.result,
                                state: this.model.state,
                                summary: this.model.summary
                            }, 
                            collection: {
                                selectedFields: this.collection.intersectedFields
                            },
                            lineNum: lineNum,
                            idx: idx,
                            allowRowExpand: this.options.allowRowExpand,
                            isPreviewEvent: isPreviewEvent,
                            showWarnings: this.options.showWarnings,
                            clickFocus: 'tr.tabbable-table-primary-row'
                        });
                        this.children['masterRow_' + idx].render().appendTo(fragment);
                        this.children['masterRow_' + idx].activate({deep: true});
                        
                        if (!isPreviewEvent) {
                            this.children['fieldRow_' + idx] = new SecondaryRow({
                                model: {
                                    event : event,
                                    report: this.model.report,
                                    result: this.model.result,
                                    summary: this.model.summary,
                                    state: this.model.state,
                                    application: this.model.application,
                                    searchJob: this.model.searchJob
                                },
                                collection: {
                                    workflowActions: this.collection.workflowActions,
                                    selectedFields: this.collection.selectedFields
                                },
                                idx: idx,
                                selectableFields: this.options.selectableFields,
                                clickFocus: 'tr.tabbable-table-secondary-row'
                            });
                            this.children['fieldRow_' + idx].render().appendTo(fragment).$el.hide();
                        }
                    },this);
                    this.$el.append(fragment);
                    
                    //bulk purge of remove mutex
                    _(this.model.state.toJSON()).each(function(value, key) {
                        if(key.indexOf('pendingRemove') === 0) {
                            this.model.state.unset(key);
                        }
                    },this);
                    
                    this.trigger('rows:added');
                    this.invalidateReflow();
                }
                return this;
            },
            remove: function() {
                this.$el.off('elementResize');
                return BaseView.prototype.remove.apply(this, arguments);
            }
        });
    }
);

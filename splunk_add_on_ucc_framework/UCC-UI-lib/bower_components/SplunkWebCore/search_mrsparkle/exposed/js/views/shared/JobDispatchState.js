define(
    [
        'jquery',
        'underscore',
        'module',
        'models/search/Job',
        'collections/shared/FlashMessages',
        'views/shared/FlashMessagesLegacy',
        'uri/route'
    ],
    function($, _, module, JobModel, FlashMessagesCollection, FlashMessagesLegacyView, route) {
        return FlashMessagesLegacyView.extend({
            moduleId: module.id,
            className: 'message-single',
            /**
             * @param {Object} options
             * @param {Backbone.Model} options.model The model to operate on
             * @param {String} options.mode The mode attribute is used to determine what attribute on the search job 
             * should be used for resultCount. Values can be events/results/results_preview/auto. Defaults to events.
             * @param {Object} options.jobDispatchStateMsgs Optional object to pass in custom messages/functions 
             * for each job dispatch state.
             * @param {Object/String} options.jobDispatchStateMsgs.STATUS.msg Required attribute if jobDispatchStateMsgs is provided.
             * @param {Boolean} options.jobDispatchStateMsgs.STATUS.escape Optional attribute to specify if message should be escaped.
             * Default value is true.
             * 
             * Example
             * 
             *  options = {
             *      model: {
             *          searchJob: <models.Job>,
             *          application: <models.shared.Application>
             *      }
             *      mode: 'results',
             *      jobDispatchStateMsgs: {
             *         JobModel.DONE: {
             *             msg : getJobDoneMessage,  //function
             *             escape: false //if msg contains HTML, don't escape
             *         }
             *         JobModel.RUNNING: {
             *             msg : 'Job is running', //string
             *         }
             *      }
             *  }
             */
            initialize: function() {
                this.collection = new FlashMessagesCollection();
                
                var jobManagerLink = route.job_manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    {data: {
                        jobStatus: JobModel.RUNNING,
                        owner: this.model.application.get('owner')
                    }}
                );
                /*
                 * Below piece of code combines a list containing keys(states) and a list containing the values
                 * (messages) into an object. This is different from the traditional way of defining objects because 
                 * the keys are variables and has a dot reference.
                 */
                var states = [
                        JobModel.PARSING, 
                        JobModel.QUEUED, 
                        JobModel.RUNNING, 
                        JobModel.FINALIZING,
                        JobModel.DONE
                    ], 
                    messages = [
                        { 
                            msg: _('Parsing search.').t(),
                            escape: true
                        }, 
                        { 
                            msg: _('Waiting for queued job to start.').t() + 
                                ' <a href="' + jobManagerLink + '">' + _('Manage jobs.').t() + '</a>', 
                            escape: false 
                        },
                        { 
                            msg: _('No results yet found.').t(),
                            escape: true
                        },
                        { 
                            msg: _('Finalizing results.').t(),
                            escape: true
                        },
                        { 
                            msg: _('No results found.').t(),
                            escape: true
                        }
                    ], 
                    defaults = _.object(states, messages);
                
                this.options = $.extend(true, {}, {jobDispatchStateMsgs: defaults}, this.options);
                FlashMessagesLegacyView.prototype.initialize.apply(this, arguments);
            },
            startListening: function() {
                FlashMessagesLegacyView.prototype.startListening.apply(this, arguments);
                if (this.resultCountAttribute) {
                    this.listenTo(this.model.searchJob.entry.content, 'change:' + this.resultCountAttribute, this.update);
                }
                this.listenTo(this.model.searchJob.entry.content, 'change:dispatchState', this.update);
            },
            activate: function(options) {
                this.ensureDeactivated({deep: true});
            
                switch (this.options.mode) {
                    case 'results_preview':
                        this.resultCountAttribute = 'resultPreviewCount';
                        break;
                    case 'results':
                        this.resultCountAttribute = 'resultCount';
                        break;
                    case 'auto':
                        break;
                    default:
                        this.resultCountAttribute = 'eventAvailableCount';
                        break;
                }
                
                FlashMessagesLegacyView.prototype.activate.apply(this, arguments);
                this.update();
                return this;
            },
            update: function() {
                if (this.model.searchJob.isNew()) {
                    return;
                }
                if (this.model.searchJob.isPreparing()) {
                    this.updatePreparingStates();
                    return;
                }
                
                if ((this.options.mode === 'auto') && (!this.resultCountAttribute)) {
                    if (this.model.searchJob.isReportSearch()) {
                        if (this.model.searchJob.entry.content.get('isPreviewEnabled')) {
                            this.resultCountAttribute = 'resultPreviewCount';
                        } else {
                            this.resultCountAttribute = 'resultCount';
                        }   
                    } else {
                        this.resultCountAttribute = 'eventAvailableCount';
                    }
                }
                
                this.updateRanStates();
            },
            updatePreparingStates: function() {
                var dispatchState = this.model.searchJob.entry.content.get('dispatchState');
                
                if (dispatchState === JobModel.PARSING) {
                    this.collection.reset([{
                        key: 'waiting',
                        type: 'info',
                        html: _.isFunction(this.options.jobDispatchStateMsgs[JobModel.PARSING].msg) ?
                            this.options.jobDispatchStateMsgs[JobModel.PARSING].msg() :
                            this.options.jobDispatchStateMsgs[JobModel.PARSING].msg,
                        escape: _.has(this.options.jobDispatchStateMsgs[JobModel.PARSING], 'escape') ? 
                            this.options.jobDispatchStateMsgs[JobModel.PARSING].escape : true
                    }]);
                } else if (dispatchState === JobModel.QUEUED) {
                    this.collection.reset([{
                        key: 'waiting',
                        type: 'info',
                        html: _.isFunction(this.options.jobDispatchStateMsgs[JobModel.QUEUED].msg) ?
                            this.options.jobDispatchStateMsgs[JobModel.QUEUED].msg() :
                            this.options.jobDispatchStateMsgs[JobModel.QUEUED].msg,
                        escape: _.has(this.options.jobDispatchStateMsgs[JobModel.QUEUED] , 'escape') ?
                            this.options.jobDispatchStateMsgs[JobModel.QUEUED].escape : true
                    }]);
                } else {
                    this.collection.reset([]);
                }
            },
            updateRanStates: function() {
                var dispatchState = this.model.searchJob.entry.content.get('dispatchState'), 
                    resultCount = this.model.searchJob.entry.content.get(this.resultCountAttribute),
                    html;

                if (dispatchState === JobModel.RUNNING && resultCount === 0) {
                    if (this.model.searchJob.isRealtime()) {
                        this.collection.reset([{
                            key: 'waiting',
                            type: 'info',
                            html: _('No results in current time range.').t()
                        }]);
                    } else {
                        html = _.isFunction(this.options.jobDispatchStateMsgs[JobModel.RUNNING].msg) ?
                            this.options.jobDispatchStateMsgs[JobModel.RUNNING].msg() :
                            this.options.jobDispatchStateMsgs[JobModel.RUNNING].msg;
                        
                        if (this.model.searchJob.isReportSearch()) {
                            if (!this.model.searchJob.entry.content.get('isPreviewEnabled')) {
                                html = _('Waiting for search to complete. Display results while the search is running by enabling Preview.').t();
                            }
                        }
                        
                        this.collection.reset([{
                            key: 'waiting',
                            type: 'info',
                            html: html,
                            escape: _.has(this.options.jobDispatchStateMsgs[JobModel.RUNNING], 'escape') ?
                                this.options.jobDispatchStateMsgs[JobModel.RUNNING].escape : true
                        }]);
                    }
                } else if (dispatchState === JobModel.FINALIZING && resultCount === 0) {
                    this.collection.reset([{
                        key: 'waiting',
                        type: 'info',
                        html: _.isFunction(this.options.jobDispatchStateMsgs[JobModel.FINALIZING].msg) ?
                            this.options.jobDispatchStateMsgs[JobModel.FINALIZING].msg() :
                            this.options.jobDispatchStateMsgs[JobModel.FINALIZING].msg,
                        escape: _.has(this.options.jobDispatchStateMsgs[JobModel.FINALIZING], 'escape') ?
                            this.options.jobDispatchStateMsgs[JobModel.FINALIZING].escape : true
                    }]);
                } else if (dispatchState === JobModel.DONE && resultCount === 0) {
                    this.collection.reset([{
                        key: 'zero',
                        type: 'error',
                        html: _.isFunction(this.options.jobDispatchStateMsgs[JobModel.DONE].msg) ?
                            this.options.jobDispatchStateMsgs[JobModel.DONE].msg() :
                            this.options.jobDispatchStateMsgs[JobModel.DONE].msg,
                        escape: _.has(this.options.jobDispatchStateMsgs[JobModel.DONE], 'escape') ?
                            this.options.jobDispatchStateMsgs[JobModel.DONE].escape : true
                    }]);
                } else {
                    this.collection.reset([]);
                }
            },
            render: function() {
                var template = this.compiledTemplate({
                    flashMessages: this.collection,
                    escape: this.options.escape
                });
                this.$el.html(template);
                return this;
            }
        });
    }
);
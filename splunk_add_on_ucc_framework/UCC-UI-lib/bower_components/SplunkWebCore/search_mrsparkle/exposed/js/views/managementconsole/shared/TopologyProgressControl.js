
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/Base',
        'views/Base',
        'views/managementconsole/shared/TaskProgressDialog',
        './TopologyProgressControl.pcss'

    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseModel,
        BaseView,
        TaskProgressDialog,
        css
    ) {
        var STRINGS = {
            PROGRESS_MESSAGE: _('Updating deployment').t(),
            PROGRESS: _('Operation in progress').t(),
            LAST_UPDATE_STATUS: _('Last Deployment Status').t(),
            STATUS: _('Status').t()
        };

        var PROGRESS_BAR_DELAY = 1000;

        return BaseView.extend({
            moduleId: module.id,
            className: 'progress-control',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                // when ever a request has been made to the server we get a new taskId, Listening to the newTask
                // to show the progressWindow
                this.setTaskId(this.options.taskId);

                this._buttonHidden = false;
                if (!_.isUndefined(this.options.buttonHidden)) {
                    this._buttonHidden = this.options.buttonHidden;
                }

                // listen to new task so that the progress bar can be shown
                this.listenTo(this.model.topologyTask, 'newTask', this._newTaks);
                // listen to sync so that the progress can be shown
                this.listenTo(this.model.topologyTask, 'sync', this._taskSync);
            },

            events: {
                'click .task-progress.disabled': '_taskProgressDisabled',
                'click .task-progress.enabled': 'showProgressWindow'
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    strings: STRINGS,
                    message: ''
                }));

                this.handleProgressButtonState();

                this.showStatusIcon(this.model.topologyTask.entry.content.get('state'));

                return this;
            },

            /**
             * @param taskId
             * @param type
             * @param instances
             * @private
             *
             * Once a new task event is fired , we update the taksId on the progress control, show the progress bar
             * and also show the progress window
             */
            _newTaks: function(taskId, type, instances) {

                this.lastOperationType = type;
                this.lastUpdatedInstances = instances;

                this.setTaskId(taskId);
                this.showProgressBar();
                this.showProgressWindow();
                this.handleProgressButtonState();

                this.hideStatusIcon();
            },

            /**
             * @private
             * on sync update the progress bar. If the task failed or completed hide the progress bar
             */
            _taskSync: function() {
                var width = 0,
                    stages = this.model.topologyTask.entry.content.get('stages'),
                    count = 0;

                // In case there are no stages the progress bar should complete when the entire task is marked
                // as complete
                if (stages.length === 0) {
                    stages =  [this.model.topologyTask.entry.content.toJSON()];
                }

                _.each(stages, function(stage) {
                    if (stage.state === 'completed') {
                        count++;
                    }
                });

                width = Math.round((count/stages.length)*100);
                this.setProgress(width);

                var taskState = this.model.topologyTask.entry.content.get('state'),
                    runningStage = _.find(this.model.topologyTask.entry.content.get('stages'), function(stage) {
                    return stage.state === 'running';
                });

                if(runningStage) {
                    this.$('.progress-status').text(STRINGS.STATUS+': '+runningStage.description);
                }

                if (width >= 100 || (taskState == 'completed' || taskState == 'failed')) {
                    _.delay(this.taskFinished.bind(this), PROGRESS_BAR_DELAY);
                } else {
                    this.hideStatusIcon();
                    this.showProgressBar();
                }
            },

            _taskProgressDisabled: function(e) {
                e.preventDefault();
            },

            // If no task exist then disable the progress button
            // If _buttonHidden is true, hide the button
            handleProgressButtonState: function() {
                // Hide extra details in the Deploy page
                if (this._buttonHidden) {
                    this.$('.task-progress').hide();
                    this.$('.status-icon').hide();
                    this.$('.progress-status').hide();
                } else {
                    if (this.taskId) {
                        this.$('.task-progress').removeClass('disabled').addClass('enabled');
                    } else {
                        this.$('.task-progress').addClass('disabled').removeClass('enabled');
                    }
                }
            },

            taskFinished: function() {
                this.model.topologyTask.entry.unset('name');
                this.model.topologyTask.trigger('taskFinished');
                var taskState = this.model.topologyTask.entry.content.get('state');
                this.showStatusIcon(taskState);
                this.hideProgressBar();
            },

            hideProgressBar: function() {
                this.$('.progress-bar ').parent().hide();
                this.resetProgress();
                this.updateProgressString(STRINGS.LAST_UPDATE_STATUS);
                this.$('.progress-status').text('').hide();
            },

            showProgressBar: function() {
                this.updateProgressString(STRINGS.PROGRESS);
                this.$('.progress-bar ').parent().show();
                if (!this._buttonHidden) {
                    this.$('.progress-status').show();
                }
            },

            setTaskId: function(taskId) {
                this.taskId = taskId;
                this.model.topologyTask.entry.set('name', this.taskId);
                this.handleProgressButtonState();
            },

            updateProgressString: function(str) {
                this.$('.progress-string').html(str);
            },

            // sets the width of the progress bar
            setProgress : function(width) {
                if (width !== null && width === 0 ) {
                    width = 10;
                }
                this.$('.progress-bar ').width(width+'%');
            },

            showStatusIcon: function(status) {
                this.$('.status-icon').show();
                this.$('.status-icon').removeClass('icon-check-circle icon-positive icon-error icon-negative');
                if (status === 'completed') {
                    this.$('.status-icon').addClass('icon-check-circle icon-positive');
                } else if (status === 'failed'){
                    this.$('.status-icon').addClass('icon-error icon-negative');
                }
            },

            hideStatusIcon: function() {
                this.$('.status-icon').hide();
            },

            resetProgress: function() {
                this.setProgress(0);
            },

            /**
             * Show the progress window
             */
            showProgressWindow: function(e) {
                e.preventDefault();
                var dialog = new TaskProgressDialog({
                    taskId: this.taskId,
                    lastOperationType: this.lastOperationType,
                    lastUpdatedInstances: this.lastUpdatedInstances,
                    model: {
                        task: this.model.topologyTask
                    },
                    onHiddenRemove: true
                });
                $('body').append(dialog.render().el);
                dialog.show();
            },

            template: '\
                <a href="#" class="btn-pill task-progress disabled pull-left">\
                    <span class="progress-string"><%- strings.LAST_UPDATE_STATUS %></span>\
                </a>\
                <div class="status-icon-section pull-left">\
                    <i class="status-icon icon-check-circle icon-positive"></i>\
                </div>\
                <div class="deployment-progress-bar pull-left">\
                    <div class="progress deployment-management-progress-bar " >\
                        <div class="progress-bar progress-striped active">\
                            <%- message %>\
                        </div>\
                    </div>\
                </div>\
                <div class="progress-status pull-left"></div>\
            '
        });
    }
);
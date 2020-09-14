/**
 * Created by lrong on 10/28/15.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/DmcBase',
        'util/time'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseModel,
        timeUtil
    ) {
        var TASK_STATE_LABELS = {
            "new": _('New').t(),
            "running": _('Running').t(),
            "completed": _('Completed').t(),
            "failed": _('Failed').t()
        };

        var getLabelFromStatus = function(status) {
            return TASK_STATE_LABELS[status];
        };

        return DmcBaseModel.extend(
            {
                urlRoot: '/services/dmc/tasks',

                getTaskId: function() {
                    return this.entry.content.get('taskId');
                },

                getTimeStamp: function() {
                    return timeUtil.convertToLocalTime(this.entry.content.get('createdAt'));
                },

                getStatus: function() {
                    return TASK_STATE_LABELS[this.entry.content.get('state')];
                },

                isFailed: function() {
                    return this.entry.content.get('state') === 'failed';
                },

                beginPolling: function() {
                    if (this.entry.get('name') && !this.isPolling()) {
                        this.fetch().done(function() {
                            // Poll only if the task is new or running
                            // completed or failed tasks should have all the information with a single fetch
                            var state = this.entry.content.get('state');
                            if (state === 'running' || state === 'new') {
                                this.startPolling();
                            }
                        }.bind(this));
                    }
                    if (!this.entry.get('name') && this.isPolling()) {
                        this.stopPolling();
                    }
                },

                isNotComplete: function() {
                    return this.entry.content.get('state') !== 'completed';
                },

                isRunning: function() {
                    return this.entry.content.get('state') === 'running';
                },

                getConfirmation: function() {
                    return $.get(this.url() + '/confirmation');
                },

                postConfirmation: function(confirmationId, choice, input) {
                    var url = this.url() + '/confirmation/' + confirmationId + '/result',
                        data = choice === 'canceled' ? {canceled: true} : {choice: choice};

                    if(input) {
                        data.input = input;
                    }

                    return $.ajax({
                        type: 'POST',
                        url: url,
                        data: JSON.stringify(data),
                        contentType: 'application/json'
                    });
                }
             },
            {
                getLabelFromStatus: getLabelFromStatus
            }
        );
    }
);

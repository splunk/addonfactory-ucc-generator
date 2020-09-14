/**
 * This is a UI only collection that will maintain the state fo the tasks.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/DmcBase',
        'models/managementconsole/Task',
        'collections/SplunkDsBase'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseModel,
        TaskModel,
        SplunkDsBaseCollection
    ) {


        /**
         * This collection wont be synced at any point. It is used to track the tasks in progress and fire
         * appropriate events.
         *
         * Events :
         *    "task:stateChanged": Fired when the state on one of the tasks is changed,
         *    "task:finished": Fired when task finishes execution
         *
         *
         */
        return SplunkDsBaseCollection.extend({
            model: TaskModel,

            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
                this.on('add', this.taskAdded);
            },

            createTask: function(taskId) {
                var model = new TaskModel();
                if (taskId) {
                    model.entry.set('name', taskId);
                    this.add([model]);
                }
                return model;
            },

            /**
             * When a new task is added , we begin polling on it and listen to stage change events.
             * @param model
             */
            taskAdded: function(model) {

                if (!(model instanceof this.model)) {
                    return;
                }

                model.beginPolling();

                // stop polling when the state is completed or failed
                this.listenTo(model.entry.content, 'change:state', (function(model, scope) {

                    // creating a closure so the right model can be addeessed.
                    return function() {
                        var state = model.entry.content.get('state');
                        if (state === 'completed' || state === 'failed') {
                            model.stopPolling();
                            scope.trigger('task:finished', model, state);
                            scope.remove(model);
                        } else {
                            scope.trigger('task:stateChanged', model, state);

                        }
                    };

                })(model, this));
            }
        });
    }
);
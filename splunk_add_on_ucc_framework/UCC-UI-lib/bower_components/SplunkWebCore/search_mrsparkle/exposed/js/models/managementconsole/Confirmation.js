/**
 *  Abstract helper model to process the response data from the task/task_id/confirmation endpoint.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/DmcBase'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseModel
    ) {
        return DmcBaseModel.extend(
            {
                getId: function() {
                    return this.entry.get('name');
                },

                isMigrationStep: function() {
                    return this.entry.content.get('payload').question_type === 'deployment_server_migration';
                },

                isAuthenticationStep: function() {
                    return this.entry.content.get('payload').question_type === 'deployment_server_authentication';
                },

                getQuestion: function() {
                    var resultArr = this.entry.content.get('payload').question,
                        noteArr = resultArr.splice(1, resultArr.length - 1);

                    resultArr.push(noteArr.join(''));
                    return resultArr;
                },

                getServerClasses: function() {
                    return this.entry.content.get('payload').data.groups;
                },

                getApps: function() {
                    return this.entry.content.get('payload').data.apps;
                }
            }
        );
    }
);

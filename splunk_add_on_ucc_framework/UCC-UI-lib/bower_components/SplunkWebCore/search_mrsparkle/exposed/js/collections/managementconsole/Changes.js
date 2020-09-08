/**
 * Created by lrong on 1/15/16.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/Change',
        'collections/managementconsole/DmcsBase'
    ],
    function(
        $,
        _,
        Backbone,
        ChangeModel,
        DmcsBaseCollection
    ) {
        var TIME_RANGE = {
            lastHour: {
                value: 60 * 60,             // number of seconds in a hour
                label: _('Last Hour').t()
            },
            lastDay: {
                value: 24 * 60 * 60,        // number of seconds in a day
                label: _('Last 24 Hours').t()
            },
            lastWeek: {
                value: 7 * 24 * 60 * 60,    // number of seconds in a week
                label: _('Last 7 Days').t()
            }
        };

        return DmcsBaseCollection.extend(
            {
                model: ChangeModel,
                url: '/services/dmc/changes',

                isPendingOnly: function() {
                    return this.fetchData.get('state') === 'pending';
                },

                isDeployedOnly: function() {
                    return this.fetchData.get('state') === 'deployed';
                },

                canDeploy: function() {
                    return this.links.has('deploy');
                },

                canSort: function() {
                    return true;
                }
            },
            {
                TIME_RANGE: TIME_RANGE
            }
        );
    }
);
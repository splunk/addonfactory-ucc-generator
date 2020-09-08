/**
 * Created by pkuruvada on 9/16/15.
 */

/**
 * This collection overrides the fetch method on the collection and uses the mock (fixtures) to provide
 * fake data into the collection.
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'collections/managementconsole/topology/Instances',
    'fixtures/managementconsole/topology/instances'
], function(
    $,
    _,
    Backbone,
    InstancesCollection,
    InstancesFixture
) {

    return InstancesCollection.extend({

        fetch: function(options) {
            var fixture = InstancesFixture;
            this.setFromSplunkD(fixture);
            this.trigger('sync');

            // fetch should return a promise;
            return $.Deferred().resolve().promise();
        }
    });
});
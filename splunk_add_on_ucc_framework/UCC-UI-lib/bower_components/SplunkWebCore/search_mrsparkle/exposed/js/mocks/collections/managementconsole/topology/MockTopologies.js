define([
    'jquery',
    'underscore',
    'backbone',
    'collections/managementconsole/topology/Topologies',
    'fixtures/managementconsole/topology/topologies'
], function(
    $,
    _,
    Backbone,
    TopologiesCollection,
    TopologiesFixture
) {

    return TopologiesCollection.extend({

        fetch: function(options) {
            var fixture = TopologiesFixture;
            this.setFromSplunkD(fixture);
            this.trigger('sync');

            // fetch should return a promise;
            return $.Deferred().resolve().promise();
        }
    });
});
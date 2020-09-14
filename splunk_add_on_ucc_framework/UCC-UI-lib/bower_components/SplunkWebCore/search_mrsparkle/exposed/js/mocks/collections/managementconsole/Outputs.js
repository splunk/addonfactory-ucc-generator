define(
    [
        'jquery',
        'underscore',
        'backbone',
        'collections/managementconsole/Outputs',
        'fixtures/managementconsole/Outputs'
    ], function MockOutputsCollection(
        $,
        _,
        Backbone,
        OutputsCollection,
        OutputsFixture
    ) {
        return OutputsCollection.extend({
            fetch: function fetch() {
                var fixture = OutputsFixture;
                this.setFromSplunkD(fixture);
                this.trigger('sync');

                return $.Deferred().resolve().promise();
            }
        });
    }
);
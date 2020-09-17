define(
    [
        'jquery',
        'underscore',
        'backbone',
        'collections/managementconsole/Apps',
        'fixtures/managementconsole/apps'
    ],
    function(
        $,
        _,
        Backbone,
        AppsCollection,
        AppsFixture
    ) {
        return AppsCollection.extend({
            fetch: function() {
                var fixture = AppsFixture;

                this.setFromSplunkD(fixture);
                this.trigger('sync');

                return $.Deferred().resolve().promise();
            }
        });
    }
);
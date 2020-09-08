define([
    'jquery',
    'underscore',
    'backbone',
    'collections/managementconsole/InputTypes',
    'fixtures/managementconsole/InputTypes'
], function (
    $,
    _,
    Backbone,
    InputTypesCollection,
    InputTypesFixture
) {
    return InputTypesCollection.extend({
        fetch: function() {
            var fixture = InputTypesFixture;

            this.setFromSplunkD(fixture);
            this.trigger('sync');

            return $.Deferred().resolve().promise();
        }
    });
});

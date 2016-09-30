/*global define*/
define([
    'app/models/Base.Model',
    'app/config/ContextMap'
], function (
    BaseModel,
    ContextMap
) {
    return BaseModel.extend({
        url: [
            ContextMap.restRoot,
            ContextMap.account
        ].join('/'),

        initialize: function (attributes, options) {
            options = options || {};
            this.collection = options.collection;
            BaseModel.prototype.initialize.call(this, attributes, options);
            this.addValidation('api_uuid', this.nonEmptyString);
            this.addValidation('api_key', this.nonEmptyString);
        }
    });
});

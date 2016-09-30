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
            "authentication",
            "users"
        ].join('/'),
    });
});

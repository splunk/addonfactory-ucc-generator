/*global define*/
define([
    'app/models/Base.Model'
], function (
    BaseModel
) {
    return BaseModel.extend({
        url: "server"
    });
});
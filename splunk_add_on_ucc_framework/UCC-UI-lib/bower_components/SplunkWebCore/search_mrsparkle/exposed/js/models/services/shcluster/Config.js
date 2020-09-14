define(
    [
        'jquery',
        'underscore',
        'models/StaticIdSplunkDBase'
    ],
    function ($, _, BaseModel) {
        return BaseModel.extend({
                url: 'shcluster/config',
                initialize: function () {
                    BaseModel.prototype.initialize.apply(this, arguments);
                },
                isEnabled: function () {
                   return this.entry.content.get("mode") ? this.entry.content.get("mode") != 'disabled' : false;
                }
            },
            {
                id: 'shcluster/config'
            });
    }
);

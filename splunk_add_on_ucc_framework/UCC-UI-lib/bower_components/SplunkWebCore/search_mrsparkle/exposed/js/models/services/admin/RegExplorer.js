define(
    [
        'models/SplunkDBase'
    ],
    function(
        BaseModel
    ) {
        return BaseModel.extend({
            url: 'admin/win-reg-explorer',
            urlRoot: 'admin/win-reg-explorer',

            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            hasSubNodes: function() {
                return this.entry.content.get('hasSubNodes');
            }
        });
    }
);
define(
    [
        'models/SplunkDBase'
    ],
    function(
        BaseModel
    ) {
        return BaseModel.extend({
            url: 'admin/win-ad-explorer',
            urlRoot: 'admin/win-ad-explorer',

            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            hasSubNodes: function() {
                return this.entry.content.get('hasSubNodes');
            }
        });
    }
);
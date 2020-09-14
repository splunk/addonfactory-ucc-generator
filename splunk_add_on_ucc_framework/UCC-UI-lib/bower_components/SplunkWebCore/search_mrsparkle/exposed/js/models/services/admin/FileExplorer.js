define(
    [
        'models/SplunkDBase'
    ],
    function(
        BaseModel
    ) {
        return BaseModel.extend({
            url: 'admin/file-explorer',
            urlRoot: 'admin/file-explorer',

            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },

            hasSubNodes: function() {
                return this.entry.content.get('hasSubNodes');
            }
        });
    }
);
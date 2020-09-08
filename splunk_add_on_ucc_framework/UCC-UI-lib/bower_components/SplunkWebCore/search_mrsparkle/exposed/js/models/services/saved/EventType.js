define(['underscore', 'models/SplunkDBase'], function(_, BaseModel) {
    return BaseModel.extend({
        url: 'saved/eventtypes',
        initialize: function() {
            BaseModel.prototype.initialize.apply(this, arguments);
            
            this.entry.content.defaults = {
                'name': void(0)
            };

            this.entry.content.validation = {
                'name': {
                    required: true,
                    msg: _('Name is required.').t()
                } 
            };
        }
    });
});

define(
    [
        'underscore',
        'models/Base',
        'util/validation'
    ],
    function(_,
             BaseModel,
             validationUtils
    ) {
        return BaseModel.extend({
            validation: {
                limit: 'validateLimit'
            },
            validateLimit: function(value, attr, computedState) {
                if ((!validationUtils.isNonNegValidInteger(value)) || parseInt(value, 10) <= 1) {
                    return _('Event Limit must be an integer greater than 1').t();
                } 
            }
        });
    }
);
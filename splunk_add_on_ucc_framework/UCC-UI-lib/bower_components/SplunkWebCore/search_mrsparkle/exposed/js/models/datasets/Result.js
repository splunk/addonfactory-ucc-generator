define(
    [
        'models/services/search/jobs/Result'
    ],
    function(
        ResultModel
    ) {
        return ResultModel.extend({
            initialize: function() {
                ResultModel.prototype.initialize.apply(this, arguments);
            }
        },
        {
            Results: ResultModel.Results.extend(
                {
                    getFieldPickerItems: function(fieldAttribute) {
                        if (!fieldAttribute) {
                            throw new Error('You must define what attribute is the field name.');
                        }
                        
                        return this.map(function(result) {
                            var value = result.get(fieldAttribute);
                            return {
                                value: (value && value[0]) || ''
                            };
                        });
                    }
                }
            )
        });
    }
);
define(
    [
        'models/services/search/jobs/Summary'
    ],
    function(
        SummaryModel
    ) {
        return SummaryModel.extend({
            initialize: function() {
                SummaryModel.prototype.initialize.apply(this, arguments);
            }
        },
        {
            Fields: SummaryModel.Fields.extend(
                {
                    getFieldPickerItems: function() {
                        return this.map(function(field) {
                            return {
                                value: field.get('name')
                            };
                        });
                    }
                }
            )
        });
    }
);
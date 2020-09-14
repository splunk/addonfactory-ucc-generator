define(
    [
        'jquery',
        'models/SplunkDBase'
    ],
    function($, SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
            url: 'data/ui/alerts'
        });
    }
);

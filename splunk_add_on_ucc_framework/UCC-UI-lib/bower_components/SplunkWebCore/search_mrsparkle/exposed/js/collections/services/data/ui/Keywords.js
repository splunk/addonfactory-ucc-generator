define(
    [
        'underscore',
        'models/livetail/Keyword', 
        'collections/SplunkDsBase'
    ],
    function(_, Model, CollectionBase) {
        return CollectionBase.extend({
            url: 'data/ui/livetail',
            model: Model
        });
    }
);

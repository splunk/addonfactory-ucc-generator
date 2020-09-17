define(
    [
        'jquery',
        'underscore',
        'models/EAIBase',
        'models/shared/LinkAction',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        EAIBaseModel,
        LinkAction,
        splunkd_utils
    ) {
        return EAIBaseModel.extend({
            url: 'data/indexes',
            urlRoot: "data/indexes"
        });
    }
);

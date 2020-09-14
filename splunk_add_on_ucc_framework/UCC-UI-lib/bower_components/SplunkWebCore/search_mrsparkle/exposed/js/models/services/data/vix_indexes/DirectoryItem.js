/**
 * @author jszeto
 * @date 7/16/14
 */

define(
    [
        'models/SplunkDBase'
    ],
    function(SplunkDBaseModel) {
        return SplunkDBaseModel.extend({
//            url: 'data/vix-indexes/browse',
            initialize: function() {
                SplunkDBaseModel.prototype.initialize.apply(this, arguments);
            },
            sync: function(method) {
                throw new Error("DirectoryItem doesn't support the method : " + method);
            }

        });
    }
);

/**
 *  Subclass SplunkDWhiteList for models/services/datamodel/DataModel to not pass "provisional" when retrieving
 *  the fields whitelist
 */
define(
    [
        'models/SplunkDWhiteList'
    ],
    function(SplunkDWhiteList) {
        return SplunkDWhiteList.extend({
            sync: function(method, model, options) {
                // The datamodel endpoint doesn't accept provisional for GET (but it does for POST)
                if (options && options.data) {
                    delete options.data.provisional;
                }
                return SplunkDWhiteList.prototype.sync.call(this, method, model, options);
            }
        });
    }
);

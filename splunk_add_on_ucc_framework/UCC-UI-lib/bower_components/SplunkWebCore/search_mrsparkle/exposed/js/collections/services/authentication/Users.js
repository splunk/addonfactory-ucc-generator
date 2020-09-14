define([
    "jquery",
    "underscore",
    "util/splunkd_utils",
    "models/services/authentication/User",
    "collections/SplunkDsBase"
],
function($, _, splunkdUtil, UserModel, SplunkDsBaseCollection) {
    return SplunkDsBaseCollection.extend({
        FREE_PAYLOAD: UserModel.prototype.FREE_PAYLOAD,
        urlRoot: "authentication/users",
        url: "authentication/users",
        model: UserModel,
        initialize: function() {
            SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
        },
        searchByValues: function (values) {
            var $deferred = $.Deferred();
            if (values === void 0) {
                $deferred.reject();
                return $deferred;
            }
            var searchFilterString = _.map(values, function(value) {
                return '(name='+splunkdUtil.quoteSearchFilterValue(value)+')';
            }).join(' OR ');

            this.fetchData.set('search', searchFilterString, {silent: true});
            $.when(this.fetch())
                .then(function () {
                    $deferred.resolve(this.models);
                    this.reset(void 0, {silent:true});
                }.bind(this))
                .fail(function () {
                    $deferred.reject();
                });
            return $deferred;
        },

        search: function (rawSearch) {
            var searchFilterString = splunkdUtil.createSearchFilterString(rawSearch, ['name', 'realname']);
            this.fetchData.set({search: searchFilterString, count: 5});
        }
    });
});
define(
    [
        'jquery',
        'backbone',
        "models/services/data/ui/Manager",
        "collections/SplunkDsBase",
        'util/splunkd_utils'
    ],
    function($, Backbone, ManagerModel, SplunkDsBaseCollection, splunkdUtils) {
        return SplunkDsBaseCollection.extend({
            url: "data/ui/manager",
            model: ManagerModel,
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            canShowMore: function() {
                return this.links.get('_show') ? true : false;
            },
            showMore: function() {
                var model = new ManagerModel({
                    id: 'data/ui/manager/_show'
                });

                // Use Backbone.sync() directly instead of Model.save() to
                // avoid argument whitelist wonkiness -- GET on
                // /data/ui/manager/_show isn't allowed, and even if it were,
                // it wouldn't produce meaningful optional/required args.

                var bbXHR, deferredResponse = $.Deferred(),
                    defaults = {
                        trigger: true,
                        processData: true,
                        url: splunkdUtils.fullpath(model.id, {}),
                        type: 'POST',
                        data: {
                            output_mode: 'json'
                        }
                    };

                var callback_collection = this;

                bbXHR = Backbone.sync.call(this, "update", model, defaults);
                bbXHR.done(function() {
                    callback_collection.links.unset('_show');
                    callback_collection.fetch({
                        data: {
                            app: '-',
                            owner: '-',
                            count: 0,
                            digest: 1
                        },
                        success: function() {
                            deferredResponse.resolve.apply(deferredResponse, arguments);
                        }
                    });
                });
                bbXHR.fail(function() {
                    deferredResponse.reject.apply(deferredResponse, arguments);
                });

                return deferredResponse.promise();
            }
        });
    }
);

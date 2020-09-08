define(
    [
        "jquery",
        "models/services/Message",
        "collections/SplunkDsBase"
    ],
    function($, MessageModel, SplunkDsBaseCollection) {
        return SplunkDsBaseCollection.extend({
            model: MessageModel,
            url: 'messages',
            initialize: function() {
                SplunkDsBaseCollection.prototype.initialize.apply(this, arguments);
            },
            destroyAll: function() {
                if (this.destroying === true) {
                    return this.destroyDFD;
                }
                this.destroying = true;
                var that = this;
                this.destroyDFD = new $.Deferred(function(dfd){
                    function destroyNext() {
                        var dummyDefered = new $.Deferred();
                        if (that.length > 0) {
                            var model = that.pop();
                            var destroyPromise = model.destroy() || dummyDefered.resolve().promise();
                            destroyPromise.always( destroyNext);
                            return destroyPromise;
                        }
                        else {
                            dfd.resolve();
                        }
                    }
                    destroyNext();
                });
                this.destroyDFD.then(function() {
                    that.destroying = false;
                });
                return this.destroyDFD.promise();
            }
        });
    }
);

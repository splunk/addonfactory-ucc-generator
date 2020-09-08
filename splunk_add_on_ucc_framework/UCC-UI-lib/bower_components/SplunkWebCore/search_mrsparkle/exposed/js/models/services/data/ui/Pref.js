define(
    [
        'jquery',
        'models/SplunkDBase',
        'util/splunkd_utils'
    ],
    function(
        $,
        BaseModel,
        splunkd_utils
    ) {
        var Pref = BaseModel.extend({
            url: 'data/ui/prefs',
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            bootstrap: function(uiPrefsDeferred, page, app, owner) {
                var uiPrefsUrl = splunkd_utils.fullpath(
                        this.url + "/" + encodeURIComponent(page),
                        {
                            app: app,
                            owner: owner
                        }
                     ),
                     proxyUIPrefModel = new Pref();

                proxyUIPrefModel.fetch({
                    url: uiPrefsUrl,
                    success: function(model, response) {
                         if ((owner||'').toLowerCase() !== proxyUIPrefModel.entry.acl.get('owner')) {
                             //we got a shared UIPref entity so we need to make a new local entity
                             this.fetch({
                                 success: function(model, response) {
                                     var data = $.extend(true, {name: page}, proxyUIPrefModel.entry.content.toJSON());
                                     this.entry.content.set(data);
                                     uiPrefsDeferred.resolve();
                                 }.bind(this),
                                 error: function(model, response) {
                                     uiPrefsDeferred.resolve();
                                 }.bind(this)
                             });
                         } else {
                             this.setFromSplunkD(proxyUIPrefModel.toSplunkD());
                             uiPrefsDeferred.resolve();
                         }
                     }.bind(this),
                     error: function(model, response) {
                         this.fetch({
                             success: function(model, response) {
                                 this.entry.content.set({
                                     name: page
                                 });
                                 uiPrefsDeferred.resolve();
                             }.bind(this),
                             error: function(model, response) {
                                 uiPrefsDeferred.resolve();
                             }.bind(this)
                         });
                     }.bind(this)
                });
            }
        });
        
        return Pref;
    }
);
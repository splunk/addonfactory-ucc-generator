/**
 * @author vroy
 * @date 4/13/15
 *
 * Base model singleton class for simulating a session cache.
 */
define(
    [
        'jquery',
        'jquery.cookie',
        'underscore',
        'backbone',
        'util/splunkd_utils',
        'util/console'
    ],
    function(
        $,
        jqueryCookie,
        _,
        Backbone,
        splunkd_utils,
        console
    ) {
        var sessionStoreInstance = null;
        var id = "_sessionStore_";
        var SessionStoreModel = Backbone.Model.extend({
            initialize: function() {
                Backbone.Model.prototype.initialize.apply(this, arguments);
                this.set("id", id);
            }, 
            sync: function(method, model, options) {
                options || (options = {});
                var def = $.Deferred();
                var data = null;
                switch(method){
                    case 'read':
                        try {
                            data = $.cookie(id);

                            if (data) {
                                data = JSON.parse(data);
                            }

                            if (options.success) {
                                options.success(data || {});
                            }
                            def.resolve();
                        }
                        catch(err) {
                            console.error('Fetch failed: ' + err);
                            if (options.error) {
                                options.error(err);
                            }
                            def.reject();
                        }
                        
                        return def;

                    case 'create':
                    case 'update':
                        try {
                            data = model.toJSON();
                            delete data["id"];
                            $.cookie(id, JSON.stringify(data));

                            if (options.success) {
                                options.success();
                            }
                            def.resolve();
                        }
                        catch(err) {
                            console.error('Save failed: ' + err);
                            if (options.error) {
                                options.error(err);
                            }
                            def.reject();
                        }
                        
                        return def;

                    case 'delete':
                        try {
                            $.cookie(id, null);
                            if (options.success) {
                                options.success();
                            }
                            def.resolve();
                        }
                        catch(err) {
                            console.error('Destroying failed: ' + err);
                            if (options.error) {
                                options.error(err);
                            }
                            def.reject();
                        }
                        return def;

                    default:
                        throw new Error('invalid method: ' + method);
                }
            }

        },
        {
            getInstance: function(force) {
                force = force || false;
                if (!sessionStoreInstance) {
                    sessionStoreInstance = new SessionStoreModel();
                }
                else {
                    if (typeof force === "boolean" && force) {
                        sessionStoreInstance.destroy();
                        sessionStoreInstance = new SessionStoreModel();
                    }
                }
                
                return sessionStoreInstance;
            }
        });
        return SessionStoreModel;
    }
);

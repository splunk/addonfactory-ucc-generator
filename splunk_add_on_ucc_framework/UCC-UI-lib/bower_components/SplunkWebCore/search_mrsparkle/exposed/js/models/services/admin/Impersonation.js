define(
    [
        'jquery',
        'underscore',
        'backbone',
        'util/splunkd_utils',
        'models/SplunkDBase'
    ],
    function(
        $,
        _,
        Backbone,
        splunkd_utils,
        BaseModel
        ) {
        /**
         * NOTE: this model is just a temporary workaround, which should be completely removed
         * as soon as the following ticket is resolved:
         * SPL-81537: EAI: fix behavior of wildcardFields on _new for endpoints that accept all POST arguments
         *
         * Please contact ykou if you have any question.
         */
        var syncCreate = function(model, options){
            var bbXHR, url,
                deferredResponse = $.Deferred(),
                defaults = {
                    data:{
                        output_mode: 'json',
                        name: model.entry.get('name')   // required for POST create
                    }
                };
            url = _.isFunction(model.url) ? model.url() : model.url;

            var app_and_owner = {};
            if (options.data){
                app_and_owner = $.extend(app_and_owner, { //JQuery purges undefined
                    app: options.data.app || undefined,
                    owner: options.data.owner || undefined,
                    sharing: options.data.sharing || undefined
                });
            }
            defaults.url = splunkd_utils.fullpath(url, app_and_owner);

            defaults.processData = true;
            $.extend(true, defaults.data, this.entry.content.toJSON());
            $.extend(true, defaults, options);

            delete defaults.data.app;
            delete defaults.data.owner;
            delete defaults.data.sharing;

            defaults.data = splunkd_utils.normalizeValuesForPOST(defaults.data);

            bbXHR = Backbone.sync.call(null, "create", model, defaults);
            bbXHR.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            bbXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });

            return deferredResponse.promise();
        };
        var syncUpdate = function(model, options){
            var bbXHR, url,
                deferredResponse = $.Deferred(),
                defaults = {data: {output_mode: 'json'}},
                id = model.id;

            url = splunkd_utils.fullpath(id, {});

            $.extend(true, defaults.data, model.entry.content.toJSON());
            $.extend(true, defaults, options);

            defaults.processData = true;
            defaults.type = 'POST';
            defaults.url = url;

            defaults.data = splunkd_utils.normalizeValuesForPOST(defaults.data);

            bbXHR = Backbone.sync.call(null, "update", model, defaults);
            bbXHR.done(function() {
                deferredResponse.resolve.apply(deferredResponse, arguments);
            });
            bbXHR.fail(function() {
                deferredResponse.reject.apply(deferredResponse, arguments);
            });

            return deferredResponse.promise();
        };
        var Model = BaseModel.extend({
            url: 'admin/conf-impersonation',
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            sync: function(method, model, options) {
                switch(method) {
                    case 'create':
                        return syncCreate.call(this, model, options);
                    case 'update':
                        return syncUpdate.call(this, model, options);
                    default:
                        return BaseModel.prototype.sync.apply(this, arguments);
                }
            },
            /**
             * Set provider name, automatically add 'provider:' as pre-fix
             * @param val   provider name
             * @param options   just the same as normal set() function
             * @returns {*} this
             */
            setName: function(val, options) {
                // convert the provider's name from 'myprovidername' to 'provider:myprovidername'
                if (val == null) return this;

                var key = 'name';
                val = 'provider:' + val;

                this.entry.set(key, val, options);
                return this;
            },

            /**
             * Get provider name, automatically remove 'provider:' prefix
             * @returns {*}
             */
            getName: function() {
                var val = this.entry.get('name');

                // convert the provider's name from 'provider:myprovidername' to 'myprovidername'
                if ((typeof val === 'string') && (val.slice(0, 9) === 'provider:')) {
                    val = val.slice(9);
                }

                return val;
            },

            /**
             * Get hadoop user name
             * @param splunkUser    splunk user name
             * @returns {*}     hadoo user name
             */
            getHadoopUser: function(splunkUser) {
                var data = this.entry.content.get(splunkUser);
                if (data) {
                    var hadoopUser = JSON.parse(data).user;
                }
                return hadoopUser;
            },

            /**
             * Get hadoop queue
             * @param splunkUser    splunk user name
             * @returns {*}     queue name
             */
            getHadoopQueue: function(splunkUser) {
                var data = this.entry.content.get(splunkUser);
                if (data) {
                    var hadoopQueue = JSON.parse(data).queue;
                }
                return hadoopQueue;
            },

            setAllAttributes: function(provider, splunkUser, hadoopUser, hadoopQueue) {
                this.setName(provider);
                this.entry.content.set(splunkUser, JSON.stringify({
                    user: hadoopUser,
                    queue: hadoopQueue
                }));
            }
        });
        return Model;
    }
);
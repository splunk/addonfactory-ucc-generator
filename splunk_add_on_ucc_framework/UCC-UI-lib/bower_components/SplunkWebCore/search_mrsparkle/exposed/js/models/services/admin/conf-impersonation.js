/**
 * Created by ykou on 2/26/14.
 */
define(
    [
        'models/SplunkDBase'
    ],
    function(
        BaseModel
        ) {
        // TODO: this model is deprecated, please use the Impersonation.js model
        return BaseModel.extend({
            url: 'admin/conf-impersonation',
            urlRoot: 'admin/conf-impersonation',

            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
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
    }
);
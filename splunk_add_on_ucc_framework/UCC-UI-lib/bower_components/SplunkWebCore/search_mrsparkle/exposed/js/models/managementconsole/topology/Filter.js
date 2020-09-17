/**
 * Created by lrong on 2/3/16.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/Base',
        'models/managementconsole/topology/Instance'
    ],
    function(
        $,
        _,
        Backbone,
        BaseModel,
        InstanceModel
    ) {
        var ALL_ATTRS = ['topology', 'serverClass', 'clientName', 'hostname', 'ip', 'dns', 'splunkPlatform', 'splunkVersion'],
            ARRAY_VAL_ATTRS = ['topology', 'serverClass'],
            DEPLOY_STATUS_ATTRS = ['upToDate'],
            STRING_VAL_ATTRS = ['clientName', 'hostname', 'ip', 'dns', 'splunkPlatform', 'splunkVersion'],
            getAllAttrs = function() {
                return ALL_ATTRS;
            },
            getArrayValAttrs = function() {
                return ARRAY_VAL_ATTRS;
            },
            getDeployStatusAttrs = function() {
                return DEPLOY_STATUS_ATTRS;
            },
            getStringValAttrs = function() {
                return STRING_VAL_ATTRS;
            };

        return BaseModel.extend(
            {
                defaults: {
                    topology: [],
                    serverClass: [],
                    clientName: '',
                    hostname: '',
                    ip: '',
                    dns: '',
                    splunkPlatform: '',
                    splunkVersion: '',
                    upToDate: 'all'
                },

                initialize: function() {
                    BaseModel.prototype.initialize.apply(this, arguments);
                    this._defaultQuery = {};
                },

                setTopology: function(isForwarderOnly) {
                    if (isForwarderOnly) {
                        this.set('topology', [InstanceModel.valForwarder()]);
                    }
                },

                resetAttrs: function(isForwarderOnly) {
                    this.set(this.defaults);
                    this.setTopology(isForwarderOnly);
                },

                setDefaultQuery: function(defaultQuery) {
                    this._defaultQuery = defaultQuery;
                },
                getDefaultQuery: function() {
                    return this._defaultQuery;
                }
            },
            {
                getAllAttrs: getAllAttrs,
                getArrayValAttrs: getArrayValAttrs,
                getDeployStatusAttrs: getDeployStatusAttrs,
                getStringValAttrs: getStringValAttrs
            }
        );
    }
);
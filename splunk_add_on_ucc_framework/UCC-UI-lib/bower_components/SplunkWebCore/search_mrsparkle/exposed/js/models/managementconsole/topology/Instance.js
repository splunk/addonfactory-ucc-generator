/**
 * Created by lrong on 8/5/15.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'helpers/managementconsole/url',
        'models/managementconsole/DmcBase',
        'models/managementconsole/Configuration',
        'collections/managementconsole/Bundles',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        Backbone,
        urlHelper,
        DmcBaseModel,
        ConfigurationModel,
        BundlesCollection,
        splunkdutils
    ) {

        var SPLUNK_ROLE_LABELS = {
                "unassigned": _('Unassigned').t(),
                "dmc": _('DMC').t(),
                "idxc:member": _('Indexer').t(),
                "shc:member": _('Search Head').t(),
                "forwarder:member": _('Forwarder').t(),
                "removed": _('Removed').t(),
                "deleted": _('Deleted').t()
            },
            ALL_GROUP = '_all';

        var getLabelFromSplunkRole = function(splunkRole) {
            return SPLUNK_ROLE_LABELS[splunkRole];
        };

        var valUnassigned = function() {
            return _.keys(SPLUNK_ROLE_LABELS)[0];
        };
        var valDMC = function() {
            return _.keys(SPLUNK_ROLE_LABELS)[1];
        };
        var valIDX = function() {
            return _.keys(SPLUNK_ROLE_LABELS)[2];
        };
        var valSH = function() {
            return _.keys(SPLUNK_ROLE_LABELS)[3];
        };
        var valForwarder = function() {
            return _.keys(SPLUNK_ROLE_LABELS)[4];
        };
        var valRemoved = function() {
            return _.keys(SPLUNK_ROLE_LABELS)[5];
        };
        var valDeleted = function() {
            return _.keys(SPLUNK_ROLE_LABELS)[6];
        };

        var confToTopo = {
            "_forwarders": valForwarder(),
            "_indexers": valIDX(),
            "_search_heads": valSH()
        };

        var configureGroupToTopologyGroup = function(confGroupId) {
            return confToTopo[confGroupId] || null;
        };

        return DmcBaseModel.extend(
            {

                urlRoot: '/services/dmc/instances',

                initialize: function() {
                    this.initializeCallCounter = 0;
                    DmcBaseModel.prototype.initialize.apply(this, arguments);
                    this._instanceMarkedForUpdate = false;
                },

                initializeAssociated: function() {
                    DmcBaseModel.prototype.initializeAssociated.apply(this, arguments);
                    if(!this.entry.content.bundlesCollection) {
                        this.entry.content.bundlesCollection = new BundlesCollection();
                    }
                },

                sync: function(method, model, options) {
                    var attrs = this.entry.content.toJSON();
                    //POST for create and update
                    if (method === 'create' || method == 'update') {
                        return Backbone.sync.call(this, 'create', model, $.extend(true, {attrs: attrs}, options));
                    } else {
                        return DmcBaseModel.prototype.sync.call(this, method, model, options);
                    }
                },

                parse: function(response, options) {
                    var responseObj = _.isArray(response) ? response[0] : response,
                        parsed = DmcBaseModel.prototype.parse.call(this, responseObj, options);

                    if (!_.isUndefined(responseObj)) {
                        var bundles = this.entry.content.get('@bundles');
                        this.entry.content.bundlesCollection.reset(bundles, {parse: true});
                    }

                    return parsed;
                },

                _onerror: function(model, response, options) {

                    // Current xhr response parser does not support the error format for the error from the agent.
                    // For any server exception we show 'server error' even if the response has a different message.
                    // The fix here is to check if we have a response with a error message and parse it manually , else
                    // use the existing error parser.
                    if (response && response.responseText) {
                        model.error.clear();
                        var errorObj = JSON.parse(response.responseText),
                            msg = errorObj.error.message;
                        if (msg) {
                            var message;
                            if (_.isObject(msg) && msg.description) {
                                message = splunkdutils.createMessageObject(splunkdutils.ERROR, msg.description);
                            } else  if (_.isString(msg)) {
                                message = splunkdutils.createMessageObject(splunkdutils.ERROR, msg);
                            }

                            if (message) {
                                this.trigger('serverValidated', false, this, [message]);
                                model.error.set("messages", message);
                                return;
                            }

                        }
                    }
                    DmcBaseModel.prototype._onerror.apply(this, arguments);
                },

                // returns an array of app names of the form [String, String, ..., String]
                getApps: function() {
                    return _.sortBy(this.getRelatedBundlesByType().app, function(app) {
                        return app.displayName.toLowerCase();
                    });
                },

                // returns an array of server classes names of the form [String, String, ..., String]
                getServerClasses: function() {
                    return _.sortBy(this.getRelatedBundlesByType().custom, function(serverClass) {
                        return serverClass.displayName.toLowerCase();
                    });
                },

                isAssigned: function() {
                    var splunkRole = this._getSplunkRole();
                    return !(_.isUndefined(splunkRole) || splunkRole === 'unassigned');
                },

                getMgmtUri: function() {
                    return this.entry.content.get('splunkMgmtUri');
                },

                getDetailFields: function() {
                    return [
                        'instanceId',
                        'clientName',
                        'hostname',
                        'ip',
                        'dns',
                        'splunkPlatform',
                        'version',
                        'lastPhoneHomeTime',
                        'serverClasses',
                        'apps',
                        'deployStatus'
                    ];
                },

                getUpToDateStatus: function() {
                    return this.entry.content.get('@upToDate');
                },

                getDetailFieldLabel: function(field) {
                    var STRINGS = {
                            INSTANCE_NULL_LABEL: _("N/A").t()
                        },
                        value,
                        label;

                    switch (field) {
                        case 'lastPhoneHomeTime':
                            value = this.entry.content.get('@lastPhoneHomeDiffNow');
                            label = this.getRelativeLastPhoneHomeTime();
                            break;
                        case 'serverClasses':
                            value = this.getServerClasses();
                            label = value.length;
                            break;
                        case 'apps':
                            value = this.getApps();
                            label = value.length;
                            break;
                        case 'deployStatus':
                            value = this.entry.content.get('@upToDate');
                            label = this.getDeployStatusLabel();
                            break;
                        case 'version':
                            value = this.getSplunkVersion();
                            label = this.getSplunkVersion();
                            break;
                        default:
                            value = this.entry.content.get(field);
                            label = value;
                    }

                    return {
                        value: value,
                        label: _.isUndefined(label) ? STRINGS.INSTANCE_NULL_LABEL : label
                    };
                },

                getSplunkVersion: function() {
                    return this.entry.content.get('splunkVersion') || this.getNullValueDisplay();
                },

                isLimitedProperty: function(field) {
                    if (field === 'serverClasses') {
                        return this.isBundleLimitedType('custom');
                    } else if (field === 'apps') {
                        return this.isBundleLimitedType('app');
                    } else {
                        return DmcBaseModel.prototype.isLimitedProperty.apply(this, arguments);
                    }
                },

                isBundleLimitedType: function(type) {
                    return (
                        DmcBaseModel.prototype.isLimitedProperty.call(this, '@relatedBundles') &&
                        _.contains(
                            this.entry.acl.get('limited_properties')['@relatedBundles'].types,
                            type
                        )
                    );
                },

                getSplunkRoleLabel: function() {
                    return getLabelFromSplunkRole(this._getSplunkRole());
                },

                _getSplunkRole: function() {
                    return this.entry.content.get('topology');
                },

                // Takes the @relatedBundles, formats them, and groups them into their
                // types.
                // Output example:
                // app: [
                //     {
                //         displayName: 'Splunk_TA_windows',
                //         name: 'Splunk_TA_windows',
                //         type: 'app'
                //     },
                //     {
                //         displayName: 'Splunk_TA_Star_Wars',
                //         name: 'Splunk_TA_Star_Wars',
                //         type: 'app'
                //     }
                // ],
                // custom: [
                //     {
                //         displayName: 'Server_Class',
                //         name: '_Server_Class',
                //         type: 'custom'
                //     },
                //      {
                //         displayName: 'Server_Class2',
                //         name: '_Server_Class2',
                //         type: 'custom'
                //     }
                // ],
                // builtin: [
                //     {
                //         displayName: 'Forwarders',
                //         name: '__forwarders',
                //         type: 'builtin'
                //     }
                // ]
                getRelatedBundlesByType: function() {
                    var relatedBundles = _.map(
                        this.entry.content.get('@relatedBundles'),
                        function(bundleValue, bundleKey) {
                            return {
                                displayName: DmcBaseModel.getBundleDisplayName(bundleKey),
                                name: bundleKey,
                                type: bundleValue.type
                            };
                        }
                    );

                    // Once the full set of instances comes online,
                    // be smarter about filtering out the "all" group.
                    // Ideally, the server only returns it when we are in
                    // "full" mode. "Forwarder mode" should only return 
                    // the "forwarder" group.
                    relatedBundles = _.reject(relatedBundles, function(bundle) {
                        return bundle.name === '__all';
                    });

                    return _.groupBy(relatedBundles, function(bundle) {
                        return bundle.type;
                    });
                },

                // For a given bundle name, return the display names of the groups
                // for that bundle, if they exist.
                // E.g. input: "Splunk_TA_windows".
                // and assume @relatedBundles =
                // { Splunk_TA_windows: { 
                //      type: 'app', 
                //      groups: {
                //          _forwarders: { type: 'builtin' },
                //          Server_Class: { type: 'custom' }
                //      }
                // } }
                //
                // Output:
                // ['Forwarders', 'Server_Class']
                getBundleGroups: function(bundle) {
                    var relatedBundles = this.entry.content.get('@relatedBundles'),
                        bundleData = relatedBundles && relatedBundles[bundle];

                    if (bundleData && bundleData.groups && _.keys(bundleData.groups).length) {
                        return _.map(bundleData.groups, function(groupAttributes, groupName) {
                            return DmcBaseModel.getGroupDisplayName(groupName, groupAttributes['type'], groupAttributes['displayName']);
                        });
                    } else {
                        return [];
                    }
                },

                // For a given bundle name, return its bundle type using the @relatedBundle attribute
                // Output:
                // 'custom', 'builtin', 'app', 'node'
                getBundleType: function(bundle) {
                    var relatedBundles = this.entry.content.get('@relatedBundles');
                    return _.isObject(relatedBundles) && _.isObject(relatedBundles[bundle]) && relatedBundles[bundle].type;
                },

                getBundleByBundleName: function(bundleName) {
                    return this.entry.content.bundlesCollection.find(function(bundle) {
                        return bundle.entry.get('name') === bundleName;
                    });
                },

                getConfigureUrl: function(opts) {
                    opts = opts || {};

                    if (!this.isAssigned()) {
                        return null;
                    }

                    _.defaults(opts, {
                        instance: this.entry.get('name'),
                        return_to: window.location.href,
                        return_to_page: 'topology_page'
                    });

                    return urlHelper.pageUrl(
                        'configure_group',
                        opts
                    );
                },

                isInstanceMarkedForUpdate: function() {
                    return this._instanceMarkedForUpdate;
                },

                setInstanceMarkedForUpdate: function(update) {
                    this._instanceMarkedForUpdate = update;
                },

                getDisplayName: function () {
                    return this.entry.content.get('clientName');
                },

                getBundleName: function () {
                    return this.entry.content.get('@bundle');
                }
            },
            {
                getLabelFromSplunkRole: getLabelFromSplunkRole,
                valUnassigned: valUnassigned,
                valDMC: valDMC,
                valIDX: valIDX,
                valSH: valSH,
                valForwarder: valForwarder,
                configureGroupToTopologyGroup: configureGroupToTopologyGroup
            }
        );
    }
);
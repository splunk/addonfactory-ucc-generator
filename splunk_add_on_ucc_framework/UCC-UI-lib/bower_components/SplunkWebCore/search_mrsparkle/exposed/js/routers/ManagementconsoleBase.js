/**
 *  This router is designed to be used for any DMC agent enable state check, as well as any RBAC check.
 */
define(
    [
        'underscore',
        'jquery',
        'backbone',
        'routers/Base',
        'models/managementconsole/DmcSettings',
        'models/managementconsole/topology/Topology',
        'models/services/server/ServerInfo',
        'models/managementconsole/DmcUser',
        'helpers/managementconsole/url'

    ],
    function(
        _,
        $,
        Backbone,
        BaseRouter,
        DmcSettingsModel,
        TopologyModel,
        ServerInfoModel,
        DmcUserModel,
        urlHelper
    ) {

        // Temporarily disabling the Enable Page, if dmc-conf is not enabled or topologies is not bootstrapped (or request is rejected),
        // we show 404 error page
        var checkDmcServerStateAndRedirect = function(options) {
            var pageUrl = window.location.pathname,
                enablerPageUrl = urlHelper.pageUrl('enabler'),
                dmcHomeUrl = urlHelper.pageUrl(),
                dmcSettingsModel = new DmcSettingsModel(),
                topologyModel = new TopologyModel(),
                dmcSettingsModelDeferred = dmcSettingsModel.fetch(),
                topologyModelDeferred = topologyModel.fetch(),
                skipRedirect = options && !!options.skipRedirect,

                dfd = $.when(dmcSettingsModelDeferred, topologyModelDeferred).always(function() {
                    if (!skipRedirect) {
                        if (pageUrl !== enablerPageUrl) {
                            if(!dmcSettingsModel.isEnabled()) {
                                showErrorPage();
                            } else {
                                if (topologyModelDeferred.state() === 'rejected' || !topologyModel.isBootstrapped()) {
                                    showErrorPage();
                                }
                            }
                        } else {
                            showErrorPage();
                        }
                    }
                });

            return {
                topologyModel: topologyModel,
                dmcSettingsModel: dmcSettingsModel,
                deferred: dfd
            };
        };

        var showErrorPage = function() {
            var url = urlHelper.pageUrl('error');
            redirectToUrl(url);
        };

        var redirectToUrl = function(url) {
            window.location.href = url;
        };

        return BaseRouter.extend({
            initialize: function(options) {
                options || (options={});
                options.model || (options.model={});
                options.model.serverInfo = options.model.serverInfo || new ServerInfoModel();
                options.model.user = options.model.user || new DmcUserModel({}, {serverInfoModel: options.model.serverInfo});

                BaseRouter.prototype.initialize.call(this, options);
                this.model = this.model || {};
                this.deferreds = this.deferreds || {};

                var returnObj = checkDmcServerStateAndRedirect({ skipRedirect: true });
                this.deferreds.capabilityChecked = returnObj.deferred;
                this.model.dmcSettings = returnObj.dmcSettingsModel;
                this.model.topology = returnObj.topologyModel;
            },

            page: function(locale, app, page) {
                var args = arguments;

                // Need to bootstrap the serverInfo and the user to check the user capabilities. In case the user does
                // not have sufficient capabilities we show an error page else we continue the page render.
                this.bootstrapServerInfo();
                this.bootstrapUser();
                $.when(
                    this.deferreds.user
                ).done(function() {
                    this.deferreds.capabilityChecked.always(function() {
                        BaseRouter.prototype.page.apply(this, args);
                    }.bind(this));
                }.bind(this));
            }
        },{
            checkDmcServerStateAndRedirect: checkDmcServerStateAndRedirect
        });
    }
);
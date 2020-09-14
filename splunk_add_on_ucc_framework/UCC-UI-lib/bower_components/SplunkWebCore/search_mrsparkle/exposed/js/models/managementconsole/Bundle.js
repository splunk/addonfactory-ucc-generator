define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/Configuration'
],
function($,
         _,
         Backbone,
         ConfigurationModel
) {
    var BUNDLE_TYPES = ConfigurationModel.BUNDLE_TYPES,
        BUNDLE_LABELS = {
            builtin: _('Server Role').t(),
            app: _('App').t(),
            custom: _('Server Class').t(),
            node: _('Instance').t()
        },
        BUNDLE_DISPLAY_NAMES = {
            forwarders: _('All Forwarders').t()
        };

    return ConfigurationModel.extend({
        initialize: function() {
            ConfigurationModel.prototype.initialize.apply(this, arguments);
        },

        isAllForwarders: function() {
            return this.getBundleId() === ConfigurationModel.BUILTIN_IDS.FORWARDERS;
        },

        canListStanzas: function() {
            return true;
        },

        getBundleId: function() {
            return this.entry.content.get('bundleId');
        },

        getDisplayName: function() {
            var bundleId = this.getBundleId(),
                bundleDisplayName = BUNDLE_DISPLAY_NAMES[bundleId];
            if (!_.isUndefined(bundleDisplayName)) {
                return bundleDisplayName;
            } else {
                return bundleId;
            }
        },

        getInternalBundleName: function() {
            var bundleId = this.getBundleId(),
                bundleType = this.getBundleType();

            if(bundleType === BUNDLE_TYPES.BUILTIN) {
                return '_'+bundleId;
            } else {
                return bundleId;
            }
        },

        getBundleType: function() {
            return this.entry.content.get('bundleType');
        },

        getBundleLabel: function() {
            var bundleType = this.getBundleType();
            return BUNDLE_LABELS[bundleType];
        },

        getConfigureUrlOpts: function(return_to_page) {
            var opts = {
                    return_to: window.location.href,
                    return_to_page: return_to_page
                },
                bundleType = this.getBundleType();

            if (bundleType === BUNDLE_TYPES.CUSTOM) {
                opts.group = this.getInternalBundleName();
            } else if (bundleType === BUNDLE_TYPES.APP) {
                opts.app = this.getInternalBundleName();
            } else if (bundleType === BUNDLE_TYPES.BUILTIN) {
                opts.group = this.getInternalBundleName();
            } else if (bundleType === BUNDLE_TYPES.NODE) {
                opts.instance = this.getInternalBundleName();
            }

            return opts;
        },

        getConfigureUrl: function(opts) {
            opts = this.getConfigureUrlOpts(opts.return_to_page);
            return ConfigurationModel.prototype.getConfigureUrl.call(this, opts);
        },

        getDeployStatusExplanation: function() {
            if (this.hasBundleDeployStatusError()) {
                return this.entry.content.get('error');
            } else {
                return null;
            }
        },

        getUpToDateStatus: function() {
            return this.entry.content.get('upToDate');
        },

        hasBundleDeployStatusError: function() {
            return !_.isUndefined(this.entry.content.get('error')) && !_.isNull(this.entry.content.get('error'));
        }
    });
});
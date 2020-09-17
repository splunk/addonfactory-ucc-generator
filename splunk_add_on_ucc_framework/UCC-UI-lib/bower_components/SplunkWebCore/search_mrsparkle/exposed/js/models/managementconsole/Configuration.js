define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/DmcBase',
        'helpers/managementconsole/url'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseModel,
        urlHelper
    ) {
        var BUILTIN_IDS = {
            INDEXERS: 'indexers',
            SEARCH_HEADS: 'search_heads',
            FORWARDERS: 'forwarders'
        },
        BUILTIN_CLASSES = {
            INDEXERS: '_indexers',
            SEARCH_HEADS: '_search_heads',
            FORWARDERS: '_forwarders'
        };

        // An abstract class, representing objects that
        // can be rendered in the conf UI.
        return DmcBaseModel.extend({
            // Meant to be overridden
            configureUrlKey: '',

            isCustom: function() {
                return false;
            },

            isBuiltin: function() {
                return false;
            },

            isSingleNode: function() {
                return false;
            },

            isApp: function() {
                return false;
            },

            isAllForwarders: function() {
                return this.entry.content.get('@bundle') === DmcBaseModel.BUILTIN_BUNDLE_NAMES.FORWARDERS;
            },

            getBundleId: function() {
                return this.getId();
            },

            getBundleType: function() {
                return this.entry.content.get('@type');
            },

            // Non-virtual functions
            getDisplayName: function() {
                return this.entry.get('name');
            },

            getConfigureUrl: function(opts) {
                var defaults = {};
                if (!this.canListStanzas()) {
                    return null;
                }

                if (!_.isUndefined(this.configureUrlKey)) {
                    defaults[this.configureUrlKey] = this.entry.get('name');
                }

				return urlHelper.pageUrl(
                    'configure_group',
                    $.extend(defaults, opts)
                );
            },
            
            getDataInputsUrl: function (bundleType, bundleName) {
                return urlHelper.pageUrl(
                    'inputs',
                    {bundleType: bundleType, bundle: bundleName}
                );
            },

            getPrefixedTitle: function() {
                return this.getPrefix() + ': ' + this.getTitle();
            },

            // Virtual/partial functions
            getTitle: function() {
                var memberCount = this.entry.content.get('@memberCount'),
                    singular = memberCount === 1;

                if (!_.isNumber(memberCount)) {
                    return this.getDisplayName();
                } else {
                    return this.getDisplayName() + ' ' +
                        '(' +
                        memberCount + ' ' +
                        (singular ? _('node').t() : _('nodes').t()) +
                        ')';
                }
            },

            getPrefix: function() {
                return '';
            },

            getBundleName: function() {
                return '';
            },

            getPreferredTypes: function() {
                return [];
            },

            getExistingTypes: function() {
                return this.entry.content.get('@existingTypes');
            },

            getDeployStatusMode: function() {
                if (this.isSingleNode()) {
                    return 'instance';
                } else if (this.isCustom()) {
                    return 'custom';
                } else if (this.isAllForwarders()) {
                    return 'forwarders';
                } else if (this.isApp()) {
                    return 'app';
                }
            },

            getDefaultDeployStatusFetchData: function() {
                return {
                    count: 10,
                    offset: 0,
                    deployStatusQuery: JSON.stringify(this.getDefaultDeployStatusQuery()),
                    query: JSON.stringify(this.getDeployStatusFilterQuery())
                };
            },

            getUpToDateRatioFields: function() {
                return [undefined, undefined];
            },

            getInstancesUpToDateRatio: function() {
                var fields = this.getUpToDateRatioFields(),
                    upToDateInstancesField = fields[0],
                    totalInstancesField = fields[1];

                if (_.isUndefined(upToDateInstancesField) || _.isUndefined(totalInstancesField)) {
                    throw new Error('Tried to call getInstancesUpToDateRatio without specifying fields');
                }

                var upToDateInstanceCount = this.entry.content.get(upToDateInstancesField),
                    totalInstanceCount = this.entry.content.get(totalInstancesField);

                if (_.isUndefined(upToDateInstanceCount) || _.isUndefined(totalInstanceCount)) {
                    return _('Unknown').t();
                }

                return upToDateInstanceCount + '/' + totalInstanceCount;
            },

            canShowRelated: function() {
                return false;
            }
        },
        {
            BUILTIN_CLASSES: BUILTIN_CLASSES,
            BUILTIN_IDS: BUILTIN_IDS
        });
    }
);
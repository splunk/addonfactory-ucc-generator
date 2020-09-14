define(
	[
		'jquery',
		'underscore',
		'backbone',
		'models/managementconsole/Configuration',
        'models/managementconsole/topology/Filter',
        'collections/managementconsole/topology/Instances',
		'helpers/managementconsole/url',
        'helpers/managementconsole/Filters'
	],
	function(
		$,
		_,
		Backbone,
		ConfigurationModel,
        FilterModel,
        InstancesCollection,
		urlHelper,
        FilterHelpers
	) {
		var INTERNAL_DESCRIPTIONS = {
            _indexers: _('Instances in the indexer tier').t(),
            _search_heads: _('Instances in the search head tier').t(),
            _universal_forwarders: _('Instances that are universal forwarders').t(),
            _heavy_forwarders: _('Instances that are heavy forwarders').t(),
            _forwarders: _('Instances that are forwarders.').t(),
            _all: _('All instances in the deployment').t()
        },
        TYPE_TO_PREFIX = {
            node: _('Instance').t(),
            custom: _('Server Class').t(),
            builtin: _('Server Role').t()
        };


		return ConfigurationModel.extend(
			{
				urlRoot: '/services/dmc/groups',
				configureUrlKey: 'group',

                getApps: function() {
                    return this.entry.content.get('@apps');
                },

				isSingleNode: function() {
					return this.entry.content.get('@type') === 'node';
				},

				isBuiltin: function() {
					return this.entry.content.get('@type') === 'builtin';
				},

				isCustom: function() {
					return this.entry.content.get('@type') === 'custom';
				},

				getBundleType: function() {
					return this.entry.content.get('@type');
				},

				canShowRelated: function() {
					if (this.isSingleNode()) {
						return true;
					}
					return ConfigurationModel.prototype.canShowRelated.apply(this, arguments);
				},

				getDisplayName: function() {
					var displayName = ConfigurationModel.getGroupDisplayName(
						this.entry.get('name'),
						this.getBundleType(),
                        this.entry.content.get('displayName')
					);

					return displayName || ConfigurationModel.prototype.getDisplayName.apply(this, arguments);
				},

				getDescription: function() {
					if (this.isBuiltin()) {
						return INTERNAL_DESCRIPTIONS[this.entry.get('name')];
					}
					return this.entry.content.get('description');
				},


                // Everything is a forwarder right now so, just return forwarder ones
                getPreferredTypes: function() {
                    return [
                        'inputs',
                        'outputs',
                        'props',
                        'transforms'
                    ];
                },

                getTitle: function() {
                    // If it is a single node group,
                    // or, if memberCount is not known,
                    // fallback:
                    //   the title is just the name of the node
                    if (this.isSingleNode()) {
                        return this.getDisplayName();
                    }
                    // Otherwise it is the displayName plus the count of nodes
                    else {
                        return ConfigurationModel.prototype.getTitle.apply(this, arguments);
                    }
                },

                getPrefix: function() {
                    return TYPE_TO_PREFIX[this.entry.content.get('@type')];
                },

                getBundleName: function() {
                    return this.entry.content.get('@bundle');
                },

				getEditUrl: function(opts) {
					return urlHelper.pageUrl(
						'configure_custom_group',
						$.extend(
							opts,
							{
								group: this.entry.get('name')
							}
						)
					);
				},

				getDetailFields: function() {
					if (this.isCustom()) {
                        return [
                            'description',
                            'whitelist',
                            'blacklist',
                            'machineTypesFilter',
                            '@apps'
                        ];
                    } else {
                        return ConfigurationModel.prototype.getDetailFields.apply(this, arguments);
                    }
                },

                getDetailFieldLabel: function(field) {
                    var STRINGS = {
                            DEFAULT_NULL_LABEL: _("Not Set").t(),
                            APPS_NULL_LABEL: _("None Installed").t()
                        },
                        value = this.entry.content.get(field),
                        label = value ? value : STRINGS.DEFAULT_NULL_LABEL;

                    if (field === '@apps') {
                        label = (_.isArray(value) && value.length) ?
                        	value.join(', ') :
                        	STRINGS.APPS_NULL_LABEL;
                    }

                    return {
                        value: value,
                        label: label
                    };
                },

                getType: function() {
                    return 'group';
                },

                getDeployStatusFilterQuery: function() {
                    var filterModel,
                        defaultInstancesQuery;

                    if (this.isBuiltin()){
                        filterModel = new FilterModel();
                        defaultInstancesQuery = InstancesCollection.getDefaultInstancesQuery();
                    } else if (this.isCustom()) {
                        filterModel = new FilterModel({serverClass: [this.getBundleId()]});
                        defaultInstancesQuery = {};
                    }

                    // only need to have a server class context filter for the server class and all forwarders status dialog case
                    return $.extend(true, FilterHelpers.getFilterQuery(filterModel), defaultInstancesQuery);
                },

                deployStatusNeedsRefetch: function(currFetchData) {
                    var defaultDeployStatusQuery = this.getDefaultDeployStatusQuery();
                    return currFetchData.get('offset') !== 0 ||
                           currFetchData.get('deployStatusQuery') !== JSON.stringify(defaultDeployStatusQuery);
                },

                getDefaultDeployStatusQuery: function() {
                    return {};
                },

                getMemberCount: function() {
                    return this.entry.content.get('@memberCount');
                },

                getUpToDateRatioFields: function() {
                    return ['@upToDateMemberCount', '@memberCount'];
                },

                sync: function(method, model, options) {
                    var defaults = {
                        attrs: {
                            description: '',
                            whitelist: '',
                            blacklist: '',
                            machineTypesFilter: '',
                            filterType: 'whitelist'
                        }
                    };

                    if (method === 'update' || method === 'create') {
                        defaults.attrs = $.extend(true, defaults.attrs, this.entry.content.toJSON());

                        if (method === 'create') {
                            defaults.attrs.name = this.entry.get('name');
                        }
                    }

                    options = $.extend(true, defaults, options);

                    return ConfigurationModel.prototype.sync.call(this, method, model, options);
                }
            }
        );
    }
);
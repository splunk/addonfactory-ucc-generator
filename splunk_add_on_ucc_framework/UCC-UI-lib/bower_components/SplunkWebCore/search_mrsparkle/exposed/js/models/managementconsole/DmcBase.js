define(
	[
		'jquery',
		'underscore',
		'backbone',
		'models/SplunkDBase',
		'util/splunkd_utils',
        'util/time',
		'helpers/managementconsole/url',
	    'models/managementconsole/LinkModel'
	],
	function(
		$,
		_,
		Backbone,
		SplunkDBaseModel,
		splunkdUtils,
        time_utils,
		urlHelper,
	    LinkActionsModel
	) {
		var BUNDLE_TYPES = {
				BUILTIN: 'builtin',
				APP: 'app',
				CUSTOM: 'custom',
				NODE: 'node'
			},
			BUILTIN_BUNDLE_NAMES = {
				ALL: '__all',
				FORWARDERS: '__forwarders',
				INDEXERS: '__indexers',
				SEARCH_HEADS: '__search_heads'
			},
			BUNDLE_TO_DISPLAY_NAME = {
				__forwarders: _('All Forwarders').t()
			},
            BUNDLE_ID_TO_DISPLAY_NAME = {
                forwarders: _('All Forwarders').t()
            },
			INTERNAL_GROUP_DISPLAY_NAMES = {
				_indexers: _('Indexers').t(),
				_search_heads: _('Search Heads').t(),
				_universal_forwarders: _('Universal Forwarders').t(),
				_heavy_forwarders: _('Heavy Forwarders').t(),
				_forwarders: _('All Forwarders').t(),
				_all: _('All').t()
			},
            NULL_VALUE_DISPLAY = _('Unknown').t(),
            BUNDLE_TYPE_PREFIX = {
                app: _('App').t(),
                custom: _('Server Class').t(),
                group: _('Server Class').t()
            },
			getBundleId = function(bundle) {
            	if (!_.isString(bundle)) return '';
				return bundle.replace(/^_+/, '');
            },
            getBundleDisplayName = function(bundle) {
                var known = BUNDLE_TO_DISPLAY_NAME[bundle] || BUNDLE_ID_TO_DISPLAY_NAME[bundle];
                if (known) {
                    return known;
                } else {
                    // The display name of all non-internal bundles is
                    // computed by removing the underscores from before
                    // the bundle name.
                    return getBundleId(bundle);
                }
            };

		return SplunkDBaseModel.extend(
			{
				initialize: function() {
					var url = '';
					SplunkDBaseModel.prototype.initialize.apply(this, arguments);

					if (_.isString(url = this.url)) {
						this.url = function() {
							return splunkdUtils.fullpath(url);
						};
					}
					this.linkModel = new LinkActionsModel();
					this.listenTo(this.linkModel, 'serverValidated', this.onLinkServerValidated);
				},

				/**
			 	*  Proxy any serverValidated errors from the linkModel to parent Model.
			 	*/
				onLinkServerValidated: function() {
					var triggerArgs = ["serverValidated"];
					for (var i = 0; i < arguments.length; i++) {
						triggerArgs.push(arguments[i]);
					}
					this.trigger.apply(this, triggerArgs);
				},

				getFullUrlRoot: function(urlRoot) {
                    urlRoot = urlRoot || this.urlRoot;
					return splunkdUtils.fullpath(urlRoot);
				},

				url: function(urlRoot) {
					var id = this.getId();
					urlRoot = urlRoot || this.getFullUrlRoot(urlRoot);

					return (urlRoot +
						(id ? ('/'+ encodeURIComponent(id)) : '')
					);
				},

				getId: function() {
					return this.entry.get('name');
				},

				sync: function(method, model, options) {
					// Skirt around SplunkDBaseModel for this case -
					// It makes a '_new' call among other things that are not necessary
					// for this model
					var defaults = {
						url: method === 'create' ? this.getFullUrlRoot() : this.url(),
						attrs: {}
					};

					if (method === 'update') {
						defaults.type = 'POST';
					}
					if (method === 'create') {
						defaults.attrs.name = this.entry.get('name') || '';
					}

					options = $.extend(true, defaults, options);

					return Backbone.sync.call(this, method, model, options);
				},

				// Get isNew to work properly
				parse: function(response, options) {
					if (!response || !response.entry || response.entry.length === 0) {
						return;
					}
					var response_entry = response.entry[0];
					response_entry.links = $.extend(true, { alternate: response_entry.name }, response_entry.links);
					return SplunkDBaseModel.prototype.parse.call(this, response, options);
				},

				// Check if a model is currently polling
				isPolling: function() {
					return !_.isUndefined(this.ticker) && this.ticker !== null;
				},

				isPending: function() {
					return !!this.entry.content.get('@pending');
				},

				getPendingText: function() {
					if (this.isPending()) {
						return _('See Details').t();
					} else {
						return '';
					}
				},

                getRelativeLastPhoneHomeTime: function() {
                    var lastPhoneHomeDiff = this.entry.content.get("@lastPhoneHomeDiffNow");
                    if (_.isUndefined(lastPhoneHomeDiff) || _.isNull(lastPhoneHomeDiff)) {
                        return NULL_VALUE_DISPLAY;
                    } else {
                        return time_utils.getRelativeStringFromSeconds(lastPhoneHomeDiff, false);
                    }
                },

				// Overridden by subclasses
				getType: function() {
					return '';
				},

				// Overriden by subclasses
				getBundleType: function(bundle) {
					return '';
				},

                getDeployStatusLabel: function() {
                    var upToDate = this.getUpToDateStatus();
                    if (_.isUndefined(upToDate) || _.isNull(upToDate)) return _('N/A').t();

                    if (upToDate) {
                        return _('Up-to-date').t();
                    } else {
                        return _('Out-of-date').t();
                    }
                },

                getNullValueDisplay: function() {
                    return NULL_VALUE_DISPLAY;
                },

				/*
				 * Link action functions
				 */
				performAction: function (action, options) {
					var $deferred = $.Deferred();
					var url = this.entry.links.get(action);
					if (url) {
						this.linkModel.id = splunkdUtils.fullpath(url);
						this.linkModel.save({}, options )
							.done(function() {
							$deferred.resolve.apply($deferred, arguments);
						  })
							.fail(function() {
							$deferred.reject.apply($deferred, arguments);
						  });
					} else {
						$deferred.reject('invalid action: ' + action);
					}
					return $deferred.promise();
				},

				isEnabled: function () {
					return !!this.entry.links.get('disable');
				},

				enable: function () {
					return this.performAction('enable');
				},

				disable: function () {
					return this.performAction('disable');
				},

				revert: function () {
					return this.performAction('revert');
				},

				move: function (newBundle) {
					return this.performAction('move', {
						attrs: { 'bundle': newBundle }
					});
				},

				getDetailFields: function() {
					return null;
				},

				// Default mapping for field -> (value, label)
				// This is overridden by subclasses
				getDetailFieldLabel: function(field) {
					return {
						value: field,
						label: field
					};
				},

				/**
                 * Constructs a formatted model to help properly display detail labels
                 * on configuration pages, while still retaining the raw value for that model's attributes.
                 * This method relies on the 'getDetailFields' defined for each group type
                 * @returns
                 *  field1: {
                 *      value: value1,
                 *      label: label1
                 *  },
                 *  field2: {
                 *      value: value2,
                 *      label: label2
                 *  } ...
                 *
                 */
	            getFormattedDetailValues: function() {
                    var detailFields = this.getDetailFields();

                	if (detailFields) {
                		return _.object(
	                    	detailFields,
	                    	_.map(detailFields, function(field) {
	                    		var fieldLabel = this.getDetailFieldLabel(field);

	                    		if (this.isLimitedProperty(field)) {
	                    			fieldLabel.value = null;
	                    			fieldLabel.label = this.getLimitedPropertyMessage();
	                    		}

	                    		return fieldLabel;
	                    	}, this)
	                    );
	                } else {
	                	return null;
	                }
	            },

				hasDetails: function() {
					var detailFields = this.getDetailFields();
					return _.isArray(detailFields) && detailFields.length > 0;
				},

				// calls validate() on root, entry and entry.content and returns consolidated result
				validate: function () {
					var entryValidateResult = this.entry.validate();
					var entryContentValidateResult = this.entry.content.validate();
					var aclValidateResult = this.entry.acl.validate();
					var rootValidateResult = SplunkDBaseModel.prototype.validate.apply(this, arguments);

					// NOTE: this conform the format of Backbone.Validation plugin. If we stopped using this plug in, we need to
					// manually update this logic to generate proper format of validation result.
					if (entryValidateResult || entryContentValidateResult || aclValidateResult || rootValidateResult) {
						return _.defaults({}, entryValidateResult, entryContentValidateResult, aclValidateResult, rootValidateResult);
					}
					return undefined;
				},

				/* 
				 * ACL-related functions
				 */
				canEdit: function() {
					return this._getAcl('can_write');
				},

				canDelete: function() {
					return this._getAcl('removable');
				},

				canListStanzas: function() {
					return this.entry.links.has('stanzas');
				},

				isLimitedProperty: function(prop) {
					return this._aclExists('limited_properties') &&
						_.has(this.entry.acl.get('limited_properties'), prop);
				},

				getLimitedPropertyMessage: function() {
					return _('You do not have permission to view this information.').t();
				},

				// Returns a boolean from a boolean acl property
				// If the acl property simply doesn't exist,
				// take that to mean the property is `true`
				_getAcl: function(aclName) {
					return !this._aclExists(aclName) ||
						this.entry.acl.get(aclName);
				},

				_aclExists: function(aclName) {
					return !_.isUndefined(this.entry.acl) &&
						this.entry.acl.has(aclName);
				}
			},
			{
				// This is duplicating knowledge that the server has,
				// Ideally every bundle would be accompanied with its display name.
				getBundleDisplayName: getBundleDisplayName,

				getBundleId: getBundleId,

				getGroupDisplayName: function(groupName, groupType, groupDisplayName) {
					switch (groupType) {
						case 'node':
							return groupDisplayName;
						case 'builtin':
							return INTERNAL_GROUP_DISPLAY_NAMES[groupName];
						case 'custom':
							return groupName;
						default:
							return '';
					}
				},

                getBundleContextLabel: function(bundleId, bundleType) {
                    var bundleTypePrefix = BUNDLE_TYPE_PREFIX[bundleType];
                    var displayName = getBundleDisplayName(bundleId);

                    if (!_.isUndefined(bundleTypePrefix)) {
                        displayName = bundleTypePrefix + ': ' + displayName;
                    }
                    return displayName;
                }.bind(this),

				PENDING_COLUMN_NAME: _('Pending Change').t(),
                NULL_VALUE_DISPLAY: NULL_VALUE_DISPLAY,
				BUNDLE_TYPES: BUNDLE_TYPES,
				BUILTIN_BUNDLE_NAMES: BUILTIN_BUNDLE_NAMES
			}
		);
	}
);

define(
	[
		'jquery',
		'underscore',
		'backbone',
		'models/managementconsole/DmcBase',
		'mixins/managementconsole/StanzaMixin',
        'util/splunkd_utils'
	],
	function(
		$,
		_,
		Backbone,
		DmcBaseModel,
		StanzaMixin,
		splunkdUtils
	) {
		var NOT_UNIQUE_ERROR = _("Failed to save due to invalid keys. Keys must be unique.").t();
		var EMPTY_STRING_ERROR = _("Failed to save due to invalid keys. Keys can not be empty.").t();

		// Returns a merging of default and local attributes.
		// Retains both default and local values for the key in question,
		// also computing the final value (local wins over default)
		// Additionally, all keys that appeared in default come before those in local.
		//
		// Example:
		//	defaultList: 	[ ["goo", "6"], ["foo", "5"] ]
		// 	localList: 		[ ["foo", "1"], ["bar", "2"], ["baz", "3"] ]
		//
		// Returns:
		// [ 
		//		["goo", { defaultValue: "6", localValue: null, finalValue: "6" }],
		//		["foo", { defaultValue: "5", localValue: "1", finalValue: "1" }],
		//		["bar", { defaultValue: null, localValue: "2", finalValue: "2" }],
		//		["baz", { defaultValue: null, localValue: "3", finalValue: "3" }]
		// ]
		var getMergedDefaultLocal = function(defaultList, localList) {
			var localObject = null,
            	defaultObject = null,
				merged = [];

			defaultList = defaultList || [];
			localList = localList || [];

			localObject = _.object(localList);
            defaultObject = _.object(defaultList);

            // All the defaults come first, get them and merge
            // with local, if local exists.
            // Flag local as "consumed" by deleting it.
			merged = _.map(defaultList, function(def) {
                var key = def[0],
                    defaultValue = def[1],
                    localValue = localObject[key],
                    finalValue = null;

                // This means the key is in local and default
                if (!_.isUndefined(localValue)) {
                	// Keep track of locals that have been merged
                    delete localObject[key];
                    finalValue = localValue;
                } 
                // This means the key is *only* in default
                else {
                	finalValue = defaultValue;
                	localValue = null;
                }

                return [
                    key, 
                    {
                        localValue: localValue,
                        defaultValue: defaultValue,
                        finalValue: finalValue
                    }
                ];
            });

			// Take all the default/local merges and append
			// the items that only have a local
            merged = merged.concat(
                _.map(
                	// Get rid of all locals that were dealt
                	// with in the previous pass
                    _.filter(localList, function(attr) {
                        return _.has(localObject, attr[0]);
                    }),
                    function(attr) {
                        var localValue = attr[1];

                        return [
                            attr[0],
                            {
                                localValue: localValue,
                                defaultValue: null,
                                finalValue: localValue
                            }
                        ];
                    }
            ));

            return merged;
		};

		// Returns a merging of default and local attributes.
		// If the key is defined in only one, it is added with its value.
		// If the key is defined in both, the local value wins.
		// Additionally, all keys that appeared in default come before those in local.
		//
		// Example:
		//	default: 	[ ["goo", "6"], ["foo", "5"] ]
		// 	local: 		[ ["foo", "1"], ["bar", "2"], ["baz", "3"] ]
		//
		// Returns:
		// [ ["goo", "6"], ["foo", "1"], ["bar", "2"], ["baz", "3"] ]
		var getMergedFinal = function(defaultList, localList) {
			return _.map(
				getMergedDefaultLocal(defaultList, localList), 
				function(attribute) {
					return [ attribute[0], attribute[1].finalValue ];
				}
			);
		};

		var StanzaModel = DmcBaseModel.extend(
			{
				urlRoot: '/services/dmc/stanzas',
                exportUrlRoot: '/services/dmc/stanzas-export',

				// Can revert if there is anything in local
				canRevert: function() {
					return this.hasDefaults() && this.hasLocals();
				},

				canDelete: function() {
					return DmcBaseModel.prototype.canDelete.apply(this, arguments) &&
						!this.hasDefaults();
				},

				hasDefaults: function() {
					return this._hasAttributes('default');
				},

				hasLocals: function() {
					return this._hasAttributes('local');
				},

				getExportUrl: function() {
                    return this.url(this.getFullUrlRoot(this.exportUrlRoot));
				},

				getType: function() {
					return 'stanza';
				},

				sync: function(method, model, options) {
					options = options || {};
					var defaults = {
							attrs: {
								local: this.entry.content.get('local') || {},
								warnings: _.isUndefined(options.warnings) ? false : options.warnings
							}
						};
					delete options.warnings;

					options = $.extend(true, defaults, options);

					return DmcBaseModel.prototype.sync.call(this, method, model, options);
				},

				// Automatically populates the "local" object
				// given a list of tuples, taken to be the key <-> value mapping.
				// Performs basic validation: ensures no duplicate keys,
				// scrubs key/values and then sets 'local'.
				// If successful, returns null.
				// If not successful, returns the error message.
				setLocalFromList: function(attrsList) {
					var trimmedKeysAttrsList = _.map(attrsList, function(attr) {
							var key = $.trim(attr[0]),
								value = attr[1];
							return [key, value];
						}),
						local = _.object(trimmedKeysAttrsList),
						allKeysUnique = _.size(attrsList) === _.size(local),
						noEmptyKeys = !_.has(local, ''),
						valid = allKeysUnique && noEmptyKeys;

					if (valid) {
						this.entry.content.set('local', trimmedKeysAttrsList);
						return;
					} else if (!allKeysUnique) {
						return NOT_UNIQUE_ERROR;
					} else if (!noEmptyKeys) {
						return EMPTY_STRING_ERROR;
					}
				},

				// Have to override this here because the urlRoot is
				// really dependent on bundle/type for stanzas too
				getFullUrlRoot: function() {
					return this.getResolvedUrl(
						DmcBaseModel.prototype.getFullUrlRoot.apply(this, arguments),
						this.entry.content.get('bundle'),
						this.entry.content.get('type')
					);
				},

				revert: function(options) {
					var oldLocal = this.entry.content.get('local');

					this.entry.content.set('local', null);

					return this.save(options).fail(function() {
						this.entry.content.set('local', oldLocal);
					}.bind(this));
				},

				getMergedFinal: function() {
					return getMergedFinal(
						this.entry.content.get('default'),
						this.entry.content.get('local')
					);
				},

				getMergedDefaultLocal: function() {
					return getMergedDefaultLocal(
						this.entry.content.get('default'),
						this.entry.content.get('local')
					);
				},

				getBundleDisplayName: function() {
                    var bundle = this.entry.content.get('bundle');
                    var bundleType = this.entry.content.get('@bundleType');
                    return DmcBaseModel.getBundleContextLabel(bundle, bundleType);
				},

				getBundleId: function() {
					return DmcBaseModel.getBundleId(
						this.entry.content.get('bundle')
					);
				},

				_hasAttributes: function(attr) {
					var val = this.entry.content.get(attr);
					return _.isArray(val) && val.length > 0;
				}
			},
			{
				getMergedDefaultLocal: getMergedDefaultLocal,
				getMergedFinal: getMergedFinal,

				// This boilerplate is the only way to have backbone-initialized
				// default properties on the content model
				Entry: DmcBaseModel.Entry.extend(
					{},
					{
						Content: DmcBaseModel.Entry.Content.extend({
							defaults: {
								'default': null,
								local: null
							}
						})
					}
				)
			}
		);

		_.extend(StanzaModel.prototype, StanzaMixin);
		return StanzaModel;
	}
);
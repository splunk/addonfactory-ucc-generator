/**
 * Created by lrong on 1/15/16.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'models/managementconsole/DmcBase',
        'models/managementconsole/Stanza',
        'models/managementconsole/App',
        'util/time'
    ],
    function(
        $,
        _,
        Backbone,
        DmcBaseModel,
        StanzaModel,
        AppModel,
        timeUtil
    ) {
        var LABELS = {
                stanza: _('Stanza').t(),
                app: _('App').t(),
                group: _('Server Class').t(),
                custom: _('Server Class').t(),
                node: _('Node').t(),
                builtin: _('Server Role').t(),
                insert: _('Create').t(),
                update: _('Update').t(),
                'delete': _('Delete').t(),
                not_set: _('Not Set').t(),
                'null': _('Unknown').t()
            },
            APP_LABELS = {
                insert: _('Install').t(),
                update: _('Edit Properties').t(),
                'delete': _('Uninstall').t(),
                upgrade: _('Update').t(),
                _forwarders: _('All Forwarders').t(),
                no_forwarders: _('No Forwarders').t(),
                no_version: _('None').t()
            },
            STANZA = {
                ADDED_BEFORE: 'STANZA_ADDED_BEFORE',
                REMOVED_AFTER: 'STANZA_REMOVED_AFTER',
                NO_ATTRIBUTES: 'STANZA_NO_ATTRIBUTES'
            };

        return DmcBaseModel.extend(
            {
                urlRoot: '/services/dmc/changes',

                /*
                 * Shared methods
                 */
                isPending: function() {
                    return this.entry.content.get('state') === 'pending';
                },

                getEditTime: function() {
                    return timeUtil.convertToLocalTime(this.entry.content.get('time'));
                },

                getEntityTypeLabel: function() {
                    return LABELS[this.entry.content.get('type')] || LABELS['null'];
                },

                getEntityName: function() {
                    return this._readKeyProperty('name') || LABELS['null'];
                },

                getOperationTypeLabel: function() {
                    if (this.isAppChange()) {
                        return APP_LABELS[this.entry.content.get('opType')] || LABELS['null'];
                    } else {
                        return LABELS[this.entry.content.get('opType')] || LABELS['null'];
                    }
                },

                getBeforeState: function() {
                    return this.entry.content.get('before');
                },

                getAfterState: function() {
                    return this.entry.content.get('after');
                },

                getDeployedOnTime: function() {
                    return timeUtil.convertToLocalTime(this.entry.content.get('deployedOn'));
                },

                // Key is the entity name for serverClass & app changes
                // stanza changes have more information in the key: name, bundleType, bundleId, type
                _readKeyProperty: function(property) {
                    var key = this.entry.content.get('key');
                    return (key && key[property]) ? key[property] : null;
                },

                /*
                 * Stanza change methods (type = 'stanza')
                 */
                isStanzaChange: function() {
                    return this.entry.content.get('type') === 'stanza';
                },

                getBundleDisplayName: function() {
                    var bundleId = this.getBundleId();
                    var bundleType = this._readKeyProperty('bundleType');

                    return DmcBaseModel.getBundleContextLabel(bundleId, bundleType);
                },

                // @clientName is the most updated Client Name for each forwarder that's computed by the backend whenever
                // Changes record is requested. Therefore in the context of Node bundle, we use @clientName as the bundle Id
                // instead of the bundleId attribute in the key, which is the forwarder instance id that can't be changed
                getBundleId: function() {
                    if (this._readKeyProperty('bundleType') === 'node') {
                        return this.entry.content.get('@clientName');
                    } else {
                        return this._readKeyProperty('bundleId') || LABELS['null'];
                    }
                },

                getStanzaType: function() {
                    return this._readKeyProperty('type') || LABELS['null'];
                },

                /**
                 * This method returns the merged attribute list in an object form, with handlers
                 * for no before/after state, empty attribute set, and attributes not set.
                 * @return
                 *  {
                 *      'a': {
                 *          'before': '1',
                 *          'after': '3'
                 *       },
                 *      'b': {
                 *          'before': 'Not Set',
                 *          'after': '2'
                 *       }
                 *  },
                 *  {
                 *      '': {
                 *          'before': 'STANZA_ADDED_BEFORE',
                 *          'after': 'STANZA_NO_ATTRIBUTES'
                 *       }
                 *  }
                 */
                getMergedAttributesObj: function() {
                    var beforeAttributes = this.getBeforeAttributes(),
                        afterAttributes = this.getAfterAttributes(),
                        beforeAttrObj = this._convertAttrArrToObj(beforeAttributes, true),
                        afterAttrObj= this._convertAttrArrToObj(afterAttributes, false),
                        beforeHelpText = this._setHelpText(beforeAttributes, true),
                        afterHelpText = this._setHelpText(afterAttributes, false),
                        emptyResultHelpObj = {
                            '': {
                                before: beforeHelpText,
                                after: afterHelpText
                            }
                        },
                        mergedResult = {};

                    // Merge before and after attribute objects
                    _.each(beforeAttrObj, function(val, key) {
                        if (afterAttrObj[key]) {
                            // Ignore the attributes that have no changes
                            if (afterAttrObj[key].after !== val.before) {
                                mergedResult[key] = $.extend({}, val, afterAttrObj[key]);
                            }
                        } else {
                            mergedResult[key] = $.extend({}, val, { after: afterHelpText });
                        }
                    });
                    _.each(afterAttrObj, function(val, key) {
                        if (!beforeAttrObj[key]) {
                            mergedResult[key] = $.extend({}, { before: beforeHelpText }, val);
                        }
                    });

                    // No attribute cases - stanza creation, deletion, or no attribute edit updates
                    if (_.isEmpty(mergedResult)) {
                        mergedResult = emptyResultHelpObj;
                    }

                    return mergedResult;
                },

                getBeforeAttributes: function() {
                    return this._getAttributes(this.getBeforeState());
                },

                getAfterAttributes: function() {
                    return this._getAttributes(this.getAfterState());
                },

                _getAttributes: function(state) {
                    return state ? StanzaModel.getMergedFinal(state['default'], state.local) : null;
                },

                /**
                 * This method converts attributes from array of arrays form to object form
                 * attributes: [
                 *    ['a', '1'],
                 *    ['b', '2']
                 * ]
                 * isBefore: true
                 * @return
                 *  {
                 *      'a': {
                 *          'before': '1'
                 *       },
                 *      'b': {
                 *          'before': '2'
                 *       }
                 *  }
                 */
                _convertAttrArrToObj: function(attributes, isBefore) {
                    var attrName = isBefore ? 'before' : 'after';

                    // Return empty object if attribute array is empty or null
                    if (!attributes) {
                        return {};
                    }

                    return _.reduce(attributes, function(attrObj, attrArr) {
                        var attrObjContent = {};

                        attrObjContent[attrName] = attrArr[1];
                        attrObj[attrArr[0]] = attrObjContent;
                        return attrObj;
                    }, {});
                },

                _setHelpText: function(attributes, isBefore) {
                    var nullText = isBefore ? STANZA.ADDED_BEFORE : STANZA.REMOVED_AFTER;

                    if (attributes === null) {
                        return nullText;
                    } else if (_.isEmpty(attributes)) {
                        return STANZA.NO_ATTRIBUTES;
                    } else {
                        return LABELS.not_set;
                    }
                },

                /*
                 * Server Class change methods (type = 'group')
                 */
                isServerClassChange: function() {
                    return this.entry.content.get('type') === 'group';
                },

                getBeforeWhitelist: function() {
                    return this._getWhitelist(this.getBeforeState());
                },

                getAfterWhitelist: function() {
                    return this._getWhitelist(this.getAfterState());
                },

                getBeforeBlacklist: function() {
                    return this._getBlacklist(this.getBeforeState());
                },

                getAfterBlacklist: function() {
                    return this._getBlacklist(this.getAfterState());
                },

                getBeforeMachineTypeFilter: function() {
                    return this._getMachineTypeFilter(this.getBeforeState());
                },

                getAfterMachineTypeFilter: function() {
                    return this._getMachineTypeFilter(this.getAfterState());
                },

                _getWhitelist: function(state) {
                    if (!state) {
                        return null;
                    }
                    return state.whitelist !== '' ? state.whitelist : LABELS.not_set;
                },

                _getBlacklist: function(state) {
                    if (!state) {
                        return null;
                    }
                    return state.blacklist !== '' ? state.blacklist : LABELS.not_set;
                },

                _getMachineTypeFilter: function(state) {
                    if (!state) {
                        return null;
                    }
                    return state.machineTypesFilter !== '' ? state.machineTypesFilter : LABELS.not_set;
                },

                /*
                 * App change methods (type = 'app')
                 */
                isAppChange: function() {
                    return this.entry.content.get('type') === 'app';
                },

                isAppUpgrade: function() {
                    return this.entry.content.get('opType') === 'upgrade';
                },

                getBeforeAppLocation: function() {
                    return this._getAppLocation(this.getBeforeState());
                },

                getAfterAppLocation: function() {
                    return this._getAppLocation(this.getAfterState());
                },

                getBeforePostInstallAction: function() {
                	return AppModel.getAfterInstallationLabel(this.getBeforeState().afterInstallation);
                },

                getAfterPostInstallAction: function() {
                    return AppModel.getAfterInstallationLabel(this.getAfterState().afterInstallation);
                },

                getBeforeAppVersion: function() {
                    return this._getAppVersionFromState(this.getBeforeState());
                },

                getAfterAppVersion: function() {
                    return this._getAppVersionFromState(this.getAfterState());
                },

                /*
                 * Getting the proper app version for app install or uninstall.
                 */
                getAppVersion: function() {
                    var version = null;
                    if (this.entry.content.get('opType') === 'insert') {
                        version = this.getAfterAppVersion();
                    }
                    if (this.entry.content.get('opType') === 'delete') {
                        version = this.getBeforeAppVersion();
                    }
                    return version;
                },

                _getAppVersionFromState: function(state) {
                    if (!state) {
                        return null;
                    }
                    var version = state['@version'];
                    return version ? version : APP_LABELS.no_version;
                },

                _getAppLocation: function(state) {
                    var groups = state ? state.groups : null;

                    if(!groups) {
                        return groups;
                    } else if (groups.length === 0) {
                        return APP_LABELS.no_forwarders;
                    } else if (_.contains(groups, '_forwarders')) {
                        return APP_LABELS._forwarders;
                    } else {
                        return LABELS.group + ': ' + groups.join(', ');
                    }
                }
            },
            {
                LABELS: LABELS,
                APP_LABELS: APP_LABELS
            }
        );
    }
);

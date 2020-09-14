// All input models inherit this base class
// allows for sharing common functions.
// @author: nmistry
define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/DmcBase',
    'models/managementconsole/documentation/InputAndOutput',
    'util/splunkd_utils',
    'splunk.util'
], function (
    $,
    _,
    Backbone,
    DmcBaseModel,
    InputAndOutputDocumentationModel,
    splunkdutils,
    splunkUtils
) {
    var STRINGS = {
        NOT_SET: _('Not Set').t(),
        FORWARDERS: _('All Forwarders').t(),
        SERVERCLASS: _('Server Class').t(),
        APP: _('App').t(),
        INSTANCE: _('Instance').t()
    };

    var prettyPrintBundle = function (bundle, bundleId, bundleType) {
        var name = '';
        switch (bundleType) {
            case 'builtin':
                name = STRINGS.FORWARDERS;
                break;
            case 'custom':
                name = STRINGS.SERVERCLASS;
                name += ': ';
                name += bundleId;
                break;
            case 'app':
                name = STRINGS.APP;
                name += ': ';
                name += bundleId;
                break;
            case 'node':
                name = STRINGS.INSTANCE;
                name += ': ';
                name += bundleId;
                break;
            default:
                name = bundleId;
                break;
        }
        return name;
    };
    return DmcBaseModel.extend({
        urlRoot: '/services/dmc/config/%s/%s',

        initialize: function () {
            DmcBaseModel.prototype.initialize.apply(this, arguments);

            this.valueDecorators = $.extend(true, {}, this.valueDecorators, {
                name: this.getName,
                bundle: this.getBundleName
            });

            this._documentationModel = new InputAndOutputDocumentationModel(this);
        },

        getValue: function (field) {
            if (_.has(this.valueDecorators, field) && _.isFunction(this.valueDecorators[field])) {
                return this.valueDecorators[field].call(this, field);
            }
            return this.entry.content.get(field) || STRINGS.NOT_SET;
        },

        getName: function () {
            return this.entry.get('name') || STRINGS.NOT_SET;
        },

        /*
         returns
         '__forwarder',
         '_serverclass',
         'appname'
         basically bundle=bundleType+bundleId
         */
        getBundle: function () {
            return this.entry.acl.get('app');
        },

        getBundleType: function () {
            // returns builtin, custom, app, node
            return this.entry.acl.get('@bundleType');
        },

        getBundleId: function () {
            // returns without underscore
            // 'forwarders', 'serverclass', 'appname'
            return this.entry.acl.get('@bundleId');
        },

        getBundleName: function () {
            // used for prettyprinting the bundle
            var bundleType = this.getBundleType();
            var bundle = this.getBundle();
            var bundleId = this.getBundleId() || DmcBaseModel.getBundleId(bundle);
            return prettyPrintBundle(bundle, bundleId, bundleType);
        },

        isPending: function () {
            return this.entry.get('@status') === 'pending';
        },

        _onerror: function (model, response, options) {
            var message;
            model.error.clear();
            if (_.has(response, 'responseJSON')) {
                if (
                    _.has(response.responseJSON, 'error')
                    && _.has(response.responseJSON.error, 'message')
                ) {
                    if (response.responseJSON.error.message.description
                        && _.isArray(response.responseJSON.error.message.missing_capabilities)) {
                        var msg = response.responseJSON.error.message.description
                            + _('. Missing capability: ').t()
                            + response.responseJSON.error.message.missing_capabilities.join(',');

                        message = splunkdutils.createMessageObject(
                            splunkdutils.ERROR,
                            msg
                        );
                    } else {
                        message = splunkdutils.createMessageObject(
                            splunkdutils.ERROR,
                            response.responseJSON.error.message
                        );
                    }
                }
            } else if (_.has(response, 'status') && _.has(response, 'statusText')) {
                message = splunkdutils.createMessageObject(
                    splunkdutils.ERROR,
                    response.status + ': ' + response.statusText
                );
            }
            this.trigger('serverValidated', false, this, [message]);
            model.error.set('messages', message);
        },

        // RBAC functions for the model
        canEdit: function () {
            return this.entry.links.has('edit');
        },

        canMove: function () {
            return this.entry.links.has('move');
        },

        canRevert: function () {
            return this.entry.links.has('revert');
        },

        canDelete: function () {
            return this.entry.links.has('delete');
        },

        canDisable: function () {
            return this.entry.links.has('disable');
        },

        canEnable: function () {
            return this.entry.links.has('enable');
        },
        
        sync: function (method, model, options) {
            var defaults = {
                url: '',
                attrs: {}
            };
            switch (method) {
                case 'create':
                    var bundle = model.getBundle();
                    var group = model.getGroup();
                    var urlRoot = splunkUtils.sprintf(this.urlRoot, group, bundle);
                    if (!bundle) {
                        return $.Deferred().reject('bundle value cannot be empty');
                    }
                    defaults.url = this.getFullUrlRoot(urlRoot + this.url());
                    defaults.attrs.name = model.entry.get('name') || '';
                    break;
                case 'update':
                    var editLink = this.entry.links.get('edit');
                    if (!editLink) {
                        return $.Deferred().reject('edit link cannot be empty');
                    }
                    defaults.type = 'POST';
                    defaults.url = this.getFullUrlRoot(editLink);
                    break;
                case 'delete':
                    var deleteLink = this.entry.links.get('delete');
                    if (!deleteLink) {
                        return $.Deferred().reject('delete link cannot be empty');
                    }
                    defaults.url = this.getFullUrlRoot(deleteLink);
                    break;
                default:
                    return $.Deferred().reject('method:"' + method + '" is not supported');
            }
            // copy in content attributes
            // backend supports the 'json' formatted data
            // putting it in attrs will do the needful, we may need to cleanup .data for this to work
            defaults.attrs = $.extend(true, {}, defaults.attrs, model.entry.content.toJSON());
            this.formatDataToPOST(defaults.attrs);

            // merge options and defaults
            options = $.extend(true, {}, defaults, options);
            return Backbone.sync.call(this, method, model, options);
        },

        // backend accepts int/string.
        // need to make necessary conversions.
        // virtual function, please implement
        formatDataToPOST: function (postData) {
        },

        // virtual function, please implement
        // this is called for row expansion and create/edit summary
        getReviewFields: function () {
        },

        /**
         * Retrieves the defined label for the specified control field of the input
         * @param field - data input field
         * @returns String
         */
        getLabel: function(field) {
            return this._documentationModel.getLabel(this.getGroup(), field);
        },

        /**
         * Retrieves the defined tooltip for the specified control field of the input
         * @param field - data input field
         * @returns String
         */
        getTooltip: function(field) {
            return this._documentationModel.getTooltip(this.getGroup(), field);
        },

        /**
         * Retrieves the defined help text for the specified control field of the input
         * @param field - data input field
         * @returns String
         */
        getHelpText: function(field) {
            return this._documentationModel.getHelpText(this.getGroup(), field);
        },

        /**
         * Retrieves the defined placeholder text for the specified control field of the input
         * @param field - data input field
         * @returns String
         */
        getPlaceholder: function(field) {
            return this._documentationModel.getPlaceholder(this.getGroup(), field);
        }
    }, {
        STRINGS: STRINGS,
        getBundleName: prettyPrintBundle
    });
});

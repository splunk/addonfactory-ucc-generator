// All input models inherit this base class
// allows for sharing common functions.
// @author: nmistry
define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/DMCContextualBase',
    'util/splunkd_utils'
], function (
    $,
    _,
    Backbone,
    DmcContextualBaseModel,
    splunkdutils
) {
    var STRINGS = $.extend(true, {}, DmcContextualBaseModel.STRINGS, {
        SEGMENT: _('Segment').t(),
        REGEX: _('Regular Expression').t(),
        HOST: _('Constant Value').t(),
        AUTOMATIC: _('Automatic').t(),
        NOT_SET: _('Not Set').t(),
        FORWARDERS: _('Forwarders').t(),
        SERVERCLASS: _('Server class').t(),
        APP: _('App').t(),
        INSTANCE: _('Instance').t(),
        GROUPS_TOOLTIP_HEADER: _('Installed on').t()
    });
    var CONNECTION_HOST_VALUES = {
        DNS: 'dns',
        IP: 'ip',
        CUSTOM: 'none'
    };
    var InputBaseModel = DmcContextualBaseModel.extend({

        initialize: function () {
            DmcContextualBaseModel.prototype.initialize.apply(this, arguments);

            this.valueDecorators = $.extend(true, {}, this.valueDecorators, {
                host: this.getHostValue,
                sourcetype: this.getSourceType,
                connection_host: this.getConnectionHostValue
            });
        },

        getGroup: function () {
            return 'inputs';
        },

        // To be overridden
        getStanzaName: function() {
            return this.entry.get('name');
        },

        getHostValue: function () {
            var hostSegment = this.entry.content.get('host_segment');
            var hostRegex = this.entry.content.get('host_regex');

            if (hostSegment) return STRINGS.SEGMENT;
            if (hostRegex) return STRINGS.REGEX;
            return this.entry.content.get('host') || STRINGS.HOST;
        },

        getSourceType: function () {
            return this.entry.content.get('sourcetype') || STRINGS.AUTOMATIC;
        },

        /**
         * Retrieves the proper documentation type so that the input model can properly
         * access its documentation strings
         * @returns String
         */
        getDocumentationType: function() {

            // this._documentationType should be initialized in child input models
            return this._documentationType;
        },

        getConnectionHostValue: function () {
            var val = this.entry.content.get('connection_host');
            var response = '';
            switch (val) {
                case CONNECTION_HOST_VALUES.DNS:
                    response = _('Forwarder\'s FQDN').t();
                    break;
                case CONNECTION_HOST_VALUES.IP:
                    response = _('Forwarder\'s IP').t();
                    break;
                case CONNECTION_HOST_VALUES.CUSTOM:
                    response = _('Fixed: ').t() + this.entry.content.get('host');
                    break;
                default:
                    // precaution
                    response = _('Unknown connection_host value').t();
                    break;
            }
            return response;
        }
    }, {
        CONNECTION_HOST_VALUES: CONNECTION_HOST_VALUES,
        STRINGS: STRINGS
    });

    InputBaseModel.Entry.ACL = InputBaseModel.Entry.ACL.extend({
        validateAclBundle: function (val, key, attrs) {
            if (_.isUndefined(val)) {
                if (attrs['@bundleType'] === 'custom')  {
                    return _('Server class is required').t();
                }
                if (attrs['@bundleType'] === 'app')  {
                    return _('App is required').t();
                }
                if (attrs['@bundleType'] === 'app')  {
                    return _('App is required').t();
                }
                return _('Context is required').t();
            }
        }
    });

    return InputBaseModel;
});

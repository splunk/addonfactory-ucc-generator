define([
    'jquery',
    'underscore',
    'backbone',
    'models/managementconsole/DMCContextualBase'
], function OutputModel(
    $,
    _,
    Backbone,
    DMCContextualBaseModel
) {
    var STANZA_NAME_PREFIX = 'tcpout:';

    return DMCContextualBaseModel.extend({
        url: function () {
            return '/tcpout-group';
        },

        initialize: function () {
            DMCContextualBaseModel.prototype.initialize.apply(this, arguments);
        },

        isDisabled: function () {
            return this.entry.links.has('enable');
        },

        getBundle: function () {
            return DMCContextualBaseModel.prototype.getBundle.call(this)
                || DMCContextualBaseModel.BUILTIN_BUNDLE_NAMES.FORWARDERS;
        },

        getStanzaName: function () {
            return STANZA_NAME_PREFIX + this.entry.get('name');
        },

        getGroup: function () {
            return 'outputs';
        }
    });
});

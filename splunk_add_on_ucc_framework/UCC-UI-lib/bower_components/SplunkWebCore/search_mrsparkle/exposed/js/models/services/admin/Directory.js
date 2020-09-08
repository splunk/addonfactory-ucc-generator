/**
 * All Configuration model
 * @author nmistry
 * @date 09/08/2016
 */

define([
    'underscore',
    'models/EAIBase'
], function(
    _,
    EAIBaseModel
) {
    return EAIBaseModel.extend({
        url: 'admin/directory',

        enterpriseSharingLabels: {
            user: _('Private').t(),
            app:  _('App').t(),
            global: _('Global').t(),
            system: _('Global').t()
        },

        liteSharingLabels: {
            user: _('Private').t(),
            app:  _('Global').t(),
            global: _('Global').t(),
            system: _('Global').t()
        },

        initialize: function (options) {
            EAIBaseModel.prototype.initialize.apply(this, arguments);
            this.isLite = this.collection && _.isBoolean(this.collection.isLite) ? this.collection.isLite: false;
        },

        getName: function () {
            return this.entry.get('name') || '';
        },

        getType: function () {
            return this.entry.content.get('eai:type') || '';
        },

        getOwner: function () {
            return this.entry.acl.get('owner') || '';
        },

        getApp: function () {
            return this.entry.acl.get("app") || '';
        },

        getSharing: function () {
            return this.entry.acl.get("sharing") || '';
        },

        getSharingLabel: function () {
            var labels = this.isLite ? this.liteSharingLabels : this.enterpriseSharingLabels;
            return labels[this.getSharing()] || '';
        },

        reassign: function (newOwner) {
            if (!_.isString(newOwner)) {
                throw new Error('newOwner needs to be a string value');
            }
            var data = {};
            data.owner = newOwner;

            if (_.isUndefined(data.sharing)) {
                data.sharing = this.entry.acl.get('sharing');
            }
            if (this.getType() === 'savedsearch' && _.isUndefined(data.app)) {
                data.app = this.entry.acl.get('app');
            }
            this.trigger('reassign:start', this.id);
            return this.acl.save({}, {
                data: data,
                success: _.bind(function (model, resp, options) {
                    this.setFromSplunkD(resp, {skipClone: true});
                    this.trigger('reassign:successful', this.id);
                }, this),
                error: _.bind(function (model, resp, options) {
                    // proxy error message to the parent model
                    this.trigger.call(this, 'error', this, resp, options);
                    this.trigger('reassign:error', this.id);
                }, this)
            });
        }
    });
});

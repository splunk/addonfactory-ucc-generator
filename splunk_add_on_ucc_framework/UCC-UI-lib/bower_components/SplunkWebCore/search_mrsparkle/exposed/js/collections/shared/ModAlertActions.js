define([
    'underscore',
    'collections/services/alerts/AlertActions',
    'models/services/alerts/AlertAction'
], function(_, AlertActionsCollection, AlertActionModel) {
    var ModAlertActionsCollection = AlertActionsCollection.extend({
        initialize: function() {
            AlertActionsCollection.prototype.initialize.apply(this, arguments);
        },
        fetch: function(options) {
            options = options || {};
            options.data = options.data || {};
            var search = '(' + ModAlertActionsCollection.getModAlertActionsSearch() + ')';
            if (options.data.search) {
                search += ' AND ' + options.data.search;
            }
            options.data.search = search;
            if (options.addListInTriggeredAlerts) {
                var success = options.success;
                options.success = function(collection, response, options) {
                    var triggerModel = new AlertActionModel();
                    triggerModel.entry.set('name', 'list');
                    triggerModel.entry.content.set({
                        description: _('Add this alert to Triggered Alerts list').t(),
                        label: _('Add to Triggered Alerts').t(),
                        icon_path: 'mod_alert_icon_list.png'
                    });
                    triggerModel.entry.acl.set({
                        app: 'search'
                    });
                    this.add(triggerModel);
                    if (success) {
                        success(collection, response, options);
                    }
                }.bind(this);
            }
            return AlertActionsCollection.prototype.fetch.call(this, options);
        }
    }, {
        BUILTIN_ACTIONS: ['email', 'script'],
        getModAlertActionsSearch: function() {
            return 'is_custom=1 OR ' + _(ModAlertActionsCollection.BUILTIN_ACTIONS).map(function(action) {
                    return 'name=' + JSON.stringify(action);
                }).join(' OR ');
        },
        isBuiltinAction: function(action) {
            return _(ModAlertActionsCollection.BUILTIN_ACTIONS).contains(action);
        }
    });
    return ModAlertActionsCollection;
});
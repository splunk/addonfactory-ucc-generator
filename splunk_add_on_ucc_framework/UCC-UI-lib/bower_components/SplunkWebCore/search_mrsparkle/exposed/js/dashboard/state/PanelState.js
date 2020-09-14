define(['underscore', './ItemState', 'views/dashboard/layout/Panel', 'views/dashboard/layout/PanelRef'], function(_, ItemState, Panel, PanelRef) {

    return ItemState.extend({
        idAttribute: 'id',
        setState: function(panel) {
            var defaults = {
                title: ''
            };
            var state = {
                id: panel.id
            };

            if (panel instanceof PanelRef) {
                _.extend(state, defaults, {ref: panel.settings.get('ref'), app: panel.settings.get('app')});
            } else if (panel instanceof Panel) {
                _.extend(state, defaults, panel.settings.toJSON(_.extend({tokens: true}, this._stateOptions || {})));
            }

            ItemState.prototype.setState.call(this, state);
        }
    });

});
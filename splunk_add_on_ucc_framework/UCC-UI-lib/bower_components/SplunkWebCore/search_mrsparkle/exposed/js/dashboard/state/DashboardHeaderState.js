define(['underscore', './ItemState'], function(_, ItemState) {

    return ItemState.extend({
        setState: function(dashboardComponent) {
            ItemState.prototype.setState.call(this, {
                label: dashboardComponent.settings.get('label'),
                description: dashboardComponent.settings.get('description')
            });
        }
    });

});
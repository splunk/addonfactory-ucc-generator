define([
            'module',
            'views/shared/DropDownMenu'
        ],
        function(
            module,
            DropDownMenu
        ) {

    return DropDownMenu.extend({

        moduleId: module.id,

        initialize: function() {
            DropDownMenu.prototype.initialize.apply(this, arguments);
            this.listenTo(this, 'itemClicked', function(type, itemData) {
                this.model.set({
                    'display.visualizations.mapping.tileLayer.url': itemData.url,
                    'display.visualizations.mapping.tileLayer.minZoom': itemData.minZoom,
                    'display.visualizations.mapping.tileLayer.maxZoom': itemData.maxZoom
                });
            });
        }

    });

});
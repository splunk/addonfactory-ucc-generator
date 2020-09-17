define([
            'module',
            'views/Base'
        ],
        function(
            module,
            BaseView
        ) {

    return BaseView.extend({

        moduleId: module.id,

        className: 'populate-button-container',

        events: {
            'click .populate-button': function(e) {
                e.preventDefault();
                var roundToHundredths = function(num) {
                    return Math.round(num * 100) / 100;
                };
                var center = this.model.get('currentMapCenter'),
                    centerString = '(' + roundToHundredths(center.lat) + ',' + roundToHundredths(center.lon) + ')';

                this.model.set({
                    'display.visualizations.mapping.map.zoom': this.model.get('currentMapZoom'),
                    'display.visualizations.mapping.map.center': centerString
                });
            }
        },

        render: function() {
            this.$el.html(this.compiledTemplate());
            return this;
        },

        template: '\
            <a href="#" class="populate-button"><%- _("Populate with current map settings").t() %></a>\
        '

    });

});
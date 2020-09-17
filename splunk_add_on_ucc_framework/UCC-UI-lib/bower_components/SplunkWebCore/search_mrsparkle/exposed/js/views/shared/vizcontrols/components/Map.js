define([
            'underscore',
            'module',
            'views/Base',
            'views/shared/vizcontrols/custom_controls/MapCenterControlGroup',
            'views/shared/vizcontrols/custom_controls/MapZoomControlGroup',
            'views/shared/vizcontrols/custom_controls/MapScrollZoomControlGroup',
            'util/console'
        ],
        function(
            _,
            module,
            Base,
            MapCenterControlGroup,
            MapZoomControlGroup,
            MapScrollZoomControlGroup,
            console
        ) {

    return Base.extend({

        moduleId: module.id,

        className: 'form form-horizontal',

        events: {
            'click .populate-button': function(e) {
                e.preventDefault();
                var roundToHundredths = function(num) {
                    return Math.round(num * 100) / 100;
                };
                var reportContent = this.model.report.entry.content,
                    center = reportContent.get('currentMapCenter'),
                    centerString = '(' + roundToHundredths(center.lat) + ',' + roundToHundredths(center.lon) + ')';

                this.model.visualization.set({
                    'display.visualizations.mapping.map.zoom': reportContent.get('currentMapZoom'),
                    'display.visualizations.mapping.map.center': centerString
                });
            }
        },

        vizToGeneralComponents: {
            line: [],
            area: [],
            column: [],
            bar: [],
            pie: [],
            scatter: [],
            bubble: [],
            radialGauge: [],
            fillerGauge: [],
            markerGauge: [],
            single: [],
            choropleth: ['centerLat', 'centerLon', 'zoom', 'scrollZoom'],
            mapping: ['centerLat', 'centerLon', 'zoom', 'scrollZoom']
        },

        /**
         * @constructor
         * @param options {
         *     model: {
         *         visualization: <models.shared.Visualization>
         *         report: <models.search.Report>
         *     }
         * }
         */

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            var controls = this.vizToGeneralComponents[this.model.visualization.get('viz_type')];
            if(_.contains(controls, 'centerLat')) {
                this.children.centerLat = new MapCenterControlGroup({
                    model: this.model.visualization,
                    mode: MapCenterControlGroup.LATITUDE
                });
            }
            if(_.contains(controls, 'centerLon')) {
                this.children.centerLon = new MapCenterControlGroup({
                    model: this.model.visualization,
                    mode: MapCenterControlGroup.LONGITUDE
                });
            }
            if(_.contains(controls, 'zoom')) {
                this.children.zoom = new MapZoomControlGroup({
                    model: this.model.visualization
                });
            }

            if(_.contains(controls, 'scrollZoom')) {
                this.children.scrollZoom = new MapScrollZoomControlGroup({
                    model: this.model.visualization
                });
            }
        },

        render: function() {
            this.children.centerLat && this.children.centerLat.render().appendTo(this.$el);
            this.children.centerLon && this.children.centerLon.render().appendTo(this.$el);
            this.children.zoom && this.children.zoom.render().appendTo(this.$el);
            var reportContent = this.model.report.entry.content;
            if(reportContent.has('currentMapZoom') && reportContent.has('currentMapCenter')) {
                this.$el.append(this.compiledTemplate());
            }
            else {
                console.warn('report content does not have current map zoom and center, disabling populate button');
            }
            this.children.scrollZoom && this.children.scrollZoom.render().appendTo(this.$el);

            return this;
        },

        template: '\
            <div class="populate-button-container">\
                <a href="#" class="populate-button"><%- _("Populate with current map settings").t() %></a>\
            </div>\
            <div class="divider"></div>\
        '

    });

});
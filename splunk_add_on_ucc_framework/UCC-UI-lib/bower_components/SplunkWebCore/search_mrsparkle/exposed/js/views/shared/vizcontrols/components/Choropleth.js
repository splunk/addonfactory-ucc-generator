define([
            'underscore',
            'module',
            'views/Base',
            'views/shared/vizcontrols/custom_controls/MapFillColorsControlGroup',
            'views/shared/vizcontrols/custom_controls/MapFillOpacityControlGroup',
            'views/shared/vizcontrols/custom_controls/MapFillStepsControlGroup',
            'views/shared/vizcontrols/custom_controls/MapBorderColorControlGroup',
            'views/shared/vizcontrols/custom_controls/MapBorderOpacityControlGroup',
            'views/shared/vizcontrols/custom_controls/MapBorderWidthControlGroup',
            'views/shared/vizcontrols/custom_controls/MapShowDensityControlGroup'
        ],
        function(
            _,
            module,
            Base,
            MapFillColorsControlGroup,
            MapFillOpacityControlGroup,
            MapFillStepsControlGroup,
            MapBorderColorControlGroup,
            MapBorderOpacityControlGroup,
            MapBorderWidthControlGroup,
            MapShowDensityControlGroup
        ) {

    return Base.extend({

        moduleId: module.id,

        className: 'form form-horizontal',

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
            mapping: [],
            choropleth: ['fillColors', 'fillOpacity', 'fillSteps', 'borderColor', 'borderOpacity', 'borderWidth', 'showDensity']
        },

        initialize: function() {
            Base.prototype.initialize.apply(this, arguments);
            var controls = this.vizToGeneralComponents[this.model.get('viz_type')];
            if(_.contains(controls, 'fillColors')) {
                this.children.fillColors = new MapFillColorsControlGroup({
                    model: this.model
                });
            }
            if(_.contains(controls, 'fillOpacity')) {
                this.children.fillOpacity = new MapFillOpacityControlGroup({
                    model: this.model
                });
            }
            if(_.contains(controls, 'fillSteps')) {
                this.children.fillSteps = new MapFillStepsControlGroup({
                    model: this.model
                });
            }
            if(_.contains(controls, 'borderColor')) {
                this.children.borderColor = new MapBorderColorControlGroup({
                    model: this.model
                });
            }
            if(_.contains(controls, 'borderOpacity')) {
                this.children.borderOpacity = new MapBorderOpacityControlGroup({
                    model: this.model
                });
            }
            if(_.contains(controls, 'borderWidth')) {
                this.children.borderWidth = new MapBorderWidthControlGroup({
                    model: this.model
                });
            }
            if(_.contains(controls, 'showDensity')) {
                this.children.showDensity = new MapShowDensityControlGroup({
                    model: this.model
                });
            }
        },

        render: function() {
            this.children.fillColors && this.children.fillColors.render().appendTo(this.$el);
            this.children.fillOpacity && this.children.fillOpacity.render().appendTo(this.$el);
            this.children.fillSteps && this.children.fillSteps.render().appendTo(this.$el);
            this.children.borderColor && this.children.borderColor.render().appendTo(this.$el);
            this.children.borderOpacity && this.children.borderOpacity.render().appendTo(this.$el);
            this.children.borderWidth && this.children.borderWidth.render().appendTo(this.$el);
            this.children.showDensity && this.children.showDensity.render().appendTo(this.$el);
            return this;
        }

    });

});
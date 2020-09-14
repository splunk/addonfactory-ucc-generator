define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/vizcontrols/custom_controls/DrilldownRadioGroup',
        'views/shared/vizcontrols/custom_controls/StackModeControlGroup',
        'views/shared/vizcontrols/custom_controls/NullValueModeControlGroup',
        'views/shared/vizcontrols/custom_controls/GaugeStyleControlGroup',
        'views/shared/vizcontrols/custom_controls/SingleValueBeforeLabelControlGroup',
        'views/shared/vizcontrols/custom_controls/SingleValueAfterLabelControlGroup',
        'views/shared/vizcontrols/custom_controls/SingleValueUnderLabelControlGroup',
        'views/shared/vizcontrols/custom_controls/SingleValueBackgroundControlGroup',
        'views/shared/vizcontrols/custom_controls/MultiSeriesRadio',
        'views/shared/vizcontrols/custom_controls/MapDrilldownControlGroup',
        'views/shared/vizcontrols/custom_controls/MinMaxDataLabelsControlGroup'
    ],
    function(
        _, 
        $,
        module, 
        Base, 
        ControlGroup,
        DrilldownRadioGroup,
        StackModeControlGroup,
        NullValueModeControlGroup,
        GaugeStyleControlGroup,
        SingleValueBeforeLabelControlGroup,
        SingleValueAfterLabelControlGroup,
        SingleValueUnderLabelControlGroup,
        SingleValueBackgroundControlGroup,
        MultiSeriesRadio,
        MapDrilldownControlGroup,
        MinMaxDataLabelsControlGroup
    ){
        return Base.extend({
            moduleId: module.id,
            className: 'form form-horizontal',
            vizToGeneralComponents: {
                line: ['nullValue', 'multiseries', 'drilldown', 'showDataLabels'],
                area: ['stack', 'nullValue', 'multiseries', 'drilldown', 'showDataLabels'],
                column: ['stack', 'multiseries', 'drilldown', 'showDataLabels'],
                bar: ['stack','multiseries', 'drilldown', 'showDataLabels'],
                pie: ['drilldown'],
                scatter: ['drilldown'], 
                bubble: ['drilldown'],
                radialGauge: ['style'],
                fillerGauge: ['style'],
                markerGauge: ['style'],
                single: ['before', 'after', 'under', 'background'],
                choropleth: ['mapDrilldown', 'scrollZoom'],
                mapping: ['mapDrilldown', 'scrollZoom']
            },
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);
                var controls = this.vizToGeneralComponents[this.model.get('viz_type')];
                if(_.indexOf(controls, 'stack')>-1)
                    this.children.stackMode = new StackModeControlGroup({
                        model: this.model,
                        controlClass: 'controls-thirdblock'
                    });
                if(_.indexOf(controls, 'nullValue')>-1)
                    this.children.nullValueMode = new NullValueModeControlGroup({
                        model: this.model,
                        controlClass: 'controls-thirdblock'
                    });
                if(_.indexOf(controls, 'multiseries')>-1)
                    this.children.multiSeries = new MultiSeriesRadio({ model: this.model });
                if(_.indexOf(controls, 'drilldown')>-1)
                    this.children.drilldown = new DrilldownRadioGroup({
                        model: this.model,
                        controlClass: 'controls-halfblock'
                    });
                if(_.indexOf(controls, 'style')>-1)
                    this.children.gaugeStyle = new GaugeStyleControlGroup({
                        model: this.model,
                        controlClass: 'controls-halfblock'
                    });
                if(_.indexOf(controls, 'before')>-1)
                    this.children.beforeLabel = new SingleValueBeforeLabelControlGroup({
                        model: this.model,
                        controlClass: 'controls-block'
                    });
                if(_.indexOf(controls, 'after')>-1)
                    this.children.afterLabel = new SingleValueAfterLabelControlGroup({
                        model: this.model,
                        controlClass: 'controls-block'
                    });
                if(_.indexOf(controls, 'under')>-1)
                    this.children.underLabel = new SingleValueUnderLabelControlGroup({
                        model: this.model,
                        controlClass: 'controls-block'
                    });
                if(_.indexOf(controls, 'background')>-1)
                    this.children.background = new SingleValueBackgroundControlGroup({
                        model: this.model,
                        controlClass: 'controls-thirdblock'
                    });
                if(_.indexOf(controls, 'mapDrilldown')>-1)
                    this.children.mapDrilldown = new MapDrilldownControlGroup({
                        model: this.model
                    });
                if(_.indexOf(controls, 'showDataLabels') > -1) {
                    this.children.showMinMaxValues = new MinMaxDataLabelsControlGroup({
                        model: this.model,
                        controlClass: 'controls-thirdblock'
                    });
                }
            },
            render: function() {
                this.children.stackMode && this.children.stackMode.render().appendTo(this.$el);
                this.children.nullValueMode && this.children.nullValueMode.render().appendTo(this.$el);
                this.children.multiSeries && this.children.multiSeries.render().appendTo(this.$el);
                this.children.drilldown && this.children.drilldown.render().appendTo(this.$el);
                this.children.gaugeStyle && this.children.gaugeStyle.render().appendTo(this.$el);
                this.children.beforeLabel && this.children.beforeLabel.render().appendTo(this.$el);
                this.children.afterLabel && this.children.afterLabel.render().appendTo(this.$el);
                this.children.underLabel && this.children.underLabel.render().appendTo(this.$el);
                this.children.background && this.children.background.render().appendTo(this.$el);
                this.children.events && this.children.events.render().appendTo(this.$el);
                this.children.statistics && this.children.statistics.render().appendTo(this.$el);
                this.children.mapDrilldown && this.children.mapDrilldown.render().appendTo(this.$el);
                this.children.showMinMaxValues && this.children.showMinMaxValues.render().appendTo(this.$el);
                return this;
            }
        });
    }
);

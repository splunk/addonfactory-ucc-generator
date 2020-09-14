define([
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'views/shared/vizcontrols/components/color/Master'
        ],
        function(
            _,
            module,
            ControlGroup,
            ColorRanges
        ) {

    return ControlGroup.extend({

        moduleId: module.id,

        initialize: function() {
            this.options.label = _("Color Ranges").t();
            this.colorRangePicker = new ColorRanges({
                model: this.model,
                prepopulateNewRanges: true,
                popdownOptions: { detachDialog: true }
            });
            this.options.controls = [this.colorRangePicker];
            ControlGroup.prototype.initialize.call(this, this.options);
        },

        // TODO [sff] temporary fix, the color range picker should extend the base Control
        getAllControls: function() {
            return ([
                {
                    getModelAttribute: function() { return 'display.visualizations.charting.chart.rangeValues'; }
                }
            ]);
        }

    });

});
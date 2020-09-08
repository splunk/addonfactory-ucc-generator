define([
            'underscore',
            'module',
            'models/Base',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/SyntheticRadioControl'
        ],
        function(
            _,
            module,
            BaseModel,
            ControlGroup,
            SyntheticRadioControl
        ) {

    var AutoRangesControl = SyntheticRadioControl.extend({

        initialize: function() {
            this.model.set({ autoMode: this.model.gaugeIsInAutoMode() ? '1' : '0' });
            this.options.modelAttribute = 'autoMode';
            this.options.items = [
                {
                    label: _("Automatic").t(),
                    value: '1',
                    tooltip: _("Uses base search to set color ranges.").t()
                },
                {
                    label: _("Manual").t(),
                    value: '0',
                    tooltip: _("Manually set color ranges. Overrides search settings.").t()
                }
            ];
            this._ranges = '["0", "30", "70", "100"]';
            this._colors = '[0x84E900, 0xFFE800, 0xBF3030]';
            this.model.on('change:autoMode', this.handleModeChange, this);
            SyntheticRadioControl.prototype.initialize.call(this, this.options);
        },

        handleModeChange: function() {
            var goingToAutoMode = this.model.get('autoMode') === '1';
            // if going to auto mode, store the original values of the ranges and colors, then unset them
            if(goingToAutoMode) {
                this._ranges = this.model.get('display.visualizations.charting.chart.rangeValues');
                this._colors = this.model.get('display.visualizations.charting.gaugeColors');
                this.model.set({
                    'display.visualizations.charting.chart.rangeValues': '',
                    'display.visualizations.charting.gaugeColors': ''
                });
            }
            // otherwise resurrect the old values
            else {
                this.model.set({
                    'display.visualizations.charting.chart.rangeValues': this._ranges,
                    'display.visualizations.charting.gaugeColors': this._colors
                });
            }
        }

    });

    return ControlGroup.extend({

        moduleId: module.id,

        initialize: function() {
            var rangesControl = new AutoRangesControl({ model: this.model });
            this.options.controlClass = 'controls-halfblock';
            // this.options.label = _("Colors").t();
            this.options.controls = [rangesControl];
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});

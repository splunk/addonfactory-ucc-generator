define([
            'underscore',
            'module',
            'views/shared/controls/ControlGroup',
            'views/shared/controls/MultiInputControl'
        ],
        function(
            _,
            module,
            ControlGroup,
            MultiInputControl
        ) {

    return ControlGroup.extend({

        moduleId: module.id,

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
            this.options.label = _("Overlay").t();
            this.options.controlType = 'Text';
            var control = new MultiInputControl({
                modelAttribute: 'display.visualizations.charting.chart.overlayFields',
                model: this.model,
                autoCompleteFields: this.model.get('currentChartFields') || [],
                placeholder: _("type in field name(s)").t()
            });
            this.options.controls = [control];
            ControlGroup.prototype.initialize.call(this, this.options);
        }

    });

});
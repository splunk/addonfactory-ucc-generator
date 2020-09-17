define([
            'underscore',
            'views/shared/controls/PercentTextControl',
            './shared_elements'
        ],
        function(
            _,
            PercentTextControl,
            SharedElements
        ) {

    return ([
        {
            id: 'general',
            title: _('General').t(),
            formElements: [
                SharedElements.DRILLDOWN
            ]
        },
        {
            id: 'size',
            title: _('Size').t(),
            formElements: [
                {
                    name: 'display.visualizations.charting.chart.sliceCollapsingThreshold',
                    label: _('Minimum Size').t(),
                    defaultValue: '0.01',
                    groupOptions: {
                        help: _('Minimum Size is applied when there are more than 10 slices.').t()
                    },
                    control: PercentTextControl
                }
            ]
        }
    ]);

});
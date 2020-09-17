define([
            'underscore',
            './shared_elements',
            'views/shared/controls/TextControl',
            'util/validation'
        ],
        function(
            _,
            SharedChartElements,
            TextControl,
            validationUtils
        ) {

    var validateSizeMinMax = validationUtils.minMaxValidationGenerator(
        'display.visualizations.charting.chart.bubbleMinimumSize',
        'display.visualizations.charting.chart.bubbleMaximumSize',
        _('The Min Size must be less than the Max Size.').t()
    );

    return ([
        {
            id: 'general',
            title: _('General').t(),
            formElements: [
                SharedChartElements.DRILLDOWN
            ]
        },
        {
            id: 'xaxis',
            title: _('X-Axis').t(),
            formElements: [
                SharedChartElements.X_AXIS_TITLE,
                SharedChartElements.X_AXIS_LABEL_ROTATION,
                SharedChartElements.X_AXIS_LABEL_ELISION,
                SharedChartElements.X_AXIS_SCALE,
                SharedChartElements.X_AXIS_INTERVAL,
                SharedChartElements.X_AXIS_MIN,
                SharedChartElements.X_AXIS_MAX
            ]
        },
        {
            id: 'yaxis',
            title: _('Y-Axis').t(),
            formElements: [
                SharedChartElements.Y_AXIS_TITLE,
                SharedChartElements.Y_AXIS_SCALE,
                SharedChartElements.Y_AXIS_INTERVAL,
                SharedChartElements.Y_AXIS_MIN,
                SharedChartElements.Y_AXIS_MAX
            ]
        },
        {
            id: 'legend',
            title: _('Legend').t(),
            formElements: [
                SharedChartElements.LEGEND_PLACEMENT,
                SharedChartElements.LEGEND_TRUNCATION
            ]
        },
        {
            id: 'mark',
            title: _('Mark').t(),
            formElements: [
                {
                    name: 'display.visualizations.charting.chart.bubbleMinimumSize',
                    label: _('Min Size').t(),
                    defaultValue: '10',
                    control: TextControl,
                    controlOptions: {
                        inputClassName: 'input-medium'
                    },
                    validation: [
                        {
                            pattern: 'digits',
                            min: 1,
                            msg: _('Min Size must be a positive integer.').t(),
                            required: true
                        },
                        {
                            fn: validateSizeMinMax
                        }
                    ]
                },
                {
                    name: 'display.visualizations.charting.chart.bubbleMaximumSize',
                    label: _('Max Size').t(),
                    defaultValue: '50',
                    control: TextControl,
                    controlOptions: {
                        inputClassName: 'input-medium'
                    },
                    validation: [
                        {
                            pattern: 'digits',
                            min: 1,
                            msg: _('Max Size must be a positive integer.').t(),
                            required: true
                        },
                        {
                            fn: validateSizeMinMax
                        }
                    ]
                }
            ]
        }
    ]);

});
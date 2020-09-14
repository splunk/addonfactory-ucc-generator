define([
            'underscore',
            './shared_elements'
        ],
        function(
            _,
            SharedChartElements
        ) {

    return ([
        {
            id: 'general',
            title: _('General').t(),
            formElements: [
                SharedChartElements.NULL_VALUE_MODE,
                SharedChartElements.MULTI_SERIES,
                SharedChartElements.DRILLDOWN,
                SharedChartElements.SHOW_DATA_VALUES
            ]
        },
        {
            id: 'xaxis',
            title: _('X-Axis').t(),
            formElements: [
                SharedChartElements.X_AXIS_TITLE,
                SharedChartElements.X_AXIS_LABEL_ROTATION,
                SharedChartElements.X_AXIS_LABEL_ELISION
            ]
        },
        {
            id: 'yaxis',
            title: _('Y-Axis').t(),
            formElements: [
                SharedChartElements.Y_AXIS_TITLE,
                SharedChartElements.Y_AXIS_SCALE,
                SharedChartElements.Y_AXIS_RANGE,
                SharedChartElements.Y_AXIS_INTERVAL,
                SharedChartElements.Y_AXIS_MIN,
                SharedChartElements.Y_AXIS_MAX
            ]
        },
        {
            id: 'overlay',
            title: _('Chart Overlay').t(),
            formElements: [
                SharedChartElements.OVERLAY_FIELDS,
                SharedChartElements.Y_AXIS_2_ENABLED,
                SharedChartElements.Y_AXIS_2_TITLE,
                SharedChartElements.Y_AXIS_2_SCALE,
                SharedChartElements.Y_AXIS_2_INTERVAL,
                SharedChartElements.Y_AXIS_2_MIN,
                SharedChartElements.Y_AXIS_2_MAX
            ]
        },
        {
            id: 'legend',
            title: _('Legend').t(),
            formElements: [
                SharedChartElements.LEGEND_PLACEMENT,
                SharedChartElements.LEGEND_TRUNCATION
            ]
        }
    ]);

});
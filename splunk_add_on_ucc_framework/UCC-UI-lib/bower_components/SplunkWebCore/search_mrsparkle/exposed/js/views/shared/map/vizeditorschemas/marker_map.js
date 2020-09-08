define([
            'underscore',
            'views/shared/controls/TextControl',
            'views/shared/controls/PercentTextControl',
            'util/validation',
            './shared_elements'
        ],
        function(
            _,
            TextControl,
            PercentTextControl,
            validationUtils,
            SharedMapElements
        ) {

    var validateMinMaxMarkerSize = validationUtils.minMaxValidationGenerator(
        'display.visualizations.mapping.markerLayer.markerMinSize',
        'display.visualizations.mapping.markerLayer.markerMaxSize',
        _('The Min Size must be less than the Max Size.').t()
    );

    return ([
        {
            id: 'general',
            title: _('General').t(),
            formElements: [
                SharedMapElements.DRILLDOWN,
                SharedMapElements.SCROLL_ZOOM,
                '<div class="divider"></div>',
                SharedMapElements.CENTER_LAT,
                SharedMapElements.CENTER_LON,
                SharedMapElements.ZOOM,
                SharedMapElements.POPULATE_CENTER_ZOOM
            ]
        },
        {
            id: 'markers',
            title: _('Markers').t(),
            formElements: [
                {
                    name: 'display.visualizations.mapping.markerLayer.markerOpacity',
                    label: _('Opacity').t(),
                    defaultValue: '0.8',
                    control: PercentTextControl
                },
                {
                    name: 'display.visualizations.mapping.markerLayer.markerMinSize',
                    label: _('Min Size').t(),
                    defaultValue: '10',
                    control: TextControl,
                    controlOptions: {
                        inputClassName: 'input-medium'
                    },
                    validation: [
                        {
                            pattern: 'digits',
                            required: true,
                            min: 1,
                            msg: _('Min Size must be a positive integer.').t()
                        },
                        {
                            fn: validateMinMaxMarkerSize
                        }
                    ]
                },
                {
                    name: 'display.visualizations.mapping.markerLayer.markerMaxSize',
                    label: _('Max Size').t(),
                    defaultValue: '50',
                    control: TextControl,
                    controlOptions: {
                        inputClassName: 'input-medium'
                    },
                    validation: [
                        {
                            pattern: 'digits',
                            required: true,
                            min: 1,
                            msg: _('Max Size must be a positive integer.').t()
                        },
                        {
                            fn: validateMinMaxMarkerSize
                        }
                    ]
                },
                {
                    name: 'display.visualizations.mapping.data.maxClusters',
                    label: _('Max Clusters').t(),
                    control: TextControl,
                    controlOptions: {
                        inputClassName: 'input-medium'
                    },
                    defaultValue: '100',
                    validation: {
                        pattern: 'digits',
                        required: true,
                        min: 0,
                        msg: _('Max Clusters must be a non-negative integer.').t()
                    }
                }
            ]
        },
        {
            id: 'tiles',
            title: _('Tiles').t(),
            formElements: [
                SharedMapElements.SHOW_TILES,
                SharedMapElements.TILE_OPACITY,
                SharedMapElements.TILE_URL,
                SharedMapElements.MIN_ZOOM,
                SharedMapElements.MAX_ZOOM,
                SharedMapElements.TILE_PRESETS
            ]
        }
    ]);

});
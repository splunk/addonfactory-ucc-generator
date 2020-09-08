define([
            'underscore',
            'views/shared/controls/SyntheticRadioControl',
            'views/shared/controls/BooleanRadioControl',
            'views/shared/controls/TextControl',
            'views/shared/controls/TextareaControl',
            'views/shared/controls/PercentTextControl',
            'views/shared/vizcontrols/custom_controls/MapCenterControlGroup',
            'views/shared/vizcontrols/custom_controls/MapPopulateCenterZoom',
            'views/shared/vizcontrols/custom_controls/TilePresetsDropDownMenu',
            'util/validation',
            'splunk.util'
        ],
        function(
            _,
            SyntheticRadioControl,
            BooleanRadioControl,
            TextControl,
            TextareaControl,
            PercentTextControl,
            MapCenterControlGroup,
            MapPopulateCenterZoom,
            TilePresetsDropDownMenu,
            validationUtils,
            splunkUtils
        ) {

    var validateMinMaxZoom = validationUtils.minMaxValidationGenerator(
        'display.visualizations.mapping.tileLayer.minZoom',
        'display.visualizations.mapping.tileLayer.maxZoom',
        _('The Min Zoom must be less than the Max Zoom.').t()
    );

    return ({

        DRILLDOWN: {
            name: 'display.visualizations.mapping.drilldown',
            label: _('Drilldown').t(),
            defaultValue: 'all',
            groupOptions: {
                controlClass: 'controls-halfblock'
            },
            control: SyntheticRadioControl,
            controlOptions: {
                items: [
                    {
                        label: _('Yes').t(),
                        value: 'all'
                    },
                    {
                        label: _('No').t(),
                        value: 'none'
                    }
                ]
            }
        },

        CENTER_LAT: {
            name: 'display.visualizations.mapping.map.center',
            label: _('Latitude').t(),
            defaultValue: '(0,0)',
            group: MapCenterControlGroup,
            groupOptions: {
                mode: MapCenterControlGroup.LATITUDE
            },
            validation: {
                pattern: /^\s*\(([-+.0-9]+)\s*,\s*([-+.0-9]+)\)\s*$/,
                required: true,
                msg: _('Latitude and Longitude must be valid numbers.').t()
            }
        },

        // This element and the one above are powered by the same attribute,
        // so use a dummy name here and omit the default value / validation
        CENTER_LON: {
            name: 'display.visualizations.mapping.map.center-lon',
            label: _('Longitude').t(),
            group: MapCenterControlGroup,
            groupOptions: {
                mode: MapCenterControlGroup.LONGITUDE
            }
        },

        ZOOM: {
            name: 'display.visualizations.mapping.map.zoom',
            label: _('Zoom').t(),
            defaultValue: '2',
            control: TextControl,
            controlOptions: {
                inputClassName: 'input-medium'
            },
            validation: {
                pattern: 'digits',
                required: true,
                min: 0,
                msg: _('Zoom must be a non-negative integer.').t()
            }
        },

        // This element is not an actual "control", just a button to populate
        // the center and zoom based on the current map viewport.
        POPULATE_CENTER_ZOOM: {
            name: 'populate-center-zoom-button',
            group: MapPopulateCenterZoom
        },

        SCROLL_ZOOM: {
            name: 'display.visualizations.mapping.map.scrollZoom',
            label: _('Zoom on Scroll').t(),
            defaultValue: '0',
            groupOptions: {
                controlClass: 'controls-halfblock'
            },
            control: BooleanRadioControl
        },

        SHOW_TILES: {
            name: 'display.visualizations.mapping.showTiles',
            label: _('Show Tiles').t(),
            defaultValue: '1',
            groupOptions: {
                controlClass: 'controls-halfblock'
            },
            control: BooleanRadioControl
        },

        TILE_OPACITY: {
            name: 'display.visualizations.mapping.tileLayer.tileOpacity',
            label: _('Tile Opacity').t(),
            defaultValue: '1',
            control: PercentTextControl,
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.mapping.showTiles'));
            }
        },

        TILE_URL: {
            name: 'display.visualizations.mapping.tileLayer.url',
            label: _('Url').t(),
            groupOptions: {
                help: _('The URL to use for requesting tiles, ex: <br /> http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').t()
            },
            control: TextareaControl,
            controlOptions: {
                className: 'control controls-block'
            },
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.mapping.showTiles'));
            }
        },

        MIN_ZOOM: {
            name: 'display.visualizations.mapping.tileLayer.minZoom',
            label: _('Min Zoom').t(),
            defaultValue: '0',
            control: TextControl,
            controlOptions: {
                className: 'control controls-block'
            },
            validation: [
                {
                    pattern: 'digits',
                    required: true,
                    min: 0,
                    msg: _('Min Zoom must be a non-negative integer.').t()
                },
                {
                    fn: validateMinMaxZoom
                }
            ],
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.mapping.showTiles'));
            }
        },

        MAX_ZOOM: {
            name: 'display.visualizations.mapping.tileLayer.maxZoom',
            label: _('Max Zoom').t(),
            defaultValue: '7',
            control: TextControl,
            controlOptions: {
                className: 'control controls-block'
            },
            validation: [
                {
                    pattern: 'digits',
                    required: true,
                    min: 0,
                    msg: _('Max Zoom must be a non-negative integer.').t()
                },
                {
                    fn: validateMinMaxZoom
                }
            ],
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.mapping.showTiles'));
            }
        },

        // This element is not an actual "control", just a drop-down menu with
        // a list of preset tile configurations.
        TILE_PRESETS: {
            name: 'tile-presets-dropdown',
            group: TilePresetsDropDownMenu,
            groupOptions: {
                label: _('Populate from preset configuration').t(),
                className: 'populate-button-container',
                dropdownClassName: 'dropdown-menu-narrow',
                anchorClassName: 'btn-pill',
                popdownOptions: { detachDialog: true },
                items: [
                    {
                        label: _('Splunk Tiles').t(),
                        value: 'splunk',
                        url: '',
                        minZoom: '0',
                        maxZoom: '7'
                    },
                    {
                        label: _('Open Street Map').t(),
                        value: 'osm',
                        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        minZoom: '0',
                        maxZoom: '19'
                    }
                ]
            },
            enabledWhen: function(reportModel) {
                return splunkUtils.normalizeBoolean(reportModel.get('display.visualizations.mapping.showTiles'));
            }
        }

    });

});
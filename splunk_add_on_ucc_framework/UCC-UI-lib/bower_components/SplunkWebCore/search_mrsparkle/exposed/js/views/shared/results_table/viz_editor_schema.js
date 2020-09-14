define([
            'underscore',
            'views/shared/controls/SyntheticRadioControl',
            'views/shared/controls/BooleanRadioControl',
            'views/shared/controls/SyntheticSelectControl',
            'views/shared/controls/TextControl'
        ],
        function(
            _,
            SyntheticRadioControl,
            BooleanRadioControl,
            SyntheticSelectControl,
            TextControl
        ) {

    var hasOverlay = function(reportContent) {
        var overlay = reportContent.get('display.statistics.overlay');
        return ((overlay === 'heatmap') || (overlay === 'highlow'));
    };

    return ([
        {
            id: 'general',
            title: _('General').t(),
            formElements: [
                {
                    name: 'display.statistics.wrap',
                    label: _('Wrap Results').t(),
                    defaultValue: '1',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl
                },
                {
                    name: 'display.statistics.rowNumbers',
                    label: _('Row Numbers').t(),
                    defaultValue: '0',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl
                },
                {
                    name: 'display.statistics.drilldown',
                    label: _('Drilldown').t(),
                    defaultValue: 'cell',
                    groupOptions: {
                        controlClass: 'controls-thirdblock'
                    },
                    control: SyntheticRadioControl,
                    controlOptions: {
                        items: [
                            { value: 'row', label: _('Row').t() },
                            { value: 'cell', label: _('Cell').t() },
                            { value: 'none', label: _('None').t() }
                        ]
                    }
                },
                {
                    name: 'display.statistics.overlay',
                    label: _('Data Overlay').t(),
                    defaultValue: 'none',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: SyntheticSelectControl,
                    controlOptions: {
                        items: [
                            { value: 'none', label: _('None').t() },
                            { value: 'heatmap', label: _('Heat map').t() },
                            { value: 'highlow', label: _('High and low values').t() }
                        ],
                        menuWidth: 'narrow',
                        toggleClassName: 'btn'
                    }
                },
                {
                    html: '<div class="alert alert-viz-control alert-warning"><i class="icon-alert"></i>' + _("Table column color overrides heat map and high/low value data overlay.").t() + '</div>',
                    visibleWhen: hasOverlay
                },
                {
                    name: 'display.prefs.statistics.count',
                    label: _('Rows Per Page').t(),
                    defaultValue: '10',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: TextControl,
                    validation: {
                        pattern: 'digits',
                        min: 1,
                        max: 100,
                        msg: _('Rows Per Page must be a positive number no larger than 100.').t(),
                        required: true
                    }
                }
            ]
        },
        {
            id: 'results-summary',
            title: _('Summary').t(),
            formElements: [
                {
                    name: 'display.statistics.totalsRow',
                    control: BooleanRadioControl,
                    defaultValue: '0',
                    label: _('Totals').t(),
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    }
                },
                {
                    name: 'display.statistics.percentagesRow',
                    control: BooleanRadioControl,
                    defaultValue: '0',
                    label: _('Percentages').t(),
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    }
                }/*
                    TODO @pwied :
                    - uncomment once totals column is ready
                ,
                {
                    name: 'display.statistics.totalsCol',
                    control: BooleanRadioControl,
                    defaultValue: '0',
                    label: _('Summary Column').t(),
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    }
                }*/
            ]
        }
    ]);

});
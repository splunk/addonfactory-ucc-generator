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

    return([
        {
            id: 'general',
            title: _('General').t(),
            formElements: [
                {
                    name: 'display.events.type',
                    label: _('Display').t(),
                    defaultValue: 'list',
                    groupOptions: {
                        controlClass: 'controls-thirdblock'
                    },
                    control: SyntheticRadioControl,
                    controlOptions: {
                        items: [
                            { label: _('Raw').t(), value: 'raw' },
                            { label: _('List').t(), value: 'list' },
                            { label: _('Table').t(), value: 'table' }
                        ]
                    }
                },
                {
                    name: 'display.events.rowNumbers',
                    label: _('Row Numbers').t(),
                    defaultValue: '0',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl,
                    visibleWhen: function(reportContent) {
                        return reportContent.get('display.events.type') !== 'raw';
                    }
                },
                {
                    name: 'display.events.list.wrap',
                    label: _('Wrap Results').t(),
                    defaultValue: '1',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl,
                    visibleWhen: function(reportContent) {
                        return reportContent.get('display.events.type') === 'list';
                    }
                },
                {
                    name: 'display.events.table.wrap',
                    label: _('Wrap Results').t(),
                    defaultValue: '1',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl,
                    visibleWhen: function(reportContent) {
                        return reportContent.get('display.events.type') === 'table';
                    }
                },
                {
                    name: 'display.events.maxLines',
                    label: _('Max Lines').t(),
                    defaultValue: '5',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: SyntheticSelectControl,
                    controlOptions: {
                        items: [
                            { value: '5', label: _('5 lines').t() },
                            { value: '10', label: _('10 lines').t() },
                            { value: '20', label: _('20 lines').t() },
                            { value: '50', label: _('50 lines').t() },
                            { value: '100', label: _('100 lines').t() },
                            { value: '200', label: _('200 lines').t() },
                            { value: '0', label: _('All lines').t() }
                        ],
                        menuWidth: 'narrow',
                        toggleClassName: 'btn'
                    }
                },
                {
                    name: 'display.events.raw.drilldown',
                    label: _('Event Drilldown').t(),
                    defaultValue: 'full',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: SyntheticSelectControl,
                    controlOptions: {
                        items: [
                            { value: 'none', label: _('None').t() },
                            { value: 'inner', label: _('Inner').t() },
                            { value: 'outer', label: _('Outer').t() },
                            { value: 'full', label: _('Full').t() }
                        ],
                        menuWidth: 'narrow',
                        toggleClassName: 'btn'
                    },
                    visibleWhen: function(reportContent) {
                        return reportContent.get('display.events.type') === 'raw';
                    }
                },
                {
                    name: 'display.events.list.drilldown',
                    label: _('Event Drilldown').t(),
                    defaultValue: 'full',
                    groupOptions: {
                        controlClass: 'controls-block'
                    },
                    control: SyntheticSelectControl,
                    controlOptions: {
                        items: [
                            { value: 'none', label: _('None').t() },
                            { value: 'inner', label: _('Inner').t() },
                            { value: 'outer', label: _('Outer').t() },
                            { value: 'full', label: _('Full').t() }
                        ],
                        menuWidth: 'narrow',
                        toggleClassName: 'btn'
                    },
                    visibleWhen: function(reportContent) {
                        return reportContent.get('display.events.type') === 'list';
                    }
                },
                {
                    name: 'display.events.table.drilldown',
                    label: _('Drilldown').t(),
                    defaultValue: '1',
                    groupOptions: {
                        controlClass: 'controls-halfblock'
                    },
                    control: BooleanRadioControl,
                    controlOptions: {
                        trueLabel: _('On').t(),
                        falseLabel: _('Off').t()
                    },
                    visibleWhen: function(reportContent) {
                        return reportContent.get('display.events.type') === 'table';
                    }
                },
                {
                    name: 'display.prefs.events.count',
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
        }
    ]);

});
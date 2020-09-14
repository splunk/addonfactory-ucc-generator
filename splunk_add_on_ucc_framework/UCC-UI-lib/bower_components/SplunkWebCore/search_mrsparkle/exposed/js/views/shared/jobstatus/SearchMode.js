define(
    [
        'underscore',
        'module',
        'views/shared/controls/SyntheticSelectControl',
        'util/splunkd_utils',
        './SearchMode.pcss'
    ],
    function(_, module, SyntheticSelectControl, splunkd_utils, css){
        return SyntheticSelectControl.extend({
            className: 'pull-left',
            moduleId: module.id,
            initialize: function(options) {
                options.items = [
                    {value: splunkd_utils.FAST, label: _('Fast Mode').t(), icon: 'lightning', description: _('Field discovery off for event searches. No event or field data for stats searches.').t()},
                    {value: splunkd_utils.SMART, label: _('Smart Mode').t(), icon: 'bulb', description: _('Field discovery on for event searches. No event or field data for stats searches.').t()},
                    {value: splunkd_utils.VERBOSE, label: _('Verbose Mode').t(), icon: 'speech-bubble', description: _('All event & field data.').t()}
                ];
                options.modelAttribute = 'display.page.search.mode';
                options.defaultValue = splunkd_utils.SMART;
                options.toggleClassName = "btn-pill dropdown-toggle-search-mode";
                options.menuClassName = "dropdown-menu-search-mode";
                options.iconClassName = "link-icon";
                SyntheticSelectControl.prototype.initialize.call(this, options);
            }
        });
    }
);

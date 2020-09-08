/**
 * @author jszeto
 * @date 12/28/12
 *
 * SyntheticSelectControl to choose a sample size for a search
 */


define(
    [
        'jquery',
        'underscore',
        'views/shared/controls/SyntheticSelectControl',
        'module'
    ],
    function(
        $,
        _,
        SyntheticSelectControl,
        module
        )
    {

        var CONSTS = {
            FIRST_1000: {head: 1000},
            FIRST_10000: {head: 10000},
            /*RANDOM_1000: "random1000",
            RANDOM_10000: "random10000",*/
            LAST_5_MINUTES: {earliest: "-5m", latest: "now"},
            LAST_24_HOURS: {earliest: "-1d@h", latest: "now"},
            LAST_7_DAY: {earliest: "-7d@h", latest: "now"}

        };

        return SyntheticSelectControl.extend({
            moduleId: module.id,
            className: 'control btn-group select-field-type',

            initialize: function () {
                var items = [{label: _("1,000 events").t(), value: CONSTS.FIRST_1000},
                    {label: _("10,000 events").t(), value: CONSTS.FIRST_10000},
                    /*{label: "1,000 random events", value: CONSTS.RANDOM_1000},
                    {label: "10,000 random events", value: CONSTS.RANDOM_10000},*/
                    {label: _("5 minutes").t(), value: CONSTS.LAST_5_MINUTES},
                    {label: _("24 hours").t(), value: CONSTS.LAST_24_HOURS},
                    {label: _("7 days").t(), value: CONSTS.LAST_7_DAY}];

                $.extend(this.options, {
                    toggleClassName: 'btn',
                    menuWidth: 'narrow',
                    items: items,
                    defaultValue: CONSTS.FIRST_1000,
                    label: _("Sample:").t()
                });
                SyntheticSelectControl.prototype.initialize.call(this, this.options);
            }
        }, CONSTS);
    });

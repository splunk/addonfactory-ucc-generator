/**
 * @author jszeto
 * @date 11/10/14
 *
 *
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/shared/controls/ValueInUnitsBaseControl'
],
    function (
        $,
        _,
        Backbone,
        module,
        ValueInUnitsBaseControl
        ) {

        var KB = 1000;
        var MB = 1000000;
        var GB = 1000000000;
        var TB = 1000000000000;

        return ValueInUnitsBaseControl.extend({
            moduleId: module.id,
            className: 'bandwidth-control input-append',

            initialize: function(options) {
                options = options || {};
                options.items = [{label: _('Kbit/s').t(), value: KB},
                    {label: _('Mbit/s').t(), value: MB},
                    {label: _('Gbit/s').t(), value: GB},
                    {label: _('Tbit/s').t(), value: TB}];

                ValueInUnitsBaseControl.prototype.initialize.call(this, options);
            },

            // Take a value and apply it to the sub controls
            applyValueToChildren: function(value) {
                var bandwidth = parseInt(value, 10) || 0;

                var unit = ((bandwidth >= TB) && (bandwidth % TB == 0)) ? TB:
                           ((bandwidth >= GB) && (bandwidth % GB == 0)) ? GB:
                           ((bandwidth >= MB) && (bandwidth % MB == 0)) ? MB:KB;
                var number = bandwidth / unit;
                //console.log("BandwidthControl.applyValueToChildren num",number, "unit",unit);
                this.children.textNumber._setValue(number, true, true);
                this.children.selectUnit._setValue(unit, true, true);

                // Subclasses should implement
            },

            // Get the value from the sub controls
            getValueFromChildren: function() {
                // Subclasses should implement
                var numberValue = this.children.textNumber.getValue();

                if (numberValue == "")
                    return;

                var returnVal =  this.children.textNumber.getValue() * this.children.selectUnit.getValue();
                //console.log("BandwidthControl getValueFromChildren num",this.children.textNumber.getValue(),
                //    "unit",this.children.selectUnit.getValue(), "total",returnVal);
                return returnVal;
            }
        });

    });


/**
 * @author claral
 * @date 10/28/15
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

    var MB = 1024 * 1024;
    var GB = 1024 * 1024 * 1024;

    return ValueInUnitsBaseControl.extend({
        moduleId: module.id,
        className: 'blocksize-control input-append',

        initialize: function(options) {
            options = options || {};
            options.items = [
                {label: _('MB').t(), value: MB},
                {label: _('GB').t(), value: GB}];

            ValueInUnitsBaseControl.prototype.initialize.call(this, options);
        },

        // Take a value and apply it to the sub controls
        applyValueToChildren: function(value) {
            var blockSize = parseInt(value, 10) || 0;

            var unit = ((blockSize >= GB) && (blockSize % GB == 0)) ? GB : MB;
            var number = blockSize / unit;

            this.children.textNumber._setValue(number, true, true);
            this.children.selectUnit._setValue(unit, true, true);
        },

        // Get the value from the sub controls
        getValueFromChildren: function() {
            var numberValue = this.children.textNumber.getValue();

            if (numberValue !== "") {
                return this.children.textNumber.getValue() * this.children.selectUnit.getValue();
            }
        }
    });
});
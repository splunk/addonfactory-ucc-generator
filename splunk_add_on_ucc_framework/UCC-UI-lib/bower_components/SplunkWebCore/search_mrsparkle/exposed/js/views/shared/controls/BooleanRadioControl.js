define([
            'underscore',
            'module',
            'views/shared/controls/SyntheticRadioControl'
        ],
        function(
            _,
            module,
            SyntheticRadioControl
        ) {

    return SyntheticRadioControl.extend({

        moduleId: module.id,

        initialize: function() {
            this.options.items = [
                { label: this.options.trueLabel || _('Yes').t(), value: '1' },
                { label: this.options.falseLabel || _('No').t(), value: '0' }
            ];
            if (this.options.reversed) {
                this.options.items.reverse();
            }
            SyntheticRadioControl.prototype.initialize.call(this, this.options);
        }

    });

});
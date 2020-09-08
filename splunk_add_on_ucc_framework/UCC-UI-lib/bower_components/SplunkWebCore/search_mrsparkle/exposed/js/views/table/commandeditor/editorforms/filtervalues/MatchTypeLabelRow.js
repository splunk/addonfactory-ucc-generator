define([
        'underscore',
        'module',
        'views/shared/controls/LabelControl'
    ],
    function(
        _,
        module,
        LabelControl
    ) {
    return LabelControl.extend({
        moduleId: module.id,

        initialize: function() {
            LabelControl.prototype.initialize.apply(this, arguments);
        },

        getLabel: function(value) {
            var labelMap = this.options.labelMap,
                label = labelMap[value];
            return label || '';
        },

        render: function() {
            var label = this.getLabel(this._value);

            if (!this.el.innerHTML) {
                var template = _.template(this.template, {
                    options: this.options,
                    value: label
                });

                this.$el.html(template);
                this.$span = this.$('span');
            } else {
                this.$span.text(label);
            }

            var additionalClassNames = this.options.additionalClassNames;
            if(additionalClassNames) {
                this.$el.addClass(additionalClassNames);
            }

            if (this.options.tooltip) {
                this.$('.tooltip-text').tooltip({animation:false, title: this.options.tooltip});
            }
            return this;
        }
    });
});

define([
        'underscore',
        'module',
        'models/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/Control',
        'views/shared/controls/colors/ColorRangeControlMaster'
    ],
    function(
        _,
        module,
        BaseModel,
        ControlGroup,
        Control,
        ColorRangeControlMaster
        ) {

        return ControlGroup.extend({
                moduleId: module.id,
                className: 'color-ranges-control-group',
                initialize: function() {
                    var colorRangesControl = new ColorRangeControlMaster({
                            className: Control.prototype.className,
                            model: this.model,
                            modelAttribute: this.options.modelAttribute,
                            rangeColorsName: this.options.rangeColorsName,
                            inputClassName: this.options.inputClassName,
                            defaultColors: this.options.defaultColors,
                            defaultRangeValues: this.options.defaultRangeValues,
                            displayMinMaxLabels: this.options.displayMinMaxLabels,
                            paletteColors: this.options.paletteColors
                    });
                    this.options.label = _('Ranges').t();
                    this.options.controlClass = 'controls-block';
                    this.options.controls = [ colorRangesControl ];
                    ControlGroup.prototype.initialize.call(this, this.options);
                },

                render: function() {
                    ControlGroup.prototype.render.apply(this, arguments);
                    return this;
                }
            });

    });

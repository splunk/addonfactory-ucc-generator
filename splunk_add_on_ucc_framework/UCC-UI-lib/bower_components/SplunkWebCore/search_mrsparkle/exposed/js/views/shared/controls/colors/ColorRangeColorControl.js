define([
        'jquery',
        'underscore',
        'module',
        'backbone',
        'views/shared/controls/Control',
        'views/shared/controls/colors/ColorPicker',
        'util/color_utils',
        './ColorRangeControlRow.pcss'
    ],
    function(
        $,
        _,
        module,
        Backbone,
        Control,
        ColorPicker,
        colorUtils,
        css
        ) {

        return Control.extend({
            className: 'color-range-input-control',
            moduleId: module.id,

            events: {
                'click .color-square': function(e) {
                    e.preventDefault();
                    var $target = $(e.currentTarget);
                    this.children.colorPicker = this._createColorPicker();
                    this.children.colorPicker.render().appendTo(
                        this.$el.closest('.modal,body')
                    );
                    this.children.colorPicker.show($target);
                }
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({}));
                }
                var bgColor = colorUtils.replaceSymbols(this.model.get("color"), '#');
                this.$('.color-square').css('background-color', bgColor);
                return this;
            },
            
            _createColorPicker: function() {
                return new ColorPicker({
                    model: this.model,
                    onHiddenRemove: true,
                    paletteColors: this.options.paletteColors
                });
            },

            template: '\
                <div class="color-picker-add-on">\
                    <a href="#" class="color-square"></a>\
                </div>\
            '
        });

    });
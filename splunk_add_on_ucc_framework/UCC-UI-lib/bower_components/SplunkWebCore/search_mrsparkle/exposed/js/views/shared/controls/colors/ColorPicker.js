define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/PopTart',
        'util/color_utils',
        'util/keyboard',
        './ColorPicker.pcss'
    ],
    function(_, $, module, PopTart, colorUtil, keyboardUtils, css){

        var VALID_COLOR_REGEX = /^(0x|#)?([a-f0-9]{3}|[a-f0-9]{6})$/i;

        return PopTart.extend({
            moduleId: module.id,
            className: 'popdown-dialog color-picker-container',
            initialize: function() {
                PopTart.prototype.initialize.apply(this, arguments);
                this.on('shown', function() {
                    this.$('.hex-input').focus();
                });
                if (!this.options.paletteColors || this.options.paletteColors.length === 0) {
                    throw new Error('Palette Colors must be defined');
                }
                this.colors = this.options.paletteColors;
                this.listenTo(this, 'hidden', function(e) {
                    if (e && e.skipApplyFromInput) {
                        return;
                    }
                    this.applyInputIfValid();
                });
            },
            events: {
                'keydown': function(e) {
                    if (e.which === keyboardUtils.KEYS.TAB) {
                        keyboardUtils.handleCircularTabbing(this.$el, e);
                    } else if (e.which === keyboardUtils.KEYS.ESCAPE) {
                        e.preventDefault();
                        // Prevent this event from bubbling up since we are handling its intent
                        // by closing the color picker.
                        e.stopPropagation();
                        this.hide({ skipApplyFromInput: true });
                    }
                },
                'click .swatch': function(e) {
                    e.preventDefault();
                    var hashPrefixedColor = $(e.currentTarget).data().color,
                        hexColor = colorUtil.replaceSymbols(hashPrefixedColor, '0x');

                    this.apply(hexColor, { skipApplyFromInput: true });
                },
                'keydown .hex-input': function(e) {
                    if (e.which === keyboardUtils.KEYS.ENTER) {
                        e.preventDefault();
                        // Prevent this event from bubbling up since we are handling its intent
                        // by closing the color picker and submitting the new color.
                        e.stopPropagation();
                        var applied = this.applyInputIfValid();
                        if (!applied) {
                            this.hide();
                        }
                    }
                },
                'keyup .hex-input': function(e) {
                    var hexColor = colorUtil.replaceSymbols(e.target.value, '0x');
                    var $miniSwatch = this.$('.mini-swatch');
                    if (VALID_COLOR_REGEX.test(hexColor)) {
                        $miniSwatch.removeClass('disabled');
                        $miniSwatch.css({
                            'background-color': colorUtil.replaceSymbols(hexColor, '#')
                        });
                    } else {
                        $miniSwatch.addClass('disabled');
                        $miniSwatch.css({ 'background-color': '' });
                    }
                },
                'click .mini-swatch': function(e) {
                    e.preventDefault();
                    this.applyInputIfValid();
                }
            },
            apply: function(color, options) {
                this.model.set({ color: color });
                // Hide first, because that will return focus to the correct popdown activator.
                // This is necessary so the parent can re-render in place correctly when the color-picker-apply event is triggered.
                this.hide(options);
                this.model.trigger('color-picker-apply', this.options.index);
            },
            applyInputIfValid: function() {
                var hexColor = colorUtil.replaceSymbols(this.$('.hex-input').val(), '0x');
                if (!VALID_COLOR_REGEX.test(hexColor)) {
                    return false;
                }
                this.apply(hexColor);
                return true;
            },
            render: function() {
                this.$el.html(PopTart.prototype.template);
                this.$('.popdown-dialog-body').addClass('color-picker-content');
                this.$('.popdown-dialog-body').append(this.compiledTemplate({
                    currentColor: colorUtil.stripSymbols(this.model.get('color'), '#'),
                    colors: this.colors,
                    colorUtil: colorUtil
                }));
            },
            template: '\
                <div class="swatches clearfix">\
                    <ul class="swatch-holder unstyled">\
                        <% _(colors).each(function(color) { %>\
                            <li>\
                                <a href="#" class="swatch" data-color="<%= color %>" style="background-color: <%= color %>"></a>\
                            </li>\
                        <% }) %>\
                    </ul>\
                </div>\
                <div class="input-prepend input-append views-shared-controls-textcontrol">\
                    <span class="add-on">#</span>\
                    <input type="text" class="hex-input" value="<%- currentColor %>">\
                    <span class="add-on">\
                        <a href="#" class="mini-swatch" style="background-color: #<%- currentColor %>;"></a>\
                    </span>\
                </div>\
            '
        });
    }
);

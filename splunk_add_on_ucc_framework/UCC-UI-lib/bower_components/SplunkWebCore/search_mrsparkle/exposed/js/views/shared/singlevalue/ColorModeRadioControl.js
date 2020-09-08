define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/controls/Control',
        'util/general_utils',
        'util/svg',
        'bootstrap.tooltip'
    ],
    function(
        $,
        _,
        module,
        Control,
        util,
        svgUtil
        // bootstrap tooltip
        ) {

        var getIconString = function(attrs) {
                var backgroundColor = attrs.backgroundColor,
                    fontColor = attrs.fontColor,
                    iconClass = 'radio-icon ' + attrs.iconClass,
                    value = attrs.value;
                return '<div class="' + iconClass + '" style="background-color: ' + backgroundColor
                    + '; color: ' + fontColor
                    + '";><div class="radio-icon-value-container"><div class="radio-icon-value">' + value + '</div></div></div>';
            };

        var IconRadioControl = Control.extend({
            className: 'control btn-group',
            moduleId: module.id,
            initialize: function(){
                if (this.options.modelAttribute) {
                    this.$el.attr('data-name', this.options.modelAttribute);
                }
                this.$el.addClass('btn-group-radio');
                Control.prototype.initialize.call(this, this.options);
            },
            drawIcon: function($placeholder, item) {
                $placeholder.html(_.template(item.iconString));
            },
            render: function(){
                var that = this;
                if (!this.el.innerHTML) {
                    var template = _.template(this.template, {
                        _: _,
                        items: that.options.items,
                        modelAttribute: this.options.modelAttribute
                    });
                    this.$el.html(template);
                    this.$('[rel="tooltip"]').tooltip({animation:false, container: 'body', trigger: 'hover'});
                }
                var value = this._value;
                this.$el.find('input:radio').each(function(i, el) {
                    var $el = $(el);
                    $el.prop({ 'checked': $el.data('value') === value });
                    $el.change(function() {
                        that.setValue( $el.data('value'));
                    });
                });
                this.$el.find('.icon-placeholder').each(function(i, el) {
                    var $el = $(el);
                    that.drawIcon($el, that.options.items[i]);
                });
                return this;
            },
            remove: function(){
                this.$('[rel="tooltip"]').tooltip('destroy');
                Control.prototype.remove.call(this);
            },
            template: '\
                <% _.each(items, function(item, index){ %>\
                    <div class="color-mode-radio-icon-container">\
                        <input type="radio" data-value="<%- item.value %>" \
                        <% if (item.tooltip) { %> rel="tooltip" title="<%=item.tooltip%>" <% } %>>\
                        <% if (item.label) { %> <div class="radio-label"><%- item.label %></div> <% } %>\
                        <div class="icon-placeholder"></div> \
                    </div>\
                <% }) %>\
        '
        });

        return IconRadioControl.extend({
            moduleId: module.id,
            className: 'color-mode-radio-control',
            SVG_POINTS: {
                decrease: {
                    polylinePoints: '20.5,3 20.5,20.5 3,20.5',
                    linePoints: [20.2,20.9,3.4,4]
                },
                increase: {
                    polylinePoints: '20.5,21 20.5,3.5 3,3.5',
                    linePoints: [20.2,3.3,3.4,20.2]
                }
            },
            initialize: function(){
                IconRadioControl.prototype.initialize.call(this, this.options);
                this.listenTo(this.model, 'change:display.visualizations.singlevalue.colorBy', function() {
                    this.render();
                });
            },
            getSvgIcon: function(item, i) {
                var settings = item.iconSettings[i],
                    mode = settings.indicatorMode,
                    translationXY = settings.indicatorTranslation,
                    translation = translationXY ? 'translate(' + translationXY.x + ' ' + translationXY.y + ')' : '',
                    svg = svgUtil.createElement('svg')
                        .height(settings.svgHeight)
                        .width(settings.svgWidth)
                        .attr('class', 'icon-svg'),
                    polyline = svgUtil.createElement('polyline')
                        .attr({
                            points: this.SVG_POINTS[mode].polylinePoints,
                            fill: 'none',
                            stroke: settings.fontColor,
                            'stroke-width': '5px',
                            transform: 'scale(' + settings.indicatorScale + ') ' + translation
                        }),
                    line = svgUtil.createElement('line')
                        .attr({
                            x1: this.SVG_POINTS[mode].linePoints[0],
                            y1: this.SVG_POINTS[mode].linePoints[1],
                            x2: this.SVG_POINTS[mode].linePoints[2],
                            y2: this.SVG_POINTS[mode].linePoints[3],
                            fill: settings.fontColor,
                            stroke: settings.fontColor,
                            'stroke-width': '5px',
                            transform: 'scale(' + settings.indicatorScale + ') ' + translation
                        });
                svg.append(polyline);
                svg.append(line);
                return svg;
            },
            drawIcon: function($placeholder, item) {
                var iconString,
                    that = this,
                    iconClass;
                iconString = '';
                _(item.iconSettings).each(function(setting) {
                    if (setting.type === 'colorMode') {
                        if (that.model.get('display.visualizations.singlevalue.colorBy') === 'trend') {
                            setting.value = '6%';
                        } else {
                            setting.value = '42';
                        }
                        setting.indicatorMode = 'increase';
                        setting.indicatorScale = 0.5;
                        setting.svgHeight = '12px';
                        setting.svgWidth = '12px';

                        iconClass = 'color-mode-radio-icon';
                    } else if (setting.type === 'indicator') {
                        setting.value = '';
                        setting.indicatorScale = 1;
                        setting.indicatorTranslation = { x: 0, y: 4 };
                        setting.svgHeight = '32px';
                        setting.svgWidth = '32px';

                        iconClass = 'indicator-radio-icon';
                    }
                    iconString += getIconString({
                        backgroundColor: setting.backgroundColor,
                        value: setting.value,
                        fontColor: setting.fontColor,
                        iconClass: iconClass
                    });
                }, this);
                $placeholder.html(_.template(iconString));

                if (this.model.get('display.visualizations.singlevalue.colorBy') === 'trend') {
                    $placeholder.find('.radio-icon-value-container').each(function(i, el) {
                        var $el = $(el),
                            svg = that.getSvgIcon(item, i);
                        $el.prepend(svg);
                        $el.attr('class', 'svg-radio-icon-value-container');
                    });
                }
            },
            render: function() {
                IconRadioControl.prototype.render.call(this);
                return this;
            }
        });
    });

define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'models/Base',
        'splunk.util',
        'util/svg',
        'util/general_utils',
        'uri/route',
        'util/numeral'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        BaseModel,
        splunkUtil,
        svgUtil,
        generalUtil,
        route,
        numeral
        ) {

        var getStringRepresentation = function(label, formatted) {
            if (_.isFunction(label)) {
                try {
                    label = label(formatted);
                } catch (e) {
                    return '';
                }
            }
            return label;
        };

        return BaseView.extend({
            moduleId: module.id,
            className: "single-value-label",
            el: function() {
                return svgUtil.createElement('g').attr({
                    'class': 'single-value-label',
                    'data-name': this.options.configName
                });
            },

            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.activate();
                this.LABEL_FONT_SIZE = this.options.labelFontSize;
                this.labelFontColor = this.options.labelFontColor;
                this.labelGroupClass = this.options.labelGroupClass;
                this.labelClass = this.options.labelClass;
                this.linkField = this.options.linkField;
                this.resultFieldValue = this.model.results.get('resultFieldValue');
                this.configName = this.options.configName;
                this.unit = this.options.unit;
                this.unitPosition = this.options.unitPosition;
                this.hasUnit = this.options.hasUnit;
                this.isNumericLabelValue = false;
                if (this.options.useResultField) {
                    if (!isNaN(this.resultFieldValue)) {
                        // Single Result Label - needs formatting
                        var formatPattern = this.model.presentation.get('formatPattern');
                        this.labelValue = numeral(this.resultFieldValue).format(formatPattern);
                        this.isNumericLabelValue = true;
                    } else {
                        this.labelValue = this.resultFieldValue;
                    }
                } else {
                    this.labelValue = getStringRepresentation(this.model.state.get(this.configName) || "", this.resultFieldValue);
                }
                this.fontWeight = this.options.fontWeight;
                this.labelOpacity = this.options.labelOpacity;
                this.exportMode = this.options.exportMode;
            },

            events: {
                'click a.single-drilldown': function(e) {
                    e.preventDefault();
                    var target = $(e.currentTarget);
                    var resModel = this.model.results.get('searchResultsColumn'),
                        names = resModel.get('fields');

                    // Fields can either be a list of strings or a list of dictionaries each with a 'name' entry
                    // depending on whether 'show_metadata' is enabled
                    if (_.isObject(names[0])) {
                        names = _(names).pluck('name');
                    }

                    var rowContext = _.object(
                        _(names).map(function(f) { return 'row.' + f; }),
                        _(resModel.get('columns')).map(function(col) { return _(col).last(); })
                    );

                    var drilldownInfo = {
                        name: target.data('field'),
                        value: target.data('value'),
                        rowContext: rowContext,
                        originalEvent: e,
                        type: 'cell'
                    };

                    // If the results model has sparkline data, we want to narrow the drilldown time range
                    // to the last time bucket, since that is what is used to display the label.
                    if (this.model.results.has('sparklineData')) {
                        var timeFieldIndex = _(names).indexOf('_time'),
                            spanFieldIndex = _(names).indexOf('_span'),
                            columns = resModel.get('columns'),
                            lastTimestamp = splunkUtil.getEpochTimeFromISO(_(columns[timeFieldIndex]).last()),
                            lastTimespan = parseFloat(_(columns[spanFieldIndex]).last());

                        // Time range drilldown has to be done with `name` and `value`, re-map the current values
                        // there to `name2` and `value2` so that consumers still have access to them.
                        drilldownInfo.name2 = drilldownInfo.name;
                        drilldownInfo.value2 = drilldownInfo.value;
                        drilldownInfo.name = '_time';
                        drilldownInfo.value = lastTimestamp;
                        drilldownInfo._span = lastTimespan;
                        drilldownInfo.rowContext['row._time'] = lastTimestamp;
                        drilldownInfo.rowContext['row._span'] = lastTimespan;
                    }

                    var specificEventNames = _(target.children('text').attr('class').split(' ')).map(function(cls) {
                        return 'click:' + cls;
                    }).join(' ');
                    this.trigger('singleDrilldownClicked', { specificEventNames: 'click drilldown ' + specificEventNames, drilldownInfo: drilldownInfo });
                },
                'click a.link-drilldown': function(e) {
                    e.preventDefault();
                    this.trigger('anchorTagClicked', e);
                }
            },

            constructLabelData: function() {
                var labelData,
                    severityColor = this.model.presentation.get('severityColor');

                labelData = {
                    name: this.labelClass,
                    linkField: this.linkField,
                    value: this.labelValue,
                    fontSize: this.LABEL_FONT_SIZE + 'px',
                    fontWeight: this.fontWeight,
                    fontColor: this.labelFontColor,
                    opacity: this.labelOpacity || 1
                };

                return labelData;
            },

            drawLabel: function(container, labelData) {
                var labelGroup,
                    labelText,
                    labelAnchor;

                labelGroup = svgUtil.createElement('g')
                    .attr('class', 'svg-label');

                labelText = svgUtil.createElement('text')
                    .attr({
                        x: labelData.x,
                        y: labelData.y,
                        'class': labelData.name
                    })
                    .css({
                        'letter-spacing': this.isNumericLabelValue ? '-0.02em' : 'normal',
                        'font-size' : labelData.fontSize,
                        'font-weight' : labelData.fontWeight,
                        'fill' : labelData.fontColor,
                        'opacity': labelData.opacity
                    });

                var labelValue = ("" + labelData.value);

                if (this.hasUnit && (this.unitPosition === "before")) {
                    if ((/^\-\d/).test(labelValue)) {
                        labelText.append(document.createTextNode('-'));
                        labelValue = labelValue.substring(1);
                    }

                    if (this.exportMode) {
                        // The export renderer does not support <tspan> elements,
                        // work around it by prepending the unit directly to the main label.
                        labelValue = "" + this.unit + labelValue;
                    } else {
                        var beforeSpan = svgUtil.createElement('tspan')
                            .attr({
                                'class': labelData.name + "-unit"
                            })
                            .css({
                                'letter-spacing': 'normal'
                            })
                            .text("" + this.unit);

                        labelText.append(beforeSpan);
                    }
                }

                labelText.append(document.createTextNode(labelValue));

                if (this.hasUnit && (this.unitPosition === "after")) {
                    if (this.exportMode) {
                        // The export renderer does not support <tspan> elements,
                        // work around it by appending the unit directly to the main label.
                        labelText.append(document.createTextNode('\u2009' + this.unit));  // u2009 = thin space
                    } else {
                        var afterSpan = svgUtil.createElement('tspan')
                            .attr({
                                'class': labelData.name + "-unit"
                            })
                            .css({
                                'letter-spacing': 'normal'
                            })
                            .text('\u2009' + this.unit);  // u2009 = thin space

                        labelText.append(afterSpan);
                    }
                }

                if (labelData.link) {
                    labelAnchor = svgUtil.createElement('a')
                        .attr({
                            href: labelData.link.attr('href'),
                            'class': labelData.link.attr('class')
                        })
                        .css({
                            'text-decoration': 'none' // only style the <text> element itself, so that there is only 1 underline on hover
                        });
                    labelAnchor.data('value', labelData.value);
                    labelAnchor.data('field', labelData.linkField);

                    labelAnchor.append(labelText);
                    labelGroup.append(labelAnchor);

                    // IE requires that hover underline anchor styles are applied directly to the <text> element and not the surrounding anchor tag.
                    // We must therefore dynamically apply a hover styling event handler as
                    // we have no stylesheet for Single Value in which to use :hover pseudoselector for SVG
                    labelText.hover(function(e) {
                        labelText.css({ 'text-decoration': e.type === "mouseenter" ? 'underline' : 'none' });
                    });
                } else {
                    labelGroup.append(labelText);
                }
                container.append(labelGroup);

                this.labelElement = this.getLabelElement();
            },

            getWidth: function() {
                return this.getBBox(this.labelElement).width;
            },

            getLeftX: function($label) {
                return parseInt($label.attr('x'), 10);
            },

            getBBox: function($label) {
                var bbox;
                try {
                    bbox = $label[0].getBBox();
                } catch (e) {
                    // FF throws blocking error if element is not yet in DOM and getBBox is called, so return dummy BBox.
                    bbox = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    };
                }
                return bbox;
            },

            getRightX: function($label) {
                return this.getLeftX($label) + this.getWidth($label);
            },

            getClientRect: function($label) {
                return $label[0].getBoundingClientRect();
            },

            getLabelElement: function() {
                var label = this.$('.' + this.labelClass);
                if (label.length > 0) {
                    return label;
                }
            },

            wrapLinks: function(field, value) {
                if (!this.model.application) {
                    return;
                }
                var linkFields = this.model.state.get('display.visualizations.singlevalue.linkFields');
                linkFields = linkFields ? $.trim(linkFields).split(/\s*,\s*/) : [];
                var linkView = this.model.state.get('display.visualizations.singlevalue.linkView');
                var linkSearch = this.model.state.get('display.visualizations.singlevalue.linkSearch');
                var drilldown = this.model.state.get('display.visualizations.singlevalue.drilldown') || 'none';
                var app = this.model.application.toJSON();

                var link;
                if ((linkView !== 'search' && linkFields.length) || linkSearch) {
                    var url;
                    if (linkView) {
                        var params = linkSearch ? { q: linkSearch } : undefined;
                        if (linkView.charAt(0) === '/') {
                            url = splunkUtil.make_full_url(linkView, params);
                        } else {
                            url = route.page(app.root, app.locale, app.app, linkView, { data: params });
                        }
                    } else {
                        url = route.search(app.root, app.locale, app.app, { data: { q: linkSearch }});
                    }
                    link = $('<a class="link-drilldown" />').attr('href', url);
                } else if (drilldown !== 'none') {
                    link = $('<a class="single-drilldown" href="#"></a>');
                    if (!_(linkFields).contains('result')) {
                        linkFields.push('result');
                    }
                }

                if (link) {
                    link.data({
                        field: field,
                        value: value
                    });
                    return { linkFields: linkFields, link: link };
                }
            },

            render: function() {
                var labelGroup,
                    labelData = this.constructLabelData(),
                    resultFieldValue = this.model.results.get('resultFieldValue'),
                    linkArray = this.wrapLinks(this.model.results.get('resultField'), resultFieldValue);

                if (linkArray) {
                    _.each(linkArray.linkFields, function(linkField) {
                        if (this.linkField === linkField) {
                            labelData.link = linkArray.link;
                        }
                    }, this);
                }
                labelGroup = this.$el.find('.' + this.labelGroupClass);
                if (labelGroup.length > 0) {
                    labelGroup.remove();
                }
                labelGroup = svgUtil.createElement('g')
                    .attr('class', this.labelGroupClass);
                this.$el.append(labelGroup);
                this.drawLabel(labelGroup, labelData);
                return this;
            }
        });
    }
);

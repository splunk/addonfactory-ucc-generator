define(
    [
        'jquery',
        'underscore',
        'module',
        'views/shared/viz/Base',
        './Sparkline',
        './MainBody',
        './UnderLabel',
        'models/Base',
        'splunk.util',
        'util/svg',
        'uri/route',
        'util/drilldown',
        'util/time',
        'util/color_utils',
        'js_charting/util/parsing_utils',
        'util/general_utils',
        'util/moment/relative',
        'util/numeral'
    ],
    function(
        $,
        _,
        module,
        VisualizationBase,
        Sparkline,
        MainBodyView,
        UnderLabelView,
        BaseModel,
        splunkUtil,
        svgUtil,
        route,
        drilldownUtil,
        timeUtil,
        colorUtil,
        parsingUtils,
        generalUtil,
        relativeMomentUtil,
        numeral
    ) {
        return VisualizationBase.extend({
            moduleId: module.id,
            className: "single-value",
            SEVERITY_COLORS: {
                severe : '#d93f3c', //red
                high : '#f58f39', //orange
                elevated: '#f7bc38', //yellow
                guarded: '#6db7c6', //blue
                low: '#65a637', //green
                none: '#555555'
            },
            SEVERITIES: ['none', 'low', 'guarded', 'elevated', 'high', 'severe'],
            BLOCK_DEFAULT_FONT_COLOR: '#FFFFFF',
            DEFAULT_FONT_COLOR: '#333333',
            UNDERLABEL_COLOR: '#555555',
            NEUTRAL_CHANGE_COLOR: '#555555',
            DELTA_GREEN: '#65a637',
            DELTA_RED: '#d93f3c',
            EDGE_PADDING: 32,
            NEUTRAL_SPARKLINE_COLOR: '#999999',

            MAX_RESULT_COUNT: 1000,

            initialize: function(options) {
                VisualizationBase.prototype.initialize.apply(this, arguments);

                this.$el.width(this.options.width || '100%');
                this.$el.height(this.options.height || '100%');
                this.$el.css('position', 'relative');

                this.model.results = new BaseModel({
                    searchResultsColumn: this.model.searchData,
                    resultField: '',
                    resultFieldValue: ''
                });

                this.model.presentation = new BaseModel();

                this.updateContainerDimensions();

                this.originalHeight = this.$el.height();

                this.model.presentation.set({
                    fontColor: this.getFontColor(),
                    scaleRatio: 1,
                    edgePadding: this.EDGE_PADDING
                });

                
                this.$inlineMessage = $('<div class="inline-message"></div>').css({
                        "text-align":"center",
                        "height":"32px",
                        "width":"100%",
                        "position":"absolute",
                        "bottom":"0"})
                    .addClass(this.options.messageContainerClass || '');

            },

            onConfigChange: function(changedAttributes) {
                var shouldInvalidate = _(changedAttributes).chain().keys()
                    .any(function(key) {
                        return key.indexOf('display.visualizations.singlevalue.') === 0;
                    })
                    .value();

                if (shouldInvalidate) {
                    this.invalidate('formatDataPass');
                }
            },

            updateResultState: function() {
                var resultField = this.determineResultFieldName(this.model.config.get("display.visualizations.singlevalue.field")),
                    resultFieldValue = this.getFieldValue(resultField),
                    fontColor,
                    sparklineData,
                    sparklineColor,
                    deltaIndicatorColor;
                // If the first column is _time, then it is a timechart and contains
                // multiple result rows, and therefore should display a sparkline.
                // Else, it should just display a standard single result value
                this.model.results.set('resultField', resultField);
                this.model.results.set('resultFieldValue', resultFieldValue);

                if (this.isTimeSeries() && !isNaN(resultFieldValue)) {
                    sparklineData = this.getFieldValues(resultField);
                    this.model.results.set('sparkline', sparklineData);
                    this.setDeltaValue(resultFieldValue);
                    // In-mem config attribute - tell Viz Editor that time series viz controls should be displayed
                    this.model.config.set('is_timeseries', true, {'transient': true});
                } else {
                    this.model.results.unset('sparkline');
                    this.model.results.unset('deltaValue');
                    this.model.results.unset('deltaBacktrack');

                    // In-mem config attribute - tell Viz Editor that time series viz controls should be hidden
                    this.model.config.set('is_timeseries', false, {'transient': true});
                }

                this.severityColor = this.getSeverityColor(resultFieldValue);
                this.deltaColor = this.getDeltaColor(resultFieldValue);

                deltaIndicatorColor = this.getDeltaIndicatorColor();
                if ((this.useColors() && this.model.config.get('display.visualizations.singlevalue.colorBy') === 'trend')
                    || this.hasBackground()) {
                    sparklineColor = deltaIndicatorColor;
                } else {
                    sparklineColor = this.NEUTRAL_SPARKLINE_COLOR;
                }
                this.model.presentation.set('deltaColor', deltaIndicatorColor);
                this.model.presentation.set('sparklineColor', sparklineColor);
                this.model.presentation.set('fontColor', this.getFontColor());
                this.model.presentation.set('formatPattern', this.getFormatPattern());
            },

            getDeltaColor: function() {
                var deltaMode = this.model.config.get('display.visualizations.singlevalue.trendColorInterpretation') || 'standard', // defaults to standard
                    deltaValue = this.model.results.get('deltaValue'),
                    deltaIncreased = deltaValue === 'percentageIncrease' || deltaValue > 0;
                if (deltaValue === 0) {
                    return this.NEUTRAL_CHANGE_COLOR;
                }
                if (deltaMode === 'inverse') {
                    if (deltaIncreased) {
                        return this.DELTA_RED;
                    }
                    return this.DELTA_GREEN;
                } else {
                    if (deltaIncreased) {
                        return this.DELTA_GREEN;
                    }
                    return this.DELTA_RED;
                }
            },

            getSeverityColor: function(resultFieldValue) {
                var ranges = this.model.config.get('display.visualizations.singlevalue.rangeValues'),
                    colors = this.model.config.get('display.visualizations.singlevalue.rangeColors'),
                    useColors = splunkUtil.normalizeBoolean(this.model.config.get('display.visualizations.singlevalue.useColors')) || false,
                    rangeMapValue = this.getResultField('range'),
                    parsedRanges,
                    parsedColors,
                    colorsDefined,
                    severities;

                // Legacy single value behavior dictates that if there is a rangemap in the results, that will color the viz.
                // We also check that useColors is false. If it is true, the user is explicitly using the rangeColors
                if (rangeMapValue && !useColors) {
                    // If the classField is used and the range field contains is a valid severity, use this as the severity
                    return this.SEVERITY_COLORS[rangeMapValue] || this.DEFAULT_FONT_COLOR;
                }
                if (ranges) {
                    parsedRanges = parsingUtils.stringToArray(ranges);
                    parsedColors = parsingUtils.stringToArray(colors);
                    colorsDefined = parsedColors.length > 0;
                    if (parsedRanges.length === 0 || isNaN(resultFieldValue)) {
                        return this.DEFAULT_FONT_COLOR;
                    }
                    severities = this.SEVERITIES.slice(1, 6); // discard 'none'
                    for (var i = 0; i < parsedRanges.length; i++) {
                        if(isNaN(parsedRanges[i])){
                            return this.DEFAULT_FONT_COLOR;
                        }
                        if (parseFloat(resultFieldValue) <= parseFloat(parsedRanges[i])) {
                            // As soon as we encounter a range that is greater than or equal to the resultFieldValue,
                            // that is the severity range that the resultFieldValue falls into, so we exit the loop and function.
                            if (colorsDefined) {
                                return colorUtil.replaceSymbols(parsedColors[i], '#') || this.DEFAULT_FONT_COLOR;
                            }
                            return this.SEVERITY_COLORS[severities[i]];
                        }
                    }
                    if (colorsDefined) {
                        // If there are more ranges than colors, assign the default grey color
                        return colorUtil.replaceSymbols(parsedColors[parsedRanges.length], '#') || this.DEFAULT_FONT_COLOR;
                    }
                    return this.SEVERITY_COLORS[severities[severities.length - 1]]; // if no severity has yet been assigned, has fallen through to highest severity
                }

                return this.DEFAULT_FONT_COLOR; // fall through to default
            },

            getDeltaIndicatorColor: function() {
                var colorBy = this.model.config.get('display.visualizations.singlevalue.colorBy');
                if (this.hasBackground()) {
                    return this.BLOCK_DEFAULT_FONT_COLOR;
                }
                if (colorBy === 'value' || !this.useColors()) {
                    return this.DEFAULT_FONT_COLOR;
                }
                return this.deltaColor;
            },

            getFontColor: function() {
                var colorBy = this.model.config.get('display.visualizations.singlevalue.colorBy');
                if (this.hasBackground()) {
                    return this.BLOCK_DEFAULT_FONT_COLOR;
                }
                if ((colorBy === 'trend' && this.isTimeSeries()) || !this.useColors()) {
                    return this.DEFAULT_FONT_COLOR;
                }
                return this.severityColor;
            },

            useColors: function() {
                var useColors = splunkUtil.normalizeBoolean(this.model.config.get('display.visualizations.singlevalue.useColors')) || false, // default to false
                    rangeMapValue = this.getFieldValues('range');
                // Default to use old Rangemap command result if useColors is not set.
                if (rangeMapValue && !useColors) {
                    return true;
                }
                return useColors;
            },

            hasBackground: function() {
                var backgroundMode = this.model.config.get('display.visualizations.singlevalue.colorMode');
                return (backgroundMode === 'block' && this.useColors() && this.getBackgroundColor());
            },

            getBackgroundColor: function() {
                var colorBy = this.model.config.get('display.visualizations.singlevalue.colorBy');
                if (this.useColors()) {
                    if (colorBy === 'trend') {
                        return this.deltaColor;
                    }
                    return this.severityColor;
                }
                return this.DEFAULT_FONT_COLOR;
            },

            getFormatPattern: function() {
                var formatPattern = '0',
                    matchedPrecision,
                    decimalPlaces,
                    numberPrecision = this.model.config.get('display.visualizations.singlevalue.numberPrecision'),
                    useThousandSeparators = splunkUtil.normalizeBoolean(this.model.config.get('display.visualizations.singlevalue.useThousandSeparators'));
                if (useThousandSeparators !== false) {
                    formatPattern += ',0';
                }
                if (numberPrecision) {
                    matchedPrecision = numberPrecision.match(/^0\.?(0*)$/);
                    if (matchedPrecision && matchedPrecision.length === 2) {
                        decimalPlaces = matchedPrecision[1];
                        if (decimalPlaces.length > 4) {
                            // User wants a large d.p. value, so revert them to the allowed max
                            decimalPlaces = '0000';
                        }
                        if (decimalPlaces.length > 0) {
                            formatPattern = formatPattern +  '.' + decimalPlaces;
                        }
                    }
                }
                return formatPattern;
            },

            setDeltaValue: function(currentValue) {
                var deltaTimeRange = this.model.config.get('display.visualizations.singlevalue.trendInterval'),
                    deltaFormat = this.model.config.get('display.visualizations.singlevalue.trendDisplayMode'),
                    times = this.getFieldValues('_time'),
                    parsedTimeArr,
                    parsedTime,
                    deltaValue,
                    deltaBacktrack,
                    formattedDeltaValue,
                    resultField = this.model.results.get('resultField'),
                    timeToBacktrackInSeconds,
                    dataPointsToBacktrack,
                    mostRecentDate,
                    secondMostRecentDate,
                    deltaDate,
                    timeGranularityInSeconds,
                    timeAmount,
                    timeUnit,
                    formatPattern = this.getFormatPattern(),
                    createRecentDateObject = function(offset) {
                        return timeUtil.bdTimeToDateObject(timeUtil.extractBdTime(times[times.length - offset]));
                    };
                if (deltaTimeRange && deltaTimeRange !== 'auto') {
                    // Calculate diff between values at most recent _time (minus) deltaTimeRange
                    try {
                        parsedTimeArr = relativeMomentUtil.parseRelativeTimeExpression(deltaTimeRange);
                    } catch(err) {
                        return;
                    }
                    if (parsedTimeArr && parsedTimeArr[0]) {
                        parsedTime = parsedTimeArr[0];
                    }
                    if (times.length >= 2 && parsedTime && parsedTime.unit && !isNaN(parsedTime.amount)) {
                        timeUnit = timeUtil.normalizeUnit(parsedTime.unit);
                        timeAmount = Math.abs(parsedTime.amount);
                        // Create 2 copies of the most recent Date object - only deltaDate will be mutated
                        mostRecentDate = createRecentDateObject(1);
                        deltaDate = createRecentDateObject(1);
                        //Compare both granularity of elements in the _time array and
                        //deltaTimeRange by converting them both to the same units - seconds
                        secondMostRecentDate = createRecentDateObject(2);
                        // Compare both granularity of elements in the _time array and
                        // deltaTimeRange by converting them both to the same units - seconds
                        timeGranularityInSeconds = (mostRecentDate.getTime() - secondMostRecentDate.getTime()) / 1000; // Convert from milliseconds to seconds by dividing by 1000
                        if (_.indexOf(['s', 'm', 'h'], timeUnit) !== -1) {
                            // Seconds, minutes, and hours are affected by Daylight Savings Time, so should NOT use the JS Date() object.
                            // Instead, they should use BDTime.
                            timeToBacktrackInSeconds = timeUtil.convertAmountAndUnitToSeconds(timeAmount, timeUnit);
                        } else {
                            // Can use the JS Date() object's setter and getter methods as months have irregular numbers of days
                            // and the Date() object internally handles these inconsistencies when calculating time deltas.
                            switch (timeUnit) {
                                case 'y':
                                    deltaDate.setFullYear(deltaDate.getFullYear() - timeAmount);
                                    break;
                                case 'q':
                                    deltaDate.setMonth(deltaDate.getMonth() - (timeAmount * 3));
                                    break;
                                case 'mon':
                                    deltaDate.setMonth(deltaDate.getMonth() - timeAmount);
                                    break;
                                case 'w':
                                    deltaDate.setDate(deltaDate.getDate() - (timeAmount * 7));
                                    break;
                                case 'd':
                                    deltaDate.setDate(deltaDate.getDate() - timeAmount);
                                    break;
                                default:
                                    deltaDate = undefined;
                                    return deltaDate;
                            }
                            if (deltaDate) {
                                timeToBacktrackInSeconds = (mostRecentDate.getTime() - deltaDate) / 1000; // Convert form milliseconds to seconds by dividing by 1000
                            }
                        }

                        if (timeToBacktrackInSeconds) {
                            // How many elements back in the _time array we should compare the currentValue to
                            dataPointsToBacktrack = Math.round(timeToBacktrackInSeconds / timeGranularityInSeconds);
                            if (dataPointsToBacktrack < times.length) {
                                deltaValue = this.calculateDeltaValue(resultField, dataPointsToBacktrack, deltaFormat, currentValue);
                                deltaBacktrack = dataPointsToBacktrack;
                            }
                        }
                    }
                }

                // Default: if deltaTimeRange is not specified or invalid, delta spans range between most recent and 2nd-most-recent data points
                if ((!deltaValue && deltaValue !== 0)) {
                    // If the field is a '_time' field, take the most recent 'count' data point as the field value,
                    // which is the last element in the 'count' array.
                    deltaValue = this.calculateDeltaValue(resultField, 1, deltaFormat, currentValue);
                    deltaBacktrack = 1;
                }

                if (formatPattern && !isNaN(deltaValue)) {
                    formattedDeltaValue = numeral(deltaValue).format(formatPattern);
                    this.model.results.set('formattedDeltaValue', formattedDeltaValue);
                }

                this.model.results.set('deltaValue', deltaValue);
                this.model.results.set('deltaBacktrack', deltaBacktrack);
            },

            calculateDeltaValue: function(resultField, dataPointsToBacktrack, deltaFormat, currentValue) {
                var previousValue = this.getFieldValue(resultField, dataPointsToBacktrack);
                if (deltaFormat && deltaFormat.toLowerCase() === 'percent') {
                    if (previousValue === "0") {
                        if (currentValue === "0") {
                            return 0;
                        }
                        // Would return a percentage change value of Infinity, which we must display as 'N/A'
                        return (currentValue > previousValue) ? 'percentageIncrease' : 'percentageDecrease';
                    }
                    return (currentValue - previousValue) / previousValue * 100;
                }
                return currentValue - previousValue;
            },

            onAddedToDocument: function() {
                VisualizationBase.prototype.onAddedToDocument.apply(this, arguments);
                this.validateReflow(true);
            },

            reflow: function() {
                this.updateContainerDimensions();
                this.updateBackgroundDimensions();
                this.invokeOnChildren('validateReflow', true);
            },

            updateContainerDimensions: function() {
                var $svgContainer = this.getSvgContainer(),
                    scaleRatio;

                // For PDF: $el has undefined height and width so set manually to passed in height and width options
                if (this.model.config.get('exportMode')) {
                    this.svgWidth = this.options.width;
                    this.svgHeight = this.options.height;
                } else {
                    this.svgHeight = this.$el.height();
                    this.svgWidth = this.$el.width();
                }

                if(this.$el.find(this.$inlineMessage).length == 1) {
                    this.svgHeight = this.svgHeight - this.$inlineMessage.height();
                }                

                if (generalUtil.valuesAreNumericAndFinite([this.svgHeight, this.svgWidth])) {
                    $svgContainer
                        .height(this.svgHeight)
                        .width(this.svgWidth);

                    scaleRatio = this.svgHeight / this.originalHeight;
                    if (!generalUtil.valuesAreNumericAndFinite([scaleRatio]) || scaleRatio === 0) {
                        scaleRatio = 1;
                    }

                    this.model.presentation.set({
                        svgWidth: this.svgWidth,
                        svgHeight: this.svgHeight,
                        scaleRatio: scaleRatio
                    });
                }
            },

            getResultField: function(field) {
                var resultFieldValue = this.getFieldValue(this.determineResultFieldName(field));
                if (!resultFieldValue) {
                    return _('N/A').t();
                }
                return resultFieldValue;
            },

            // Fields can either be a list of strings or a list of dictionaries each with a 'name' entry
            // depending on whether 'show_metadata' is enabled
            getFieldNames: function() {
                var fields = this.model.searchData.get('fields');

                if (!fields || fields.length === 0) {
                    return [];
                }
                if (_.isObject(fields[0])) {
                    return _(fields).pluck('name');
                }
                return $.extend([], fields);
            },

            getFieldValue: function(field, idx) {
                var column = this.getFieldValues(field);
                if (!idx) {
                    // idx should be 0 unless calculating backtracked delta value
                    idx = 0;
                }
                if (!(column && column.length)) {
                    return '';
                }
                // If data is time series, then result value should be the most recent, which is at the end
                if (this.isTimeSeries()) {
                    return column[(column.length - idx - 1)];
                }
                // If data is not time series, then result value should be the first in the list
                return column[idx];
            },

            getFieldValues: function(fieldName) {
                var fields = this.getFieldNames(),
                    columns = this.model.searchData.get('columns') || [],
                    countIdx = _(fields).indexOf(fieldName);
                return columns[countIdx];
            },

            determineResultFieldName: function(configuredField) {
                var fields = this.getFieldNames();
                if (configuredField && _(fields).contains(configuredField)) {
                    return configuredField;
                }
                return _(fields).find(function(f) {
                    return f === '_raw' || f[0] !== '_'; // Does not allow '_time' either
                });
            },

            // Is using Timechart command
            isTimeSeries: function() {
                var fields = this.getFieldNames();
                return _(fields).some(function(f) {
                    return f === '_time';
                });
            },

            getSvgContainer: function() {
                return this.$('.svg-container');
            },

            getBackgroundMode: function() {
                return this.model.config.get('display.visualizations.singlevalue.colorMode') || 'none';
            },

            updateBackgroundDimensions: function() {
                var background;
                if (this.hasBackground()) {
                    background = this.getSvgContainer().find('.block-background');
                    if (background.length > 0) {
                        background.attr('width', this.svgWidth);
                        background.attr('height', this.svgHeight);
                    }
                }
            },

            drawSeverityBackground: function($svgContainer) {
                if (this.hasBackground()) {
                    $svgContainer.append(
                        svgUtil.createElement('rect')
                            .attr({
                                x: 0,
                                y: 0,
                                width: this.svgWidth,
                                height: this.svgHeight,
                                'class': 'block-background',
                                fill: this.getBackgroundColor()
                            })
                    );
                }
            },

            drawSvgContainer: function() {
                var $svgContainer = this.getSvgContainer();
                if ($svgContainer.length > 0) {
                    $svgContainer.remove();
                }

                $svgContainer = svgUtil.createElement('svg')
                    .width(this.svgWidth)
                    .height(this.svgHeight)
                    .attr('class', 'svg-container')
                    .css('position', 'absolute')
                    .css('top', '0')
                    .css('left', '0');
                $svgContainer.appendTo(this.el);
                return $svgContainer;
            },

            drawSparkline: function($svgContainer) {
                if (this.children.sparkline) {
                    this.children.sparkline.detach();
                    this.children.sparkline.remove();
                }
                if (this.hasSparkline) {
                    this.model.results.set({
                        sparklineData: this.model.results.get('sparkline').slice(0)
                    });

                    this.model.presentation.set({
                       sparklineOpacity: 1
                    });

                    this.children.sparkline = new Sparkline({
                        model: {
                            presentation: this.model.presentation,
                            results: this.model.results,
                            state: this.model.config
                        }
                    });
                    this.children.sparkline.render().appendTo($svgContainer);
                } else {
                    this.model.results.unset('sparklineData');
                }
            },

            drawMainBody: function($svgContainer) {
                var mainBodyPadding,
                    deltaFontSize,
                    deltaScale,
                    singleValueFont,
                    sideLabelFont,
                    hasUnderLabel = this.model.config.get('display.visualizations.singlevalue.underLabel');
                if (this.children.mainBody) {
                    this.children.mainBody.detach();
                    this.children.mainBody.remove();
                }
                if (this.hasSparkline && hasUnderLabel) {
                    singleValueFont = 50;
                    sideLabelFont = 28;
                    mainBodyPadding = 50;
                    deltaFontSize = 20;
                    deltaScale = 0.85;
                } else {
                    singleValueFont = 66;
                    sideLabelFont = 37;
                    deltaFontSize = 26;
                    deltaScale = 1.1;
                    if (!this.hasSparkline && !hasUnderLabel) {
                        mainBodyPadding = 70;
                    } else {
                        mainBodyPadding = 60;
                    }
                }
                this.model.presentation.set({
                    singleValueFontSize: singleValueFont,
                    sideLabelFontSize: sideLabelFont,
                    mainBodyPadding: mainBodyPadding,
                    deltaFontSize: deltaFontSize,
                    deltaScale: deltaScale
                });
                this.children.mainBody = new MainBodyView({
                    model: {
                        application: this.model.application,
                        state: this.model.config,
                        results: this.model.results,
                        presentation: this.model.presentation
                    }
                });

                this.listenTo(this.children.mainBody, 'singleDrilldownClicked', function(params) {
                    this.handleSingleDrilldownClicked(params);
                });
                this.listenTo(this.children.mainBody, 'anchorTagClicked', function(e) {
                    this.handleAnchorTagClicked(e);
                });

                this.children.mainBody.render().appendTo($svgContainer);
            },

            handleSingleDrilldownClicked: function(params) {
                this.trigger(params.specificEventNames, params.drilldownInfo);
            },

            handleAnchorTagClicked: function(e) {
                // xlink:href does not work for SVG anchors in our case, so we must handle redirect manually
                var href = $(e.currentTarget).attr('href');
                if (href) {
                    route.redirectTo(href, drilldownUtil.shouldDrilldownInNewTab(e));
                }
            },

            drawUnderLabel: function($svgContainer) {
                var underLabelColor = this.hasBackground() ? this.BLOCK_DEFAULT_FONT_COLOR : this.UNDERLABEL_COLOR,
                    underLabelOpacity = this.hasBackground() ? 0.8 : 1,
                    underLabelY;

                if (this.hasSparkline) {
                    underLabelY = 72;
                } else {
                    underLabelY = 85;
                }

                if (this.children.underLabel) {
                    this.children.underLabel.detach();
                    this.children.underLabel.remove();
                }
                this.model.presentation.set({
                    underLabelY: underLabelY,
                    underLabelColor: underLabelColor,
                    underLabelOpacity: underLabelOpacity
                });
                    this.children.underLabel = new UnderLabelView({
                    model: {
                        state: this.model.config,
                        results: this.model.results,
                        presentation: this.model.presentation,
                        application: this.model.application
                    }
                });

                this.listenTo(this.children.underLabel, 'singleDrilldownClicked', function(params) {
                    this.handleSingleDrilldownClicked(params);
                });
                this.listenTo(this.children.underLabel, 'anchorTagClicked', function(e) {
                    this.handleAnchorTagClicked(e);
                });

                this.children.underLabel.render().appendTo($svgContainer);
            },

            drawComponents: function() {
                var $svgContainer = this.drawSvgContainer();

                this.hasSparkline = this.model.results.get('sparkline') && splunkUtil.normalizeBoolean(this.model.config.get('display.visualizations.singlevalue.showSparkline')) !== false;
                this.model.presentation.set('hasSparkline', this.hasSparkline);

                this.drawSeverityBackground($svgContainer);

                this.drawMainBody($svgContainer);

                if (this.model.config.get("display.visualizations.singlevalue.underLabel")) {
                    this.drawUnderLabel($svgContainer);
                }

                this.drawSparkline($svgContainer);
            },

            renderMaxResultCountMessage: function(resultCount) {
                var message = splunkUtil.sprintf(
                    _('These results may be truncated. This visualization is configured to display a maximum of %s results per series, and that limit has been reached.').t(),
                    resultCount
                );
                this.$inlineMessage.html(_(this.inlineMessageTemplate).template({ message: message, level: 'warning' }));
            },
            inlineMessageTemplate: '\
                <div class="alert alert-inline alert-<%= level %> alert-inline"> \
                    <i class="icon-alert"></i> \
                    <%- message %> \
                </div> \
            ',

            updateView: function() {
                this.updateResultState();

                this.$el.removeClass(this._dynamicClasses || '');
                this._dynamicClasses = [
                    this.model.config.get('display.visualizations.singlevalue.additionalClass'),
                    this.getFieldValue(this.model.config.get('display.visualizations.singlevalue.classField'))
                ].join(' ');
                this.$el.addClass(this._dynamicClasses);

                this.drawComponents();
                
                this.$inlineMessage.remove();
                if(this.model.searchDataParams) {
                    this.MAX_RESULT_COUNT = this.model.searchDataParams.get('count');
                }

                if(this.model.results.get('sparkline') && this.model.results.get('sparkline').length >= this.MAX_RESULT_COUNT) {
                    this.renderMaxResultCountMessage(this.MAX_RESULT_COUNT);
                    this.$inlineMessage.insertAfter(this.$('.svg-container'));
                }

                if (this.isAddedToDocument()) {
                    this.reflow();
                }
            }
        });
    }
);

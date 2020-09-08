define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        './Label',
        'models/Base',
        'splunk.util',
        'util/svg',
        'util/math_utils'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        LabelView,
        BaseModel,
        splunkUtil,
        svgUtil,
        mathUtil
        ) {

        return BaseView.extend({
            moduleId: module.id,
            className: "single-value-labels",
            el: function() {
                return svgUtil.createElement('g').attr('class', 'single-value-labels');
            },
            LABEL_SIDE_PADDING: 5,

            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.activate();
                this.unit = options.unit;
                this.unitPosition = options.unitPosition;
                this.hasUnit = options.hasUnit;
                this.hasAfterLabel = options.hasAfterLabel;
                this.hasBeforeLabel = options.hasBeforeLabel;
                this.originalSingleValueFontSize = this.model.presentation.get('singleValueFontSize');
                this.originalSideLabelFontSize = this.model.presentation.get('sideLabelFontSize');
                this.updateContainerDimensions();
            },

            reflow: function() {
                this.updateContainerDimensions();
                this.scaleLabels();
                // Do not call this.positionLabels() in reflow because positionLabels is called manually by the parent view (MainBody.js) later,
                // after the delta value scaling and measuring routines have run, in order to use the latest deltaWidth dimension.
            },

            updateContainerDimensions: function() {
                // Scale font size to fill new available SVG height
                this.scaleRatio = this.model.presentation.get('scaleRatio');
                this.singleValueFontSize = this.originalSingleValueFontSize * this.scaleRatio;
                this.labelFontSize = this.originalSideLabelFontSize * this.scaleRatio;
            },

            constructMainLabelData: function() {
                var labelData,
                    fontColor = this.model.presentation.get('fontColor'),
                    beforeLabelConfigName = "display.visualizations.singlevalue.beforeLabel",
                    afterLabelConfigName = "display.visualizations.singlevalue.afterLabel";

                labelData = {
                    singleResultData: {
                        labelFontSize: this.originalSingleValueFontSize,
                        labelFontColor: fontColor,
                        labelGroupClass: 'single-result-group',
                        labelClass: 'single-result',
                        linkField: 'result',
                        configName: 'display.visualizations.singlevalue.singleResult',
                        useResultField: true,
                        fontWeight: 'bold',
                        unit: this.unit,
                        unitPosition: this.unitPosition,
                        hasUnit: this.hasUnit,
                        exportMode: !!this.model.state.get('exportMode')
                    }
                };

                if (this.hasBeforeLabel) {
                    labelData.beforeLabelData = {
                        labelFontSize: this.originalSideLabelFontSize,
                        labelFontColor: fontColor,
                        labelGroupClass: 'before-label-group',
                        labelClass: 'before-label',
                        linkField: 'beforelabel',
                        configName: beforeLabelConfigName,
                        useResultField: false,
                        fontWeight: 'normal'
                    };
                }

                if (this.hasAfterLabel) {
                    labelData.afterLabelData = {
                        labelFontSize: this.originalSideLabelFontSize,
                        labelFontColor: fontColor,
                        labelGroupClass: 'after-label-group',
                        labelClass: 'after-label',
                        linkField: 'afterlabel',
                        configName: afterLabelConfigName,
                        useResultField: false,
                        fontWeight: 'normal'
                    };
                }

                return labelData;
            },

            getMainLabelsWidth: function() {
                var mainLabelsWidth = 0;
                if (this.hasBeforeLabel) {
                    mainLabelsWidth += this.children.beforeLabelView.getWidth();
                    mainLabelsWidth += this.LABEL_SIDE_PADDING;
                }
                if (this.hasAfterLabel) {
                    mainLabelsWidth += this.children.afterLabelView.getWidth();
                    mainLabelsWidth += this.LABEL_SIDE_PADDING;
                }
                mainLabelsWidth += this.children.singleResultView.getWidth();

                return mainLabelsWidth;
            },

            positionLabels: function() {
                var shiftWidth = 0,
                    beforeLabel,
                    afterLabel,
                    singleValue = this.children.singleResultView.getLabelElement(),
                    beforeLabelX = shiftWidth,
                    singleValueX = shiftWidth,
                    afterLabelX = 0,
                    beforeLabelWidth,
                    singleValueWidth = this.children.singleResultView.getWidth(),
                    mainLabelsWidth = this.getMainLabelsWidth(),
                    deltaWidth = this.model.presentation.get('deltaWidth') || 0,
                    svgWidth = this.model.presentation.get('svgWidth');

                if (deltaWidth > 0) {
                    deltaWidth += this.model.presentation.get('deltaPadding');
                }
                // Center labels within SVG container
                shiftWidth = mathUtil.roundToDecimal((svgWidth / 2) - ((mainLabelsWidth + deltaWidth) / 2), -2); // round to 2 d.p.

                // Now, actually reposition the labels
                if (this.hasBeforeLabel) {
                    beforeLabelWidth = this.children.beforeLabelView.getWidth();
                    beforeLabel = this.children.beforeLabelView.getLabelElement();
                    beforeLabelX = shiftWidth;
                    singleValueX = beforeLabelWidth + beforeLabelX + this.LABEL_SIDE_PADDING;
                    beforeLabel.attr('x', beforeLabelX);
                } else {
                    singleValueX = shiftWidth;
                }
                singleValue.attr('x', singleValueX);

                if (this.hasAfterLabel) {
                    afterLabel = this.children.afterLabelView.getLabelElement();
                    afterLabelX = singleValueX + singleValueWidth + this.LABEL_SIDE_PADDING;
                    afterLabel.attr('x', afterLabelX);
                }
            },

            scaleLabels: function() {
                var beforeLabel,
                    singleValue = this.children.singleResultView.getLabelElement(),
                    afterLabel,
                    mainLabelsWidth,
                    maxLabelWidth = this.model.presentation.get('maxLabelsWidth'),
                    maxLabelRatio;

                if (!this.defaultMainLabelsWidth) {
                    this.defaultMainLabelsWidth = this.getMainLabelsWidth();
                }

                // Reset all adjusted attributes to position and scale from the same place every time
                singleValue.css('font-size', this.singleValueFontSize);

                // Width will always be 0 in PDF so skip this step
                if (!this.model.state.get('exportMode')) {
                    if (this.children.singleResultView.getWidth() === 0) {
                        // The labels are not yet in the DOM - not point of adjusting positions/scales
                        // Bail and wait until next pass through when labels are in DOM
                        return;
                    }
                }

                if (this.hasBeforeLabel) {
                    beforeLabel = this.children.beforeLabelView.getLabelElement();
                    beforeLabel.css('font-size', this.labelFontSize);
                }

                if (this.hasAfterLabel) {
                    afterLabel = this.children.afterLabelView.getLabelElement();
                    afterLabel.css('font-size', this.labelFontSize);
                }

                mainLabelsWidth = this.getMainLabelsWidth();

                // Newly scaled labels would overflow - revert to max allowable size
                if (mainLabelsWidth > maxLabelWidth) {
                    maxLabelRatio = mathUtil.roundToDecimal(maxLabelWidth / this.defaultMainLabelsWidth, -4);
                    this.singleValueFontSize = mathUtil.roundToDecimal(this.originalSingleValueFontSize * maxLabelRatio, -4);
                    this.labelFontSize = mathUtil.roundToDecimal(this.originalSideLabelFontSize * maxLabelRatio, -4);

                    singleValue.css('font-size', this.singleValueFontSize);
                    if (this.hasBeforeLabel) {
                        beforeLabel = this.children.beforeLabelView.getLabelElement();
                        beforeLabel.css('font-size', this.labelFontSize);
                    }

                    if (this.hasAfterLabel) {
                        afterLabel = this.children.afterLabelView.getLabelElement();
                        afterLabel.css('font-size', this.labelFontSize);
                    }
                }
            },

            createLabel: function(mainGroup, mainLabelData, modelOptions, viewName, dataName) {
                if (this.children[viewName]) {
                    this.children[viewName].detach();
                    this.children[viewName].remove();
                }
                this.children[viewName] = new LabelView(_.extend(modelOptions, mainLabelData[dataName]));
                this.children[viewName].render().appendTo(mainGroup);

                this.listenTo(this.children[viewName], 'singleDrilldownClicked', function(params) {
                    this.trigger('singleDrilldownClicked', params);
                });
                this.listenTo(this.children[viewName], 'anchorTagClicked', function(e) {
                    this.trigger('anchorTagClicked', e);
                });
            },

            render: function() {
                var mainGroup = this.$el.find('.main-label-group'),
                    mainLabelData = this.constructMainLabelData(),
                    modelOptions = {
                        model: {
                            state: this.model.state,
                            results: this.model.results,
                            presentation: this.model.presentation,
                            application: this.model.application
                        }
                    };
                if (mainGroup.length > 0) {
                    mainGroup.remove();
                }
                // Create group to contain BeforeLabel, SingleValue, and AfterLabel
                mainGroup = svgUtil.createElement('g')
                    .attr('class', 'main-label-group');
                this.$el.append(mainGroup);

                if (this.hasBeforeLabel) {
                    this.createLabel(mainGroup, mainLabelData, modelOptions, 'beforeLabelView', 'beforeLabelData');
                }

                this.createLabel(mainGroup, mainLabelData, modelOptions, 'singleResultView', 'singleResultData');

                if (this.hasAfterLabel) {
                    this.createLabel(mainGroup, mainLabelData, modelOptions, 'afterLabelView', 'afterLabelData');
                }
                return this;
            }
        });
    }
);

define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        './Labels',
        './Delta',
        'models/Base',
        'splunk.util',
        'util/svg',
        'util/general_utils',
        'util/math_utils'

    ],
    function(
        $,
        _,
        module,
        BaseView,
        LabelsView,
        DeltaView,
        BaseModel,
        splunkUtil,
        svgUtil,
        generalUtil,
        mathUtil
        ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'single-value-main-body',
            el: function() {
                return svgUtil.createElement('g').attr('class', 'single-value-main-body');
            },
            DELTA_PADDING: 10,
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.model.presentation.set('deltaPadding', this.DELTA_PADDING);
            },

            reflow: function() {
                var mainLabelsRightX,
                    deltaWidth,
                    labelWidth,
                    maxDeltaWidth,
                    maxLabelsWidth,
                    $rightmostLabel,
                    rightLabelWidth,
                    rightLabelLeftX,
                    edgePadding = this.model.presentation.get('edgePadding'),
                    svgWidth = this.model.presentation.get('svgWidth') - edgePadding * 2,
                    scaleRatio = this.model.presentation.get('scaleRatio'),
                    mainBodyPadding = this.model.presentation.get('mainBodyPadding'),
                    scaledMainBodyPadding = mainBodyPadding * scaleRatio;


                if (generalUtil.valuesAreNumericAndFinite([scaledMainBodyPadding])) {
                    this.$el.attr('transform', 'translate(0,' + scaledMainBodyPadding + ')');
                }
                // Keep track of ratio between Labels and Delta Value
                if (this.displayDelta()) {
                    svgWidth -= this.DELTA_PADDING;
                    if (!this.maxLabelProportion) {
                        labelWidth = this.children.labels.getMainLabelsWidth();
                        deltaWidth = this.children.delta.el.getBBox().width;
                        this.maxLabelProportion = mathUtil.roundToDecimal(labelWidth / (labelWidth + deltaWidth), -2);
                    }
                    maxLabelsWidth = mathUtil.roundToDecimal(svgWidth * this.maxLabelProportion, -2);
                    maxDeltaWidth = svgWidth - maxLabelsWidth;

                    // Subtract width of delta view from the width available for the main labels
                    this.model.presentation.set('maxLabelsWidth', maxLabelsWidth);
                    this.model.presentation.set('maxDeltaWidth', maxDeltaWidth);
                } else {
                    this.model.presentation.set('maxLabelsWidth', svgWidth);
                    this.model.presentation.set('maxDeltaWidth', 0);
                }

                // Have main labels scale to fill in the new width
                this.children.labels.validateReflow(true);

                if (this.displayDelta()) {
                    // Have delta scale to fill in the new width
                    // ( Note: because delta scaling and positioning happen in the same SVG transform action, the delta
                    //   will also be positioned here, but we will reposition the delta properly later in this method. )
                    this.children.delta.validateReflow(true);

                    deltaWidth = this.children.delta.el.getBoundingClientRect().width;

                    this.model.presentation.set('deltaWidth', deltaWidth);
                } else {
                    this.model.presentation.set('deltaWidth', 0);
                }

                this.children.labels.positionLabels();

                // Now, we reposition the delta value to its final position using the new scaled label's coordinates
                if (this.displayDelta()) {
                    if (this.hasAfterLabel) {
                        $rightmostLabel = this.children.labels.children.afterLabelView;
                    } else {
                        $rightmostLabel = this.children.labels.children.singleResultView;
                    }
                    // PDF requires that we read the text element's 'x' attribute to measure its position
                    rightLabelLeftX = parseFloat($rightmostLabel.$('text').attr('x'));
                    rightLabelWidth = $rightmostLabel.getWidth();
                    mainLabelsRightX = rightLabelLeftX + rightLabelWidth;

                    this.model.presentation.set('deltaLeft', mainLabelsRightX);
                    this.children.delta.positionAndScaleElements();
                }
            },

            drawLabels: function() {
                if (this.children.labels) {
                    this.children.labels.remove();
                }

                var unit = this.model.state.get("display.visualizations.singlevalue.unit");
                if (typeof unit === "undefined" || unit === "") {
                    this.hasUnit = false;
                    this.hasAfterLabel = !!this.model.state.get("display.visualizations.singlevalue.afterLabel");
                    this.hasBeforeLabel = !!this.model.state.get("display.visualizations.singlevalue.beforeLabel");
                } else {
                    this.hasUnit = true;
                    var unitPosition = this.model.state.get("display.visualizations.singlevalue.unitPosition");
                    if (unitPosition === "before") {
                        this.unitPosition = "before";
                        this.hasBeforeLabel = false;
                        this.hasAfterLabel = false;
                    } else {
                        this.unitPosition = "after";
                        this.hasBeforeLabel = false;
                        this.hasAfterLabel = false;
                    }
                }
                this.children.labels = new LabelsView({
                    model: {
                        application: this.model.application,
                        state: this.model.state,
                        results: this.model.results,
                        presentation: this.model.presentation
                    },
                    unit: unit,
                    unitPosition: this.unitPosition,
                    hasUnit: this.hasUnit,
                    hasBeforeLabel: this.hasBeforeLabel,
                    hasAfterLabel: this.hasAfterLabel
                });
                this.listenTo(this.children.labels, 'singleDrilldownClicked', function(params) {
                    this.trigger('singleDrilldownClicked', params);
                });
                this.listenTo(this.children.labels, 'anchorTagClicked', function(e) {
                    this.trigger('anchorTagClicked', e);
                });
                this.children.labels.render().appendTo(this.$el);
            },

            drawDelta: function() {
                if (this.children.delta) {
                    this.children.delta.detach();
                    this.children.delta.remove();
                }

                if (this.displayDelta()) {
                    this.children.delta = new DeltaView({
                        model: {
                            state: this.model.state,
                            presentation: this.model.presentation,
                            results: this.model.results
                        }
                    });
                    this.children.delta.render().appendTo(this.$el);
                }

            },

            displayDelta: function() {
                var showDeltaValue = splunkUtil.normalizeBoolean(this.model.state.get('display.visualizations.singlevalue.showTrendIndicator')),
                deltaValue = this.model.results.get('deltaValue');
                return showDeltaValue !== false && (deltaValue  || deltaValue === 0);
            },

            drawComponents: function() {
                this.drawLabels();
                this.drawDelta();
            },

            render: function() {
                this.drawComponents();
                return this;
            }
        });
    }
);

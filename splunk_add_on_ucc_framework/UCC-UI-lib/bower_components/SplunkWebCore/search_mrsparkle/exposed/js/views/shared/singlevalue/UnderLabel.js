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
        'util/general_utils',
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
        generalUtil,
        mathUtil
        ) {

        return BaseView.extend({
            moduleId: module.id,
            className: 'single-value-under-label',
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            el: function() {
                return svgUtil.createElement('g').attr('class', 'single-value-under-label');
            },
            LABEL_FONT_SIZE: 12,

            createUnderLabel: function() {
                if (this.children.underLabel) {
                    this.children.underLabel.detach();
                    this.children.underLabel.remove();
                }
                this.children.underLabel = new LabelView({
                    model: {
                        state: this.model.state,
                        results: this.model.results,
                        presentation: this.model.presentation,
                        application: this.model.application
                    },
                    labelFontSize: this.LABEL_FONT_SIZE,
                    labelFontColor: this.model.presentation.get('underLabelColor'),
                    labelGroupClass: 'under-label-group',
                    labelClass: 'under-label',
                    linkField: 'underlabel',
                    configName: 'display.visualizations.singlevalue.underLabel',
                    useResultField: false,
                    labelOpacity: this.model.presentation.get('underLabelOpacity'),
                    fontWeight: 'normal'
                });

                this.listenTo(this.children.underLabel, 'singleDrilldownClicked', function(params) {
                    this.trigger('singleDrilldownClicked', params);
                });
                this.listenTo(this.children.underLabel, 'anchorTagClicked', function(e) {
                    this.trigger('anchorTagClicked', e);
                });
            },

            reflow: function() {
                this.updateContainerDimensions();
                this.positionAndScaleUnderLabel();
            },

            updateContainerDimensions: function() {
                this.svgWidth = this.model.presentation.get('svgWidth');
                this.svgHeight = this.model.presentation.get('svgHeight');
                // Scale up the font size at a decreasing rate to keep the label relatively small
                this.scaleRatio = this.model.presentation.get('scaleRatio');
                this.UNDER_LABEL_WIDTH = this.children.underLabel.getWidth();
            },

            positionAndScaleUnderLabel: function() {
                // Under label does not scale - it always stays the same size. It is just scaled vertically.
                if (this.UNDER_LABEL_WIDTH) {
                    // Position underlabel in correct location to bottom center of container
                    var shiftWidth = mathUtil.roundToDecimal((this.svgWidth / 2 - this.UNDER_LABEL_WIDTH / 2), -2),
                        shiftHeight = this.model.presentation.get('underLabelY') * this.scaleRatio;
                    if (generalUtil.valuesAreNumericAndFinite([shiftWidth, shiftHeight])) {
                        this.$el.attr({
                            transform: "translate(" + shiftWidth + "," + shiftHeight + ")"
                        });
                    }
                }
            },

            render: function() {
                this.createUnderLabel();
                this.children.underLabel.render().appendTo(this.$el);
                return this;
            }
        });
    }
);

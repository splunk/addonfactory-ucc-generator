define([
            'jquery',
            'underscore',
            'mocks/models/MockModel',
            'views/shared/map/Master',
            'mocks/data/mapping',
            'jg/async/Pass',
            'util/color_utils',
            'util/qunit_utils'
        ],
        function(
            $,
            _,
            MockModel,
            Map,
            mappingData,
            Pass,
            colorUtils,
            qunitUtils
        ) {

    var WHITE = 0xffffff,
        RED = 0xff0000,
        BLUE = 0x0000ff;

    var COLORS = {
        RED: RED,
        WHITE: WHITE,
        BLUE: BLUE,
        FOUR_COLORS_WHITE_TO_RED: [
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 1/3)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 2/3)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 1))
        ],
        FIVE_COLORS_WHITE_TO_RED: [
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0.25)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0.5)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0.75)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 1))
        ],
        SIX_COLORS_WHITE_TO_RED: [
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0.2)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0.4)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0.6)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 0.8)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 1))
        ],
        FOUR_COLORS_BLUE_TO_WHITE: [
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 0)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 1/3)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 2/3)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 1))
        ],
        FIVE_COLORS_BLUE_TO_WHITE: [
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 0)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 0.25)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 0.5)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 0.75)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 1))
        ],
        EIGHT_COLORS_BLUE_TO_RED: [
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 0)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 2/7)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 4/7)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(BLUE, WHITE, 6/7)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 1/7)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 3/7)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 5/7)),
            qunitUtils.normalizeColorToRgb(colorUtils.interpolateColors(WHITE, RED, 1))
        ]
    };

    var Module = {

        setup: function() {},

        teardown: function() {
            Pass.validateAll();
        },

        drawTestMap: function(data, configOptions) {
            var configModel = new MockModel(configOptions);
            var searchDataModel = new MockModel(data);
            var view = new Map({
                model: {
                    config: configModel,
                    application: new MockModel(),
                    searchData: searchDataModel,
                    searchDataParams: new MockModel()
                },
                width: 400,
                height: 400
            });
            view.render().validate();
            Pass.validateAll();
            return view;
        },

        getConfigModel: function(view) {
            return view.model.config;
        },

        getSearchDataModel: function(view) {
            return view.model.searchData;
        },

        getChoroplethLayer: function(view) {
            return view._choroplethLayer;
        },

        getPolygonList: function(view) {
            var choroplethLayer = this.getChoroplethLayer(view);
            if (!choroplethLayer) {
                throw new Error('the view does not have a choropleth layer');
            }
            return _(choroplethLayer._polygonList).sortBy(function(polygon) {
                return parseFloat(polygon.count);
            });
        },

        getNumericLegend: function(view) {
            return view._numericLegend;
        },

        getExternalLegend: function(view) {
            return view._externalLegend;
        },

        getCategoricalLegend: function(view) {
            return view._categoricalVisualLegend;
        },

        getFieldColorPalette: function(view) {
            return view._fieldColorPalette;
        },

        getChoroplethColorPalette: function(view) {
            return view._choroplethColorPalette;
        },

        getNumericAxis: function(view) {
            return view._numericAxis;
        },

        $getLegendElement: function(view) {
            return view.$(".legend");
        },

        $getLegendColorElements: function(view) {
            return view.$('.legend-color');
        },

        $getLegendLabelElements: function(view) {
            return view.$('.legend .svg-label');
        },

        verifyLegendLabels: function(legendContainer, expectedRanges) {
            var $legendLabelElements = $(legendContainer).find('.svg-label');
            equal($legendLabelElements.length, expectedRanges.length, 'the number of labels is correct');
            _(expectedRanges).each(function(expected, i) {
                var actual = $legendLabelElements.eq(i).text();
                if (_.isArray(expected)) {
                    var actualLabelsAsFloats = _(actual.split(' - ')).map(parseFloat);
                    deepEqual(actualLabelsAsFloats, expected, 'label ' + i + ' is correct');
                } else {
                    equal(actual, expected.toString(), 'label ' + i + ' is correct');
                }
            });
        }

    };

    return ({
        Module: Module,
        DATA: mappingData,
        COLORS: COLORS
    });

});
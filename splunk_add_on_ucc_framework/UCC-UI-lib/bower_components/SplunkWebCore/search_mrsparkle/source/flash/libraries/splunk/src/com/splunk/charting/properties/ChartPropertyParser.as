package com.splunk.charting.properties
{

	import com.splunk.charting.charts.AbstractChart;
	import com.splunk.charting.charts.AbstractChart1D;
	import com.splunk.charting.charts.AbstractChart2D;
	import com.splunk.charting.charts.AbstractChart3D;
	import com.splunk.charting.charts.AbstractChart4D;
	import com.splunk.charting.charts.AnnotationChart;
	import com.splunk.charting.charts.AreaChart;
	import com.splunk.charting.charts.BarChart;
	import com.splunk.charting.charts.BubbleChart;
	import com.splunk.charting.charts.ColumnChart;
	import com.splunk.charting.charts.FillerGauge;
	import com.splunk.charting.charts.Histogram;
	import com.splunk.charting.charts.LineChart;
	import com.splunk.charting.charts.MarkerGauge;
	import com.splunk.charting.charts.MotionBubbleChart;
	import com.splunk.charting.charts.PieChart;
	import com.splunk.charting.charts.RadialGauge;
	import com.splunk.charting.charts.RangeMarker;
	import com.splunk.charting.charts.RatioBarChart;
	import com.splunk.charting.charts.ScatterChart;
	import com.splunk.charting.charts.ValueMarker;
	import com.splunk.properties.ArrayPropertyParser;
	import com.splunk.properties.BrushPalettePropertyParser;
	import com.splunk.properties.BrushPropertyParser;
	import com.splunk.properties.DataTablePropertyParser;
	import com.splunk.properties.LayoutSpritePropertyParser;
	import com.splunk.properties.ParseUtils;
	import com.splunk.properties.PropertyManager;
	import com.splunk.properties.ShapePalettePropertyParser;
	import com.splunk.properties.ShapePropertyParser;
	import com.splunk.properties.SpriteStylePropertyParser;
	import com.splunk.properties.TextBlockStylePropertyParser;

	public class ChartPropertyParser extends LayoutSpritePropertyParser
	{

		// Private Static Properties

		private static var _instance:ChartPropertyParser;

		// Public Static Methods

		public static function getInstance() : ChartPropertyParser
		{
			var instance:ChartPropertyParser = ChartPropertyParser._instance;
			if (!instance)
				instance = ChartPropertyParser._instance = new ChartPropertyParser();
			return instance;
		}

		// Protected Properties

		protected var dataTablePropertyParser:DataTablePropertyParser;
		protected var legendPropertyParser:LegendPropertyParser;
		protected var axisPropertyParser:AxisPropertyParser;
		protected var brushPropertyParser:BrushPropertyParser;
		protected var shapePropertyParser:ShapePropertyParser;
		protected var brushPalettePropertyParser:BrushPalettePropertyParser;
		protected var shapePalettePropertyParser:ShapePalettePropertyParser;
		protected var spriteStylePropertyParser:SpriteStylePropertyParser;
		protected var textBlockStylePropertyParser:TextBlockStylePropertyParser;
		protected var scalePropertyParser:ScalePropertyParser;
		protected var numberArrayPropertyParser:ArrayPropertyParser;
		protected var stringArrayPropertyParser:ArrayPropertyParser;

		// Constructor

		public function ChartPropertyParser()
		{
			this.dataTablePropertyParser = DataTablePropertyParser.getInstance();
			this.legendPropertyParser = LegendPropertyParser.getInstance();
			this.axisPropertyParser = AxisPropertyParser.getInstance();
			this.brushPropertyParser = BrushPropertyParser.getInstance();
			this.shapePropertyParser = ShapePropertyParser.getInstance();
			this.brushPalettePropertyParser = BrushPalettePropertyParser.getInstance();
			this.shapePalettePropertyParser = ShapePalettePropertyParser.getInstance();
			this.spriteStylePropertyParser = SpriteStylePropertyParser.getInstance();
			this.textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
			this.scalePropertyParser = ScalePropertyParser.getInstance();
			this.numberArrayPropertyParser = ArrayPropertyParser.getInstance(this.numberPropertyParser);
			this.stringArrayPropertyParser = ArrayPropertyParser.getInstance(this.stringPropertyParser);
		}

		// Public Methods

		public override function stringToValue(propertyManager:PropertyManager, str:String) : *
		{
			switch (ParseUtils.trimWhiteSpace(str))
			{
				case "annotation":
					return new AnnotationChart();
				case "area":
					return new AreaChart();
				case "bar":
					return new BarChart();
				case "bubble":
					return new BubbleChart();
				case "column":
					return new ColumnChart();
				case "fillerGauge":
					return new FillerGauge();
				case "histogram":
					return new Histogram();
				case "line":
					return new LineChart();
				case "markerGauge":
					return new MarkerGauge();
				case "motionBubble":
					return new MotionBubbleChart();
				case "pie":
					return new PieChart();
				case "radialGauge":
					return new RadialGauge();
				case "rangeMarker":
					return new RangeMarker();
				case "ratioBar":
					return new RatioBarChart();
				case "scatter":
					return new ScatterChart();
				case "valueMarker":
					return new ValueMarker();
				default:
					return null;
			}
		}

		public override function valueToString(propertyManager:PropertyManager, value:*) : String
		{
			if (value is AnnotationChart)
				return "annotation";
			if (value is AreaChart)
				return "area";
			if (value is BarChart)
				return "bar";
			if (value is BubbleChart)
				return "bubble";
			if (value is ColumnChart)
				return "column";
			if (value is FillerGauge)
				return "fillerGauge";
			if (value is Histogram)
				return "histogram";
			if (value is LineChart)
				return "line";
			if (value is MarkerGauge)
				return "markerGauge";
			if (value is MotionBubbleChart)
				return "motionBubble";
			if (value is PieChart)
				return "pie";
			if (value is RadialGauge)
				return "radialGauge";
			if (value is RangeMarker)
				return "rangeMarker";
			if (value is RatioBarChart)
				return "ratioBar";
			if (value is ScatterChart)
				return "scatter";
			if (value is ValueMarker)
				return "valueMarker";
			return null;
		}

		public override function registerProperties(propertyManager:PropertyManager, value:*) : void
		{
			super.registerProperties(propertyManager, value);

			if (value is AbstractChart)
			{
				propertyManager.registerProperty("data", this.dataTablePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("legend", this.legendPropertyParser, this.getProperty, this.setProperty);
			}

			if (value is AbstractChart1D)
			{
				propertyManager.registerProperty("axis", this.axisPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is AbstractChart2D)
			{
				propertyManager.registerProperty("axisX", this.axisPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("axisY", this.axisPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is AbstractChart3D)
			{
				propertyManager.registerProperty("axisX", this.axisPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("axisY", this.axisPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("axisZ", this.axisPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is AbstractChart4D)
			{
				propertyManager.registerProperty("axisW", this.axisPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("axisX", this.axisPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("axisY", this.axisPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("axisZ", this.axisPropertyParser, this.getProperty, this.setProperty);
			}

			if (value is AnnotationChart)
			{
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labels", this.stringArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is AreaChart)
			{
				propertyManager.registerProperty("areaBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("areaStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("lineBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("lineStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showLines", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stackMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("nullValueMode", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is BarChart)
			{
				propertyManager.registerProperty("barBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("barShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("barStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("barAlignment", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("barSpacing", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("seriesSpacing", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("useAbsoluteSpacing", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stackMode", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is BubbleChart)
			{
				propertyManager.registerProperty("bubbleBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bubbleShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bubbleStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bubbleMinimumSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bubbleMaximumSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultSeriesName", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ColumnChart)
			{
				propertyManager.registerProperty("columnBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnAlignment", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnSpacing", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("seriesSpacing", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("useAbsoluteSpacing", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stackMode", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is FillerGauge)
			{
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fillerBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fillerStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fillerPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("fillerPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeValues", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangePadding", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorUnit", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorUnit", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelPlacement", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("valueStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("valuePlacement", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningShape", this.shapePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningPlacement", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundPadding", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundPadding", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("layers", this.stringArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("usePercentageRange", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("usePercentageValue", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showMajorTicks", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showMinorTicks", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showLabels", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showValue", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is Histogram)
			{
				propertyManager.registerProperty("columnBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("columnStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is LineChart)
			{
				propertyManager.registerProperty("lineBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("lineStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showMarkers", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("stackMode", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("nullValueMode", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is MarkerGauge)
			{
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerShape", this.shapePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerThickness", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeValues", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangePadding", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeBandBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeBandStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeBandPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeBandPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorUnit", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorUnit", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelPlacement", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("valueStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("valuePlacement", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningShape", this.shapePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningPlacement", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundPadding", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundPlacement1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundPlacement2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundPadding", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("layers", this.stringArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("usePercentageRange", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("usePercentageValue", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showRangeBand", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showMajorTicks", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showMinorTicks", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showLabels", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showValue", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is MotionBubbleChart)
			{
				propertyManager.registerProperty("frame", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bubbleBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bubbleShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bubbleStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bubbleMinimumSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("bubbleMaximumSize", this.numberPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is PieChart)
			{
				propertyManager.registerProperty("sliceBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sliceStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sliceCollapsingThreshold", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("sliceCollapsingLabel", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelLineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showLabels", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showPercent", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is RadialGauge)
			{
				propertyManager.registerProperty("needleBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("needleShape", this.shapePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("needleStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("needleRadius1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("needleRadius2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("needleThickness", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeValues", this.numberArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeStartAngle", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeArcAngle", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeBandBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeBandStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeBandRadius1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("rangeBandRadius2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickRadius1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorTickRadius2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("majorUnit", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickRadius1", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorTickRadius2", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("minorUnit", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelRadius", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("valueStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("valueRadius", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningShape", this.shapePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningRadius", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("warningSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("foregroundRadius", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("backgroundRadius", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("layers", this.stringArrayPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("usePercentageRange", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("usePercentageValue", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showRangeBand", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showMajorTicks", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showMinorTicks", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showLabels", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showValue", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is RangeMarker)
			{
				propertyManager.registerProperty("minimumValue", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("maximumValue", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("lineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("innerFillBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("outerFillBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is RatioBarChart)
			{
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("barBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("barStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("barCollapsingThreshold", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("barCollapsingLabel", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelStyle", this.textBlockStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("labelLineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showLabels", this.booleanPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("showPercent", this.booleanPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ScatterChart)
			{
				propertyManager.registerProperty("markerBrushPalette", this.brushPalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerShapePalette", this.shapePalettePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerStyle", this.spriteStylePropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("markerSize", this.numberPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("defaultSeriesName", this.stringPropertyParser, this.getProperty, this.setProperty);
			}
			else if (value is ValueMarker)
			{
				propertyManager.registerProperty("value", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("orientation", this.stringPropertyParser, this.getProperty, this.setProperty);
				propertyManager.registerProperty("lineBrush", this.brushPropertyParser, this.getProperty, this.setProperty);
			}
		}

	}

}

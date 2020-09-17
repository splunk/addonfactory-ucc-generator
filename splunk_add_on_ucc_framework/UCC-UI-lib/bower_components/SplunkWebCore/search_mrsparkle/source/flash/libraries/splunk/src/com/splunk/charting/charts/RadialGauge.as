package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.DrawingUtils;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.EllipseShape;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.layout.Visibility;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.controls.Label;
	import com.splunk.data.IDataTable;
	import com.splunk.palettes.brush.IBrushPalette;
	import com.splunk.palettes.brush.SolidFillBrushPalette;
	import com.splunk.palettes.color.ListColorPalette;
	import com.splunk.utils.Style;
	import flash.display.DisplayObject;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class RadialGauge extends AbstractChart
	{

		// Private Properties

		private var _needleBrush:ObservableProperty;
		private var _needleShape:ObservableProperty;
		private var _needleStyle:ObservableProperty;
		private var _needleRadius1:ObservableProperty;
		private var _needleRadius2:ObservableProperty;
		private var _needleThickness:ObservableProperty;
		private var _rangeValues:ObservableProperty;
		private var _rangeStartAngle:ObservableProperty;
		private var _rangeArcAngle:ObservableProperty;
		private var _rangeBandBrushPalette:ObservableProperty;
		private var _rangeBandStyle:ObservableProperty;
		private var _rangeBandRadius1:ObservableProperty;
		private var _rangeBandRadius2:ObservableProperty;
		private var _majorTickBrush:ObservableProperty;
		private var _majorTickStyle:ObservableProperty;
		private var _majorTickRadius1:ObservableProperty;
		private var _majorTickRadius2:ObservableProperty;
		private var _majorUnit:ObservableProperty;
		private var _minorTickBrush:ObservableProperty;
		private var _minorTickStyle:ObservableProperty;
		private var _minorTickRadius1:ObservableProperty;
		private var _minorTickRadius2:ObservableProperty;
		private var _minorUnit:ObservableProperty;
		private var _labelStyle:ObservableProperty;
		private var _labelRadius:ObservableProperty;
		private var _labelFormat:ObservableProperty;
		private var _valueStyle:ObservableProperty;
		private var _valueRadius:ObservableProperty;
		private var _valueFormat:ObservableProperty;
		private var _warningBrush:ObservableProperty;
		private var _warningShape:ObservableProperty;
		private var _warningStyle:ObservableProperty;
		private var _warningRadius:ObservableProperty;
		private var _warningSize:ObservableProperty;
		private var _foregroundBrush:ObservableProperty;
		private var _foregroundStyle:ObservableProperty;
		private var _foregroundRadius:ObservableProperty;
		private var _backgroundBrush:ObservableProperty;
		private var _backgroundStyle:ObservableProperty;
		private var _backgroundRadius:ObservableProperty;
		private var _layers:ObservableProperty;
		private var _usePercentageRange:ObservableProperty;
		private var _usePercentageValue:ObservableProperty;
		private var _showRangeBand:ObservableProperty;
		private var _showMajorTicks:ObservableProperty;
		private var _showMinorTicks:ObservableProperty;
		private var _showLabels:ObservableProperty;
		private var _showValue:ObservableProperty;

		private var _needleValue:Number;
		private var _needlePosition:Number;
		private var _rangeFields:Array;
		private var _rangePositions:Array;
		private var _majorTickValues:Array;
		private var _majorTickPositions:Array;
		private var _minorTickPositions:Array;
		private var _labels:Array;

		private var _foreground:Shape;
		private var _needle:Needle;
		private var _warningLight:Shape;
		private var _valueLabel:Label;
		private var _labelsContainer:Sprite;
		private var _majorTicks:Shape;
		private var _minorTicks:Shape;
		private var _rangeBand:Shape;
		private var _background:Shape;

		// Constructor

		public function RadialGauge()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0x00FF00, 0xFFFF00, 0xFF0000 ], true);

			this._needleBrush = new ObservableProperty(this, "needleBrush", IBrush, new SolidFillBrush(0x000000), this.invalidates(AbstractChart.RENDER_CHART));
			this._needleShape = new ObservableProperty(this, "needleShape", IShape, new RectangleShape(), this.invalidates(AbstractChart.RENDER_CHART));
			this._needleStyle = new ObservableProperty(this, "needleStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._needleRadius1 = new ObservableProperty(this, "needleRadius1", Number, 0, this.invalidates(AbstractChart.RENDER_CHART));
			this._needleRadius2 = new ObservableProperty(this, "needleRadius2", Number, 0.9, this.invalidates(AbstractChart.RENDER_CHART));
			this._needleThickness = new ObservableProperty(this, "needleThickness", Number, 0.05, this.invalidates(AbstractChart.RENDER_CHART));
			this._rangeValues = new ObservableProperty(this, "rangeValues", Array, null, this.invalidates(AbstractChart.PROCESS_DATA));
			this._rangeStartAngle = new ObservableProperty(this, "rangeStartAngle", Number, 45, this.invalidates(AbstractChart.RENDER_CHART));
			this._rangeArcAngle = new ObservableProperty(this, "rangeArcAngle", Number, 270, this.invalidates(AbstractChart.RENDER_CHART));
			this._rangeBandBrushPalette = new ObservableProperty(this, "rangeBandBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette), this.invalidates(AbstractChart.RENDER_CHART));
			this._rangeBandStyle = new ObservableProperty(this, "rangeBandStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._rangeBandRadius1 = new ObservableProperty(this, "rangeBandRadius1", Number, 0.8, this.invalidates(AbstractChart.RENDER_CHART));
			this._rangeBandRadius2 = new ObservableProperty(this, "rangeBandRadius2", Number, 0.9, this.invalidates(AbstractChart.RENDER_CHART));
			this._majorTickBrush = new ObservableProperty(this, "majorTickBrush", IBrush, new SolidStrokeBrush(1, 0x000000), this.invalidates(AbstractChart.RENDER_CHART));
			this._majorTickStyle = new ObservableProperty(this, "majorTickStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._majorTickRadius1 = new ObservableProperty(this, "majorTickRadius1", Number, 0.7, this.invalidates(AbstractChart.RENDER_CHART));
			this._majorTickRadius2 = new ObservableProperty(this, "majorTickRadius2", Number, 0.8, this.invalidates(AbstractChart.RENDER_CHART));
			this._majorUnit = new ObservableProperty(this, "majorUnit", Number, NaN, this.invalidates(AbstractChart.PROCESS_DATA));
			this._minorTickBrush = new ObservableProperty(this, "minorTickBrush", IBrush, new SolidStrokeBrush(1, 0x000000), this.invalidates(AbstractChart.RENDER_CHART));
			this._minorTickStyle = new ObservableProperty(this, "minorTickStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._minorTickRadius1 = new ObservableProperty(this, "minorTickRadius1", Number, 0.75, this.invalidates(AbstractChart.RENDER_CHART));
			this._minorTickRadius2 = new ObservableProperty(this, "minorTickRadius2", Number, 0.8, this.invalidates(AbstractChart.RENDER_CHART));
			this._minorUnit = new ObservableProperty(this, "minorUnit", Number, NaN, this.invalidates(AbstractChart.PROCESS_DATA));
			this._labelStyle = new ObservableProperty(this, "labelStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._labelRadius = new ObservableProperty(this, "labelRadius", Number, 0.7, this.invalidates(AbstractChart.RENDER_CHART));
			this._labelFormat = new ObservableProperty(this, "labelFormat", Function, null, this.invalidates(LayoutSprite.MEASURE));
			this._valueStyle = new ObservableProperty(this, "valueStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._valueRadius = new ObservableProperty(this, "valueRadius", Number, 0.8, this.invalidates(AbstractChart.RENDER_CHART));
			this._valueFormat = new ObservableProperty(this, "valueFormat", Function, null, this.invalidates(LayoutSprite.MEASURE));
			this._warningBrush = new ObservableProperty(this, "warningBrush", IBrush, new SolidFillBrush(0xFF0000), this.invalidates(AbstractChart.RENDER_CHART));
			this._warningShape = new ObservableProperty(this, "warningShape", IShape, new EllipseShape(), this.invalidates(AbstractChart.RENDER_CHART));
			this._warningStyle = new ObservableProperty(this, "warningStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._warningRadius = new ObservableProperty(this, "warningRadius", Number, 1, this.invalidates(AbstractChart.RENDER_CHART));
			this._warningSize = new ObservableProperty(this, "warningSize", Number, 0.1, this.invalidates(AbstractChart.RENDER_CHART));
			this._foregroundBrush = new ObservableProperty(this, "foregroundBrush", IBrush, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._foregroundStyle = new ObservableProperty(this, "foregroundStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._foregroundRadius = new ObservableProperty(this, "foregroundRadius", Number, 1, this.invalidates(AbstractChart.RENDER_CHART));
			this._backgroundBrush = new ObservableProperty(this, "backgroundBrush", IBrush, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._backgroundStyle = new ObservableProperty(this, "backgroundStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._backgroundRadius = new ObservableProperty(this, "backgroundRadius", Number, 1, this.invalidates(AbstractChart.RENDER_CHART));
			this._layers = new ObservableProperty(this, "layers", Array, new Array(), this.invalidates(AbstractChart.RENDER_CHART));
			this._usePercentageRange = new ObservableProperty(this, "usePercentageRange", Boolean, false, this.invalidates(AbstractChart.PROCESS_DATA));
			this._usePercentageValue = new ObservableProperty(this, "usePercentageValue", Boolean, false, this.invalidates(AbstractChart.PROCESS_DATA));
			this._showRangeBand = new ObservableProperty(this, "showRangeBand", Boolean, true, this.invalidates(AbstractChart.RENDER_CHART));
			this._showMajorTicks = new ObservableProperty(this, "showMajorTicks", Boolean, true, this.invalidates(AbstractChart.RENDER_CHART));
			this._showMinorTicks = new ObservableProperty(this, "showMinorTicks", Boolean, true, this.invalidates(AbstractChart.RENDER_CHART));
			this._showLabels = new ObservableProperty(this, "showLabels", Boolean, true, this.invalidates(LayoutSprite.MEASURE));
			this._showValue = new ObservableProperty(this, "showValue", Boolean, true, this.invalidates(LayoutSprite.MEASURE));

			this._needleValue = 0;
			this._needlePosition = 0;
			this._rangeFields = new Array();
			this._rangePositions = new Array();
			this._majorTickValues = new Array();
			this._majorTickPositions = new Array();
			this._minorTickPositions = new Array();
			this._labels = new Array();

			this._foreground = new Shape();
			this._needle = new Needle();
			this._warningLight = new Shape();
			this._valueLabel = new Label();
			this._labelsContainer = new Sprite();
			this._labelsContainer.mouseEnabled = false;
			this._majorTicks = new Shape();
			this._minorTicks = new Shape();
			this._rangeBand = new Shape();
			this._background = new Shape();

			this._updateLayers();

			this.invalidate(AbstractChart.PROCESS_DATA);
		}

		// Public Getters/Setters

		public function get needleBrush() : IBrush
		{
			return this._needleBrush.value;
		}
		public function set needleBrush(value:IBrush) : void
		{
			this._needleBrush.value = value;
		}

		public function get needleShape() : IShape
		{
			return this._needleShape.value;
		}
		public function set needleShape(value:IShape) : void
		{
			this._needleShape.value = value;
		}

		public function get needleStyle() : Style
		{
			return this._needleStyle.value;
		}
		public function set needleStyle(value:Style) : void
		{
			this._needleStyle.value = value;
		}

		public function get needleRadius1() : Number
		{
			return this._needleRadius1.value;
		}
		public function set needleRadius1(value:Number) : void
		{
			this._needleRadius1.value = value;
		}

		public function get needleRadius2() : Number
		{
			return this._needleRadius2.value;
		}
		public function set needleRadius2(value:Number) : void
		{
			this._needleRadius2.value = value;
		}

		public function get needleThickness() : Number
		{
			return this._needleThickness.value;
		}
		public function set needleThickness(value:Number) : void
		{
			this._needleThickness.value = value;
		}

		public function get rangeValues() : Array
		{
			var value:Array = this._rangeValues.value;
			return value ? value.concat() : null;
		}
		public function set rangeValues(value:Array) : void
		{
			this._rangeValues.value = value ? value.concat() : null;
		}

		public function get rangeStartAngle() : Number
		{
			return this._rangeStartAngle.value;
		}
		public function set rangeStartAngle(value:Number) : void
		{
			this._rangeStartAngle.value = value;
		}

		public function get rangeArcAngle() : Number
		{
			return this._rangeArcAngle.value;
		}
		public function set rangeArcAngle(value:Number) : void
		{
			this._rangeArcAngle.value = value;
		}

		public function get rangeBandBrushPalette() : IBrushPalette
		{
			return this._rangeBandBrushPalette.value;
		}
		public function set rangeBandBrushPalette(value:IBrushPalette) : void
		{
			this._rangeBandBrushPalette.value = value;
		}

		public function get rangeBandStyle() : Style
		{
			return this._rangeBandStyle.value;
		}
		public function set rangeBandStyle(value:Style) : void
		{
			this._rangeBandStyle.value = value;
		}

		public function get rangeBandRadius1() : Number
		{
			return this._rangeBandRadius1.value;
		}
		public function set rangeBandRadius1(value:Number) : void
		{
			this._rangeBandRadius1.value = value;
		}

		public function get rangeBandRadius2() : Number
		{
			return this._rangeBandRadius2.value;
		}
		public function set rangeBandRadius2(value:Number) : void
		{
			this._rangeBandRadius2.value = value;
		}

		public function get majorTickBrush() : IBrush
		{
			return this._majorTickBrush.value;
		}
		public function set majorTickBrush(value:IBrush) : void
		{
			this._majorTickBrush.value = value;
		}

		public function get majorTickStyle() : Style
		{
			return this._majorTickStyle.value;
		}
		public function set majorTickStyle(value:Style) : void
		{
			this._majorTickStyle.value = value;
		}

		public function get majorTickRadius1() : Number
		{
			return this._majorTickRadius1.value;
		}
		public function set majorTickRadius1(value:Number) : void
		{
			this._majorTickRadius1.value = value;
		}

		public function get majorTickRadius2() : Number
		{
			return this._majorTickRadius2.value;
		}
		public function set majorTickRadius2(value:Number) : void
		{
			this._majorTickRadius2.value = value;
		}

		public function get majorUnit() : Number
		{
			return this._majorUnit.value;
		}
		public function set majorUnit(value:Number) : void
		{
			this._majorUnit.value = value;
		}

		public function get minorTickBrush() : IBrush
		{
			return this._minorTickBrush.value;
		}
		public function set minorTickBrush(value:IBrush) : void
		{
			this._minorTickBrush.value = value;
		}

		public function get minorTickStyle() : Style
		{
			return this._minorTickStyle.value;
		}
		public function set minorTickStyle(value:Style) : void
		{
			this._minorTickStyle.value = value;
		}

		public function get minorTickRadius1() : Number
		{
			return this._minorTickRadius1.value;
		}
		public function set minorTickRadius1(value:Number) : void
		{
			this._minorTickRadius1.value = value;
		}

		public function get minorTickRadius2() : Number
		{
			return this._minorTickRadius2.value;
		}
		public function set minorTickRadius2(value:Number) : void
		{
			this._minorTickRadius2.value = value;
		}

		public function get minorUnit() : Number
		{
			return this._minorUnit.value;
		}
		public function set minorUnit(value:Number) : void
		{
			this._minorUnit.value = value;
		}

		public function get labelStyle() : Style
		{
			return this._labelStyle.value;
		}
		public function set labelStyle(value:Style) : void
		{
			this._labelStyle.value = value;
		}

		public function get labelRadius() : Number
		{
			return this._labelRadius.value;
		}
		public function set labelRadius(value:Number) : void
		{
			this._labelRadius.value = value;
		}

		public function get labelFormat() : Function
		{
			return this._labelFormat.value;
		}
		public function set labelFormat(value:Function) : void
		{
			this._labelFormat.value = value;
		}

		public function get valueStyle() : Style
		{
			return this._valueStyle.value;
		}
		public function set valueStyle(value:Style) : void
		{
			this._valueStyle.value = value;
		}

		public function get valueRadius() : Number
		{
			return this._valueRadius.value;
		}
		public function set valueRadius(value:Number) : void
		{
			this._valueRadius.value = value;
		}

		public function get valueFormat() : Function
		{
			return this._valueFormat.value;
		}
		public function set valueFormat(value:Function) : void
		{
			this._valueFormat.value = value;
		}

		public function get warningBrush() : IBrush
		{
			return this._warningBrush.value;
		}
		public function set warningBrush(value:IBrush) : void
		{
			this._warningBrush.value = value;
		}

		public function get warningShape() : IShape
		{
			return this._warningShape.value;
		}
		public function set warningShape(value:IShape) : void
		{
			this._warningShape.value = value;
		}

		public function get warningStyle() : Style
		{
			return this._warningStyle.value;
		}
		public function set warningStyle(value:Style) : void
		{
			this._warningStyle.value = value;
		}

		public function get warningRadius() : Number
		{
			return this._warningRadius.value;
		}
		public function set warningRadius(value:Number) : void
		{
			this._warningRadius.value = value;
		}

		public function get warningSize() : Number
		{
			return this._warningSize.value;
		}
		public function set warningSize(value:Number) : void
		{
			this._warningSize.value = value;
		}

		public function get foregroundBrush() : IBrush
		{
			return this._foregroundBrush.value;
		}
		public function set foregroundBrush(value:IBrush) : void
		{
			this._foregroundBrush.value = value;
		}

		public function get foregroundStyle() : Style
		{
			return this._foregroundStyle.value;
		}
		public function set foregroundStyle(value:Style) : void
		{
			this._foregroundStyle.value = value;
		}

		public function get foregroundRadius() : Number
		{
			return this._foregroundRadius.value;
		}
		public function set foregroundRadius(value:Number) : void
		{
			this._foregroundRadius.value = value;
		}

		public function get backgroundBrush() : IBrush
		{
			return this._backgroundBrush.value;
		}
		public function set backgroundBrush(value:IBrush) : void
		{
			this._backgroundBrush.value = value;
		}

		public function get backgroundStyle() : Style
		{
			return this._backgroundStyle.value;
		}
		public function set backgroundStyle(value:Style) : void
		{
			this._backgroundStyle.value = value;
		}

		public function get backgroundRadius() : Number
		{
			return this._backgroundRadius.value;
		}
		public function set backgroundRadius(value:Number) : void
		{
			this._backgroundRadius.value = value;
		}

		public function get layers() : Array
		{
			return this._layers.value.concat();
		}
		public function set layers(value:Array) : void
		{
			this._layers.value = value ? value.concat() : new Array();
		}

		public function get usePercentageRange() : Boolean
		{
			return this._usePercentageRange.value;
		}
		public function set usePercentageRange(value:Boolean) : void
		{
			this._usePercentageRange.value = value;
		}

		public function get usePercentageValue() : Boolean
		{
			return this._usePercentageValue.value;
		}
		public function set usePercentageValue(value:Boolean) : void
		{
			this._usePercentageValue.value = value;
		}

		public function get showRangeBand() : Boolean
		{
			return this._showRangeBand.value;
		}
		public function set showRangeBand(value:Boolean) : void
		{
			this._showRangeBand.value = value;
		}

		public function get showMajorTicks() : Boolean
		{
			return this._showMajorTicks.value;
		}
		public function set showMajorTicks(value:Boolean) : void
		{
			this._showMajorTicks.value = value;
		}

		public function get showMinorTicks() : Boolean
		{
			return this._showMinorTicks.value;
		}
		public function set showMinorTicks(value:Boolean) : void
		{
			this._showMinorTicks.value = value;
		}

		public function get showLabels() : Boolean
		{
			return this._showLabels.value;
		}
		public function set showLabels(value:Boolean) : void
		{
			this._showLabels.value = value;
		}

		public function get showValue() : Boolean
		{
			return this._showValue.value;
		}
		public function set showValue(value:Boolean) : void
		{
			this._showValue.value = value;
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			this.invalidate(LayoutSprite.MEASURE);

			var manualRangeValues:Array = this._rangeValues.value;
			var majorUnit:Number = this._majorUnit.value;
			var minorUnit:Number = this._minorUnit.value;
			var usePercentageRange:Number = this._usePercentageRange.value;
			var usePercentageValue:Number = this._usePercentageValue.value;

			var needleValue:Number = NaN;
			var needlePosition:Number = 0;
			var rangeFields:Array = new Array();
			var rangeValues:Array = new Array();
			var rangePositions:Array = new Array();
			var majorTickValues:Array = new Array();
			var majorTickPositions:Array = new Array();
			var minorTickPositions:Array = new Array();

			var prevValue:Number;
			var value:Number;
			var i:int;

			if (manualRangeValues)
			{
				prevValue = -Infinity;
				for each (value in manualRangeValues)
				{
					if ((value != value) || (value <= prevValue))
						continue;

					prevValue = value;

					rangeValues.push(value);
					rangeFields.push("range" + rangeFields.length);
				}
			}

			if (data)
			{
				var numDataRows:int = data.numRows;
				var numDataColumns:int = data.numColumns;
				if ((numDataRows > 0) && (numDataColumns > 0))
				{
					needleValue = NumberUtil.parseNumber(data.getValue(0, 0));

					if (!manualRangeValues)
					{
						prevValue = -Infinity;
						for (i = 1; i < numDataColumns; i++)
						{
							value = NumberUtil.parseNumber(data.getValue(0, i));
							if ((value != value) || (value <= prevValue))
								continue;

							prevValue = value;

							rangeValues.push(value);
							rangeFields.push(data.getColumnName(i));
						}
					}
				}
			}

			var numRangeValues:int = rangeValues.length;
			if (numRangeValues < 2)
			{
				rangeValues = [ 0, 30, 70, 100 ];
				rangeFields = [ "range0", "range1", "range2", "range3" ];
				numRangeValues = 4;
			}

			var minimumValue:Number = rangeValues[0];
			var maximumValue:Number = rangeValues[numRangeValues - 1];
			var range:Number = maximumValue - minimumValue;

			if (needleValue != needleValue)
				needleValue = minimumValue;

			needlePosition = (needleValue - minimumValue) / range;

			for each (value in rangeValues)
				rangePositions.push((value - minimumValue) / range);

			if (usePercentageValue)
				needleValue = needlePosition * 100;

			if (usePercentageRange)
			{
				minimumValue = 0;
				maximumValue = 100;
			}

			this._computeTickPositions(minimumValue, maximumValue, majorUnit, minorUnit, majorTickValues, majorTickPositions, minorTickPositions);

			this._needleValue = needleValue;
			this._needlePosition = needlePosition;
			this._rangeFields = rangeFields;
			this._rangePositions = rangePositions;
			this._majorTickValues = majorTickValues;
			this._majorTickPositions = majorTickPositions;
			this._minorTickPositions = minorTickPositions;
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var labelStyle:Style = this._labelStyle.value;
			var labelFormat:Function = this._labelFormat.value;
			var valueStyle:Style = this._valueStyle.value;
			var valueFormat:Function = this._valueFormat.value;
			var usePercentageRange:Number = this._usePercentageRange.value;
			var usePercentageValue:Number = this._usePercentageValue.value;
			var showLabels:Boolean = this._showLabels.value;
			var showValue:Boolean = this._showValue.value;

			var needleValue:Number = this._needleValue;
			var majorTickValues:Array = this._majorTickValues;

			var childSize:Size = new Size(Infinity, Infinity);

			// labels

			var numTickValues:int = majorTickValues.length;
			var labelsContainer:Sprite = this._labelsContainer;
			var labels:Array = this._labels;
			var numLabels:int = labels.length;
			var label:Label;
			var i:int;

			if (labelFormat == null)
				labelFormat = usePercentageRange ? this._percentageFormat : this._numericFormat;

			for (i = 0; i < numTickValues; i++)
			{
				if (i < numLabels)
				{
					label = labels[i];
				}
				else
				{
					label = new Label();
					labels.push(label);
					labelsContainer.addChild(label);
				}

				label.text = labelFormat(majorTickValues[i]);
				Style.applyStyle(label, labelStyle);
				label.visibility = showLabels ? Visibility.VISIBLE : Visibility.COLLAPSED;
				label.measure(childSize);
			}

			for (i = labels.length - 1; i >= numTickValues; i--)
			{
				label = labels.pop();
				labelsContainer.removeChild(label);
			}

			// value

			var valueLabel:Label = this._valueLabel;

			if (valueFormat == null)
				valueFormat = usePercentageValue ? this._percentageFormat : this._numericFormat;

			valueLabel.text = valueFormat(needleValue);
			Style.applyStyle(valueLabel, valueStyle);
			valueLabel.visibility = showValue ? Visibility.VISIBLE : Visibility.COLLAPSED;
			valueLabel.measure(childSize);

			return super.measureOverride(availableSize);
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var needleBrush:IBrush = this._needleBrush.value;
			var needleShape:IShape = this._needleShape.value;
			var needleStyle:Style = this._needleStyle.value;
			var needleRadius1:Number = this._needleRadius1.value;
			var needleRadius2:Number = this._needleRadius2.value;
			var needleThickness:Number = this._needleThickness.value;
			var rangeStartAngle:Number = this._rangeStartAngle.value + 90;
			var rangeArcAngle:Number = NumberUtil.minMax(this._rangeArcAngle.value, -360, 360);
			var rangeBandBrushPalette:IBrushPalette = this._rangeBandBrushPalette.value;
			var rangeBandStyle:Style = this._rangeBandStyle.value;
			var rangeBandRadius1:Number = this._rangeBandRadius1.value;
			var rangeBandRadius2:Number = this._rangeBandRadius2.value;
			var majorTickBrush:IBrush = this._majorTickBrush.value;
			var majorTickStyle:Style = this._majorTickStyle.value;
			var majorTickRadius1:Number = this._majorTickRadius1.value;
			var majorTickRadius2:Number = this._majorTickRadius2.value;
			var minorTickBrush:IBrush = this._minorTickBrush.value;
			var minorTickStyle:Style = this._minorTickStyle.value;
			var minorTickRadius1:Number = this._minorTickRadius1.value;
			var minorTickRadius2:Number = this._minorTickRadius2.value;
			var labelRadius:Number = this._labelRadius.value;
			var valueRadius:Number = this._valueRadius.value;
			var warningBrush:IBrush = this._warningBrush.value;
			var warningShape:IShape = this._warningShape.value;
			var warningStyle:Style = this._warningStyle.value;
			var warningRadius:Number = this._warningRadius.value;
			var warningSize:Number = this._warningSize.value;
			var foregroundBrush:IBrush = this._foregroundBrush.value;
			var foregroundStyle:Style = this._foregroundStyle.value;
			var foregroundRadius:Number = this._foregroundRadius.value;
			var backgroundBrush:IBrush = this._backgroundBrush.value;
			var backgroundStyle:Style = this._backgroundStyle.value;
			var backgroundRadius:Number = this._backgroundRadius.value;
			var layers:Array = this._layers.value;
			var showRangeBand:Boolean = this._showRangeBand.value;
			var showMajorTicks:Boolean = this._showMajorTicks.value;
			var showMinorTicks:Boolean = this._showMinorTicks.value;

			var needlePosition:Number = this._needlePosition;
			var rangeFields:Array = this._rangeFields;
			var rangePositions:Array = this._rangePositions;
			var majorTickPositions:Array = this._majorTickPositions;
			var minorTickPositions:Array = this._minorTickPositions;

			var centerX:Number = chartWidth / 2;
			var centerY:Number = chartHeight / 2;
			var radius:Number = Math.min(centerX, centerY);
			var brushBounds:Array = [ new Point(centerX - radius, centerY - radius), new Point(centerX + radius, centerY - radius), new Point(centerX + radius, centerY + radius), new Point(centerX - radius, centerY + radius) ];

			var graphics:Graphics;

			// range fill

			graphics = this._rangeBand.graphics;
			graphics.clear();

			if (showRangeBand)
				this._drawRangeBand(graphics, rangeBandBrushPalette, brushBounds, centerX, centerY, radius * rangeBandRadius1, radius * rangeBandRadius2, rangeStartAngle, rangeArcAngle, rangePositions, rangeFields);

			Style.applyStyle(this._rangeBand, rangeBandStyle);

			// minor ticks

			graphics = this._minorTicks.graphics;
			graphics.clear();

			if (showMinorTicks)
			{
				this._drawTicks(graphics, minorTickBrush, brushBounds, centerX, centerY, radius * minorTickRadius1, radius * minorTickRadius2, rangeStartAngle, rangeArcAngle, minorTickPositions);
				if (!showMajorTicks)
					this._drawTicks(graphics, minorTickBrush, brushBounds, centerX, centerY, radius * minorTickRadius1, radius * minorTickRadius2, rangeStartAngle, rangeArcAngle, majorTickPositions);
			}

			Style.applyStyle(this._minorTicks, minorTickStyle);

			// major ticks

			graphics = this._majorTicks.graphics;
			graphics.clear();

			if (showMajorTicks)
				this._drawTicks(graphics, majorTickBrush, brushBounds, centerX, centerY, radius * majorTickRadius1, radius * majorTickRadius2, rangeStartAngle, rangeArcAngle, majorTickPositions);

			Style.applyStyle(this._majorTicks, majorTickStyle);

			// labels

			this._placeLabels(this._labels, centerX, centerY, radius * labelRadius, rangeStartAngle, rangeArcAngle, majorTickPositions);

			// value

			this._placeLabel(this._valueLabel, centerX, centerY, radius * valueRadius, rangeStartAngle + (rangeArcAngle + 360) / 2);

			// warning light

			graphics = this._warningLight.graphics;
			graphics.clear();

			this._drawWarningLight(graphics, warningBrush, warningShape, centerX, centerY, radius * warningRadius, radius * warningSize, rangeStartAngle, rangeArcAngle, needlePosition);

			Style.applyStyle(this._warningLight, warningStyle);

			// needle

			this._updateNeedle(this._needle, needleBrush, needleShape, centerX, centerY, radius * needleRadius1, radius * needleRadius2, radius * needleThickness, rangeStartAngle, rangeArcAngle, needlePosition);

			Style.applyStyle(this._needle, needleStyle);

			// foreground

			graphics = this._foreground.graphics;
			graphics.clear();

			this._drawLayer(graphics, foregroundBrush, brushBounds, centerX, centerY, radius * foregroundRadius);

			Style.applyStyle(this._foreground, foregroundStyle);

			// background

			graphics = this._background.graphics;
			graphics.clear();

			this._drawLayer(graphics, backgroundBrush, brushBounds, centerX, centerY, radius * backgroundRadius);

			Style.applyStyle(this._background, backgroundStyle);

			// layers

			this._updateLayers(layers);
		}

		// Private Methods

		private function _drawRangeBand(graphics:Graphics, brushPalette:IBrushPalette, brushBounds:Array, x:Number, y:Number, radius1:Number, radius2:Number, startAngle:Number, arcAngle:Number, rangePositions:Array, rangeFields:Array) : void
		{
			var numRangePositions:int = Math.min(rangePositions.length, rangeFields.length) - 1;
			var position1:Number;
			var position2:Number;
			var angle1:Number;
			var angle2:Number;
			var radians1:Number;
			var radians2:Number;
			var arc:Number;
			var x1:Number;
			var y1:Number;
			var x2:Number;
			var y2:Number;
			var brush:IBrush;

			for (var i:int = 0; i < numRangePositions; i++)
			{
				position1 = rangePositions[i];
				position2 = rangePositions[i + 1];

				angle1 = startAngle + arcAngle * position1;
				angle2 = startAngle + arcAngle * position2;

				radians1 = (angle1 / 180) * Math.PI;
				radians2 = (angle2 / 180) * Math.PI;

				arc = arcAngle * (position2 - position1);

				brush = brushPalette ? brushPalette.getBrush(rangeFields[i], i, numRangePositions) : null;
				if (!brush)
					brush = new SolidFillBrush(0x000000);

				x1 = x + Math.cos(radians1) * radius1;
				y1 = y + Math.sin(radians1) * radius1;
				x2 = x + Math.cos(radians2) * radius2;
				y2 = y + Math.sin(radians2) * radius2;

				brush.beginBrush(graphics, null, brushBounds);
				brush.moveTo(x1, y1);
				DrawingUtils.arcTo(brush, x1, y1, angle1, arc, radius1);
				brush.lineTo(x2, y2);
				DrawingUtils.arcTo(brush, x2, y2, angle2, -arc, radius2);
				brush.lineTo(x1, y1);
				brush.endBrush();
			}
		}

		private function _drawTicks(graphics:Graphics, brush:IBrush, brushBounds:Array, x:Number, y:Number, radius1:Number, radius2:Number, startAngle:Number, arcAngle:Number, tickPositions:Array) : void
		{
			if (!brush)
				brush = new SolidStrokeBrush(1, 0x000000);

			var position:Number;
			var angle:Number;
			var radians:Number;
			var x1:Number;
			var y1:Number;
			var x2:Number;
			var y2:Number;

			for each (position in tickPositions)
			{
				angle = startAngle + arcAngle * position;
				radians = (angle / 180) * Math.PI;

				x1 = x + Math.cos(radians) * radius1;
				y1 = y + Math.sin(radians) * radius1;
				x2 = x + Math.cos(radians) * radius2;
				y2 = y + Math.sin(radians) * radius2;

				brush.beginBrush(graphics, null, brushBounds);
				brush.moveTo(x1, y1);
				brush.lineTo(x2, y2);
				brush.endBrush();
			}
		}

		private function _drawWarningLight(graphics:Graphics, brush:IBrush, shape:IShape, x:Number, y:Number, radius:Number, size:Number, startAngle:Number, arcAngle:Number, position:Number) : void
		{
			if ((position >= 0) && (position <= 1))
				return;

			if (!brush)
				brush = new SolidFillBrush(0x000000);

			if (!shape)
				shape = new EllipseShape();

			size /= 2;

			if (radius < 0)
				radius -= size;
			else
				radius += size;

			var angle:Number = (position < 0) ? startAngle : startAngle + arcAngle;
			angle = (angle / 180) * Math.PI;

			x += Math.cos(angle) * radius;
			y += Math.sin(angle) * radius;

			var x1:Number = Math.round(x - size);
			var x2:Number = Math.round(x + size);
			var y1:Number = Math.round(y - size);
			var y2:Number = Math.round(y + size);

			shape.draw(graphics, x1, y1, x2 - x1, y2 - y1, brush);
		}

		private function _drawLayer(graphics:Graphics, brush:IBrush, brushBounds:Array, x:Number, y:Number, radius:Number) : void
		{
			if (!brush)
				return;

			brush.beginBrush(graphics, null, brushBounds);
			DrawingUtils.drawEllipse(brush, x, y, radius, radius);
			brush.endBrush();
		}

		private function _placeLabels(labels:Array, x:Number, y:Number, radius:Number, startAngle:Number, arcAngle:Number, positions:Array) : void
		{
			var numLabels:int = Math.min(labels.length, positions.length);
			var numOverlaps:int = 0;
			var labelBounds:Array = new Array(numLabels);
			var label:Label;
			var bounds1:Rectangle;
			var bounds2:Rectangle;
			var position:Number;
			var i:int;
			var j:int;

			// place labels
			for (i = 0; i < numLabels; i++)
			{
				label = labels[i];
				position = positions[i];
				labelBounds[i] = this._placeLabel(label, x, y, radius, startAngle + arcAngle * position);
			}

			// compute numOverlaps
			for (i = 0; i < numLabels; i++)
			{
				bounds1 = labelBounds[i];
				for (j = i + 1; j < numLabels; j++)
				{
					bounds2 = labelBounds[j];
					if (bounds2.intersects(bounds1))
						numOverlaps = Math.max(numOverlaps, j - i);
				}
			}

			// hide overlapping labels
			if (numOverlaps > 0)
			{
				numOverlaps++;
				for (i = 0; i < numLabels; i++)
				{
					if ((numOverlaps == numLabels) || ((i % numOverlaps) != 0))
					{
						label = labels[numLabels - i - 1];
						label.visible = false;
					}
				}
			}
		}

		private function _placeLabel(label:Label, x:Number, y:Number, radius:Number, angle:Number) : Rectangle
		{
			var labelBounds:Rectangle = new Rectangle(0, 0, label.measuredWidth, label.measuredHeight);

			angle = (angle / 180) * Math.PI;

			var cosAngle:Number = Math.cos(angle);
			var sinAngle:Number = Math.sin(angle);

			var labelRadiusX:Number = labelBounds.width / 2;
			var labelRadiusY:Number = labelBounds.height / 2;
			var labelX:Number = labelRadiusX * cosAngle;
			var labelY:Number = labelRadiusY * sinAngle;
			var labelRadius:Number = Math.sqrt(labelX * labelX + labelY * labelY);

			if (radius < 0)
				radius += labelRadius;
			else
				radius -= labelRadius;

			labelBounds.x = x + radius * cosAngle - labelRadiusX;
			labelBounds.y = y + radius * sinAngle - labelRadiusY;

			// place label at snapped position
			label.x = Math.round(labelBounds.x);
			label.y = Math.round(labelBounds.y);

			// trim labelBounds so overlap detection is less strict
			if (labelBounds.width > 4)
			{
				labelBounds.x += 2;
				labelBounds.width -= 4;
			}
			if (labelBounds.height > 4)
			{
				labelBounds.y += 2;
				labelBounds.height -= 4;
			}

			return labelBounds;
		}

		private function _updateNeedle(needle:Needle, brush:IBrush, shape:IShape, x:Number, y:Number, radius1:Number, radius2:Number, thickness:Number, startAngle:Number, arcAngle:Number, position:Number) : void
		{
			var graphics:Graphics = needle.graphics;
			graphics.clear();

			if (!brush)
				brush = new SolidFillBrush(0x000000);

			if (!shape)
				shape = new RectangleShape();

			thickness /= 2;

			var x1:Number = radius1;
			var x2:Number = radius2;
			var y1:Number = -thickness;
			var y2:Number = thickness;

			shape.draw(graphics, x1, y1, x2 - x1, y2 - y1, brush);

			needle.x = x;
			needle.y = y;
			needle.startAngle = startAngle;
			needle.arcAngle = arcAngle;
			needle.position = position;

			needle.update();
		}

		private function _updateLayers(layers:Array = null) : void
		{
			var layerNames:Array = [ "background", "rangeBand", "minorTicks", "majorTicks", "labels", "value", "warning", "needle", "foreground" ];
			var layerSprites:Array = [ this._background, this._rangeBand, this._minorTicks, this._majorTicks, this._labelsContainer, this._valueLabel, this._warningLight, this._needle, this._foreground ];

			var layerName:String;
			var layerSprite:DisplayObject;
			var index:int;

			for each (layerName in layers)
			{
				index = layerNames.indexOf(layerName);
				if (index >= 0)
				{
					layerNames.splice(index, 1);
					layerNames.push(layerName);

					layerSprite = layerSprites[index];
					layerSprites.splice(index, 1);
					layerSprites.push(layerSprite);
				}
			}

			for each (layerSprite in layerSprites)
				this.addChild(layerSprite);
		}

		private function _computeTickPositions(minimum:Number, maximum:Number, majorUnit:Number, minorUnit:Number, majorTickValues:Array, majorTickPositions:Array, minorTickPositions:Array) : void
		{
			var maxMajorUnits:int = 50;
			var maxMinorUnits:int = 20;

			var range:Number = maximum - minimum;
			if ((range != range) || (range <= 0) || (range == Infinity))
				return;

			// get majorUnit, compute auto units if necessary
			if (majorUnit != majorUnit)
				majorUnit = this._computeAutoUnits(range);

			// verify majorUnit is between zero and infinity
			if ((majorUnit <= 0) || (majorUnit == Infinity))
				return;

			// scale majorUnit if numMajorUnits is greater than maxMajorUnits
			var numMajorUnits:Number = 1 + Math.floor(range / majorUnit);
			majorUnit *= Math.ceil(numMajorUnits / maxMajorUnits);

			// compute major positions
			var majorTick:Number = Math.round(minimum / majorUnit);
			var majorValue:Number;
			while (true)
			{
				majorValue = majorUnit * majorTick;
				if (NumberUtil.approxLessThanOrEqual(majorValue, maximum))
				{
					if (NumberUtil.approxGreaterThanOrEqual(majorValue, minimum))
					{
						majorTickValues.push(majorValue);
						majorTickPositions.push((majorValue - minimum) / range);
					}
				}
				else
				{
					break;
				}
				majorTick++;
			}

			// get minorUnit, compute auto units if necessary
			if (minorUnit != minorUnit)
				minorUnit = this._computeAutoUnits(majorUnit);

			// verify minorUnit is between zero and majorUnit
			if ((minorUnit <= 0) || (minorUnit >= majorUnit))
				return;

			// scale minorUnit if numMinorUnits is greater than maxMinorUnits
			var numMinorUnits:Number = 1 + Math.floor(majorUnit / minorUnit);
			minorUnit *= Math.ceil(numMinorUnits / maxMinorUnits);

			// compute minor positions
			var minorTick:Number = Math.round(minimum / minorUnit);
			var minorValue:Number;
			while (true)
			{
				minorValue = minorUnit * minorTick;
				if (NumberUtil.approxLessThanOrEqual(minorValue, maximum))
				{
					if (NumberUtil.approxGreaterThanOrEqual(minorValue, minimum))
					{
						majorValue = Math.round(minorValue / majorUnit) * majorUnit;
						if (!NumberUtil.approxEqual(minorValue, majorValue))
							minorTickPositions.push((minorValue - minimum) / range);
					}
				}
				else
				{
					break;
				}
				minorTick++;
			}
		}

		private function _computeAutoUnits(range:Number) : Number
		{
			var significand:Number = range / 10;
			var exponent:Number = 0;

			if (significand > 0)
			{
				var str:String = significand.toExponential(20);
				var eIndex:int = str.indexOf("e");
				if (eIndex >= 0)
				{
					significand = Number(str.substring(0, eIndex));
					exponent = Number(str.substring(eIndex + 1, str.length));
				}
			}

			significand = Math.ceil(significand);

			if (significand > 5)
				significand = 10;
			else if (significand > 2)
				significand = 5;

			return significand * Math.pow(10, exponent);
		}

		private function _numericFormat(value:Number) : String
		{
			return String(Math.round(value * 100) / 100);
		}

		private function _percentageFormat(value:Number) : String
		{
			return this._numericFormat(value) + "%";
		}

	}

}

import com.jasongatt.utils.NumberUtil;
import flash.display.Shape;
import flash.events.Event;

class Needle extends Shape
{

	// Public Properties

	public var startAngle:Number = 0;
	public var arcAngle:Number = 0;
	public var position:Number = 0;

	// Private Properties

	private var _currentPosition:Number = 0;
	private var _isAnimating:Boolean = false;

	// Constructor

	public function Needle()
	{
	}

	// Public Methods

	public function update() : void
	{
		var startAngle:Number = this.startAngle;
		var arcAngle:Number = this.arcAngle;
		var position:Number = this.position;

		var isPegged:Boolean = (position < 0) || (position > 1);

		if (!isPegged && NumberUtil.approxEqual(this._currentPosition, position, 0.001))
		{
			this._currentPosition = position;

			if (this._isAnimating)
			{
				this._isAnimating = false;
				this.removeEventListener(Event.ENTER_FRAME, this._self_enterFrame);
			}
		}
		else if (!this._isAnimating)
		{
			this._isAnimating = true;
			this.addEventListener(Event.ENTER_FRAME, this._self_enterFrame);
		}

		this.rotation = startAngle + arcAngle * NumberUtil.minMax(this._currentPosition, 0, 1);

		if (isPegged)
		{
			var r:Number = 10 * Math.random();
			if (position < 0)
				r *= -1;
			if (arcAngle < 0)
				r *= -1;
			this.rotation += r;
		}
	}

	// Private Methods

	private function _self_enterFrame(e:Event) : void
	{
		this._currentPosition += (this.position - this._currentPosition) * 0.5;

		this.update();
	}

}

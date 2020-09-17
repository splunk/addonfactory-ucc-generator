package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.DrawingUtils;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.EllipseShape;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
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
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class FillerGauge extends AbstractChart
	{

		// Private Properties

		private var _orientation:ObservableProperty;
		private var _fillerBrushPalette:ObservableProperty;
		private var _fillerStyle:ObservableProperty;
		private var _fillerPlacement1:ObservableProperty;
		private var _fillerPlacement2:ObservableProperty;
		private var _rangeValues:ObservableProperty;
		private var _rangePadding:ObservableProperty;
		private var _majorTickBrush:ObservableProperty;
		private var _majorTickStyle:ObservableProperty;
		private var _majorTickPlacement1:ObservableProperty;
		private var _majorTickPlacement2:ObservableProperty;
		private var _majorUnit:ObservableProperty;
		private var _minorTickBrush:ObservableProperty;
		private var _minorTickStyle:ObservableProperty;
		private var _minorTickPlacement1:ObservableProperty;
		private var _minorTickPlacement2:ObservableProperty;
		private var _minorUnit:ObservableProperty;
		private var _labelStyle:ObservableProperty;
		private var _labelPlacement:ObservableProperty;
		private var _labelFormat:ObservableProperty;
		private var _valueStyle:ObservableProperty;
		private var _valuePlacement:ObservableProperty;
		private var _valueFormat:ObservableProperty;
		private var _warningBrush:ObservableProperty;
		private var _warningShape:ObservableProperty;
		private var _warningStyle:ObservableProperty;
		private var _warningPlacement:ObservableProperty;
		private var _warningSize:ObservableProperty;
		private var _foregroundBrush:ObservableProperty;
		private var _foregroundStyle:ObservableProperty;
		private var _foregroundPlacement1:ObservableProperty;
		private var _foregroundPlacement2:ObservableProperty;
		private var _foregroundPadding:ObservableProperty;
		private var _backgroundBrush:ObservableProperty;
		private var _backgroundStyle:ObservableProperty;
		private var _backgroundPlacement1:ObservableProperty;
		private var _backgroundPlacement2:ObservableProperty;
		private var _backgroundPadding:ObservableProperty;
		private var _layers:ObservableProperty;
		private var _usePercentageRange:ObservableProperty;
		private var _usePercentageValue:ObservableProperty;
		private var _showMajorTicks:ObservableProperty;
		private var _showMinorTicks:ObservableProperty;
		private var _showLabels:ObservableProperty;
		private var _showValue:ObservableProperty;

		private var _fillerValue:Number;
		private var _fillerPosition:Number;
		private var _rangeFields:Array;
		private var _rangePositions:Array;
		private var _majorTickValues:Array;
		private var _majorTickPositions:Array;
		private var _minorTickPositions:Array;
		private var _labels:Array;

		private var _foreground:Shape;
		private var _valueLabel:Label;
		private var _filler:Filler;
		private var _warningLight:Shape;
		private var _labelsContainer:Sprite;
		private var _majorTicks:Shape;
		private var _minorTicks:Shape;
		private var _background:Shape;

		// Constructor

		public function FillerGauge()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0x00FF00, 0xFFFF00, 0xFF0000 ], true);

			this._orientation = new ObservableProperty(this, "orientation", String, Orientation.Y, this.invalidates(LayoutSprite.MEASURE));
			this._fillerBrushPalette = new ObservableProperty(this, "fillerBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette), this.invalidates(AbstractChart.RENDER_CHART));
			this._fillerStyle = new ObservableProperty(this, "fillerStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._fillerPlacement1 = new ObservableProperty(this, "fillerPlacement1", Number, -20, this.invalidates(AbstractChart.RENDER_CHART));
			this._fillerPlacement2 = new ObservableProperty(this, "fillerPlacement2", Number, 20, this.invalidates(AbstractChart.RENDER_CHART));
			this._rangeValues = new ObservableProperty(this, "rangeValues", Array, null, this.invalidates(AbstractChart.PROCESS_DATA));
			this._rangePadding = new ObservableProperty(this, "rangePadding", Number, 20, this.invalidates(LayoutSprite.MEASURE));
			this._majorTickBrush = new ObservableProperty(this, "majorTickBrush", IBrush, new SolidStrokeBrush(1, 0x000000), this.invalidates(AbstractChart.RENDER_CHART));
			this._majorTickStyle = new ObservableProperty(this, "majorTickStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._majorTickPlacement1 = new ObservableProperty(this, "majorTickPlacement1", Number, 20, this.invalidates(AbstractChart.RENDER_CHART));
			this._majorTickPlacement2 = new ObservableProperty(this, "majorTickPlacement2", Number, 40, this.invalidates(AbstractChart.RENDER_CHART));
			this._majorUnit = new ObservableProperty(this, "majorUnit", Number, NaN, this.invalidates(AbstractChart.PROCESS_DATA));
			this._minorTickBrush = new ObservableProperty(this, "minorTickBrush", IBrush, new SolidStrokeBrush(1, 0x000000), this.invalidates(AbstractChart.RENDER_CHART));
			this._minorTickStyle = new ObservableProperty(this, "minorTickStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._minorTickPlacement1 = new ObservableProperty(this, "minorTickPlacement1", Number, 20, this.invalidates(AbstractChart.RENDER_CHART));
			this._minorTickPlacement2 = new ObservableProperty(this, "minorTickPlacement2", Number, 30, this.invalidates(AbstractChart.RENDER_CHART));
			this._minorUnit = new ObservableProperty(this, "minorUnit", Number, NaN, this.invalidates(AbstractChart.PROCESS_DATA));
			this._labelStyle = new ObservableProperty(this, "labelStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._labelPlacement = new ObservableProperty(this, "labelPlacement", Number, 40, this.invalidates(LayoutSprite.MEASURE));
			this._labelFormat = new ObservableProperty(this, "labelFormat", Function, null, this.invalidates(LayoutSprite.MEASURE));
			this._valueStyle = new ObservableProperty(this, "valueStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._valuePlacement = new ObservableProperty(this, "valuePlacement", Number, -20, this.invalidates(LayoutSprite.MEASURE));
			this._valueFormat = new ObservableProperty(this, "valueFormat", Function, null, this.invalidates(LayoutSprite.MEASURE));
			this._warningBrush = new ObservableProperty(this, "warningBrush", IBrush, new SolidFillBrush(0xFF0000), this.invalidates(AbstractChart.RENDER_CHART));
			this._warningShape = new ObservableProperty(this, "warningShape", IShape, new EllipseShape(), this.invalidates(AbstractChart.RENDER_CHART));
			this._warningStyle = new ObservableProperty(this, "warningStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._warningPlacement = new ObservableProperty(this, "warningPlacement", Number, 70, this.invalidates(AbstractChart.RENDER_CHART));
			this._warningSize = new ObservableProperty(this, "warningSize", Number, 20, this.invalidates(AbstractChart.RENDER_CHART));
			this._foregroundBrush = new ObservableProperty(this, "foregroundBrush", IBrush, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._foregroundStyle = new ObservableProperty(this, "foregroundStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._foregroundPlacement1 = new ObservableProperty(this, "foregroundPlacement1", Number, -20, this.invalidates(AbstractChart.RENDER_CHART));
			this._foregroundPlacement2 = new ObservableProperty(this, "foregroundPlacement2", Number, 20, this.invalidates(AbstractChart.RENDER_CHART));
			this._foregroundPadding = new ObservableProperty(this, "foregroundPadding", Number, 20, this.invalidates(AbstractChart.RENDER_CHART));
			this._backgroundBrush = new ObservableProperty(this, "backgroundBrush", IBrush, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._backgroundStyle = new ObservableProperty(this, "backgroundStyle", Style, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._backgroundPlacement1 = new ObservableProperty(this, "backgroundPlacement1", Number, -20, this.invalidates(AbstractChart.RENDER_CHART));
			this._backgroundPlacement2 = new ObservableProperty(this, "backgroundPlacement2", Number, 20, this.invalidates(AbstractChart.RENDER_CHART));
			this._backgroundPadding = new ObservableProperty(this, "backgroundPadding", Number, 20, this.invalidates(AbstractChart.RENDER_CHART));
			this._layers = new ObservableProperty(this, "layers", Array, new Array(), this.invalidates(AbstractChart.RENDER_CHART));
			this._usePercentageRange = new ObservableProperty(this, "usePercentageRange", Boolean, false, this.invalidates(AbstractChart.PROCESS_DATA));
			this._usePercentageValue = new ObservableProperty(this, "usePercentageValue", Boolean, false, this.invalidates(AbstractChart.PROCESS_DATA));
			this._showMajorTicks = new ObservableProperty(this, "showMajorTicks", Boolean, true, this.invalidates(AbstractChart.RENDER_CHART));
			this._showMinorTicks = new ObservableProperty(this, "showMinorTicks", Boolean, true, this.invalidates(AbstractChart.RENDER_CHART));
			this._showLabels = new ObservableProperty(this, "showLabels", Boolean, true, this.invalidates(LayoutSprite.MEASURE));
			this._showValue = new ObservableProperty(this, "showValue", Boolean, true, this.invalidates(LayoutSprite.MEASURE));

			this._fillerValue = 0;
			this._fillerPosition = 0;
			this._rangeFields = new Array();
			this._rangePositions = new Array();
			this._majorTickValues = new Array();
			this._majorTickPositions = new Array();
			this._minorTickPositions = new Array();
			this._labels = new Array();

			this._foreground = new Shape();
			this._valueLabel = new Label();
			this._filler = new Filler();
			this._warningLight = new Shape();
			this._labelsContainer = new Sprite();
			this._labelsContainer.mouseEnabled = false;
			this._majorTicks = new Shape();
			this._minorTicks = new Shape();
			this._background = new Shape();

			this._updateLayers();

			this.invalidate(AbstractChart.PROCESS_DATA);
		}

		// Public Getters/Setters

		public function get orientation() : String
		{
			return this._orientation.value;
		}
		public function set orientation(value:String) : void
		{
			switch (value)
			{
				case Orientation.X:
				case Orientation.Y:
					break;
				default:
					value = Orientation.Y;
					break;
			}
			this._orientation.value = value;
		}

		public function get fillerBrushPalette() : IBrushPalette
		{
			return this._fillerBrushPalette.value;
		}
		public function set fillerBrushPalette(value:IBrushPalette) : void
		{
			this._fillerBrushPalette.value = value;
		}

		public function get fillerStyle() : Style
		{
			return this._fillerStyle.value;
		}
		public function set fillerStyle(value:Style) : void
		{
			this._fillerStyle.value = value;
		}

		public function get fillerPlacement1() : Number
		{
			return this._fillerPlacement1.value;
		}
		public function set fillerPlacement1(value:Number) : void
		{
			this._fillerPlacement1.value = value;
		}

		public function get fillerPlacement2() : Number
		{
			return this._fillerPlacement2.value;
		}
		public function set fillerPlacement2(value:Number) : void
		{
			this._fillerPlacement2.value = value;
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

		public function get rangePadding() : Number
		{
			return this._rangePadding.value;
		}
		public function set rangePadding(value:Number) : void
		{
			this._rangePadding.value = value;
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

		public function get majorTickPlacement1() : Number
		{
			return this._majorTickPlacement1.value;
		}
		public function set majorTickPlacement1(value:Number) : void
		{
			this._majorTickPlacement1.value = value;
		}

		public function get majorTickPlacement2() : Number
		{
			return this._majorTickPlacement2.value;
		}
		public function set majorTickPlacement2(value:Number) : void
		{
			this._majorTickPlacement2.value = value;
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

		public function get minorTickPlacement1() : Number
		{
			return this._minorTickPlacement1.value;
		}
		public function set minorTickPlacement1(value:Number) : void
		{
			this._minorTickPlacement1.value = value;
		}

		public function get minorTickPlacement2() : Number
		{
			return this._minorTickPlacement2.value;
		}
		public function set minorTickPlacement2(value:Number) : void
		{
			this._minorTickPlacement2.value = value;
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

		public function get labelPlacement() : Number
		{
			return this._labelPlacement.value;
		}
		public function set labelPlacement(value:Number) : void
		{
			this._labelPlacement.value = value;
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

		public function get valuePlacement() : Number
		{
			return this._valuePlacement.value;
		}
		public function set valuePlacement(value:Number) : void
		{
			this._valuePlacement.value = value;
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

		public function get warningPlacement() : Number
		{
			return this._warningPlacement.value;
		}
		public function set warningPlacement(value:Number) : void
		{
			this._warningPlacement.value = value;
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

		public function get foregroundPlacement1() : Number
		{
			return this._foregroundPlacement1.value;
		}
		public function set foregroundPlacement1(value:Number) : void
		{
			this._foregroundPlacement1.value = value;
		}

		public function get foregroundPlacement2() : Number
		{
			return this._foregroundPlacement2.value;
		}
		public function set foregroundPlacement2(value:Number) : void
		{
			this._foregroundPlacement2.value = value;
		}

		public function get foregroundPadding() : Number
		{
			return this._foregroundPadding.value;
		}
		public function set foregroundPadding(value:Number) : void
		{
			this._foregroundPadding.value = value;
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

		public function get backgroundPlacement1() : Number
		{
			return this._backgroundPlacement1.value;
		}
		public function set backgroundPlacement1(value:Number) : void
		{
			this._backgroundPlacement1.value = value;
		}

		public function get backgroundPlacement2() : Number
		{
			return this._backgroundPlacement2.value;
		}
		public function set backgroundPlacement2(value:Number) : void
		{
			this._backgroundPlacement2.value = value;
		}

		public function get backgroundPadding() : Number
		{
			return this._backgroundPadding.value;
		}
		public function set backgroundPadding(value:Number) : void
		{
			this._backgroundPadding.value = value;
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

			var fillerValue:Number = NaN;
			var fillerPosition:Number = 0;
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
					fillerValue = NumberUtil.parseNumber(data.getValue(0, 0));

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

			if (fillerValue != fillerValue)
				fillerValue = minimumValue;

			fillerPosition = (fillerValue - minimumValue) / range;

			for each (value in rangeValues)
				rangePositions.push((value - minimumValue) / range);

			if (usePercentageValue)
				fillerValue = fillerPosition * 100;

			if (usePercentageRange)
			{
				minimumValue = 0;
				maximumValue = 100;
			}

			this._computeTickPositions(minimumValue, maximumValue, majorUnit, minorUnit, majorTickValues, majorTickPositions, minorTickPositions);

			this._fillerValue = fillerValue;
			this._fillerPosition = fillerPosition;
			this._rangeFields = rangeFields;
			this._rangePositions = rangePositions;
			this._majorTickValues = majorTickValues;
			this._majorTickPositions = majorTickPositions;
			this._minorTickPositions = minorTickPositions;
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var orientation:String = this._orientation.value;
			var rangePadding:Number = this._rangePadding.value;
			var labelStyle:Style = this._labelStyle.value;
			var labelPlacement:Number = this._labelPlacement.value;
			var labelFormat:Function = this._labelFormat.value;
			var valueStyle:Style = this._valueStyle.value;
			var valuePlacement:Number = this._valuePlacement.value;
			var valueFormat:Function = this._valueFormat.value;
			var usePercentageRange:Number = this._usePercentageRange.value;
			var usePercentageValue:Number = this._usePercentageValue.value;
			var showLabels:Boolean = this._showLabels.value;
			var showValue:Boolean = this._showValue.value;

			var fillerValue:Number = this._fillerValue;
			var majorTickValues:Array = this._majorTickValues;
			var majorTickPositions:Array = this._majorTickPositions;

			var childSize:Size = new Size();

			// labels

			var numTickValues:int = Math.min(majorTickValues.length, majorTickPositions.length);
			var labelsContainer:Sprite = this._labelsContainer;
			var labels:Array = this._labels;
			var numLabels:int = labels.length;
			var label:Label;
			var i:int;

			if (numTickValues > 1)
			{
				var position0:Number = majorTickPositions[0];
				var position1:Number = majorTickPositions[1];
				var dt:Number = position1 - position0;

				if (orientation == Orientation.X)
				{
					rangePadding = Math.min(rangePadding, availableSize.width / 2);

					childSize.width = (availableSize.width - rangePadding * 2) * dt;
					if (labelPlacement < 0)
						childSize.height = Math.max(availableSize.height / 2 + labelPlacement, 0);
					else
						childSize.height = Math.max(availableSize.height / 2 - labelPlacement, 0);
				}
				else
				{
					rangePadding = Math.min(rangePadding, availableSize.height / 2);

					childSize.height = (availableSize.height - rangePadding * 2) * dt;
					if (labelPlacement < 0)
						childSize.width = Math.max(availableSize.width / 2 + labelPlacement, 0);
					else
						childSize.width = Math.max(availableSize.width / 2 - labelPlacement, 0);
				}

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
			}

			for (i = labels.length - 1; i >= numTickValues; i--)
			{
				label = labels.pop();
				labelsContainer.removeChild(label);
			}

			// value

			var valueLabel:Label = this._valueLabel;

			if (orientation == Orientation.X)
			{
				childSize.width = availableSize.width / 2;
				if (valuePlacement < 0)
					childSize.height = Math.max(availableSize.height / 2 + valuePlacement, 0);
				else
					childSize.height = Math.max(availableSize.height / 2 - valuePlacement, 0);
			}
			else
			{
				childSize.height = availableSize.height / 2;
				if (valuePlacement < 0)
					childSize.width = Math.max(availableSize.width / 2 + valuePlacement, 0);
				else
					childSize.width = Math.max(availableSize.width / 2 - valuePlacement, 0);
			}

			if (valueFormat == null)
				valueFormat = usePercentageValue ? this._percentageFormat : this._numericFormat;

			valueLabel.text = valueFormat(fillerValue);
			Style.applyStyle(valueLabel, valueStyle);
			valueLabel.visibility = showValue ? Visibility.VISIBLE : Visibility.COLLAPSED;
			valueLabel.measure(childSize);

			return super.measureOverride(availableSize);
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var orientation:String = this._orientation.value;
			var fillerBrushPalette:IBrushPalette = this._fillerBrushPalette.value;
			var fillerStyle:Style = this._fillerStyle.value;
			var fillerPlacement1:Number = this._fillerPlacement1.value;
			var fillerPlacement2:Number = this._fillerPlacement2.value;
			var rangePadding:Number = this._rangePadding.value;
			var majorTickBrush:IBrush = this._majorTickBrush.value;
			var majorTickStyle:Style = this._majorTickStyle.value;
			var majorTickPlacement1:Number = this._majorTickPlacement1.value;
			var majorTickPlacement2:Number = this._majorTickPlacement2.value;
			var minorTickBrush:IBrush = this._minorTickBrush.value;
			var minorTickStyle:Style = this._minorTickStyle.value;
			var minorTickPlacement1:Number = this._minorTickPlacement1.value;
			var minorTickPlacement2:Number = this._minorTickPlacement2.value;
			var labelPlacement:Number = this._labelPlacement.value;
			var valuePlacement:Number = this._valuePlacement.value;
			var warningBrush:IBrush = this._warningBrush.value;
			var warningShape:IShape = this._warningShape.value;
			var warningStyle:Style = this._warningStyle.value;
			var warningPlacement:Number = this._warningPlacement.value;
			var warningSize:Number = this._warningSize.value;
			var foregroundBrush:IBrush = this._foregroundBrush.value;
			var foregroundStyle:Style = this._foregroundStyle.value;
			var foregroundPlacement1:Number = this._foregroundPlacement1.value;
			var foregroundPlacement2:Number = this._foregroundPlacement2.value;
			var foregroundPadding:Number = this._foregroundPadding.value;
			var backgroundBrush:IBrush = this._backgroundBrush.value;
			var backgroundStyle:Style = this._backgroundStyle.value;
			var backgroundPlacement1:Number = this._backgroundPlacement1.value;
			var backgroundPlacement2:Number = this._backgroundPlacement2.value;
			var backgroundPadding:Number = this._backgroundPadding.value;
			var layers:Array = this._layers.value;
			var showMajorTicks:Boolean = this._showMajorTicks.value;
			var showMinorTicks:Boolean = this._showMinorTicks.value;

			var fillerPosition:Number = this._fillerPosition;
			var rangeFields:Array = this._rangeFields;
			var rangePositions:Array = this._rangePositions;
			var majorTickPositions:Array = this._majorTickPositions;
			var minorTickPositions:Array = this._minorTickPositions;

			var graphics:Graphics;

			// minor ticks

			graphics = this._minorTicks.graphics;
			graphics.clear();

			if (showMinorTicks)
			{
				this._drawTicks(graphics, minorTickBrush, orientation, rangePadding, chartWidth, chartHeight, minorTickPlacement1, minorTickPlacement2, minorTickPositions);
				if (!showMajorTicks)
					this._drawTicks(graphics, minorTickBrush, orientation, rangePadding, chartWidth, chartHeight, minorTickPlacement1, minorTickPlacement2, majorTickPositions);
			}

			Style.applyStyle(this._minorTicks, minorTickStyle);

			// major ticks

			graphics = this._majorTicks.graphics;
			graphics.clear();

			if (showMajorTicks)
				this._drawTicks(graphics, majorTickBrush, orientation, rangePadding, chartWidth, chartHeight, majorTickPlacement1, majorTickPlacement2, majorTickPositions);

			Style.applyStyle(this._majorTicks, majorTickStyle);

			// labels

			this._placeLabels(this._labels, orientation, rangePadding, chartWidth, chartHeight, labelPlacement, majorTickPositions);

			// value

			this._placeLabel(this._valueLabel, orientation, rangePadding, chartWidth, chartHeight, valuePlacement, fillerPosition);

			// warning light

			graphics = this._warningLight.graphics;
			graphics.clear();

			this._drawWarningLight(graphics, warningBrush, warningShape, orientation, rangePadding, chartWidth, chartHeight, warningPlacement, warningSize, fillerPosition);

			Style.applyStyle(this._warningLight, warningStyle);

			// filler

			this._updateFiller(this._filler, fillerBrushPalette, orientation, rangePadding, chartWidth, chartHeight, fillerPlacement1, fillerPlacement2, rangePositions, rangeFields, fillerPosition);

			Style.applyStyle(this._filler, fillerStyle);

			// foreground

			graphics = this._foreground.graphics;
			graphics.clear();

			this._drawLayer(graphics, foregroundBrush, orientation, chartWidth, chartHeight, foregroundPlacement1, foregroundPlacement2, foregroundPadding);

			Style.applyStyle(this._foreground, foregroundStyle);

			// background

			graphics = this._background.graphics;
			graphics.clear();

			this._drawLayer(graphics, backgroundBrush, orientation, chartWidth, chartHeight, backgroundPlacement1, backgroundPlacement2, backgroundPadding);

			Style.applyStyle(this._background, backgroundStyle);

			// layers

			this._updateLayers(layers);
		}

		// Private Methods

		private function _drawTicks(graphics:Graphics, brush:IBrush, orientation:String, rangePadding:Number, chartWidth:Number, chartHeight:Number, placement1:Number, placement2:Number, tickPositions:Array) : void
		{
			if (!brush)
				brush = new SolidStrokeBrush(1, 0x000000);

			var position:Number;
			var x1:Number;
			var y1:Number;
			var x2:Number;
			var y2:Number;
			var matrix:Matrix;
			var brushBounds:Array;

			if (orientation == Orientation.X)
			{
				rangePadding = Math.min(rangePadding, chartWidth / 2);
				chartWidth -= rangePadding * 2;

				x1 = Math.round(rangePadding);
				x2 = Math.round(rangePadding + chartWidth);
				y1 = Math.round(chartHeight / 2 + placement1);
				y2 = Math.round(chartHeight / 2 + placement2);

				matrix = new Matrix(0, 1, -1, 0);

				brushBounds = [ new Point(x1, y1), new Point(x2, y1), new Point(x2, y2), new Point(x1, y2) ];

				for each (position in tickPositions)
				{
					x1 = x2 = Math.round(rangePadding + chartWidth * position);

					brush.beginBrush(graphics, matrix, brushBounds);
					brush.moveTo(x1, y1);
					brush.lineTo(x2, y2);
					brush.endBrush();
				}
			}
			else
			{
				rangePadding = Math.min(rangePadding, chartHeight / 2);
				chartHeight -= rangePadding * 2;

				x1 = Math.round(chartWidth / 2 + placement1);
				x2 = Math.round(chartWidth / 2 + placement2);
				y1 = Math.round(rangePadding);
				y2 = Math.round(rangePadding + chartHeight);

				brushBounds = [ new Point(x1, y1), new Point(x2, y1), new Point(x2, y2), new Point(x1, y2) ];

				for each (position in tickPositions)
				{
					y1 = y2 = Math.round(rangePadding + chartHeight * (1 - position));

					brush.beginBrush(graphics, null, brushBounds);
					brush.moveTo(x1, y1);
					brush.lineTo(x2, y2);
					brush.endBrush();
				}
			}
		}

		private function _drawWarningLight(graphics:Graphics, brush:IBrush, shape:IShape, orientation:String, rangePadding:Number, chartWidth:Number, chartHeight:Number, placement:Number, size:Number, position:Number) : void
		{
			if ((position >= 0) && (position <= 1))
				return;

			if (!brush)
				brush = new SolidFillBrush(0x000000);

			if (!shape)
				shape = new EllipseShape();

			size /= 2;

			if (placement < 0)
				placement -= size;
			else
				placement += size;

			var x:Number;
			var y:Number;
			if (orientation == Orientation.X)
			{
				rangePadding = Math.min(rangePadding, chartWidth / 2);

				x = (position < 0) ? Math.round(rangePadding) : Math.round(chartWidth - rangePadding);
				y = Math.round(chartHeight / 2 + placement);
			}
			else
			{
				rangePadding = Math.min(rangePadding, chartHeight / 2);

				x = Math.round(chartWidth / 2 + placement);
				y = (position < 0) ? Math.round(chartHeight - rangePadding) : Math.round(rangePadding);
			}

			var x1:Number = Math.round(x - size);
			var x2:Number = Math.round(x + size);
			var y1:Number = Math.round(y - size);
			var y2:Number = Math.round(y + size);

			shape.draw(graphics, x1, y1, x2 - x1, y2 - y1, brush);
		}

		private function _drawLayer(graphics:Graphics, brush:IBrush, orientation:String, chartWidth:Number, chartHeight:Number, placement1:Number, placement2:Number, padding:Number) : void
		{
			if (!brush)
				return;

			var x1:Number;
			var y1:Number;
			var x2:Number;
			var y2:Number;
			var matrix:Matrix;

			if (orientation == Orientation.X)
			{
				padding = Math.min(padding, chartWidth / 2);

				x1 = Math.round(padding);
				x2 = Math.round(chartWidth - padding);
				y1 = Math.round(chartHeight / 2 + placement1);
				y2 = Math.round(chartHeight / 2 + placement2);

				matrix = new Matrix(0, 1, -1, 0);
			}
			else
			{
				padding = Math.min(padding, chartHeight / 2);

				x1 = Math.round(chartWidth / 2 + placement1);
				x2 = Math.round(chartWidth / 2 + placement2);
				y1 = Math.round(padding);
				y2 = Math.round(chartHeight - padding);
			}

			brush.beginBrush(graphics, matrix);
			DrawingUtils.drawRectangle(brush, x1, y1, x2 - x1, y2 - y1);
			brush.endBrush();
		}

		private function _placeLabels(labels:Array, orientation:String, rangePadding:Number, chartWidth:Number, chartHeight:Number, placement:Number, positions:Array) : void
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
				labelBounds[i] = this._placeLabel(label, orientation, rangePadding, chartWidth, chartHeight, placement, position);
			}

			// compute numOverlaps
			for (i = 0; i < numLabels; i++)
			{
				bounds1 = labelBounds[i];
				for (j = i + 1; j < numLabels; j++)
				{
					bounds2 = labelBounds[j];
					if (!bounds2.intersects(bounds1))
						break;
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

		private function _placeLabel(label:Label, orientation:String, rangePadding:Number, chartWidth:Number, chartHeight:Number, placement:Number, position:Number) : Rectangle
		{
			var labelBounds:Rectangle = new Rectangle(0, 0, label.measuredWidth, label.measuredHeight);

			if (orientation == Orientation.X)
			{
				rangePadding = Math.min(rangePadding, chartWidth / 2);
				chartWidth -= rangePadding * 2;

				labelBounds.x = rangePadding + chartWidth * position - labelBounds.width / 2;
				if (placement > 0)
					labelBounds.y = chartHeight / 2 + placement;
				else if (placement < 0)
					labelBounds.y = chartHeight / 2 + placement - labelBounds.height;
				else
					labelBounds.y = (chartHeight - labelBounds.height) / 2;
			}
			else
			{
				rangePadding = Math.min(rangePadding, chartHeight / 2);
				chartHeight -= rangePadding * 2;

				labelBounds.y = rangePadding + chartHeight * (1 - position) - labelBounds.height / 2;
				if (placement > 0)
					labelBounds.x = chartWidth / 2 + placement;
				else if (placement < 0)
					labelBounds.x = chartWidth / 2 + placement - labelBounds.width;
				else
					labelBounds.x = (chartWidth - labelBounds.width) / 2;
			}

			// place label at snapped position
			label.x = Math.round(labelBounds.x);
			label.y = Math.round(labelBounds.y);

			return labelBounds;
		}

		private function _updateFiller(filler:Filler, brushPalette:IBrushPalette, orientation:String, rangePadding:Number, chartWidth:Number, chartHeight:Number, placement1:Number, placement2:Number, rangePositions:Array, rangeFields:Array, position:Number) : void
		{
			filler.label = this._valueLabel;
			filler.brushPalette = brushPalette;
			filler.orientation = orientation;
			filler.rangePadding = rangePadding;
			filler.chartWidth = chartWidth;
			filler.chartHeight = chartHeight;
			filler.placement1 = placement1;
			filler.placement2 = placement2;
			filler.rangePositions = rangePositions;
			filler.rangeFields = rangeFields;
			filler.position = position;

			filler.update();
		}

		private function _updateLayers(layers:Array = null) : void
		{
			var layerNames:Array = [ "background", "minorTicks", "majorTicks", "labels", "warning", "filler", "value", "foreground" ];
			var layerSprites:Array = [ this._background, this._minorTicks, this._majorTicks, this._labelsContainer, this._warningLight, this._filler, this._valueLabel, this._foreground ];

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

import com.jasongatt.graphics.brushes.DrawingUtils;
import com.jasongatt.graphics.brushes.IBrush;
import com.jasongatt.graphics.brushes.SolidFillBrush;
import com.jasongatt.layout.Orientation;
import com.jasongatt.utils.NumberUtil;
import com.splunk.controls.Label;
import com.splunk.palettes.brush.IBrushPalette;
import flash.display.Graphics;
import flash.display.Shape;
import flash.events.Event;
import flash.geom.Matrix;
import flash.geom.Point;

class Filler extends Shape
{

	// Public Properties

	public var label:Label;
	public var brushPalette:IBrushPalette;
	public var orientation:String;
	public var rangePadding:Number;
	public var chartWidth:Number;
	public var chartHeight:Number;
	public var placement1:Number;
	public var placement2:Number;
	public var rangePositions:Array;
	public var rangeFields:Array;
	public var position:Number;

	// Private Properties

	private var _currentPosition:Number = 0;
	private var _isAnimating:Boolean = false;

	// Constructor

	public function Filler()
	{
	}

	// Public Methods

	public function update() : void
	{
		var label:Label = this.label;
		var brushPalette:IBrushPalette = this.brushPalette;
		var orientation:String = this.orientation;
		var rangePadding:Number = this.rangePadding;
		var chartWidth:Number = this.chartWidth;
		var chartHeight:Number = this.chartHeight;
		var placement1:Number = this.placement1;
		var placement2:Number = this.placement2;
		var rangePositions:Array = this.rangePositions;
		var rangeFields:Array = this.rangeFields;
		var position:Number = this.position;

		var numRangePositions:int = (rangePositions && rangeFields) ? Math.min(rangePositions.length, rangeFields.length) - 1 : 0;
		var brush:IBrush;
		var matrix:Matrix;
		var brushBounds:Array;
		var x1:Number;
		var y1:Number;
		var x2:Number;
		var y2:Number;

		if (NumberUtil.approxEqual(this._currentPosition, position, 0.001))
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

		if (orientation == Orientation.X)
		{
			rangePadding = Math.min(rangePadding, chartWidth / 2);
			chartWidth -= rangePadding * 2;

			x1 = Math.round(rangePadding);
			x2 = Math.round(rangePadding + chartWidth * NumberUtil.minMax(this._currentPosition, 0, 1));
			y1 = Math.round(chartHeight / 2 + placement1);
			y2 = Math.round(chartHeight / 2 + placement2);

			matrix = new Matrix(0, 1, -1, 0);

			brushBounds = [ new Point(x1, y1), new Point(Math.round(rangePadding + chartWidth), y1), new Point(Math.round(rangePadding + chartWidth), y2), new Point(x1, y2) ];

			if (label)
				label.x = Math.round(Math.max(x2 - label.measuredWidth, rangePadding));
		}
		else
		{
			rangePadding = Math.min(rangePadding, chartHeight / 2);
			chartHeight -= rangePadding * 2;

			x1 = Math.round(chartWidth / 2 + placement1);
			x2 = Math.round(chartWidth / 2 + placement2);
			y1 = Math.round(rangePadding + chartHeight * (1 - NumberUtil.minMax(this._currentPosition, 0, 1)));
			y2 = Math.round(rangePadding + chartHeight);

			brushBounds = [ new Point(x1, Math.round(rangePadding)), new Point(x2, Math.round(rangePadding)), new Point(x2, y2), new Point(x1, y2) ];

			if (label)
				label.y = Math.round(Math.min(y1, rangePadding + chartHeight - label.measuredHeight));
		}

		for (var i:int = 0; i < numRangePositions; i++)
		{
			if ((position < rangePositions[i + 1]) || (i == (numRangePositions - 1)))
			{
				brush = brushPalette ? brushPalette.getBrush(rangeFields[i], i, numRangePositions) : null;
				break;
			}
		}

		if (!brush)
			brush = new SolidFillBrush(0x000000);

		var graphics:Graphics = this.graphics;
		graphics.clear();

		brush.beginBrush(graphics, matrix, brushBounds);
		DrawingUtils.drawRectangle(brush, x1, y1, x2 - x1, y2 - y1);
		brush.endBrush();
	}

	// Private Methods

	private function _self_enterFrame(e:Event) : void
	{
		this._currentPosition += (this.position - this._currentPosition) * 0.5;

		this.update();
	}

}

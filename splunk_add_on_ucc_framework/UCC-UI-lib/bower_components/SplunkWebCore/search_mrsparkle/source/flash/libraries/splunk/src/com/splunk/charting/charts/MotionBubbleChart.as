package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.shapes.EllipseShape;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.UniformSizeShape;
	import com.jasongatt.motion.GroupTween;
	import com.jasongatt.motion.PropertyTween;
	import com.jasongatt.motion.TweenRunner;
	import com.jasongatt.utils.ArrayUtil;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.controls.Tooltip;
	import com.splunk.data.IDataTable;
	import com.splunk.palettes.brush.IBrushPalette;
	import com.splunk.palettes.brush.SolidFillBrushPalette;
	import com.splunk.palettes.color.ListColorPalette;
	import com.splunk.palettes.shape.IShapePalette;
	import com.splunk.palettes.shape.ListShapePalette;
	import com.splunk.utils.Style;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class MotionBubbleChart extends AbstractChart4D
	{

		// Private Properties

		private var _frame:ObservableProperty;
		private var _bubbleBrushPalette:ObservableProperty;
		private var _bubbleShapePalette:ObservableProperty;
		private var _bubbleStyle:ObservableProperty;
		private var _bubbleMinimumSize:ObservableProperty;
		private var _bubbleMaximumSize:ObservableProperty;

		private var _valueDatasW:Array;
		private var _valueDatasX:Array;
		private var _valueDatasY:Array;
		private var _valueDatasZ:Array;
		private var _valueSortComparator:ValueSortComparator;
		private var _valueSearchComparator:ValueSearchComparator;
		private var _isValueDatasValid:Boolean = true;
		private var _seriesSprites:Array;

		private var _seriesMask:Shape;
		private var _seriesContainer:Sprite;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function MotionBubbleChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);

			this._frame = new ObservableProperty(this, "frame", Object, null, this.invalidates(AbstractChart.RENDER_CHART));
			this._bubbleBrushPalette = new ObservableProperty(this, "bubbleBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._bubbleShapePalette = new ObservableProperty(this, "bubbleShapePalette", IShapePalette, new ListShapePalette([ new EllipseShape() ]), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._bubbleStyle = new ObservableProperty(this, "bubbleStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._bubbleMinimumSize = new ObservableProperty(this, "bubbleMinimumSize", Number, 10, this.invalidates(AbstractChart.RENDER_CHART));
			this._bubbleMaximumSize = new ObservableProperty(this, "bubbleMaximumSize", Number, 50, this.invalidates(AbstractChart.RENDER_CHART));

			this._valueDatasW = new Array();
			this._valueDatasX = new Array();
			this._valueDatasY = new Array();
			this._valueDatasZ = new Array();
			this._valueSortComparator = new ValueSortComparator();
			this._valueSearchComparator = new ValueSearchComparator();
			this._seriesSprites = new Array();

			this._seriesMask = new Shape();

			this._seriesContainer = new Sprite();
			this._seriesContainer.mouseEnabled = false;
			this._seriesContainer.mask = this._seriesMask;

			this.addChild(this._seriesContainer);
			this.addChild(this._seriesMask);
		}

		// Public Getters/Setters

		public function get frame() : *
		{
			return this._frame.value;
		}
		public function set frame(value:*) : void
		{
			this._frame.value = value;
		}

		public function get bubbleBrushPalette() : IBrushPalette
		{
			return this._bubbleBrushPalette.value;
		}
		public function set bubbleBrushPalette(value:IBrushPalette) : void
		{
			this._bubbleBrushPalette.value = value;
		}

		public function get bubbleShapePalette() : IShapePalette
		{
			return this._bubbleShapePalette.value;
		}
		public function set bubbleShapePalette(value:IShapePalette) : void
		{
			this._bubbleShapePalette.value = value;
		}

		public function get bubbleStyle() : Style
		{
			return this._bubbleStyle.value;
		}
		public function set bubbleStyle(value:Style) : void
		{
			this._bubbleStyle.value = value;
		}

		public function get bubbleMinimumSize() : Number
		{
			return this._bubbleMinimumSize.value;
		}
		public function set bubbleMinimumSize(value:Number) : void
		{
			this._bubbleMinimumSize.value = value;
		}

		public function get bubbleMaximumSize() : Number
		{
			return this._bubbleMaximumSize.value;
		}
		public function set bubbleMaximumSize(value:Number) : void
		{
			this._bubbleMaximumSize.value = value;
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			var valueDatasW:Array = this._valueDatasW = new Array();
			var valueDatasX:Array = this._valueDatasX = new Array();
			var valueDatasY:Array = this._valueDatasY = new Array();
			var valueDatasZ:Array = this._valueDatasZ = new Array();

			var seriesContainer:Sprite = this._seriesContainer;
			var seriesSprites:Array = this._seriesSprites;
			var seriesSprite:SeriesSprite;
			var numSeries:int = 0;

			var bubbleSprites:Array;
			var bubbleSprite:BubbleSprite;
			var numBubbles:int;

			var i:int;
			var j:int;

			for each (seriesSprite in seriesSprites)
				seriesSprite.numBubbles = 0;

			if (data)
			{
				var numDataColumns:int = data.numColumns;
				var numDataRows:int = data.numRows;

				if ((numDataColumns > 5) && (numDataRows > 0))
				{
					var fieldW:String = data.getColumnName(0);
					var fieldSeries:String = data.getColumnName(1);
					var fieldSample:String = data.getColumnName(2);
					var fieldX:String = data.getColumnName(3);
					var fieldY:String = data.getColumnName(4);
					var fieldZ:String = data.getColumnName(5);

					var valueW:*;
					var valueSeries:*;
					var valueSample:*;
					var valueX:*;
					var valueY:*;
					var valueZ:*;

					var valueDataW:ValueData;
					var valueDataX:ValueData;
					var valueDataY:ValueData;
					var valueDataZ:ValueData;

					var seriesName:String;
					var sampleName:String;
					var seriesSpriteMap:Object = new Object();
					var numSeriesSprites:int = seriesSprites.length;

					for (i = 0; i < numDataRows; i++)
					{
						valueW = data.getValue(i, 0);
						valueSeries = data.getValue(i, 1);
						valueSample = data.getValue(i, 2);
						valueX = data.getValue(i, 3);
						valueY = data.getValue(i, 4);
						valueZ = data.getValue(i, 5);

						if ((valueW == null) || (valueSeries == null) || (valueSample == null))
							continue;

						if ((valueX == null) && (valueY == null) && (valueZ == null))
							continue;

						seriesName = String(valueSeries);
						if (!seriesName)
							continue;

						sampleName = String(valueSample);
						if (!sampleName)
							continue;

						valueDataW = new ValueData(valueW);
						valueDataX = (valueX != null) ? new ValueData(valueX, valueDataW) : null;
						valueDataY = (valueY != null) ? new ValueData(valueY, valueDataW) : null;
						valueDataZ = (valueZ != null) ? new ValueData(valueZ, valueDataW) : null;

						valueDatasW.push(valueDataW);
						if (valueDataX)
							valueDatasX.push(valueDataX);
						if (valueDataY)
							valueDatasY.push(valueDataY);
						if (valueDataZ)
							valueDatasZ.push(valueDataZ);

						seriesSprite = seriesSpriteMap[seriesName];
						if (!seriesSprite)
						{
							if (numSeries < numSeriesSprites)
							{
								seriesSprite = seriesSprites[numSeries];
							}
							else
							{
								seriesSprite = new SeriesSprite();
								seriesSprites.push(seriesSprite);
								seriesContainer.addChild(seriesSprite);
							}

							seriesSprite.field = seriesName;
							seriesSprite.bubbleSpriteMap = new Object();

							seriesSpriteMap[seriesName] = seriesSprite;
							numSeries++;
						}

						bubbleSprite = seriesSprite.bubbleSpriteMap[sampleName];
						if (!bubbleSprite)
						{
							bubbleSprites = seriesSprite.bubbleSprites;

							if (seriesSprite.numBubbles < bubbleSprites.length)
							{
								bubbleSprite = bubbleSprites[seriesSprite.numBubbles];
							}
							else
							{
								bubbleSprite = new BubbleSprite();
								bubbleSprite.chart = this;
								bubbleSprite.dataRowIndex = -1;  // no row index since we are interpolating
								bubbleSprite.tipPlacement = Tooltip.LEFT_RIGHT;
								bubbleSprites.push(bubbleSprite);
								seriesSprite.addChild(bubbleSprite);
							}

							bubbleSprite.valueDatasX = new Array();
							bubbleSprite.valueDatasY = new Array();
							bubbleSprite.valueDatasZ = new Array();
							bubbleSprite.seriesName = seriesName;
							bubbleSprite.fields = [ fieldSeries, fieldSample, fieldX, fieldY, fieldZ ];
							bubbleSprite.data = new Object();
							bubbleSprite.data[fieldSeries] = seriesName;
							bubbleSprite.data[fieldSample] = sampleName;

							seriesSprite.bubbleSpriteMap[sampleName] = bubbleSprite;
							seriesSprite.numBubbles++;
						}

						if (valueDataX)
							bubbleSprite.valueDatasX.push(valueDataX);
						if (valueDataY)
							bubbleSprite.valueDatasY.push(valueDataY);
						if (valueDataZ)
							bubbleSprite.valueDatasZ.push(valueDataZ);
					}
				}
			}

			// remove unused series sprites
			for (i = seriesSprites.length - 1; i >= numSeries; i--)
			{
				seriesSprite = seriesSprites.pop();
				seriesContainer.removeChild(seriesSprite);
			}

			// remove unused bubble sprites
			for (i; i >= 0; i--)
			{
				seriesSprite = seriesSprites[i];
				bubbleSprites = seriesSprite.bubbleSprites;
				numBubbles = seriesSprite.numBubbles;
				for (j = bubbleSprites.length - 1; j >= numBubbles; j--)
				{
					bubbleSprite = bubbleSprites.pop();
					seriesSprite.removeChild(bubbleSprite);
				}
			}
		}

		protected override function updateAxisValuesWOverride() : Array
		{
			var valuesW:Array = new Array();

			for each (var valueData:ValueData in this._valueDatasW)
				valuesW.push(valueData.value);

			return valuesW;
		}

		protected override function updateAxisValuesXOverride() : Array
		{
			var valuesX:Array = new Array();

			for each (var valueData:ValueData in this._valueDatasX)
				valuesX.push(valueData.value);

			return valuesX;
		}

		protected override function updateAxisValuesYOverride() : Array
		{
			var valuesY:Array = new Array();

			for each (var valueData:ValueData in this._valueDatasY)
				valuesY.push(valueData.value);

			return valuesY;
		}

		protected override function updateAxisValuesZOverride() : Array
		{
			var valuesZ:Array = new Array();

			for each (var valueData:ValueData in this._valueDatasZ)
				valuesZ.push(valueData.value);

			return valuesZ;
		}

		protected override function processValuesWOverride(axisW:IAxis) : void
		{
			var valueData:ValueData;

			if (axisW)
			{
				for each (valueData in this._valueDatasW)
					valueData.absolute = axisW.valueToAbsolute(valueData.value);
			}
			else
			{
				for each (valueData in this._valueDatasW)
					valueData.absolute = NaN;
			}

			this._isValueDatasValid = false;
		}

		protected override function processValuesXOverride(axisX:IAxis) : void
		{
			var valueData:ValueData;

			if (axisX)
			{
				for each (valueData in this._valueDatasX)
					valueData.absolute = axisX.valueToAbsolute(valueData.value);
			}
			else
			{
				for each (valueData in this._valueDatasX)
					valueData.absolute = NaN;
			}
		}

		protected override function processValuesYOverride(axisY:IAxis) : void
		{
			var valueData:ValueData;

			if (axisY)
			{
				for each (valueData in this._valueDatasY)
					valueData.absolute = axisY.valueToAbsolute(valueData.value);
			}
			else
			{
				for each (valueData in this._valueDatasY)
					valueData.absolute = NaN;
			}
		}

		protected override function processValuesZOverride(axisZ:IAxis) : void
		{
			var valueData:ValueData;

			if (axisW)
			{
				for each (valueData in this._valueDatasZ)
					valueData.absolute = axisZ.valueToAbsolute(valueData.value);
			}
			else
			{
				for each (valueData in this._valueDatasZ)
					valueData.absolute = NaN;
			}
		}

		protected override function processAbsolutesWOverride(axisW:IAxis) : void
		{
			// we don't use relative values on w axis
		}

		protected override function processAbsolutesXOverride(axisX:IAxis) : void
		{
			var valueData:ValueData;

			if (axisX)
			{
				for each (valueData in this._valueDatasX)
					valueData.relative = (valueData.absolute == valueData.absolute) ? axisX.absoluteToRelative(valueData.absolute) : NaN;
			}
			else
			{
				for each (valueData in this._valueDatasX)
					valueData.relative = NaN;
			}

			this._isValueDatasValid = false;
		}

		protected override function processAbsolutesYOverride(axisY:IAxis) : void
		{
			var valueData:ValueData;

			if (axisY)
			{
				for each (valueData in this._valueDatasY)
					valueData.relative = (valueData.absolute == valueData.absolute) ? axisY.absoluteToRelative(valueData.absolute) : NaN;
			}
			else
			{
				for each (valueData in this._valueDatasY)
					valueData.relative = NaN;
			}

			this._isValueDatasValid = false;
		}

		protected override function processAbsolutesZOverride(axisZ:IAxis) : void
		{
			var valueData:ValueData;

			if (axisX)
			{
				for each (valueData in this._valueDatasZ)
					valueData.relative = (valueData.absolute == valueData.absolute) ? axisZ.absoluteToRelative(valueData.absolute) : NaN;
			}
			else
			{
				for each (valueData in this._valueDatasZ)
					valueData.relative = NaN;
			}

			this._isValueDatasValid = false;
		}

		protected override function updateLegendLabelsOverride(data:IDataTable) : Array
		{
			var labels:Array = new Array();

			for each (var seriesSprite:SeriesSprite in this._seriesSprites)
				labels.push(seriesSprite.field);

			return labels;
		}

		protected override function updateLegendSwatchesOverride(legend:ILegend, labels:Array) : Array
		{
			var swatches:Array = new Array();

			var bubbleBrushPalette:IBrushPalette = this._bubbleBrushPalette.value;
			var bubbleShapePalette:IShapePalette = this._bubbleShapePalette.value;
			var bubbleStyle:Style = this._bubbleStyle.value;

			var bubbleBrush:IBrush;
			var bubbleShape:IShape;

			var numLabels:int = labels.length;
			var label:String;
			var labelIndex:int;
			var labelCount:int = legend ? legend.numLabels : numLabels;

			for (var i:int = 0; i < numLabels; i++)
			{
				label = labels[i];
				labelIndex = legend ? legend.getLabelIndex(label) : i;

				bubbleBrush = bubbleBrushPalette ? bubbleBrushPalette.getBrush(label, labelIndex, labelCount) : null;
				if (!bubbleBrush)
					bubbleBrush = new SolidFillBrush(0x000000, 1);

				bubbleShape = bubbleShapePalette ? bubbleShapePalette.getShape(label, labelIndex, labelCount) : null;
				if (!bubbleShape)
					bubbleShape = new EllipseShape();
				bubbleShape = new UniformSizeShape(bubbleShape);

				swatches.push(new SeriesSwatch([ bubbleShape ], [ bubbleBrush ], [ bubbleStyle ], 1));
			}

			return swatches;
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			this._validateValueDatas();

			var axisW:IAxis = super.axisW;
			var axisX:IAxis = super.axisX;
			var axisY:IAxis = super.axisY;
			var axisZ:IAxis = super.axisZ;

			var frame:* = this._frame.value;
			var frameNumber:Number = (axisW && (frame != null)) ? axisW.valueToAbsolute(frame) : NaN;

			var brushBounds:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];

			var maskGraphics:Graphics = this._seriesMask.graphics;

			var seriesSprites:Array = this._seriesSprites;
			var numSeriesSprites:int = seriesSprites.length;
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;

			var bubbleBrushPalette:IBrushPalette = this._bubbleBrushPalette.value;
			var bubbleShapePalette:IShapePalette = this._bubbleShapePalette.value;
			var bubbleStyle:Style = this._bubbleStyle.value;
			var bubbleMinimumSize:Number = Math.max(this._bubbleMinimumSize.value, 0);
			var bubbleMaximumSize:Number = Math.max(this._bubbleMaximumSize.value, bubbleMinimumSize);
			var bubbleSprites:Array;
			var numBubbleSprites:int;
			var bubbleSprite:BubbleSprite;
			var bubbleGraphics:Graphics;
			var bubbleBrush:IBrush;
			var bubbleShape:IShape;

			var valueDataX:ValueData;
			var valueDataY:ValueData;
			var valueDataZ:ValueData;
			var positionX:Number;
			var positionY:Number;
			var positionZ:Number;
			var x1:Number;
			var x2:Number;
			var y1:Number;
			var y2:Number;
			var i:int;
			var j:int;

			seriesCount = legend ? legend.numLabels : numSeriesSprites;

			for (i = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = seriesSprites[i];
				bubbleSprites = seriesSprite.bubbleSprites;
				numBubbleSprites = bubbleSprites.length;

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				bubbleBrush = bubbleBrushPalette ? bubbleBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!bubbleBrush)
					bubbleBrush = new SolidFillBrush(0x000000, 1);

				bubbleShape = bubbleShapePalette ? bubbleShapePalette.getShape(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!bubbleShape)
					bubbleShape = new EllipseShape();

				for (j = 0; j < numBubbleSprites; j++)
				{
					bubbleSprite = bubbleSprites[j];
					bubbleSprite.visible = false;

					bubbleGraphics = bubbleSprite.graphics;
					bubbleGraphics.clear();

					valueDataX = this._getValueData(axisX, bubbleSprite.valueDatasX2, frameNumber);
					if (!valueDataX)
						continue;

					valueDataY = this._getValueData(axisY, bubbleSprite.valueDatasY2, frameNumber);
					if (!valueDataY)
						continue;

					valueDataZ = this._getValueData(axisZ, bubbleSprite.valueDatasZ2, frameNumber);
					if (!valueDataZ)
						continue;

					positionX = Math.round(chartWidth * valueDataX.relative);
					positionY = Math.round(chartHeight * (1 - valueDataY.relative));
					positionZ = Math.max(Math.round((bubbleMinimumSize + (bubbleMaximumSize - bubbleMinimumSize) * NumberUtil.minMax(valueDataZ.relative, 0, 1)) / 2), 1);

					x1 = positionX - positionZ;
					x2 = positionX + positionZ;
					y1 = positionY - positionZ;
					y2 = positionY + positionZ;

					if ((x2 > 0) && (x1 < chartWidth) && (y2 > 0) && (y1 < chartHeight))
					{
						// draw hit area
						bubbleGraphics.beginFill(0x000000, 0);
						bubbleGraphics.drawRect(x1, y1, x2 - x1, y2 - y1);
						bubbleGraphics.endFill();

						// draw bubble
						bubbleShape.draw(bubbleGraphics, x1, y1, x2 - x1, y2 - y1, bubbleBrush, null, brushBounds);

						bubbleSprite.data[bubbleSprite.fields[2]] = valueDataX.value;
						bubbleSprite.data[bubbleSprite.fields[3]] = valueDataY.value;
						bubbleSprite.data[bubbleSprite.fields[4]] = valueDataZ.value;
						bubbleSprite.tipBounds = new Rectangle(x1, y1, x2 - x1, y2 - y1);
						bubbleSprite.visible = true;
					}

					Style.applyStyle(bubbleSprite, bubbleStyle);
				}
			}

			// draw mask
			maskGraphics.clear();
			maskGraphics.beginFill(0x000000, 1);
			maskGraphics.drawRect(0, 0, chartWidth, chartHeight);
			maskGraphics.endFill();
		}

		protected override function highlightSeriesOverride(seriesName:String) : void
		{
			var tweens:Array = new Array();

			var a:Number = AbstractChart.HIGHLIGHT_RATIO;

			for each (var seriesSprite:SeriesSprite in this._seriesSprites)
			{
				if (seriesName && (seriesSprite.field != seriesName))
					tweens.push(new PropertyTween(seriesSprite, "alpha", null, a));
				else
					tweens.push(new PropertyTween(seriesSprite, "alpha", null, 1));
			}

			if (tweens.length > 0)
				TweenRunner.start(new GroupTween(tweens, AbstractChart.HIGHLIGHT_EASER), AbstractChart.HIGHLIGHT_DURATION);
		}

		protected override function highlightElementOverride(element:DataSprite) : void
		{
			var tweens:Array = new Array();

			var a:Number;

			if (element)
			{
				a = AbstractChart.HIGHLIGHT_RATIO;
				if (element.chart == this)
				{
					tweens.push(new PropertyTween(element, "alpha", null, 1 / a));
					this._highlightedElement = element;
				}
			}
			else
			{
				a = 1;
				if (this._highlightedElement)
				{
					tweens.push(new PropertyTween(this._highlightedElement, "alpha", null, 1));
					this._highlightedElement = null;
				}
			}

			for each (var seriesSprite:SeriesSprite in this._seriesSprites)
				tweens.push(new PropertyTween(seriesSprite, "alpha", null, a));

			if (tweens.length > 0)
				TweenRunner.start(new GroupTween(tweens, AbstractChart.HIGHLIGHT_EASER), AbstractChart.HIGHLIGHT_DURATION);
		}

		// Private Methods

		private function _validateValueDatas() : void
		{
			if (this._isValueDatasValid)
				return;

			var seriesSprite:SeriesSprite;
			var bubbleSprite:BubbleSprite;

			for each (seriesSprite in this._seriesSprites)
			{
				for each (bubbleSprite in seriesSprite.bubbleSprites)
				{
					bubbleSprite.valueDatasX2 = this._processValueDatas(bubbleSprite.valueDatasX);
					bubbleSprite.valueDatasY2 = this._processValueDatas(bubbleSprite.valueDatasY);
					bubbleSprite.valueDatasZ2 = this._processValueDatas(bubbleSprite.valueDatasZ);
				}
			}

			this._isValueDatasValid = true;
		}

		private function _processValueDatas(valueDatas:Array) : Array
		{
			if (!valueDatas)
				return null;

			var valueDatas2:Array = new Array();

			var valueData:ValueData;

			// copy non-empty values with non-empty frames
			for each (valueData in valueDatas)
			{
				if ((valueData.relative == valueData.relative) && (valueData.frameData.absolute == valueData.frameData.absolute))
					valueDatas2.push(valueData);
			}

			// sort values by frame
			ArrayUtil.sort(valueDatas2, this._valueSortComparator);

			// remove values with duplicate frames
			var frame:Number = NaN;
			for (var i:int = valueDatas2.length - 1; i >= 0; i--)
			{
				valueData = valueDatas2[i];
				if (valueData.frameData.absolute == frame)
					valueDatas2.splice(i, 1);
				else
					frame = valueData.frameData.absolute;
			}

			return valueDatas2;
		}

		private function _getValueData(axis:IAxis, valueDatas:Array, frameNumber:Number) : ValueData
		{
			if (!axis || !valueDatas)
				return null;

			var numValueDatas:int = valueDatas.length;
			if (numValueDatas == 0)
				return null;

			if ((numValueDatas == 1) || (frameNumber != frameNumber))
				return valueDatas[0];

			var frameIndex:int = ArrayUtil.binarySearch(valueDatas, frameNumber, this._valueSearchComparator);
			if (frameIndex >= 0)
				return valueDatas[frameIndex];

			frameIndex = -frameIndex - 1;

			if (frameIndex == 0)
				return valueDatas[0];
			if (frameIndex == numValueDatas)
				return valueDatas[numValueDatas - 1];

			var valueData1:ValueData = valueDatas[frameIndex - 1];
			var valueData2:ValueData = valueDatas[frameIndex];
			var p:Number = (frameNumber - valueData1.frameData.absolute) / (valueData2.frameData.absolute - valueData1.frameData.absolute);

			var valueData:ValueData = new ValueData();
			valueData.relative = valueData1.relative * (1 - p) + valueData2.relative * p;
			valueData.absolute = axis.relativeToAbsolute(valueData.relative);
			valueData.value = axis.absoluteToValue(valueData.absolute);
			return valueData;
		}

	}

}

import com.jasongatt.utils.IComparator;
import com.splunk.charting.charts.DataSprite;
import flash.display.Sprite;

class ValueData
{

	// Public Properties

	public var value:*;
	public var absolute:Number;
	public var relative:Number;
	public var frameData:ValueData;

	// Constructor

	public function ValueData(value:* = null, frameData:ValueData = null)
	{
		this.value = value;
		this.frameData = frameData;
	}

}

class ValueSortComparator implements IComparator
{

	// Constructor

	public function ValueSortComparator()
	{
	}

	// Public Methods

	public function compare(value1:*, value2:*) : Number
	{
		var valueData1:ValueData = ValueData(value1);
		var valueData2:ValueData = ValueData(value2);
		var frame1:Number = valueData1.frameData.absolute;
		var frame2:Number = valueData2.frameData.absolute;
		if (frame1 < frame2)
			return -1;
		if (frame1 > frame2)
			return 1;
		return 0;
	}

}

class ValueSearchComparator implements IComparator
{

	// Constructor

	public function ValueSearchComparator()
	{
	}

	// Public Methods

	public function compare(value1:*, value2:*) : Number
	{
		var frame1:Number = Number(value1);
		var frame2:Number = ValueData(value2).frameData.absolute;
		if (frame1 < frame2)
			return -1;
		if (frame1 > frame2)
			return 1;
		return 0;
	}

}

class SeriesSprite extends Sprite
{

	// Public Properties

	public var field:String;
	public var bubbleSpriteMap:Object;
	public var bubbleSprites:Array;
	public var numBubbles:int;

	// Constructor

	public function SeriesSprite()
	{
		this.bubbleSprites = new Array();

		this.mouseEnabled = false;
	}

}

class BubbleSprite extends DataSprite
{

	// Public Properties

	public var valueDatasX:Array;
	public var valueDatasY:Array;
	public var valueDatasZ:Array;
	public var valueDatasX2:Array;
	public var valueDatasY2:Array;
	public var valueDatasZ2:Array;

	// Constructor

	public function BubbleSprite()
	{
	}

}

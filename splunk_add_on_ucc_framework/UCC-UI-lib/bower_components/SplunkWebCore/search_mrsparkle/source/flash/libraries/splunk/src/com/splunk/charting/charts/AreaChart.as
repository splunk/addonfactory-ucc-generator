package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.LineShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.motion.GroupTween;
	import com.jasongatt.motion.PropertyTween;
	import com.jasongatt.motion.TweenRunner;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.controls.Tooltip;
	import com.splunk.data.IDataTable;
	import com.splunk.palettes.brush.IBrushPalette;
	import com.splunk.palettes.brush.SolidFillBrushPalette;
	import com.splunk.palettes.brush.SolidStrokeBrushPalette;
	import com.splunk.palettes.color.ListColorPalette;
	import com.splunk.utils.Style;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class AreaChart extends AbstractChart2D
	{

		// Private Properties

		private var _areaBrushPalette:ObservableProperty;
		private var _areaStyle:ObservableProperty;
		private var _lineBrushPalette:ObservableProperty;
		private var _lineStyle:ObservableProperty;
		private var _showLines:ObservableProperty;
		private var _stackMode:ObservableProperty;
		private var _nullValueMode:ObservableProperty;

		private var _valuesX:Array;
		private var _valuesYSeries:Array;
		private var _positionsX:Array;
		private var _positionsYSeries:Array;
		private var _position0:Number;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function AreaChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);

			this._areaBrushPalette = new ObservableProperty(this, "areaBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 0.6), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._areaStyle = new ObservableProperty(this, "areaStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._lineBrushPalette = new ObservableProperty(this, "lineBrushPalette", IBrushPalette, new SolidStrokeBrushPalette(1, colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._lineStyle = new ObservableProperty(this, "lineStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._showLines = new ObservableProperty(this, "showLines", Boolean, true, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._stackMode = new ObservableProperty(this, "stackMode", String, StackMode.DEFAULT, this.invalidates(AbstractChart.PROCESS_DATA));
			this._nullValueMode = new ObservableProperty(this, "nullValueMode", String, NullValueMode.GAPS, this.invalidates(AbstractChart.RENDER_CHART));

			this._valuesX = new Array();
			this._valuesYSeries = new Array();
			this._positionsX = new Array();
			this._positionsYSeries = new Array();
		}

		// Public Getters/Setters

		public function get areaBrushPalette() : IBrushPalette
		{
			return this._areaBrushPalette.value;
		}
		public function set areaBrushPalette(value:IBrushPalette) : void
		{
			this._areaBrushPalette.value = value;
		}

		public function get areaStyle() : Style
		{
			return this._areaStyle.value;
		}
		public function set areaStyle(value:Style) : void
		{
			this._areaStyle.value = value;
		}

		public function get lineBrushPalette() : IBrushPalette
		{
			return this._lineBrushPalette.value;
		}
		public function set lineBrushPalette(value:IBrushPalette) : void
		{
			this._lineBrushPalette.value = value;
		}

		public function get lineStyle() : Style
		{
			return this._lineStyle.value;
		}
		public function set lineStyle(value:Style) : void
		{
			this._lineStyle.value = value;
		}

		public function get showLines() : Boolean
		{
			return this._showLines.value;
		}
		public function set showLines(value:Boolean) : void
		{
			this._showLines.value = value;
		}

		public function get stackMode() : String
		{
			return this._stackMode.value;
		}
		public function set stackMode(value:String) : void
		{
			switch (value)
			{
				case StackMode.DEFAULT:
				case StackMode.STACKED:
				case StackMode.STACKED_100:
					break;
				default:
					value = StackMode.DEFAULT;
					break;
			}
			this._stackMode.value = value;
		}

		public function get nullValueMode() : String
		{
			return this._nullValueMode.value;
		}
		public function set nullValueMode(value:String) : void
		{
			switch (value)
			{
				case NullValueMode.GAPS:
				case NullValueMode.ZERO:
				case NullValueMode.CONNECT:
					break;
				default:
					value = NullValueMode.GAPS;
					break;
			}
			this._nullValueMode.value = value;
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			var valuesX:Array = new Array();
			var valuesYSeries:Array = new Array();

			var numProcessedSeries:int = 0;

			if (data)
			{
				var numDataColumns:int = data.numColumns;

				if (numDataColumns > 1)
				{
					numProcessedSeries = numDataColumns - 1;

					var stackMode:int;
					switch (this._stackMode.value)
					{
						case StackMode.STACKED_100:
							stackMode = 2;
							break;
						case StackMode.STACKED:
							stackMode = 1;
							break;
						default:
							stackMode = 0;
							break;
					}

					var numRows:int = data.numRows;
					var sums:Array = new Array();
					var totals:Array = new Array();
					var valuesY:Array;
					var value:*;
					var i:int;
					var j:int;

					var numSeriesSprites:int = this.numChildren;
					var seriesSprite:SeriesSprite;
					var hitSprites:Sprite;
					var numHitSprites:int;
					var hitSprite:DataSprite;

					var fieldX:String = data.getColumnName(0);
					var fieldY:String;

					for (i = 0; i < numRows; i++)
					{
						valuesX.push(data.getValue(i, 0));
						if (stackMode > 0)
						{
							sums.push(0);
							if (stackMode > 1)
								totals.push(0);
						}
					}

					for (i = 0; i < numProcessedSeries; i++)
					{
						if (i < numSeriesSprites)
						{
							seriesSprite = this.getChildAt(i) as SeriesSprite;
						}
						else
						{
							seriesSprite = new SeriesSprite();
							this.addChild(seriesSprite);
						}

						hitSprites = seriesSprite.hitSprites;
						numHitSprites = hitSprites.numChildren;

						fieldY = data.getColumnName(i + 1);

						seriesSprite.field = fieldY;

						valuesY = new Array();
						for (j = 0; j < numRows; j++)
						{
							value = data.getValue(j, i + 1);

							if (j < numHitSprites)
							{
								hitSprite = hitSprites.getChildAt(j) as DataSprite;
							}
							else
							{
								hitSprite = new DataSprite();
								hitSprite.chart = this;
								hitSprite.tipPlacement = Tooltip.LEFT_RIGHT;
								hitSprites.addChild(hitSprite);
							}

							hitSprite.seriesName = fieldY;
							hitSprite.fields = [ fieldX, fieldY ];
							hitSprite.data = new Object();
							hitSprite.data[fieldX] = valuesX[j];
							hitSprite.data[fieldY] = value;
							hitSprite.dataRowIndex = j;

							value = NumberUtil.parseNumber(value);
							if (value != value)
							{
								valuesY.push(null);
							}
							else
							{
								if (stackMode > 0)
								{
									if (stackMode > 1)
										totals[j] += Math.abs(value);
									value = sums[j] = sums[j] + value;
								}
								valuesY.push(value);
							}
						}
						valuesYSeries.push(valuesY);

						for (j = hitSprites.numChildren - 1; j >= numRows; j--)
							hitSprites.removeChildAt(j);
					}

					if (stackMode > 1)
					{
						var total:Number;
						for (i = 0; i < numProcessedSeries; i++)
						{
							valuesY = valuesYSeries[i];
							for (j = 0; j < numRows; j++)
							{
								value = valuesY[j];
								if (value != null)
								{
									total = totals[j];
									if (total > 0)
										valuesY[j] = 100 * NumberUtil.minMax(value / total, -1, 1);
									else
										valuesY[j] = 0;
								}
							}
						}
					}
				}
			}

			for (i = this.numChildren - 1; i >= numProcessedSeries; i--)
				this.removeChildAt(i);

			this._valuesX = valuesX;
			this._valuesYSeries = valuesYSeries;
		}

		protected override function updateAxisValuesXOverride() : Array
		{
			return this._valuesX;
		}

		protected override function updateAxisValuesYOverride() : Array
		{
			var valuesY:Array = new Array();

			for each (var values:Array in this._valuesYSeries)
				valuesY = valuesY.concat(values);

			return valuesY;
		}

		protected override function processAbsolutesXOverride(axisX:IAxis) : void
		{
			var valuesX:Array = this._valuesX;
			var numValuesX:int = valuesX.length;
			var valueX:*;

			var positionsX:Array = new Array(numValuesX);
			var positionX:Number;

			var i:int;

			if (!axisX)
			{
				for (i = 0; i < numValuesX; i++)
					positionsX[i] = NaN;
			}
			else
			{
				for (i = 0; i < numValuesX; i++)
				{
					valueX = valuesX[i];
					if (valueX == null)
					{
						positionsX[i] = NaN;
						continue;
					}

					positionX = axisX.absoluteToRelative(axisX.valueToAbsolute(valueX));
					if (positionX != positionX)
					{
						positionsX[i] = NaN;
						continue;
					}

					positionsX[i] = positionX;
				}
			}

			this._positionsX = positionsX;
		}

		protected override function processAbsolutesYOverride(axisY:IAxis) : void
		{
			var numValuesX:int = this._valuesX.length;

			var valuesYSeries:Array = this._valuesYSeries;
			var valuesY:Array;
			var numValuesYSeries:int = valuesYSeries.length;
			var valueY:*;

			var positionsYSeries:Array = new Array(numValuesYSeries);
			var positionsY:Array;
			var positionY:Number;
			var position0:Number;

			var i:int;
			var j:int;

			if (!axisY)
			{
				for (i = 0; i < numValuesYSeries; i++)
				{
					positionsY = new Array(numValuesX);
					for (j = 0; j < numValuesX; j++)
						positionsY[j] = NaN;
					positionsYSeries[i] = positionsY;
				}

				position0 = NaN;
			}
			else
			{
				for (i = 0; i < numValuesYSeries; i++)
				{
					valuesY = valuesYSeries[i];
					positionsY = new Array(numValuesX);
					for (j = 0; j < numValuesX; j++)
					{
						valueY = valuesY[j];
						if (valueY == null)
						{
							positionsY[j] = NaN;
							continue;
						}

						positionY = axisY.absoluteToRelative(axisY.valueToAbsolute(valueY));
						if (positionY != positionY)
						{
							positionsY[j] = NaN;
							continue;
						}

						positionsY[j] = positionY;
					}
					positionsYSeries[i] = positionsY;
				}

				position0 = axisY.absoluteToRelative(axisY.valueToAbsolute(0));
			}

			this._positionsYSeries = positionsYSeries;
			this._position0 = position0;
		}

		protected override function updateLegendLabelsOverride(data:IDataTable) : Array
		{
			var labels:Array = new Array();

			var numSeries:int = data.numColumns - 1;
			for (var i:int = 0; i < numSeries; i++)
				labels.push(data.getColumnName(i + 1));

			return labels;
		}

		protected override function updateLegendSwatchesOverride(legend:ILegend, labels:Array) : Array
		{
			var swatches:Array = new Array();

			var areaBrushPalette:IBrushPalette = this._areaBrushPalette.value;
			var areaStyle:Style = this._areaStyle.value;
			var lineBrushPalette:IBrushPalette = this._lineBrushPalette.value;
			var lineStyle:Style = this._lineStyle.value;
			var showLines:Boolean = this._showLines.value;

			var areaBrush:IBrush;
			var areaShape:IShape = new RectangleShape();
			var lineBrush:IBrush;
			var lineShape:IShape = new LineShape(new Point(0, 0), new Point(1, 0));

			var shapes:Array;
			var brushes:Array;
			var styles:Array;
			var aspectRatio:Number = showLines ? 3 : 1;

			var numLabels:int = labels.length;
			var label:String;
			var labelIndex:int;
			var labelCount:int = legend ? legend.numLabels : numLabels;

			for (var i:int = 0; i < numLabels; i++)
			{
				label = labels[i];
				labelIndex = legend ? legend.getLabelIndex(label) : i;

				shapes = new Array();
				brushes = new Array();
				styles = new Array();

				areaBrush = areaBrushPalette ? areaBrushPalette.getBrush(label, labelIndex, labelCount) : null;
				if (!areaBrush)
					areaBrush = new SolidFillBrush(0x000000, 1);

				shapes.push(areaShape);
				brushes.push(areaBrush);
				styles.push(areaStyle);

				if (showLines)
				{
					lineBrush = lineBrushPalette ? lineBrushPalette.getBrush(label, labelIndex, labelCount) : null;
					if (!lineBrush)
						lineBrush = new SolidStrokeBrush(1, 0x000000, 1);

					shapes.push(lineShape);
					brushes.push(lineBrush);
					styles.push(lineStyle);
				}

				swatches.push(new SeriesSwatch(shapes, brushes, styles, aspectRatio));
			}

			return swatches;
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var positionsX:Array = this._positionsX;
			var positionsYSeries:Array = this._positionsYSeries;
			var positionsY:Array;
			var numPositionsX:int = positionsX.length;
			var numPositionsYSeries:int = positionsYSeries.length;
			var pixelsX:Array = new Array(numPositionsX);
			var pixelsYSeries:Array = new Array(numPositionsYSeries);
			var pixelsY:Array;
			var pixel0:Number = Math.round(chartHeight * (1 - this._position0));
			var positionX:Number;
			var positionY:Number;
			var i:int;
			var j:int;
			var stackMode:int;
			var nullValueMode:int;

			switch (this._stackMode.value)
			{
				case StackMode.STACKED_100:
					stackMode = 2;
					break;
				case StackMode.STACKED:
					stackMode = 1;
					break;
				default:
					stackMode = 0;
					break;
			}

			switch (this._nullValueMode.value)
			{
				case NullValueMode.ZERO:
					nullValueMode = 0;
					break;
				case NullValueMode.GAPS:
					nullValueMode = 1;
					break;
				default:
					nullValueMode = 2;
					break;
			}

			for (i = 0; i < numPositionsX; i++)
			{
				positionX = positionsX[i];
				if (positionX != positionX)
				{
					pixelsX[i] = NaN;
					continue;
				}

				pixelsX[i] = Math.round(chartWidth * positionX);
			}

			for (i = 0; i < numPositionsYSeries; i++)
			{
				positionsY = positionsYSeries[i];
				pixelsY = pixelsYSeries[i] = new Array(numPositionsX);

				for (j = 0; j < numPositionsX; j++)
				{
					positionY = positionsY[j];
					if (positionY != positionY)
					{
						pixelsY[j] = NaN;
						continue;
					}

					pixelsY[j] = Math.round(chartHeight * (1 - positionY));
				}
			}

			this._renderAreas(chartWidth, chartHeight, legend, pixelsX, pixelsYSeries, pixel0, stackMode, nullValueMode);
			this._renderLines(chartWidth, chartHeight, legend, pixelsX, pixelsYSeries, pixel0, stackMode, nullValueMode);
			this._renderHitAreas(chartWidth, chartHeight, legend, pixelsX, pixelsYSeries, pixel0, stackMode, nullValueMode);
		}

		protected override function highlightSeriesOverride(seriesName:String) : void
		{
			var tweens:Array = new Array();

			var a:Number = AbstractChart.HIGHLIGHT_RATIO;

			var numSeriesSprites:int = this.numChildren;
			var seriesSprite:SeriesSprite;
			for (var i:int = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = this.getChildAt(i) as SeriesSprite;
				if (seriesSprite)
				{
					if (seriesName && (seriesSprite.field != seriesName))
						tweens.push(new PropertyTween(seriesSprite, "alpha", null, a));
					else
						tweens.push(new PropertyTween(seriesSprite, "alpha", null, 1));
				}
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
					tweens.push(new PropertyTween(this._highlightedElement, "alpha", null, 0));
					this._highlightedElement = null;
				}
			}

			var numSeriesSprites:int = this.numChildren;
			var seriesSprite:SeriesSprite;
			for (var i:int = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = this.getChildAt(i) as SeriesSprite;
				if (seriesSprite)
					tweens.push(new PropertyTween(seriesSprite, "alpha", null, a));
			}

			if (tweens.length > 0)
				TweenRunner.start(new GroupTween(tweens, AbstractChart.HIGHLIGHT_EASER), AbstractChart.HIGHLIGHT_DURATION);
		}

		// Private Methods

		private function _renderAreas(chartWidth:Number, chartHeight:Number, legend:ILegend, pixelsX:Array, pixelsYSeries:Array, pixel0:Number, stackMode:int, nullValueMode:int) : void
		{
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;

			var brushBounds:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];

			var areaBrushPalette:IBrushPalette = this._areaBrushPalette.value;
			var areaStyle:Style = this._areaStyle.value;
			var areaSprite:Shape;
			var areaMaskSprite:Shape;
			var areaGraphics:Graphics;
			var areaMaskGraphics:Graphics;
			var areaBrush:IBrush;

			var pixelsY:Array;
			var stackedPixels:Array;
			var numPixelsX:int = pixelsX.length;
			var numPixelsYSeries:int = pixelsYSeries.length;
			var pixelX:Number;
			var pixelY:Number;
			var startIndex:int;
			var startPixel:Number;
			var endIndex:int;
			var i:int;
			var j:int;
			var k:int;

			stackedPixels = new Array(numPixelsX);
			for (i = 0; i < numPixelsX; i++)
				stackedPixels[i] = pixel0;

			seriesCount = legend ? legend.numLabels : numPixelsYSeries;

			for (i = 0; i < numPixelsYSeries; i++)
			{
				pixelsY = pixelsYSeries[i];

				seriesSprite = this.getChildAt(i) as SeriesSprite;

				areaSprite = seriesSprite.areaSprite;
				areaSprite.visible = false;

				areaMaskSprite = seriesSprite.areaMaskSprite;
				areaMaskSprite.visible = false;

				areaGraphics = areaSprite.graphics;
				areaGraphics.clear();

				areaMaskGraphics = areaMaskSprite.graphics;
				areaMaskGraphics.clear();

				if (pixel0 != pixel0)
				{
					Style.applyStyle(areaSprite, areaStyle);
					continue;
				}

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				areaBrush = areaBrushPalette ? areaBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!areaBrush)
					areaBrush = new SolidFillBrush(0x000000, 1);

				startIndex = -1;

				for (j = 0; j < numPixelsX; j++)
				{
					for (j; j < numPixelsX; j++)
					{
						pixelX = pixelsX[j];
						if (pixelX != pixelX)
							continue;

						pixelY = pixelsY[j];
						if (pixelY != pixelY)
						{
							if (stackMode > 0)
								pixelY = stackedPixels[j];
							else if (nullValueMode == 0)
								pixelY = pixel0;
							else if (nullValueMode == 1)
								break;
							else
								continue;
						}

						if (startIndex < 0)
						{
							startIndex = j;
							startPixel = pixelY;

							areaBrush.beginBrush(areaGraphics, null, brushBounds);
							areaBrush.moveTo(pixelX, pixelY);
						}
						else
						{
							areaBrush.lineTo(pixelX, pixelY);
						}

						endIndex = j;
					}

					if (startIndex >= 0)
					{
						for (k = endIndex; k >= startIndex; k--)
						{
							pixelX = pixelsX[k];
							if (pixelX != pixelX)
								continue;

							pixelY = stackedPixels[k];

							areaBrush.lineTo(pixelX, pixelY);

							if (stackMode > 0)
							{
								pixelY = pixelsY[k];
								if (pixelY == pixelY)
									stackedPixels[k] = pixelY;
							}
						}

						pixelY = startPixel;
						areaBrush.lineTo(pixelX, pixelY);
						areaBrush.endBrush();

						startIndex = -1;
					}
				}

				areaSprite.visible = true;
				areaMaskSprite.visible = true;
				areaMaskGraphics.beginFill(0x000000, 1);
				areaMaskGraphics.drawRect(0, 0, chartWidth, chartHeight);

				Style.applyStyle(areaSprite, areaStyle);
			}
		}

		private function _renderLines(chartWidth:Number, chartHeight:Number, legend:ILegend, pixelsX:Array, pixelsYSeries:Array, pixel0:Number, stackMode:int, nullValueMode:int) : void
		{
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;

			var brushBounds:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];

			var lineBrushPalette:IBrushPalette = this._lineBrushPalette.value;
			var lineStyle:Style = this._lineStyle.value;
			var lineSprite:Shape;
			var lineMaskSprite:Shape;
			var lineGraphics:Graphics;
			var lineMaskGraphics:Graphics;
			var lineBrush:IBrush;

			var showLines:Boolean = this._showLines.value;

			var pixelsY:Array;
			var stackedPixels:Array;
			var numPixelsX:int = pixelsX.length;
			var numPixelsYSeries:int = pixelsYSeries.length;
			var pixelX:Number;
			var pixelY:Number;
			var startIndex:int;
			var startPixel:Number;
			var endIndex:int;
			var i:int;
			var j:int;
			var k:int;

			stackedPixels = new Array(numPixelsX);
			for (i = 0; i < numPixelsX; i++)
				stackedPixels[i] = pixel0;

			seriesCount = legend ? legend.numLabels : numPixelsYSeries;

			for (i = 0; i < numPixelsYSeries; i++)
			{
				pixelsY = pixelsYSeries[i];

				seriesSprite = this.getChildAt(i) as SeriesSprite;

				lineSprite = seriesSprite.lineSprite;
				lineSprite.visible = false;

				lineMaskSprite = seriesSprite.lineMaskSprite;
				lineMaskSprite.visible = false;

				lineGraphics = lineSprite.graphics;
				lineGraphics.clear();

				lineMaskGraphics = lineMaskSprite.graphics;
				lineMaskGraphics.clear();

				if (!showLines || (pixel0 != pixel0))
				{
					Style.applyStyle(lineSprite, lineStyle);
					continue;
				}

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				lineBrush = lineBrushPalette ? lineBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!lineBrush)
					lineBrush = new SolidStrokeBrush(1, 0x000000, 1);

				startIndex = -1;

				for (j = 0; j < numPixelsX; j++)
				{
					for (j; j < numPixelsX; j++)
					{
						pixelX = pixelsX[j];
						if (pixelX != pixelX)
							continue;

						pixelY = pixelsY[j];
						if (pixelY != pixelY)
						{
							if (stackMode > 0)
								pixelY = stackedPixels[j];
							else if (nullValueMode == 0)
								pixelY = pixel0;
							else if (nullValueMode == 1)
								break;
							else
								continue;
						}

						if (startIndex < 0)
						{
							startIndex = j;
							startPixel = pixelY;

							lineBrush.beginBrush(lineGraphics, null, brushBounds);
							lineBrush.moveTo(pixelX, pixelY);
						}
						else
						{
							lineBrush.lineTo(pixelX, pixelY);
						}

						endIndex = j;
					}

					lineBrush.endBrush();

					if (startIndex >= 0)
					{
						if (stackMode > 0)
						{
							for (k = endIndex; k >= startIndex; k--)
							{
								pixelY = pixelsY[k];
								if (pixelY == pixelY)
									stackedPixels[k] = pixelY;
							}
						}

						startIndex = -1;
					}
				}

				lineSprite.visible = true;
				lineMaskSprite.visible = true;
				lineMaskGraphics.beginFill(0x000000, 1);
				lineMaskGraphics.drawRect(0, 0, chartWidth, chartHeight);

				Style.applyStyle(lineSprite, lineStyle);
			}
		}

		private function _renderHitAreas(chartWidth:Number, chartHeight:Number, legend:ILegend, pixelsX:Array, pixelsYSeries:Array, pixel0:Number, stackMode:int, nullValueMode:int) : void
		{
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;

			var brushBounds:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];

			var areaBrushPalette:IBrushPalette = this._areaBrushPalette.value;
			var areaBrush:IBrush;

			var hitSprites:Sprite;
			var hitSprite:DataSprite;
			var hitGraphics:Graphics;
			var hitMaskSprite:Shape;
			var hitMaskGraphics:Graphics;

			var pixelsY:Array;
			var stackedPixels:Array;
			var numPixelsX:int = pixelsX.length;
			var numPixelsYSeries:int = pixelsYSeries.length;
			var pixelX:Number;
			var pixelY:Number;
			var pixelX1:Number;
			var pixelX2:Number;
			var pixelX3:Number;
			var pixelY11:Number;
			var pixelY12:Number;
			var pixelY13:Number;
			var pixelY21:Number;
			var pixelY22:Number;
			var pixelY23:Number;
			var startIndex:int;
			var startPixel:Number;
			var endIndex:int;
			var i:int;
			var j:int;
			var k:int;
			var l:int;

			stackedPixels = new Array(numPixelsX);
			for (i = 0; i < numPixelsX; i++)
				stackedPixels[i] = pixel0;

			seriesCount = legend ? legend.numLabels : numPixelsYSeries;

			for (i = 0; i < numPixelsYSeries; i++)
			{
				pixelsY = pixelsYSeries[i].concat();

				seriesSprite = this.getChildAt(i) as SeriesSprite;

				hitSprites = seriesSprite.hitSprites;

				hitMaskSprite = seriesSprite.hitMaskSprite;

				hitMaskGraphics = hitMaskSprite.graphics;
				hitMaskGraphics.clear();

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				areaBrush = areaBrushPalette ? areaBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!areaBrush)
					areaBrush = new SolidFillBrush(0x000000, 1);

				startIndex = -1;

				for (j = 0; j < numPixelsX; j++)
				{
					for (j; j < numPixelsX; j++)
					{
						hitSprite = hitSprites.getChildAt(j) as DataSprite;
						hitSprite.visible = false;

						hitGraphics = hitSprite.graphics;
						hitGraphics.clear();

						if (pixel0 != pixel0)
							continue;

						pixelX = pixelsX[j];
						if (pixelX != pixelX)
							continue;

						pixelY = pixelsY[j];
						if (pixelY != pixelY)
						{
							if (stackMode > 0)
								pixelY = stackedPixels[j];
							else if (nullValueMode == 0)
								pixelY = pixel0;
							else if (nullValueMode == 1)
								break;
							else
								continue;
							pixelsY[j] = pixelY;
						}

						if (startIndex < 0)
						{
							startIndex = j;
							startPixel = pixelY;
						}

						endIndex = j;
					}

					if (startIndex >= 0)
					{
						for (k = startIndex; k <= endIndex; k++)
						{
							pixelX2 = pixelsX[k];
							pixelY12 = pixelsY[k];
							pixelY22 = stackedPixels[k];

							if ((pixelX2 != pixelX2) || (pixelY12 != pixelY12) || (pixelY22 != pixelY22))
								continue;

							pixelX1 = NaN;
							pixelX3 = NaN;
							pixelY11 = NaN;
							pixelY13 = NaN;
							pixelY21 = NaN;
							pixelY23 = NaN;

							for (l = k - 1; l >= startIndex; l--)
							{
								pixelX1 = pixelsX[l];
								pixelY11 = pixelsY[l];
								pixelY21 = stackedPixels[l];
								if ((pixelX1 == pixelX1) && (pixelY11 == pixelY11) && (pixelY21 == pixelY21))
									break;
							}

							for (l = k + 1; l <= endIndex; l++)
							{
								pixelX3 = pixelsX[l];
								pixelY13 = pixelsY[l];
								pixelY23 = stackedPixels[l];
								if ((pixelX3 == pixelX3) && (pixelY13 == pixelY13) && (pixelY23 == pixelY23))
									break;
							}

							if ((pixelX1 != pixelX1) || (pixelY11 != pixelY11) || (pixelY21 != pixelY21))
							{
								pixelX1 = pixelX2;
								pixelY11 = pixelY12;
								pixelY21 = pixelY22;
							}

							if ((pixelX3 != pixelX3) || (pixelY13 != pixelY13) || (pixelY23 != pixelY23))
							{
								pixelX3 = pixelX2;
								pixelY13 = pixelY12;
								pixelY23 = pixelY22;
							}

							pixelX1 = Math.round((pixelX1 + pixelX2) / 2);
							pixelX3 = Math.round((pixelX3 + pixelX2) / 2);
							pixelY11 = Math.round((pixelY11 + pixelY12) / 2);
							pixelY13 = Math.round((pixelY13 + pixelY12) / 2);
							pixelY21 = Math.round((pixelY21 + pixelY22) / 2);
							pixelY23 = Math.round((pixelY23 + pixelY22) / 2);

							hitSprite = hitSprites.getChildAt(k) as DataSprite;

							hitGraphics = hitSprite.graphics;

							areaBrush.beginBrush(hitGraphics, null, brushBounds);
							areaBrush.moveTo(pixelX1, pixelY11);
							areaBrush.lineTo(pixelX2, pixelY12);
							areaBrush.lineTo(pixelX3, pixelY13);
							areaBrush.lineTo(pixelX3, pixelY23);
							areaBrush.lineTo(pixelX2, pixelY22);
							areaBrush.lineTo(pixelX1, pixelY21);
							areaBrush.lineTo(pixelX1, pixelY11);
							areaBrush.endBrush();

							hitSprite.tipBounds = new Rectangle(pixelX2, pixelY12, 0, 0);
							hitSprite.alpha = 0;
							hitSprite.visible = true;
						}

						if (stackMode > 0)
						{
							for (k = endIndex; k >= startIndex; k--)
							{
								pixelY = pixelsY[k];
								if (pixelY == pixelY)
									stackedPixels[k] = pixelY;
							}
						}

						startIndex = -1;
					}
				}

				hitMaskSprite.visible = true;
				hitMaskGraphics.beginFill(0x000000, 1);
				hitMaskGraphics.drawRect(0, 0, chartWidth, chartHeight);
			}
		}

	}

}

import flash.display.Shape;
import flash.display.Sprite;

class SeriesSprite extends Sprite
{

	// Public Properties

	public var field:String;
	public var areaSprite:Shape;
	public var areaMaskSprite:Shape;
	public var lineSprite:Shape;
	public var lineMaskSprite:Shape;
	public var hitSprites:Sprite;
	public var hitMaskSprite:Shape;

	// Constructor

	public function SeriesSprite()
	{
		this.areaSprite = new Shape();
		this.areaMaskSprite = new Shape();
		this.lineSprite = new Shape();
		this.lineMaskSprite = new Shape();
		this.hitSprites = new Sprite();
		this.hitMaskSprite = new Shape();

		this.areaSprite.mask = this.areaMaskSprite;
		this.lineSprite.mask = this.lineMaskSprite;
		this.hitSprites.mask = this.hitMaskSprite;

		this.hitSprites.mouseEnabled = false;
		this.mouseEnabled = false;

		this.addChild(this.areaSprite);
		this.addChild(this.areaMaskSprite);
		this.addChild(this.lineSprite);
		this.addChild(this.lineMaskSprite);
		this.addChild(this.hitSprites);
		this.addChild(this.hitMaskSprite);
	}

}

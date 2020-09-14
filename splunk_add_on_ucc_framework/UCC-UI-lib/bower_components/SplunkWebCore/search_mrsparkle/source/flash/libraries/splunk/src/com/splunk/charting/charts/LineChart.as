package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.LineShape;
	import com.jasongatt.graphics.shapes.MaximumSizeShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.graphics.shapes.UniformSizeShape;
	import com.jasongatt.motion.GroupTween;
	import com.jasongatt.motion.PropertyTween;
	import com.jasongatt.motion.TweenRunner;
	import com.jasongatt.utils.ArrayUtil;
	import com.jasongatt.utils.IComparator;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.controls.Tooltip;
	import com.splunk.data.IDataTable;
	import com.splunk.palettes.brush.IBrushPalette;
	import com.splunk.palettes.brush.SolidFillBrushPalette;
	import com.splunk.palettes.brush.SolidStrokeBrushPalette;
	import com.splunk.palettes.color.ListColorPalette;
	import com.splunk.palettes.shape.IShapePalette;
	import com.splunk.palettes.shape.ListShapePalette;
	import com.splunk.utils.Style;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class LineChart extends AbstractChart2D
	{

		// Private Properties

		private var _lineBrushPalette:ObservableProperty;
		private var _lineStyle:ObservableProperty;
		private var _markerBrushPalette:ObservableProperty;
		private var _markerShapePalette:ObservableProperty;
		private var _markerStyle:ObservableProperty;
		private var _markerSize:ObservableProperty;
		private var _showMarkers:ObservableProperty;
		private var _stackMode:ObservableProperty;
		private var _nullValueMode:ObservableProperty;

		private var _valuesX:Array;
		private var _valuesYSeries:Array;
		private var _positionsX:Array;
		private var _positionsYSeries:Array;
		private var _position0:Number;
		private var _nearPointData:Array;
		private var _highlightDataIndex:int = -1;

		private var _lastInteractionPoint:Point;
		private var _stage:Stage;
		private var _chartWidth:Number = 0;
		private var _chartHeight:Number = 0;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function LineChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);

			this._lineBrushPalette = new ObservableProperty(this, "lineBrushPalette", IBrushPalette, new SolidStrokeBrushPalette(1, colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._lineStyle = new ObservableProperty(this, "lineStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._markerBrushPalette = new ObservableProperty(this, "markerBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._markerShapePalette = new ObservableProperty(this, "markerShapePalette", IShapePalette, new ListShapePalette([ new RectangleShape() ]), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._markerStyle = new ObservableProperty(this, "markerStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._markerSize = new ObservableProperty(this, "markerSize", Number, 4, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._showMarkers = new ObservableProperty(this, "showMarkers", Boolean, true, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._stackMode = new ObservableProperty(this, "stackMode", String, StackMode.DEFAULT, this.invalidates(AbstractChart.PROCESS_DATA));
			this._nullValueMode = new ObservableProperty(this, "nullValueMode", String, NullValueMode.GAPS, this.invalidates(AbstractChart.RENDER_CHART));

			this._valuesX = new Array();
			this._valuesYSeries = new Array();
			this._positionsX = new Array();
			this._positionsYSeries = new Array();

			this.addEventListener(Event.ADDED_TO_STAGE, this._self_addedToStage, false, int.MAX_VALUE);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this._self_removedFromStage, false, int.MAX_VALUE);
		}

		// Public Getters/Setters

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

		public function get markerBrushPalette() : IBrushPalette
		{
			return this._markerBrushPalette.value;
		}
		public function set markerBrushPalette(value:IBrushPalette) : void
		{
			this._markerBrushPalette.value = value;
		}

		public function get markerShapePalette() : IShapePalette
		{
			return this._markerShapePalette.value;
		}
		public function set markerShapePalette(value:IShapePalette) : void
		{
			this._markerShapePalette.value = value;
		}

		public function get markerStyle() : Style
		{
			return this._markerStyle.value;
		}
		public function set markerStyle(value:Style) : void
		{
			this._markerStyle.value = value;
		}

		public function get markerSize() : Number
		{
			return this._markerSize.value;
		}
		public function set markerSize(value:Number) : void
		{
			this._markerSize.value = value;
		}

		public function get showMarkers() : Boolean
		{
			return this._showMarkers.value;
		}
		public function set showMarkers(value:Boolean) : void
		{
			this._showMarkers.value = value;
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
					var markerSprites:Sprite;
					var numMarkerSprites:int;
					var markerSprite:DataSprite;

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

						markerSprites = seriesSprite.markerSprites;
						numMarkerSprites = markerSprites.numChildren;

						fieldY = data.getColumnName(i + 1);

						seriesSprite.field = fieldY;

						valuesY = new Array();
						for (j = 0; j < numRows; j++)
						{
							value = data.getValue(j, i + 1);

							if (j < numMarkerSprites)
							{
								markerSprite = markerSprites.getChildAt(j) as DataSprite;
							}
							else
							{
								markerSprite = new DataSprite();
								markerSprite.chart = this;
								markerSprite.tipPlacement = Tooltip.LEFT_RIGHT;
								markerSprites.addChild(markerSprite);
							}

							markerSprite.seriesName = fieldY;
							markerSprite.fields = [ fieldX, fieldY ];
							markerSprite.data = new Object();
							markerSprite.data[fieldX] = valuesX[j];
							markerSprite.data[fieldY] = value;
							markerSprite.dataRowIndex = j;

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

						for (j = markerSprites.numChildren - 1; j >= numRows; j--)
							markerSprites.removeChildAt(j);
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

			var lineBrushPalette:IBrushPalette = this._lineBrushPalette.value;
			var lineStyle:Style = this._lineStyle.value;
			var markerBrushPalette:IBrushPalette = this._markerBrushPalette.value;
			var markerShapePalette:IShapePalette = this._markerShapePalette.value;
			var markerStyle:Style = this._markerStyle.value;
			var markerSize:Number = Math.max(this._markerSize.value, 0);
			var showMarkers:Boolean = this._showMarkers.value;

			var lineBrush:IBrush;
			var lineShape:IShape = new LineShape();
			var markerBrush:IBrush;
			var markerShape:IShape;

			var shapes:Array;
			var brushes:Array;
			var styles:Array;

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

				lineBrush = lineBrushPalette ? lineBrushPalette.getBrush(label, labelIndex, labelCount) : null;
				if (!lineBrush)
					lineBrush = new SolidStrokeBrush(1, 0x000000, 1);

				shapes.push(lineShape);
				brushes.push(lineBrush);
				styles.push(lineStyle);

				if (showMarkers)
				{
					markerBrush = markerBrushPalette ? markerBrushPalette.getBrush(label, labelIndex, labelCount) : null;
					if (!markerBrush)
						markerBrush = new SolidFillBrush(0x000000, 1);

					markerShape = markerShapePalette ? markerShapePalette.getShape(label, labelIndex, labelCount) : null;
					if (!markerShape)
						markerShape = new RectangleShape();
					markerShape = new UniformSizeShape(new MaximumSizeShape(markerShape, markerSize, markerSize));

					shapes.push(markerShape);
					brushes.push(markerBrush);
					styles.push(markerStyle);
				}

				swatches.push(new SeriesSwatch(shapes, brushes, styles, 3));
			}

			return swatches;
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var nearPointData:Array = this._nearPointData = new Array();
			this._chartWidth = chartWidth;
			this._chartHeight = chartHeight;

			var positionsX:Array = this._positionsX;
			var positionsYSeries:Array = this._positionsYSeries;
			var positionsY:Array;
			var numPositionsX:int = positionsX.length;
			var numPositionsYSeries:int = positionsYSeries.length;
			var pixelsX:Array = new Array(numPositionsX);
			var pixelsYSeries:Array = new Array(numPositionsYSeries);
			var pixelsY:Array;
			var zeroPixel:Number = Math.round(chartHeight * (1 - this._position0));
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

				nearPointData.push({ pixel:pixelsX[i], index:i });
			}

			nearPointData.sortOn("pixel", Array.NUMERIC);

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

			this._renderLines(chartWidth, chartHeight, legend, pixelsX, pixelsYSeries, zeroPixel, stackMode, nullValueMode);
			this._renderMarkers(chartWidth, chartHeight, legend, pixelsX, pixelsYSeries, zeroPixel, stackMode, nullValueMode);

			this._updateInteraction();
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
					element.visible = true;
					this._highlightedElement = element;
				}
			}
			else
			{
				a = 1;
				if (this._highlightedElement)
				{
					tweens.push(new PropertyTween(this._highlightedElement, "alpha", null, 1));
					this._highlightedElement.visible = this._showMarkers.value;
					this._highlightedElement = null;

					var point:Point = this._lastInteractionPoint;
					this._updateInteraction(new Point(-Infinity, -Infinity));
					this._updateInteraction(point);
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

		private function _renderLines(chartWidth:Number, chartHeight:Number, legend:ILegend, pixelsX:Array, pixelsYSeries:Array, zeroPixel:Number, stackMode:int, nullValueMode:int) : void
		{
			var brushBounds:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];

			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;

			var lineBrushPalette:IBrushPalette = this._lineBrushPalette.value;
			var lineStyle:Style = this._lineStyle.value;
			var lineSprite:Shape;
			var lineMaskSprite:Shape;
			var lineGraphics:Graphics;
			var lineMaskGraphics:Graphics;
			var lineBrush:IBrush;

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
				stackedPixels[i] = zeroPixel;

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

				if (zeroPixel != zeroPixel)
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
								pixelY = zeroPixel;
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

		private function _renderMarkers(chartWidth:Number, chartHeight:Number, legend:ILegend, pixelsX:Array, pixelsYSeries:Array, zeroPixel:Number, stackMode:int, nullValueMode:int) : void
		{
			var brushBounds:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];

			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;

			var markerBrushPalette:IBrushPalette = this._markerBrushPalette.value;
			var markerShapePalette:IShapePalette = this._markerShapePalette.value;
			var markerStyle:Style = this._markerStyle.value;
			var markerSize:Number = Math.max(this._markerSize.value, 0);
			var markerHitAreaSize:Number = Math.max(markerSize, 10);
			var markerSprites:Sprite;
			var markerSprite:DataSprite;
			var markerGraphics:Graphics;
			var markerBrush:IBrush;
			var markerShape:IShape;

			var showMarkers:Boolean = this._showMarkers.value;

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
				stackedPixels[i] = zeroPixel;

			seriesCount = legend ? legend.numLabels : numPixelsYSeries;

			for (i = 0; i < numPixelsYSeries; i++)
			{
				pixelsY = pixelsYSeries[i];

				seriesSprite = this.getChildAt(i) as SeriesSprite;

				markerSprites = seriesSprite.markerSprites;

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				markerBrush = markerBrushPalette ? markerBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!markerBrush)
					markerBrush = new SolidFillBrush(0x000000, 1);

				markerShape = markerShapePalette ? markerShapePalette.getShape(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!markerShape)
					markerShape = new RectangleShape();

				startIndex = -1;

				for (j = 0; j < numPixelsX; j++)
				{
					for (j; j < numPixelsX; j++)
					{
						markerSprite = markerSprites.getChildAt(j) as DataSprite;
						markerSprite.visible = false;

						markerGraphics = markerSprite.graphics;
						markerGraphics.clear();

						if (zeroPixel != zeroPixel)
						{
							Style.applyStyle(markerSprite, markerStyle);
							continue;
						}

						pixelX = pixelsX[j];
						if (pixelX != pixelX)
							continue;

						pixelY = pixelsY[j];
						if (pixelY != pixelY)
						{
							if (stackMode > 0)
								pixelY = stackedPixels[j];
							else if (nullValueMode == 0)
								pixelY = zeroPixel;
							else if (nullValueMode == 1)
								break;
							else
								continue;
						}

						if (startIndex < 0)
						{
							startIndex = j;
							startPixel = pixelY;
						}

						if ((pixelX >= 0) && (pixelX <= chartWidth) && (pixelY >= 0) && (pixelY <= chartHeight))
						{
							// draw marker hit area
							markerGraphics.beginFill(0x000000, 0);
							markerGraphics.drawRect(Math.round(pixelX - markerHitAreaSize / 2), Math.round(pixelY - markerHitAreaSize / 2), markerHitAreaSize, markerHitAreaSize);
							markerGraphics.endFill();

							// draw marker
							markerShape.draw(markerGraphics, Math.round(pixelX - markerSize / 2), Math.round(pixelY - markerSize / 2), markerSize, markerSize, markerBrush, null, brushBounds);

							markerSprite.tipBounds = new Rectangle(Math.round(pixelX - markerSize / 2), Math.round(pixelY - markerSize / 2), markerSize, markerSize);
							markerSprite.visible = showMarkers;
						}

						Style.applyStyle(markerSprite, markerStyle);

						endIndex = j;
					}

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
			}
		}

		private function _updateInteraction(point:Point = null) : void
		{
			if (!point)
				point = this._lastInteractionPoint;

			var markerSize:Number = Math.max(this._markerSize.value, 0) / 2;

			if (point && ((point.x < -markerSize) || (point.x > (this._chartWidth + markerSize)) || (point.y < -markerSize) || (point.y > (this._chartHeight + markerSize))))
				point = null;

			this._lastInteractionPoint = point;

			if (!point)
			{
				this._highlightData(-1);
				return;
			}

			var nearPointData:Array = this._nearPointData;
			if (!nearPointData)
			{
				this._highlightData(-1);
				return;
			}

			var numPointData:int = nearPointData.length;
			if (numPointData == 0)
			{
				this._highlightData(-1);
				return;
			}

			var x:Number = point.x;
			var index:int = ArrayUtil.binarySearch(nearPointData, x, POINT_DATA_COMPARATOR);
			if (index < 0)
			{
				var indexHigh:int = -index - 1;
				var indexLow:int = indexHigh - 1;
				if (indexLow < 0)
					index = indexHigh;
				else if (indexHigh >= numPointData)
					index = indexLow;
				else if (Math.abs(nearPointData[indexLow].pixel - x) < Math.abs(nearPointData[indexHigh].pixel - x))
					index = indexLow;
				else
					index = indexHigh;
			}

			var pointData:Object = nearPointData[index];
			var rowIndex:int = pointData.index;

			this._highlightData(rowIndex);
		}

		private function _highlightData(index:int) : void
		{
			var lastIndex:int = this._highlightDataIndex;
			if (index == lastIndex)
				return;

			this._highlightDataIndex = index;

			var numSeriesSprites:int = this.numChildren;
			var seriesSprite:SeriesSprite;
			var markerSprites:Sprite;
			var numMarkerSprites:int;
			var markerSprite:DataSprite;
			var showMarkers:Boolean = this._showMarkers.value;

			for (var i:int = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = this.getChildAt(i) as SeriesSprite;
				markerSprites = seriesSprite.markerSprites;
				numMarkerSprites = markerSprites.numChildren;

				if ((lastIndex >= 0) && (lastIndex < numMarkerSprites))
				{
					markerSprite = markerSprites.getChildAt(lastIndex) as DataSprite;
					markerSprite.visible = showMarkers || (markerSprite == this._highlightedElement);
				}

				if ((index >= 0) && (index < numMarkerSprites))
				{
					markerSprite = markerSprites.getChildAt(index) as DataSprite;
					markerSprite.visible = true;
				}
			}
		}

		private function _self_addedToStage(e:Event) : void
		{
			var stage:Stage = this.stage;
			if (!stage)
				return;

			this._stage = stage;

			stage.addEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove, false, int.MAX_VALUE);
			stage.addEventListener(Event.MOUSE_LEAVE, this._stage_mouseLeave, false, int.MAX_VALUE);
		}

		private function _self_removedFromStage(e:Event) : void
		{
			var stage:Stage = this._stage;
			if (!stage)
				return;

			this._stage = null;

			stage.removeEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove);
			stage.removeEventListener(Event.MOUSE_LEAVE, this._stage_mouseLeave);
		}

		private function _stage_mouseMove(e:MouseEvent) : void
		{
			this._updateInteraction(this.globalToLocal(new Point(e.stageX, e.stageY)));
		}

		private function _stage_mouseLeave(e:Event) : void
		{
			this._updateInteraction(new Point(-Infinity, -Infinity));
		}

	}

}

import com.jasongatt.utils.IComparator;
import flash.display.Shape;
import flash.display.Sprite;

class SeriesSprite extends Sprite
{

	// Public Properties

	public var field:String;
	public var lineSprite:Shape;
	public var lineMaskSprite:Shape;
	public var markerSprites:Sprite;

	// Constructor

	public function SeriesSprite()
	{
		this.lineSprite = new Shape();
		this.lineMaskSprite = new Shape();
		this.markerSprites = new Sprite();

		this.lineSprite.mask = this.lineMaskSprite;

		this.markerSprites.mouseEnabled = false;
		this.mouseEnabled = false;

		this.addChild(this.lineSprite);
		this.addChild(this.lineMaskSprite);
		this.addChild(this.markerSprites);
	}

}


class PointDataComparator implements IComparator
{

	// Constructor

	public function PointDataComparator()
	{
	}

	// Public Methods

	public function compare(value1:*, value2:*) : Number
	{
		var x:Number = value1;
		var pixel:Number = value2.pixel;
		if (x < pixel)
			return -1;
		if (x > pixel)
			return 1;
		return 0;
	}

}

const POINT_DATA_COMPARATOR:IComparator = new PointDataComparator();

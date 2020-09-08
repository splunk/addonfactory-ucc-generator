package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.graphics.shapes.UniformSizeShape;
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
	import com.splunk.palettes.color.ListColorPalette;
	import com.splunk.palettes.shape.IShapePalette;
	import com.splunk.palettes.shape.ListShapePalette;
	import com.splunk.utils.Style;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class ColumnChart extends AbstractChart2D
	{

		// Private Properties

		private var _columnBrushPalette:ObservableProperty;
		private var _columnShapePalette:ObservableProperty;
		private var _columnStyle:ObservableProperty;
		private var _columnAlignment:ObservableProperty;
		private var _columnSpacing:ObservableProperty;
		private var _seriesSpacing:ObservableProperty;
		private var _useAbsoluteSpacing:ObservableProperty;
		private var _stackMode:ObservableProperty;

		private var _cachedStackMode:int;
		private var _valueDataX:Array;
		private var _valueDataY:Array;
		private var _absoluteDataX:Array;
		private var _absoluteDataY:Array;
		private var _relativeDataX:Array;
		private var _relativeDataY:Array;
		private var _seriesSprites:Array;

		private var _seriesMask:Shape;
		private var _seriesContainer:Sprite;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function ColumnChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);

			this._columnBrushPalette = new ObservableProperty(this, "columnBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._columnShapePalette = new ObservableProperty(this, "columnShapePalette", IShapePalette, new ListShapePalette([ new RectangleShape() ]), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._columnStyle = new ObservableProperty(this, "columnStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._columnAlignment = new ObservableProperty(this, "columnAlignment", Number, 0.5, this.invalidates(AbstractChart2D.PROCESS_VALUES_X));
			this._columnSpacing = new ObservableProperty(this, "columnSpacing", Number, 1, this.invalidates(AbstractChart.RENDER_CHART));
			this._seriesSpacing = new ObservableProperty(this, "seriesSpacing", Number, 0, this.invalidates(AbstractChart.RENDER_CHART));
			this._useAbsoluteSpacing = new ObservableProperty(this, "useAbsoluteSpacing", Boolean, false, this.invalidates(AbstractChart.RENDER_CHART));
			this._stackMode = new ObservableProperty(this, "stackMode", String, StackMode.DEFAULT, this.invalidates(AbstractChart.PROCESS_DATA));

			this._valueDataX = new Array();
			this._valueDataY = new Array();
			this._absoluteDataX = new Array();
			this._absoluteDataY = new Array();
			this._relativeDataX = new Array();
			this._relativeDataY = new Array();
			this._seriesSprites = new Array();

			this._seriesMask = new Shape();

			this._seriesContainer = new Sprite();
			this._seriesContainer.mouseEnabled = false;
			this._seriesContainer.mask = this._seriesMask;

			this.addChild(this._seriesContainer);
			this.addChild(this._seriesMask);
		}

		// Public Getters/Setters

		public function get columnBrushPalette() : IBrushPalette
		{
			return this._columnBrushPalette.value;
		}
		public function set columnBrushPalette(value:IBrushPalette) : void
		{
			this._columnBrushPalette.value = value;
		}

		public function get columnShapePalette() : IShapePalette
		{
			return this._columnShapePalette.value;
		}
		public function set columnShapePalette(value:IShapePalette) : void
		{
			this._columnShapePalette.value = value;
		}

		public function get columnStyle() : Style
		{
			return this._columnStyle.value;
		}
		public function set columnStyle(value:Style) : void
		{
			this._columnStyle.value = value;
		}

		public function get columnAlignment() : Number
		{
			return this._columnAlignment.value;
		}
		public function set columnAlignment(value:Number) : void
		{
			this._columnAlignment.value = value;
		}

		public function get columnSpacing() : Number
		{
			return this._columnSpacing.value;
		}
		public function set columnSpacing(value:Number) : void
		{
			this._columnSpacing.value = value;
		}

		public function get seriesSpacing() : Number
		{
			return this._seriesSpacing.value;
		}
		public function set seriesSpacing(value:Number) : void
		{
			this._seriesSpacing.value = value;
		}

		public function get useAbsoluteSpacing() : Boolean
		{
			return this._useAbsoluteSpacing.value;
		}
		public function set useAbsoluteSpacing(value:Boolean) : void
		{
			this._useAbsoluteSpacing.value = value;
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

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			switch (this._stackMode.value)
			{
				case StackMode.STACKED_100:
					this._cachedStackMode = 2;
					break;
				case StackMode.STACKED:
					this._cachedStackMode = 1;
					break;
				default:
					this._cachedStackMode = 0;
					break;
			}

			var valueDataX:Array = this._valueDataX = new Array();
			var valueDataY:Array = this._valueDataY = new Array();
			var seriesSprites:Array = this._seriesSprites;
			var numSeries:int = 0;
			var i:int;

			if (data)
			{
				var numDataColumns:int = data.numColumns;
				var numDataRows:int = data.numRows;

				if ((numDataColumns > 1) && (numDataRows > 0))
				{
					numSeries = numDataColumns - 1;

					var stackMode:int = this._cachedStackMode;
					var valueData:ValueData;
					var zeroData:ValueData;
					var positiveData:ValueData;
					var negativeData:ValueData;
					var total:Number;
					var j:int;

					var numSeriesSprites:int = seriesSprites.length;
					var seriesSprite:SeriesSprite;
					var columnSprites:Array;
					var numColumnSprites:int;
					var columnSprite:ColumnSprite;

					var fieldX:String = data.getColumnName(0);
					var fieldY:String;

					// get values
					zeroData = new ValueData(0);
					valueDataY.push(zeroData);
					for (i = 0; i < numDataRows; i++)
					{
						valueData = new ValueData(data.getValue(i, 0));
						valueDataX.push(valueData);

						for (j = 0; j < numSeries; j++)
						{
							valueData = new ValueData(data.getValue(i, j + 1));
							valueData.next = zeroData;
							valueDataY.push(valueData);
						}
					}

					// stack values
					if (stackMode > 0)
					{
						for (i = 0; i < numDataRows; i++)
						{
							positiveData = negativeData = zeroData;
							total = 0;

							for (j = 0; j < numSeries; j++)
							{
								valueData = valueDataY[1 + (numSeries * i) + j];

								if (valueData.stackedValue != valueData.stackedValue)
									continue;

								if (stackMode > 1)
									total += Math.abs(valueData.stackedValue);

								if (valueData.stackedValue < 0)
								{
									valueData.stackedValue += negativeData.stackedValue;
									valueData.next = negativeData;
									negativeData = valueData;
								}
								else
								{
									valueData.stackedValue += positiveData.stackedValue;
									valueData.next = positiveData;
									positiveData = valueData;
								}
							}

							if ((stackMode > 1) && (total > 0))
							{
								for (j = 0; j < numSeries; j++)
								{
									valueData = valueDataY[1 + (numSeries * i) + j];
									valueData.stackedValue = 100 * NumberUtil.minMax(valueData.stackedValue / total, -1, 1);
								}
							}
						}
					}

					// update sprites
					for (i = 0; i < numSeries; i++)
					{
						if (i < numSeriesSprites)
						{
							seriesSprite = seriesSprites[i];
						}
						else
						{
							seriesSprite = new SeriesSprite();
							seriesSprites.push(seriesSprite);
							this._seriesContainer.addChild(seriesSprite);
						}

						columnSprites = seriesSprite.columnSprites;
						numColumnSprites = columnSprites.length;

						fieldY = data.getColumnName(i + 1);

						seriesSprite.field = fieldY;

						for (j = 0; j < numDataRows; j++)
						{
							if (j < numColumnSprites)
							{
								columnSprite = columnSprites[j];
							}
							else
							{
								columnSprite = new ColumnSprite();
								columnSprite.chart = this;
								columnSprite.tipPlacement = Tooltip.LEFT_RIGHT;
								columnSprites.push(columnSprite);
								seriesSprite.addChild(columnSprite);
							}

							columnSprite.valueDataX = valueDataX[j];
							columnSprite.valueDataY = valueDataY[1 + (numSeries * j) + i];
							columnSprite.seriesName = fieldY;
							columnSprite.fields = [ fieldX, fieldY ];
							columnSprite.data = new Object();
							columnSprite.data[fieldX] = columnSprite.valueDataX.value;
							columnSprite.data[fieldY] = columnSprite.valueDataY.value;
							columnSprite.dataRowIndex = j;
						}

						for (j = columnSprites.length - 1; j >= numDataRows; j--)
						{
							columnSprite = columnSprites.pop();
							seriesSprite.removeChild(columnSprite);
						}
					}
				}
			}

			// remove unused sprites
			for (i = seriesSprites.length - 1; i >= numSeries; i--)
			{
				seriesSprite = seriesSprites.pop();
				this._seriesContainer.removeChild(seriesSprite);
			}
		}

		protected override function updateAxisValuesXOverride() : Array
		{
			var valuesX:Array = new Array();

			for each (var valueData:ValueData in this._valueDataX)
				valuesX.push(valueData.value);

			return valuesX;
		}

		protected override function updateAxisValuesYOverride() : Array
		{
			var valuesY:Array = new Array();

			for each (var valueData:ValueData in this._valueDataY)
			{
				if (valueData.stackedValue == valueData.stackedValue)
					valuesY.push(valueData.stackedValue);
			}

			// remove forced zero
			if (valuesY.length > 0)
				valuesY.shift();

			return valuesY;
		}

		protected override function processValuesXOverride(axisX:IAxis) : void
		{
			var absoluteDataX:Array = this._absoluteDataX = new Array();

			if (!axisX)
				return;

			var valueData1:ValueData;
			var valueData2:ValueData;
			var valueData3:ValueData;
			var numAbsoluteDataX:int;

			for each (valueData1 in this._valueDataX)
			{
				valueData1.absolute = axisX.valueToAbsolute(valueData1.value);
				if (valueData1.absolute == valueData1.absolute)
					absoluteDataX.push(valueData1);
			}

			absoluteDataX.sortOn("absolute", Array.NUMERIC);

			numAbsoluteDataX = absoluteDataX.length;
			if (numAbsoluteDataX > 0)
			{
				var minSpacing:Number = Infinity;
				var i:int;

				valueData1 = absoluteDataX[0];
				for (i = 1; i < numAbsoluteDataX; i++)
				{
					valueData2 = absoluteDataX[i];
					minSpacing = Math.min(minSpacing, valueData2.absolute - valueData1.absolute);
					valueData1 = valueData2;
				}

				if (minSpacing == Infinity)
					minSpacing = 1;

				valueData1 = absoluteDataX[0];
				valueData2 = absoluteDataX[numAbsoluteDataX - 1];

				valueData3 = new ValueData();
				valueData3.absolute = valueData1.absolute - minSpacing;
				absoluteDataX.unshift(valueData3);

				valueData3 = new ValueData();
				valueData3.absolute = valueData2.absolute + minSpacing;
				absoluteDataX.push(valueData3);

				var threshold:Number = minSpacing * 1.1;
				for (i = absoluteDataX.length - 1; i > 0; i--)
				{
					valueData1 = absoluteDataX[i - 1];
					valueData2 = absoluteDataX[i];
					if ((valueData2.absolute - valueData1.absolute) > threshold)
					{
						valueData3 = new ValueData();
						valueData3.absolute = valueData2.absolute - minSpacing;
						absoluteDataX.splice(i, 0, valueData3);

						valueData3 = new ValueData();
						valueData3.absolute = valueData1.absolute + minSpacing;
						absoluteDataX.splice(i, 0, valueData3);
					}
				}

				var columnAlignment:Number = this._columnAlignment.value;
				for (i = absoluteDataX.length - 1; i > 0; i--)
				{
					valueData1 = absoluteDataX[i - 1];
					valueData2 = absoluteDataX[i];

					valueData1.next = valueData2;
					valueData2.absolute = valueData1.absolute * columnAlignment + valueData2.absolute * (1 - columnAlignment);
				}

				absoluteDataX.shift();
			}
		}

		protected override function processValuesYOverride(axisY:IAxis) : void
		{
			var absoluteDataY:Array = this._absoluteDataY = new Array();

			if (!axisY)
				return;

			var valueData1:ValueData;

			for each (valueData1 in this._valueDataY)
			{
				if (valueData1.stackedValue == valueData1.stackedValue)
				{
					valueData1.absolute = axisY.valueToAbsolute(valueData1.stackedValue);
					if (valueData1.absolute == valueData1.absolute)
						absoluteDataY.push(valueData1);
				}
			}
		}

		protected override function updateAxisRangeXOverride() : Array
		{
			var absoluteDataX:Array = this._absoluteDataX;
			var numAbsoluteDataX:int = absoluteDataX.length;
			if (numAbsoluteDataX < 1)
				return null;

			var valueDataMin:ValueData = absoluteDataX[0];
			var valueDataMax:ValueData = absoluteDataX[numAbsoluteDataX - 1];

			return [ valueDataMin.absolute, valueDataMax.absolute ];
		}

		protected override function processAbsolutesXOverride(axisX:IAxis) : void
		{
			var relativeDataX:Array = this._relativeDataX = new Array();

			if (!axisX)
				return;

			var valueData:ValueData;

			for each (valueData in this._absoluteDataX)
			{
				valueData.relative = axisX.absoluteToRelative(valueData.absolute);
				if (valueData.relative == valueData.relative)
					relativeDataX.push(valueData);
			}
		}

		protected override function processAbsolutesYOverride(axisY:IAxis) : void
		{
			var relativeDataY:Array = this._relativeDataY = new Array();

			if (!axisY)
				return;

			var valueData:ValueData;

			for each (valueData in this._absoluteDataY)
			{
				valueData.relative = axisY.absoluteToRelative(valueData.absolute);
				if (valueData.relative == valueData.relative)
					relativeDataY.push(valueData);
			}
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

			var columnBrushPalette:IBrushPalette = this._columnBrushPalette.value;
			var columnShapePalette:IShapePalette = this._columnShapePalette.value;
			var columnStyle:Style = this._columnStyle.value;

			var columnBrush:IBrush;
			var columnShape:IShape;

			var numLabels:int = labels.length;
			var label:String;
			var labelIndex:int;
			var labelCount:int = legend ? legend.numLabels : numLabels;

			for (var i:int = 0; i < numLabels; i++)
			{
				label = labels[i];
				labelIndex = legend ? legend.getLabelIndex(label) : i;

				columnBrush = columnBrushPalette ? columnBrushPalette.getBrush(label, labelIndex, labelCount) : null;
				if (!columnBrush)
					columnBrush = new SolidFillBrush(0x000000, 1);

				columnShape = columnShapePalette ? columnShapePalette.getShape(label, labelIndex, labelCount) : null;
				if (!columnShape)
					columnShape = new RectangleShape();
				columnShape = new UniformSizeShape(columnShape);

				swatches.push(new SeriesSwatch([ columnShape ], [ columnBrush ], [ columnStyle ], 1));
			}

			return swatches;
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var renderKey:Object = new Object();

			var relativeDataX:Array = this._relativeDataX;
			var relativeDataY:Array = this._relativeDataY;
			var valueData:ValueData;

			for each (valueData in relativeDataX)
			{
				valueData.renderKey = renderKey;
				valueData.pixel = Math.round(chartWidth * valueData.relative);
			}

			for each (valueData in relativeDataY)
			{
				valueData.renderKey = renderKey;
				valueData.pixel = Math.round(chartHeight * (1 - valueData.relative));
			}

			var zeroData:ValueData = (relativeDataY.length > 0) ? relativeDataY[0] : null;
			var zeroPixel:Number = zeroData ? zeroData.pixel : chartHeight;
			var brushBounds1:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, zeroPixel), new Point(0, zeroPixel) ];
			var brushBounds2:Array = [ new Point(0, zeroPixel), new Point(chartWidth, zeroPixel), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];
			var brushBounds:Array;

			var columnBrushPalette:IBrushPalette = this._columnBrushPalette.value;
			var columnShapePalette:IShapePalette = this._columnShapePalette.value;
			var columnStyle:Style = this._columnStyle.value;
			var columnSpacing:Number = Math.max(this._columnSpacing.value, 0);
			var seriesSpacing:Number = Math.max(this._seriesSpacing.value, 0);
			var useAbsoluteSpacing:Boolean = this._useAbsoluteSpacing.value;
			var stackMode:int = this._cachedStackMode;

			var seriesSprites:Array = this._seriesSprites;
			var numSeriesSprites:int = seriesSprites.length;
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;
			var columnSprites:Array;
			var numColumnSprites:int;
			var columnSprite:ColumnSprite;

			var columnBrush:IBrush;
			var columnShape:IShape;
			var columnGraphics:Graphics;

			var valueDataX1:ValueData;
			var valueDataX2:ValueData;
			var valueDataY1:ValueData;
			var valueDataY2:ValueData;
			var x1:Number;
			var x2:Number;
			var y1:Number;
			var y2:Number;
			var i:int;
			var j:int;

			var availableSpace:Number;
			var totalSpacing:Number;
			var actualColumnSpacing:Number;
			var actualSeriesSpacing:Number;

			seriesCount = legend ? legend.numLabels : numSeriesSprites;

			for (i = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = seriesSprites[i];
				columnSprites = seriesSprite.columnSprites;
				numColumnSprites = columnSprites.length;

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				columnBrush = columnBrushPalette ? columnBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!columnBrush)
					columnBrush = new SolidFillBrush(0x000000, 1);

				columnShape = columnShapePalette ? columnShapePalette.getShape(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!columnShape)
					columnShape = new RectangleShape();

				for (j = 0; j < numColumnSprites; j++)
				{
					columnSprite = columnSprites[j];
					columnSprite.visible = false;

					columnGraphics = columnSprite.graphics;
					columnGraphics.clear();

					valueDataX1 = columnSprite.valueDataX;
					valueDataX2 = valueDataX1.next;
					valueDataY1 = columnSprite.valueDataY;
					valueDataY2 = valueDataY1.next;

					if ((valueDataX1.renderKey == renderKey) && (valueDataX2.renderKey == renderKey) && (valueDataY1.renderKey == renderKey) && (valueDataY2.renderKey == renderKey))
					{
						if ((Math.max(valueDataX1.relative, valueDataX2.relative) < 0) ||
						    (Math.min(valueDataX1.relative, valueDataX2.relative) > 1) ||
						    (Math.max(valueDataY1.relative, valueDataY2.relative) < 0) ||
						    (Math.min(valueDataY1.relative, valueDataY2.relative) > 1))
							continue;

						x1 = valueDataX1.pixel;
						x2 = valueDataX2.pixel;
						y1 = valueDataY1.pixel;
						y2 = valueDataY2.pixel;

						if (x1 < x2)
							availableSpace = x2 - x1;
						else
							availableSpace = x1 - x2;

						if ((stackMode > 0) || (numSeriesSprites == 1))
						{
							if (useAbsoluteSpacing)
							{
								if (columnSpacing < availableSpace)
									actualColumnSpacing = columnSpacing;
								else
									actualColumnSpacing = availableSpace;
							}
							else
							{
								actualColumnSpacing = availableSpace * (columnSpacing / (1 + columnSpacing));
							}

							actualColumnSpacing /= 2;
							if (x1 < x2)
							{
								x1 += actualColumnSpacing;
								x2 -= actualColumnSpacing;
							}
							else
							{
								x1 -= actualColumnSpacing;
								x2 += actualColumnSpacing;
							}
						}
						else
						{
							if (useAbsoluteSpacing)
							{
								totalSpacing = columnSpacing + seriesSpacing * (numSeriesSprites - 1);
								if (totalSpacing > availableSpace)
								{
									actualColumnSpacing = columnSpacing * (availableSpace / totalSpacing);
									actualSeriesSpacing = seriesSpacing * (availableSpace / totalSpacing);
								}
								else
								{
									actualColumnSpacing = columnSpacing;
									actualSeriesSpacing = seriesSpacing;
								}
							}
							else
							{
								totalSpacing = numSeriesSprites + columnSpacing + seriesSpacing * (numSeriesSprites - 1);
								actualColumnSpacing = availableSpace * (columnSpacing / totalSpacing);
								actualSeriesSpacing = availableSpace * (seriesSpacing / totalSpacing);
							}

							actualColumnSpacing /= 2;
							if (x1 < x2)
							{
								x1 += actualColumnSpacing;
								x2 -= actualColumnSpacing;

								availableSpace = ((x2 - x1) - (actualSeriesSpacing * (numSeriesSprites - 1))) / numSeriesSprites;

								if ((i + 1) < numSeriesSprites)
									x2 = x1 + (availableSpace + actualSeriesSpacing) * (i + 1) - actualSeriesSpacing;
								if (i > 0)
									x1 += (availableSpace + actualSeriesSpacing) * i;
							}
							else
							{
								x1 -= actualColumnSpacing;
								x2 += actualColumnSpacing;

								availableSpace = ((x1 - x2) - (actualSeriesSpacing * (numSeriesSprites - 1))) / numSeriesSprites;

								if ((i + 1) < numSeriesSprites)
									x2 = x1 - (availableSpace + actualSeriesSpacing) * (i + 1) + actualSeriesSpacing;
								if (i > 0)
									x1 -= (availableSpace + actualSeriesSpacing) * i;
							}
						}

						x1 = Math.round(x1);
						x2 = Math.round(x2);

						if (x1 == x2)
						{
							if (valueDataX1.relative < valueDataX2.relative)
								x2++;
							else if (valueDataX1.relative > valueDataX2.relative)
								x2--;
						}

						if (y1 == y2)
						{
							if (valueDataY1.relative < valueDataY2.relative)
								y1++;
							else if (valueDataY1.relative > valueDataY2.relative)
								y1--;
						}

						brushBounds = (y1 <= y2) ? brushBounds1 : brushBounds2;

						if (x1 > x2)
						{
							var temp:Number = x1;
							x1 = x2;
							x2 = temp;
						}

						columnShape.draw(columnGraphics, x1, y1, x2 - x1, y2 - y1, columnBrush, null, brushBounds);

						columnSprite.tipBounds = new Rectangle(x1, y1, x2 - x1, 0);
						columnSprite.visible = true;
					}

					Style.applyStyle(columnSprite, columnStyle);
				}
			}

			var maskGraphics:Graphics = this._seriesMask.graphics;
			maskGraphics.clear();
			maskGraphics.beginFill(0x000000, 1);
			maskGraphics.drawRect(0, 0, Math.round(chartWidth), Math.round(chartHeight));
			maskGraphics.endFill();
		}

		protected override function highlightSeriesOverride(seriesName:String) : void
		{
			var tweens:Array = new Array();

			var a:Number = AbstractChart.HIGHLIGHT_RATIO;

			var seriesSprites:Array = this._seriesSprites;
			var numSeriesSprites:int = seriesSprites.length;
			var seriesSprite:SeriesSprite;
			for (var i:int = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = seriesSprites[i];
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
					tweens.push(new PropertyTween(this._highlightedElement, "alpha", null, 1));
					this._highlightedElement = null;
				}
			}

			var seriesSprites:Array = this._seriesSprites;
			var numSeriesSprites:int = seriesSprites.length;
			var seriesSprite:SeriesSprite;
			for (var i:int = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = seriesSprites[i];
				if (seriesSprite)
					tweens.push(new PropertyTween(seriesSprite, "alpha", null, a));
			}

			if (tweens.length > 0)
				TweenRunner.start(new GroupTween(tweens, AbstractChart.HIGHLIGHT_EASER), AbstractChart.HIGHLIGHT_DURATION);
		}

	}

}

import com.jasongatt.utils.NumberUtil;
import com.splunk.charting.charts.DataSprite;
import flash.display.Sprite;

class ValueData
{

	// Public Properties

	public var value:*;
	public var stackedValue:Number;
	public var absolute:Number;
	public var relative:Number;
	public var pixel:Number;
	public var next:ValueData;
	public var renderKey:Object;

	// Constructor

	public function ValueData(value:* = null)
	{
		this.value = value;
		this.stackedValue = NumberUtil.parseNumber(value);
	}

}

class SeriesSprite extends Sprite
{

	// Public Properties

	public var field:String;
	public var columnSprites:Array;

	// Constructor

	public function SeriesSprite()
	{
		this.columnSprites = new Array();

		this.mouseEnabled = false;
	}

}

class ColumnSprite extends DataSprite
{

	// Public Properties

	public var valueDataX:ValueData;
	public var valueDataY:ValueData;

	// Constructor

	public function ColumnSprite()
	{
	}

}

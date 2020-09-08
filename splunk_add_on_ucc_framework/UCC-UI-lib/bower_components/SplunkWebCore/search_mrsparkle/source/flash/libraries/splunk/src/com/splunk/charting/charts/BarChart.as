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

	public class BarChart extends AbstractChart2D
	{

		// Private Properties

		private var _barBrushPalette:ObservableProperty;
		private var _barShapePalette:ObservableProperty;
		private var _barStyle:ObservableProperty;
		private var _barAlignment:ObservableProperty;
		private var _barSpacing:ObservableProperty;
		private var _seriesSpacing:ObservableProperty;
		private var _useAbsoluteSpacing:ObservableProperty;
		private var _stackMode:ObservableProperty;

		private var _cachedStackMode:int;
		private var _valueDataY:Array;
		private var _valueDataX:Array;
		private var _absoluteDataY:Array;
		private var _absoluteDataX:Array;
		private var _relativeDataY:Array;
		private var _relativeDataX:Array;
		private var _seriesSprites:Array;

		private var _seriesMask:Shape;
		private var _seriesContainer:Sprite;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function BarChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);

			this._barBrushPalette = new ObservableProperty(this, "barBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._barShapePalette = new ObservableProperty(this, "barShapePalette", IShapePalette, new ListShapePalette([ new RectangleShape() ]), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._barStyle = new ObservableProperty(this, "barStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._barAlignment = new ObservableProperty(this, "barAlignment", Number, 0.5, this.invalidates(AbstractChart2D.PROCESS_VALUES_Y));
			this._barSpacing = new ObservableProperty(this, "barSpacing", Number, 1, this.invalidates(AbstractChart.RENDER_CHART));
			this._seriesSpacing = new ObservableProperty(this, "seriesSpacing", Number, 0, this.invalidates(AbstractChart.RENDER_CHART));
			this._useAbsoluteSpacing = new ObservableProperty(this, "useAbsoluteSpacing", Boolean, false, this.invalidates(AbstractChart.RENDER_CHART));
			this._stackMode = new ObservableProperty(this, "stackMode", String, StackMode.DEFAULT, this.invalidates(AbstractChart.PROCESS_DATA));

			this._valueDataY = new Array();
			this._valueDataX = new Array();
			this._absoluteDataY = new Array();
			this._absoluteDataX = new Array();
			this._relativeDataY = new Array();
			this._relativeDataX = new Array();
			this._seriesSprites = new Array();

			this._seriesMask = new Shape();

			this._seriesContainer = new Sprite();
			this._seriesContainer.mouseEnabled = false;
			this._seriesContainer.mask = this._seriesMask;

			this.addChild(this._seriesContainer);
			this.addChild(this._seriesMask);
		}

		// Public Getters/Setters

		public function get barBrushPalette() : IBrushPalette
		{
			return this._barBrushPalette.value;
		}
		public function set barBrushPalette(value:IBrushPalette) : void
		{
			this._barBrushPalette.value = value;
		}

		public function get barShapePalette() : IShapePalette
		{
			return this._barShapePalette.value;
		}
		public function set barShapePalette(value:IShapePalette) : void
		{
			this._barShapePalette.value = value;
		}

		public function get barStyle() : Style
		{
			return this._barStyle.value;
		}
		public function set barStyle(value:Style) : void
		{
			this._barStyle.value = value;
		}

		public function get barAlignment() : Number
		{
			return this._barAlignment.value;
		}
		public function set barAlignment(value:Number) : void
		{
			this._barAlignment.value = value;
		}

		public function get barSpacing() : Number
		{
			return this._barSpacing.value;
		}
		public function set barSpacing(value:Number) : void
		{
			this._barSpacing.value = value;
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

			var valueDataY:Array = this._valueDataY = new Array();
			var valueDataX:Array = this._valueDataX = new Array();
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
					var barSprites:Array;
					var numBarSprites:int;
					var barSprite:BarSprite;

					var fieldY:String = data.getColumnName(0);
					var fieldX:String;

					// get values
					zeroData = new ValueData(0);
					valueDataX.push(zeroData);
					for (i = 0; i < numDataRows; i++)
					{
						valueData = new ValueData(data.getValue(i, 0));
						valueDataY.push(valueData);

						for (j = 0; j < numSeries; j++)
						{
							valueData = new ValueData(data.getValue(i, j + 1));
							valueData.next = zeroData;
							valueDataX.push(valueData);
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
								valueData = valueDataX[1 + (numSeries * i) + j];

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
									valueData = valueDataX[1 + (numSeries * i) + j];
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

						barSprites = seriesSprite.barSprites;
						numBarSprites = barSprites.length;

						fieldX = data.getColumnName(i + 1);

						seriesSprite.field = fieldX;

						for (j = 0; j < numDataRows; j++)
						{
							if (j < numBarSprites)
							{
								barSprite = barSprites[j];
							}
							else
							{
								barSprite = new BarSprite();
								barSprite.chart = this;
								barSprite.tipPlacement = Tooltip.TOP_BOTTOM;
								barSprites.push(barSprite);
								seriesSprite.addChild(barSprite);
							}

							barSprite.valueDataY = valueDataY[j];
							barSprite.valueDataX = valueDataX[1 + (numSeries * j) + i];
							barSprite.seriesName = fieldX;
							barSprite.fields = [ fieldY, fieldX ];
							barSprite.data = new Object();
							barSprite.data[fieldY] = barSprite.valueDataY.value;
							barSprite.data[fieldX] = barSprite.valueDataX.value;
							barSprite.dataRowIndex = j;
						}

						for (j = barSprites.length - 1; j >= numDataRows; j--)
						{
							barSprite = barSprites.pop();
							seriesSprite.removeChild(barSprite);
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

		protected override function updateAxisValuesYOverride() : Array
		{
			var valuesY:Array = new Array();

			for each (var valueData:ValueData in this._valueDataY)
				valuesY.push(valueData.value);

			return valuesY;
		}

		protected override function updateAxisValuesXOverride() : Array
		{
			var valuesX:Array = new Array();

			for each (var valueData:ValueData in this._valueDataX)
			{
				if (valueData.stackedValue == valueData.stackedValue)
					valuesX.push(valueData.stackedValue);
			}

			// remove forced zero
			if (valuesX.length > 0)
				valuesX.shift();

			return valuesX;
		}

		protected override function processValuesYOverride(axisY:IAxis) : void
		{
			var absoluteDataY:Array = this._absoluteDataY = new Array();

			if (!axisY)
				return;

			var valueData1:ValueData;
			var valueData2:ValueData;
			var valueData3:ValueData;
			var numAbsoluteDataY:int;

			for each (valueData1 in this._valueDataY)
			{
				valueData1.absolute = axisY.valueToAbsolute(valueData1.value);
				if (valueData1.absolute == valueData1.absolute)
					absoluteDataY.push(valueData1);
			}

			absoluteDataY.sortOn("absolute", Array.NUMERIC);

			numAbsoluteDataY = absoluteDataY.length;
			if (numAbsoluteDataY > 0)
			{
				var minSpacing:Number = Infinity;
				var i:int;

				valueData1 = absoluteDataY[0];
				for (i = 1; i < numAbsoluteDataY; i++)
				{
					valueData2 = absoluteDataY[i];
					minSpacing = Math.min(minSpacing, valueData2.absolute - valueData1.absolute);
					valueData1 = valueData2;
				}

				if (minSpacing == Infinity)
					minSpacing = 1;

				valueData1 = absoluteDataY[0];
				valueData2 = absoluteDataY[numAbsoluteDataY - 1];

				valueData3 = new ValueData();
				valueData3.absolute = valueData1.absolute - minSpacing;
				absoluteDataY.unshift(valueData3);

				valueData3 = new ValueData();
				valueData3.absolute = valueData2.absolute + minSpacing;
				absoluteDataY.push(valueData3);

				var threshold:Number = minSpacing * 1.1;
				for (i = absoluteDataY.length - 1; i > 0; i--)
				{
					valueData1 = absoluteDataY[i - 1];
					valueData2 = absoluteDataY[i];
					if ((valueData2.absolute - valueData1.absolute) > threshold)
					{
						valueData3 = new ValueData();
						valueData3.absolute = valueData2.absolute - minSpacing;
						absoluteDataY.splice(i, 0, valueData3);

						valueData3 = new ValueData();
						valueData3.absolute = valueData1.absolute + minSpacing;
						absoluteDataY.splice(i, 0, valueData3);
					}
				}

				var barAlignment:Number = this._barAlignment.value;
				for (i = absoluteDataY.length - 1; i > 0; i--)
				{
					valueData1 = absoluteDataY[i - 1];
					valueData2 = absoluteDataY[i];

					valueData1.next = valueData2;
					valueData2.absolute = valueData1.absolute * barAlignment + valueData2.absolute * (1 - barAlignment);
				}

				absoluteDataY.shift();
			}
		}

		protected override function processValuesXOverride(axisX:IAxis) : void
		{
			var absoluteDataX:Array = this._absoluteDataX = new Array();

			if (!axisX)
				return;

			var valueData1:ValueData;

			for each (valueData1 in this._valueDataX)
			{
				if (valueData1.stackedValue == valueData1.stackedValue)
				{
					valueData1.absolute = axisX.valueToAbsolute(valueData1.stackedValue);
					if (valueData1.absolute == valueData1.absolute)
						absoluteDataX.push(valueData1);
				}
			}
		}

		protected override function updateAxisRangeYOverride() : Array
		{
			var absoluteDataY:Array = this._absoluteDataY;
			var numAbsoluteDataY:int = absoluteDataY.length;
			if (numAbsoluteDataY < 1)
				return null;

			var valueDataMin:ValueData = absoluteDataY[0];
			var valueDataMax:ValueData = absoluteDataY[numAbsoluteDataY - 1];

			return [ valueDataMin.absolute, valueDataMax.absolute ];
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

			var barBrushPalette:IBrushPalette = this._barBrushPalette.value;
			var barShapePalette:IShapePalette = this._barShapePalette.value;
			var barStyle:Style = this._barStyle.value;

			var barBrush:IBrush;
			var barShape:IShape;

			var numLabels:int = labels.length;
			var label:String;
			var labelIndex:int;
			var labelCount:int = legend ? legend.numLabels : numLabels;

			for (var i:int = 0; i < numLabels; i++)
			{
				label = labels[i];
				labelIndex = legend ? legend.getLabelIndex(label) : i;

				barBrush = barBrushPalette ? barBrushPalette.getBrush(label, labelIndex, labelCount) : null;
				if (!barBrush)
					barBrush = new SolidFillBrush(0x000000, 1);

				barShape = barShapePalette ? barShapePalette.getShape(label, labelIndex, labelCount) : null;
				if (!barShape)
					barShape = new RectangleShape();
				barShape = new UniformSizeShape(barShape);

				swatches.push(new SeriesSwatch([ barShape ], [ barBrush ], [ barStyle ], 1));
			}

			return swatches;
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var renderKey:Object = new Object();

			var relativeDataY:Array = this._relativeDataY;
			var relativeDataX:Array = this._relativeDataX;
			var valueData:ValueData;

			for each (valueData in relativeDataY)
			{
				valueData.renderKey = renderKey;
				valueData.pixel = Math.round(chartHeight * (1 - valueData.relative));
			}

			for each (valueData in relativeDataX)
			{
				valueData.renderKey = renderKey;
				valueData.pixel = Math.round(chartWidth * valueData.relative);
			}

			var zeroData:ValueData = (relativeDataX.length > 0) ? relativeDataX[0] : null;
			var zeroPixel:Number = zeroData ? zeroData.pixel : 0;
			var brushBounds1:Array = [ new Point(zeroPixel, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(zeroPixel, chartHeight) ];
			var brushBounds2:Array = [ new Point(0, 0), new Point(zeroPixel, 0), new Point(zeroPixel, chartHeight), new Point(0, chartHeight) ];
			var brushBounds:Array;

			var barBrushPalette:IBrushPalette = this._barBrushPalette.value;
			var barShapePalette:IShapePalette = this._barShapePalette.value;
			var barStyle:Style = this._barStyle.value;
			var barSpacing:Number = Math.max(this._barSpacing.value, 0);
			var seriesSpacing:Number = Math.max(this._seriesSpacing.value, 0);
			var useAbsoluteSpacing:Boolean = this._useAbsoluteSpacing.value;
			var stackMode:int = this._cachedStackMode;

			var seriesSprites:Array = this._seriesSprites;
			var numSeriesSprites:int = seriesSprites.length;
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;
			var barSprites:Array;
			var numBarSprites:int;
			var barSprite:BarSprite;

			var barBrush:IBrush;
			var barShape:IShape;
			var barGraphics:Graphics;

			var valueDataY1:ValueData;
			var valueDataY2:ValueData;
			var valueDataX1:ValueData;
			var valueDataX2:ValueData;
			var y1:Number;
			var y2:Number;
			var x1:Number;
			var x2:Number;
			var i:int;
			var j:int;

			var availableSpace:Number;
			var totalSpacing:Number;
			var actualBarSpacing:Number;
			var actualSeriesSpacing:Number;

			seriesCount = legend ? legend.numLabels : numSeriesSprites;

			for (i = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = seriesSprites[i];
				barSprites = seriesSprite.barSprites;
				numBarSprites = barSprites.length;

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				barBrush = barBrushPalette ? barBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!barBrush)
					barBrush = new SolidFillBrush(0x000000, 1);

				barShape = barShapePalette ? barShapePalette.getShape(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!barShape)
					barShape = new RectangleShape();

				for (j = 0; j < numBarSprites; j++)
				{
					barSprite = barSprites[j];
					barSprite.visible = false;

					barGraphics = barSprite.graphics;
					barGraphics.clear();

					valueDataY1 = barSprite.valueDataY;
					valueDataY2 = valueDataY1.next;
					valueDataX1 = barSprite.valueDataX;
					valueDataX2 = valueDataX1.next;

					if ((valueDataY1.renderKey == renderKey) && (valueDataY2.renderKey == renderKey) && (valueDataX1.renderKey == renderKey) && (valueDataX2.renderKey == renderKey))
					{
						if ((Math.max(valueDataY1.relative, valueDataY2.relative) < 0) ||
						    (Math.min(valueDataY1.relative, valueDataY2.relative) > 1) ||
						    (Math.max(valueDataX1.relative, valueDataX2.relative) < 0) ||
						    (Math.min(valueDataX1.relative, valueDataX2.relative) > 1))
							continue;

						y1 = valueDataY1.pixel;
						y2 = valueDataY2.pixel;
						x1 = valueDataX1.pixel;
						x2 = valueDataX2.pixel;

						if (y1 < y2)
							availableSpace = y2 - y1;
						else
							availableSpace = y1 - y2;

						if ((stackMode > 0) || (numSeriesSprites == 1))
						{
							if (useAbsoluteSpacing)
							{
								if (barSpacing < availableSpace)
									actualBarSpacing = barSpacing;
								else
									actualBarSpacing = availableSpace;
							}
							else
							{
								actualBarSpacing = availableSpace * (barSpacing / (1 + barSpacing));
							}

							actualBarSpacing /= 2;
							if (y1 < y2)
							{
								y1 += actualBarSpacing;
								y2 -= actualBarSpacing;
							}
							else
							{
								y1 -= actualBarSpacing;
								y2 += actualBarSpacing;
							}
						}
						else
						{
							if (useAbsoluteSpacing)
							{
								totalSpacing = barSpacing + seriesSpacing * (numSeriesSprites - 1);
								if (totalSpacing > availableSpace)
								{
									actualBarSpacing = barSpacing * (availableSpace / totalSpacing);
									actualSeriesSpacing = seriesSpacing * (availableSpace / totalSpacing);
								}
								else
								{
									actualBarSpacing = barSpacing;
									actualSeriesSpacing = seriesSpacing;
								}
							}
							else
							{
								totalSpacing = numSeriesSprites + barSpacing + seriesSpacing * (numSeriesSprites - 1);
								actualBarSpacing = availableSpace * (barSpacing / totalSpacing);
								actualSeriesSpacing = availableSpace * (seriesSpacing / totalSpacing);
							}

							actualBarSpacing /= 2;
							if (y1 < y2)
							{
								y1 += actualBarSpacing;
								y2 -= actualBarSpacing;

								availableSpace = ((y2 - y1) - (actualSeriesSpacing * (numSeriesSprites - 1))) / numSeriesSprites;

								if ((i + 1) < numSeriesSprites)
									y2 = y1 + (availableSpace + actualSeriesSpacing) * (i + 1) - actualSeriesSpacing;
								if (i > 0)
									y1 += (availableSpace + actualSeriesSpacing) * i;
							}
							else
							{
								y1 -= actualBarSpacing;
								y2 += actualBarSpacing;

								availableSpace = ((y1 - y2) - (actualSeriesSpacing * (numSeriesSprites - 1))) / numSeriesSprites;

								if ((i + 1) < numSeriesSprites)
									y2 = y1 - (availableSpace + actualSeriesSpacing) * (i + 1) + actualSeriesSpacing;
								if (i > 0)
									y1 -= (availableSpace + actualSeriesSpacing) * i;
							}
						}

						y1 = Math.round(y1);
						y2 = Math.round(y2);

						if (y1 == y2)
						{
							if (valueDataY1.relative < valueDataY2.relative)
								y2++;
							else if (valueDataY1.relative > valueDataY2.relative)
								y2--;
						}

						if (x1 == x2)
						{
							if (valueDataX1.relative < valueDataX2.relative)
								x1--;
							else if (valueDataX1.relative > valueDataX2.relative)
								x1++;
						}

						brushBounds = (x1 >= x2) ? brushBounds1 : brushBounds2;

						if (y1 > y2)
						{
							var temp:Number = y1;
							y1 = y2;
							y2 = temp;
						}

						barShape.draw(barGraphics, x2, y1, x1 - x2, y2 - y1, barBrush, null, brushBounds);

						barSprite.tipBounds = new Rectangle(x1, y1, 0, y2 - y1);
						barSprite.visible = true;
					}

					Style.applyStyle(barSprite, barStyle);
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
	public var barSprites:Array;

	// Constructor

	public function SeriesSprite()
	{
		this.barSprites = new Array();

		this.mouseEnabled = false;
	}

}

class BarSprite extends DataSprite
{

	// Public Properties

	public var valueDataY:ValueData;
	public var valueDataX:ValueData;

	// Constructor

	public function BarSprite()
	{
	}

}

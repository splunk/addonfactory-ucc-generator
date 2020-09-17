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

	public class BubbleChart extends AbstractChart3D
	{

		// Private Properties

		private var _bubbleBrushPalette:ObservableProperty;
		private var _bubbleShapePalette:ObservableProperty;
		private var _bubbleStyle:ObservableProperty;
		private var _bubbleMinimumSize:ObservableProperty;
		private var _bubbleMaximumSize:ObservableProperty;
		private var _defaultSeriesName:ObservableProperty;

		private var _valuesX:Array;
		private var _valuesY:Array;
		private var _valuesZ:Array;
		private var _positionsX:Array;
		private var _positionsY:Array;
		private var _positionsZ:Array;
		private var _seriesSprites:Array;

		private var _seriesMask:Shape;
		private var _seriesContainer:Sprite;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function BubbleChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);

			this._bubbleBrushPalette = new ObservableProperty(this, "bubbleBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._bubbleShapePalette = new ObservableProperty(this, "bubbleShapePalette", IShapePalette, new ListShapePalette([ new EllipseShape() ]), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._bubbleStyle = new ObservableProperty(this, "bubbleStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._bubbleMinimumSize = new ObservableProperty(this, "bubbleMinimumSize", Number, 10, this.invalidates(AbstractChart.RENDER_CHART));
			this._bubbleMaximumSize = new ObservableProperty(this, "bubbleMaximumSize", Number, 50, this.invalidates(AbstractChart.RENDER_CHART));
			this._defaultSeriesName = new ObservableProperty(this, "defaultSeriesName", String, "bubble", this.invalidates(AbstractChart.PROCESS_DATA));

			this._valuesX = new Array();
			this._valuesY = new Array();
			this._valuesZ = new Array();
			this._positionsX = new Array();
			this._positionsY = new Array();
			this._positionsZ = new Array();
			this._seriesSprites = new Array();

			this._seriesMask = new Shape();

			this._seriesContainer = new Sprite();
			this._seriesContainer.mouseEnabled = false;
			this._seriesContainer.mask = this._seriesMask;

			this.addChild(this._seriesContainer);
			this.addChild(this._seriesMask);
		}

		// Public Getters/Setters

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

		public function get defaultSeriesName() : String
		{
			return this._defaultSeriesName.value;
		}
		public function set defaultSeriesName(value:String) : void
		{
			this._defaultSeriesName.value = value;
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			var valuesX:Array = this._valuesX = new Array();
			var valuesY:Array = this._valuesY = new Array();
			var valuesZ:Array = this._valuesZ = new Array();

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

				if ((numDataColumns > 2) && (numDataRows > 0))
				{
					var fieldSeries:String;
					var fieldX:String;
					var fieldY:String;
					var fieldZ:String;

					if (numDataColumns > 3)
					{
						fieldSeries = data.getColumnName(0);
						fieldX = data.getColumnName(1);
						fieldY = data.getColumnName(2);
						fieldZ = data.getColumnName(3);
					}
					else
					{
						fieldX = data.getColumnName(0);
						fieldY = data.getColumnName(1);
						fieldZ = data.getColumnName(2);
					}

					var valueSeries:*;
					var valueX:*;
					var valueY:*;
					var valueZ:*;

					var seriesName:String;
					var seriesSpriteMap:Object = new Object();
					var numSeriesSprites:int = seriesSprites.length;
					var defaultSeriesName:String = this._defaultSeriesName.value;

					for (i = 0; i < numDataRows; i++)
					{
						if (numDataColumns > 3)
						{
							valueSeries = data.getValue(i, 0);
							valueX = data.getValue(i, 1);
							valueY = data.getValue(i, 2);
							valueZ = data.getValue(i, 3);
						}
						else
						{
							valueSeries = defaultSeriesName;
							valueX = data.getValue(i, 0);
							valueY = data.getValue(i, 1);
							valueZ = data.getValue(i, 2);
						}

						if ((valueSeries == null) || (valueX == null) || (valueY == null) || (valueZ == null))
							continue;

						seriesName = String(valueSeries);
						if (!seriesName)
							continue;

						valuesX.push(valueX);
						valuesY.push(valueY);
						valuesZ.push(valueZ);

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

							seriesSpriteMap[seriesName] = seriesSprite;
							numSeries++;
						}

						bubbleSprites = seriesSprite.bubbleSprites;

						if (seriesSprite.numBubbles < bubbleSprites.length)
						{
							bubbleSprite = bubbleSprites[seriesSprite.numBubbles];
						}
						else
						{
							bubbleSprite = new BubbleSprite();
							bubbleSprite.chart = this;
							bubbleSprite.tipPlacement = Tooltip.LEFT_RIGHT;
							bubbleSprites.push(bubbleSprite);
							seriesSprite.addChild(bubbleSprite);
						}

						seriesSprite.numBubbles++;

						bubbleSprite.seriesName = seriesName;
						bubbleSprite.indexX = (valuesX.length - 1);
						bubbleSprite.indexY = (valuesY.length - 1);
						bubbleSprite.indexZ = (valuesZ.length - 1);
						bubbleSprite.data = new Object();
						bubbleSprite.dataRowIndex = i;
						if (fieldSeries)
						{
							bubbleSprite.fields = [ fieldSeries, fieldX, fieldY, fieldZ ];
							bubbleSprite.data[fieldSeries] = seriesName;
						}
						else
						{
							bubbleSprite.fields = [ fieldX, fieldY, fieldZ ];
						}
						bubbleSprite.data[fieldX] = valueX;
						bubbleSprite.data[fieldY] = valueY;
						bubbleSprite.data[fieldZ] = valueZ;
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

		protected override function updateAxisValuesXOverride() : Array
		{
			return this._valuesX;
		}

		protected override function updateAxisValuesYOverride() : Array
		{
			return this._valuesY;
		}

		protected override function updateAxisValuesZOverride() : Array
		{
			return this._valuesZ;
		}

		protected override function processAbsolutesXOverride(axisX:IAxis) : void
		{
			var valuesX:Array = this._valuesX;
			var numValuesX:int = valuesX.length;
			var positionsX:Array = this._positionsX = new Array(numValuesX);
			var i:int;

			if (axisX)
			{
				for (i = 0; i < numValuesX; i++)
					positionsX[i] = axisX.absoluteToRelative(axisX.valueToAbsolute(valuesX[i]));
			}
			else
			{
				for (i = 0; i < numValuesX; i++)
					positionsX[i] = NaN;
			}
		}

		protected override function processAbsolutesYOverride(axisY:IAxis) : void
		{
			var valuesY:Array = this._valuesY;
			var numValuesY:int = valuesY.length;
			var positionsY:Array = this._positionsY = new Array(numValuesY);
			var i:int;

			if (axisY)
			{
				for (i = 0; i < numValuesY; i++)
					positionsY[i] = axisY.absoluteToRelative(axisY.valueToAbsolute(valuesY[i]));
			}
			else
			{
				for (i = 0; i < numValuesY; i++)
					positionsY[i] = NaN;
			}
		}

		protected override function processAbsolutesZOverride(axisZ:IAxis) : void
		{
			var valuesZ:Array = this._valuesZ;
			var numValuesZ:int = valuesZ.length;
			var positionsZ:Array = this._positionsZ = new Array(numValuesZ);
			var i:int;

			if (axisZ)
			{
				for (i = 0; i < numValuesZ; i++)
					positionsZ[i] = axisZ.absoluteToRelative(axisZ.valueToAbsolute(valuesZ[i]));
			}
			else
			{
				for (i = 0; i < numValuesZ; i++)
					positionsZ[i] = NaN;
			}
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

			var positionsX:Array = this._positionsX;
			var positionsY:Array = this._positionsY;
			var positionsZ:Array = this._positionsZ;
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

					positionX = positionsX[bubbleSprite.indexX];
					if (positionX != positionX)
						continue;

					positionY = positionsY[bubbleSprite.indexY];
					if (positionY != positionY)
						continue;

					positionZ = positionsZ[bubbleSprite.indexZ];
					if (positionZ != positionZ)
						continue;

					positionX = Math.round(chartWidth * positionX);
					positionY = Math.round(chartHeight * (1 - positionY));
					positionZ = Math.max(Math.round((bubbleMinimumSize + (bubbleMaximumSize - bubbleMinimumSize) * NumberUtil.minMax(positionZ, 0, 1)) / 2), 1);

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

	}

}

import com.splunk.charting.charts.DataSprite;
import flash.display.Sprite;

class SeriesSprite extends Sprite
{

	// Public Properties

	public var field:String;
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

	public var indexX:int;
	public var indexY:int;
	public var indexZ:int;

	// Constructor

	public function BubbleSprite()
	{
	}

}

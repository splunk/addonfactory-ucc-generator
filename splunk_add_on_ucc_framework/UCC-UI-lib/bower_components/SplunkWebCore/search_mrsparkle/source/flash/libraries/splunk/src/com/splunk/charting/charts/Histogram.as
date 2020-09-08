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

	public class Histogram extends AbstractChart2D
	{

		// Private Properties

		private var _columnBrushPalette:ObservableProperty;
		private var _columnShapePalette:ObservableProperty;
		private var _columnStyle:ObservableProperty;

		private var _valueDataX:Array;
		private var _valueDataY:Array;
		private var _absoluteDataX:Array;
		private var _absoluteDataY:Array;
		private var _relativeDataX:Array;
		private var _relativeDataY:Array;

		private var _seriesMask:Shape;
		private var _seriesSprite:SeriesSprite;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function Histogram()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);

			this._columnBrushPalette = new ObservableProperty(this, "columnBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._columnShapePalette = new ObservableProperty(this, "columnShapePalette", IShapePalette, new ListShapePalette([ new RectangleShape() ]), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._columnStyle = new ObservableProperty(this, "columnStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));

			this._valueDataX = new Array();
			this._valueDataY = new Array();
			this._absoluteDataX = new Array();
			this._absoluteDataY = new Array();
			this._relativeDataX = new Array();
			this._relativeDataY = new Array();

			this._seriesMask = new Shape();

			this._seriesSprite = new SeriesSprite();
			this._seriesSprite.mask = this._seriesMask;

			this.addChild(this._seriesSprite);
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

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			var valueDataX:Array = this._valueDataX = new Array();
			var valueDataY:Array = this._valueDataY = new Array();
			var seriesSprite:SeriesSprite = this._seriesSprite;
			var columnSprites:Array = seriesSprite.columnSprites;
			var numColumns:int = 0;
			var i:int;

			if (data)
			{
				var numDataColumns:int = data.numColumns;
				var numDataRows:int = data.numRows;

				if ((numDataColumns > 2) && (numDataRows > 0))
				{
					numColumns = numDataRows;

					var valueData:ValueData;
					var zeroData:ValueData;

					var numColumnSprites:int = columnSprites.length;
					var columnSprite:ColumnSprite;

					var fieldX1:String = data.getColumnName(0);
					var fieldX2:String = data.getColumnName(1);
					var fieldY:String = data.getColumnName(2);

					seriesSprite.field = fieldY;

					// get values
					zeroData = new ValueData(0);
					valueDataY.push(zeroData);
					for (i = 0; i < numDataRows; i++)
					{
						valueData = new ValueData(data.getValue(i, 0));
						valueDataX.push(valueData);

						valueData = new ValueData(data.getValue(i, 1));
						valueDataX.push(valueData);

						valueData = new ValueData(data.getValue(i, 2));
						valueDataY.push(valueData);
					}

					// update sprites
					for (i = 0; i < numDataRows; i++)
					{
						if (i < numColumnSprites)
						{
							columnSprite = columnSprites[i];
						}
						else
						{
							columnSprite = new ColumnSprite();
							columnSprite.chart = this;
							columnSprite.tipPlacement = Tooltip.LEFT_RIGHT;
							columnSprites.push(columnSprite);
							seriesSprite.addChild(columnSprite);
						}

						columnSprite.valueDataX1 = valueDataX[i * 2];
						columnSprite.valueDataX2 = valueDataX[i * 2 + 1];
						columnSprite.valueDataY1 = valueDataY[1 + i];
						columnSprite.valueDataY2 = zeroData;
						columnSprite.seriesName = fieldY;
						columnSprite.fields = [ fieldX1, fieldX2, fieldY ];
						columnSprite.data = new Object();
						columnSprite.data[fieldX1] = columnSprite.valueDataX1.value;
						columnSprite.data[fieldX2] = columnSprite.valueDataX2.value;
						columnSprite.data[fieldY] = columnSprite.valueDataY1.value;
						columnSprite.dataRowIndex = i;
					}
				}
			}

			// remove unused sprites
			for (i = columnSprites.length - 1; i >= numDataRows; i--)
			{
				columnSprite = columnSprites.pop();
				seriesSprite.removeChild(columnSprite);
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
				valuesY.push(valueData.value);

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

			var valueData:ValueData;

			for each (valueData in this._valueDataX)
			{
				valueData.absolute = axisX.valueToAbsolute(valueData.value);
				if (valueData.absolute == valueData.absolute)
					absoluteDataX.push(valueData);
			}
		}

		protected override function processValuesYOverride(axisY:IAxis) : void
		{
			var absoluteDataY:Array = this._absoluteDataY = new Array();

			if (!axisY)
				return;

			var valueData:ValueData;

			for each (valueData in this._valueDataY)
			{
				valueData.absolute = axisY.valueToAbsolute(valueData.value);
				if (valueData.absolute == valueData.absolute)
					absoluteDataY.push(valueData);
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

			if (data.numColumns > 2)
				labels.push(data.getColumnName(2));

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

			var seriesSprite:SeriesSprite = this._seriesSprite;
			var seriesIndex:int;
			var seriesCount:int;
			var columnSprites:Array = seriesSprite.columnSprites;
			var numColumnSprites:int = columnSprites.length;
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

			if (legend)
			{
				seriesIndex = legend.getLabelIndex(seriesSprite.field);
				seriesCount = legend.numLabels;
			}
			else
			{
				seriesIndex = 0;
				seriesCount = 1;
			}

			columnBrush = columnBrushPalette ? columnBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
			if (!columnBrush)
				columnBrush = new SolidFillBrush(0x000000, 1);

			columnShape = columnShapePalette ? columnShapePalette.getShape(seriesSprite.field, seriesIndex, seriesCount) : null;
			if (!columnShape)
				columnShape = new RectangleShape();

			for (i = 0; i < numColumnSprites; i++)
			{
				columnSprite = columnSprites[i];
				columnSprite.visible = false;

				columnGraphics = columnSprite.graphics;
				columnGraphics.clear();

				valueDataX1 = columnSprite.valueDataX1;
				valueDataX2 = columnSprite.valueDataX2;
				valueDataY1 = columnSprite.valueDataY1;
				valueDataY2 = columnSprite.valueDataY2;

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
						x1++;
					else
						x2++;

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

					// draw column hit area
					columnGraphics.beginFill(0x000000, 0);
					if (x1 < x2)
						columnGraphics.drawRect(x1 - 1, 0, x2 - x1 + 1, Math.round(chartHeight));
					else if (x1 > x2)
						columnGraphics.drawRect(x1, 0, x2 - x1 - 1, Math.round(chartHeight));
					else
						columnGraphics.drawRect(x1, 0, x2 - x1, Math.round(chartHeight));
					columnGraphics.endFill();

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

			var seriesSprite:SeriesSprite = this._seriesSprite;
			if (seriesSprite)
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

			var seriesSprite:SeriesSprite = this._seriesSprite;
			if (seriesSprite)
				tweens.push(new PropertyTween(seriesSprite, "alpha", null, a));

			if (tweens.length > 0)
				TweenRunner.start(new GroupTween(tweens, AbstractChart.HIGHLIGHT_EASER), AbstractChart.HIGHLIGHT_DURATION);
		}

	}

}

import com.splunk.charting.charts.DataSprite;
import flash.display.Sprite;

class ValueData
{

	// Public Properties

	public var value:*;
	public var absolute:Number;
	public var relative:Number;
	public var pixel:Number;
	public var renderKey:Object;

	// Constructor

	public function ValueData(value:* = null)
	{
		this.value = value;
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

	public var valueDataX1:ValueData;
	public var valueDataX2:ValueData;
	public var valueDataY1:ValueData;
	public var valueDataY2:ValueData;

	// Constructor

	public function ColumnSprite()
	{
	}

}

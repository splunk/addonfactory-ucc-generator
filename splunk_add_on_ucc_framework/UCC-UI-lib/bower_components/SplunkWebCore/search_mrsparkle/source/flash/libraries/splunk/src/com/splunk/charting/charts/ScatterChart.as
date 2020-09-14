package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.MaximumSizeShape;
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
	import flash.display.Sprite;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class ScatterChart extends AbstractChart2D
	{

		// Private Properties

		private var _markerBrushPalette:ObservableProperty;
		private var _markerShapePalette:ObservableProperty;
		private var _markerStyle:ObservableProperty;
		private var _markerSize:ObservableProperty;
		private var _defaultSeriesName:ObservableProperty;

		private var _valuesX:Array;
		private var _valuesY:Array;
		private var _positionsX:Array;
		private var _positionsY:Array;
		private var _seriesSprites:Array;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function ScatterChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);

			this._markerBrushPalette = new ObservableProperty(this, "markerBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._markerShapePalette = new ObservableProperty(this, "markerShapePalette", IShapePalette, new ListShapePalette([ new RectangleShape() ]), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._markerStyle = new ObservableProperty(this, "markerStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._markerSize = new ObservableProperty(this, "markerSize", Number, 4, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._defaultSeriesName = new ObservableProperty(this, "defaultSeriesName", String, "scatter", this.invalidates(AbstractChart.PROCESS_DATA));

			this._valuesX = new Array();
			this._valuesY = new Array();
			this._positionsX = new Array();
			this._positionsY = new Array();
			this._seriesSprites = new Array();
		}

		// Public Getters/Setters

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
			var seriesSprites:Array = this._seriesSprites;
			var seriesSprite:SeriesSprite;
			var numSeries:int = 0;
			var markerSprites:Array;
			var markerSprite:MarkerSprite;
			var numMarkers:int;
			var i:int;
			var j:int;

			for each (seriesSprite in seriesSprites)
				seriesSprite.numMarkers = 0;

			if (data)
			{
				var numDataColumns:int = data.numColumns;
				var numDataRows:int = data.numRows;

				if ((numDataColumns > 1) && (numDataRows > 0))
				{
					var fieldSeries:String;
					var fieldX:String;
					var fieldY:String;

					if (numDataColumns > 2)
					{
						fieldSeries = data.getColumnName(0);
						fieldX = data.getColumnName(1);
						fieldY = data.getColumnName(2);
					}
					else
					{
						fieldX = data.getColumnName(0);
						fieldY = data.getColumnName(1);
					}

					var valueSeries:String;
					var valueX:*;
					var valueY:*;
					var seriesSpriteMap:Object = new Object();
					var numSeriesSprites:int = seriesSprites.length;
					var defaultSeriesName:String = this._defaultSeriesName.value;

					for (i = 0; i < numDataRows; i++)
					{
						if (numDataColumns > 2)
						{
							valueSeries = data.getValue(i, 0);
							valueX = data.getValue(i, 1);
							valueY = data.getValue(i, 2);
						}
						else
						{
							valueSeries = defaultSeriesName;
							valueX = data.getValue(i, 0);
							valueY = data.getValue(i, 1);
						}

						if ((valueSeries == null) || (valueX == null) || (valueY == null))
							continue;

						valueSeries = String(valueSeries);
						if (!valueSeries)
							continue;

						valuesX.push(valueX);
						valuesY.push(valueY);

						seriesSprite = seriesSpriteMap[valueSeries];
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
								this.addChild(seriesSprite);
							}

							seriesSprite.field = valueSeries;
							seriesSpriteMap[valueSeries] = seriesSprite;

							numSeries++;
						}

						markerSprites = seriesSprite.markerSprites;

						if (seriesSprite.numMarkers < markerSprites.length)
						{
							markerSprite = markerSprites[seriesSprite.numMarkers];
						}
						else
						{
							markerSprite = new MarkerSprite();
							markerSprite.chart = this;
							markerSprite.tipPlacement = Tooltip.LEFT_RIGHT;
							markerSprites.push(markerSprite);
							seriesSprite.addChild(markerSprite);
						}

						seriesSprite.numMarkers++;

						markerSprite.seriesName = valueSeries;
						markerSprite.indexX = (valuesX.length - 1);
						markerSprite.indexY = (valuesY.length - 1);
						markerSprite.data = new Object();
						markerSprite.dataRowIndex = i;
						if (fieldSeries)
						{
							markerSprite.fields = [ fieldSeries, fieldX, fieldY ];
							markerSprite.data[fieldSeries] = valueSeries;
						}
						else
						{
							markerSprite.fields = [ fieldX, fieldY ];
						}
						markerSprite.data[fieldX] = valueX;
						markerSprite.data[fieldY] = valueY;
					}
				}
			}

			// remove unused series sprites
			for (i = seriesSprites.length - 1; i >= numSeries; i--)
			{
				seriesSprite = seriesSprites.pop();
				this.removeChild(seriesSprite);
			}

			// remove unused marker sprites
			for (i; i >= 0; i--)
			{
				seriesSprite = seriesSprites[i];
				markerSprites = seriesSprite.markerSprites;
				numMarkers = seriesSprite.numMarkers;
				for (j = markerSprites.length - 1; j >= numMarkers; j--)
				{
					markerSprite = markerSprites.pop();
					seriesSprite.removeChild(markerSprite);
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

			var markerBrushPalette:IBrushPalette = this._markerBrushPalette.value;
			var markerShapePalette:IShapePalette = this._markerShapePalette.value;
			var markerStyle:Style = this._markerStyle.value;
			var markerSize:Number = Math.max(this._markerSize.value, 0);

			var markerBrush:IBrush;
			var markerShape:IShape;

			var numLabels:int = labels.length;
			var label:String;
			var labelIndex:int;
			var labelCount:int = legend ? legend.numLabels : numLabels;

			for (var i:int = 0; i < numLabels; i++)
			{
				label = labels[i];
				labelIndex = legend ? legend.getLabelIndex(label) : i;

				markerBrush = markerBrushPalette ? markerBrushPalette.getBrush(label, labelIndex, labelCount) : null;
				if (!markerBrush)
					markerBrush = new SolidFillBrush(0x000000, 1);

				markerShape = markerShapePalette ? markerShapePalette.getShape(label, labelIndex, labelCount) : null;
				if (!markerShape)
					markerShape = new RectangleShape();
				markerShape = new UniformSizeShape(new MaximumSizeShape(markerShape, markerSize, markerSize));

				swatches.push(new SeriesSwatch([ markerShape ], [ markerBrush ], [ markerStyle ], 1));
			}

			return swatches;
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var brushBounds:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];

			var seriesSprites:Array = this._seriesSprites;
			var numSeriesSprites:int = seriesSprites.length;
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;

			var markerBrushPalette:IBrushPalette = this._markerBrushPalette.value;
			var markerShapePalette:IShapePalette = this._markerShapePalette.value;
			var markerStyle:Style = this._markerStyle.value;
			var markerSize:Number = Math.max(this._markerSize.value, 0);
			var markerHitAreaSize:Number = Math.max(markerSize, 10);
			var markerSprites:Array;
			var numMarkerSprites:int;
			var markerSprite:MarkerSprite;
			var markerGraphics:Graphics;
			var markerBrush:IBrush;
			var markerShape:IShape;

			var positionsX:Array = this._positionsX;
			var positionsY:Array = this._positionsY;
			var positionX:Number;
			var positionY:Number;
			var i:int;
			var j:int;

			seriesCount = legend ? legend.numLabels : numSeriesSprites;

			for (i = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = seriesSprites[i];
				markerSprites = seriesSprite.markerSprites;
				numMarkerSprites = markerSprites.length;

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				markerBrush = markerBrushPalette ? markerBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!markerBrush)
					markerBrush = new SolidFillBrush(0x000000, 1);

				markerShape = markerShapePalette ? markerShapePalette.getShape(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!markerShape)
					markerShape = new RectangleShape();

				for (j = 0; j < numMarkerSprites; j++)
				{
					markerSprite = markerSprites[j];
					markerSprite.visible = false;

					markerGraphics = markerSprite.graphics;
					markerGraphics.clear();

					positionX = positionsX[markerSprite.indexX];
					if (positionX != positionX)
						continue;

					positionY = positionsY[markerSprite.indexY];
					if (positionY != positionY)
						continue;

					if ((positionX >= 0) && (positionX <= 1) && (positionY >= 0) && (positionY <= 1))
					{
						// draw hit area
						markerGraphics.beginFill(0x000000, 0);
						markerGraphics.drawRect(Math.round(chartWidth * positionX - markerHitAreaSize / 2), Math.round(chartHeight * (1 - positionY) - markerHitAreaSize / 2), markerHitAreaSize, markerHitAreaSize);
						markerGraphics.endFill();

						// draw marker
						markerShape.draw(markerGraphics, Math.round(chartWidth * positionX - markerSize / 2), Math.round(chartHeight * (1 - positionY) - markerSize / 2), markerSize, markerSize, markerBrush, null, brushBounds);

						markerSprite.tipBounds = new Rectangle(Math.round(chartWidth * positionX - markerSize / 2), Math.round(chartHeight * (1 - positionY) - markerSize / 2), markerSize, markerSize);
						markerSprite.visible = true;
					}

					Style.applyStyle(markerSprite, markerStyle);
				}
			}
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
	public var markerSprites:Array;
	public var numMarkers:int;

	// Constructor

	public function SeriesSprite()
	{
		this.markerSprites = new Array();

		this.mouseEnabled = false;
	}

}

class MarkerSprite extends DataSprite
{

	// Public Properties

	public var indexX:int;
	public var indexY:int;

	// Constructor

	public function MarkerSprite()
	{
	}

}

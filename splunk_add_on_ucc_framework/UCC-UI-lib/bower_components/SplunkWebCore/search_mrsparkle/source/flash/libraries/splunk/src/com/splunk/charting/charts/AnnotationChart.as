package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.graphics.shapes.UniformSizeShape;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.layout.Size;
	import com.jasongatt.motion.GroupTween;
	import com.jasongatt.motion.PropertyTween;
	import com.jasongatt.motion.TweenRunner;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.controls.Label;
	import com.splunk.controls.Tooltip;
	import com.splunk.data.IDataTable;
	import com.splunk.palettes.brush.IBrushPalette;
	import com.splunk.palettes.brush.SolidFillBrushPalette;
	import com.splunk.palettes.color.ListColorPalette;
	import com.splunk.utils.Style;
	import flash.display.Graphics;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class AnnotationChart extends AbstractChart1D
	{

		// Private Properties

		private var _orientation:ObservableProperty;
		private var _markerBrushPalette:ObservableProperty;
		private var _markerStyle:ObservableProperty;
		private var _labels:ObservableProperty;
		private var _labelStyle:ObservableProperty;

		private var _valueDatas:Array;
		private var _absoluteDatas:Array;
		private var _relativeDatas:Array;
		private var _seriesSprites:Array;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function AnnotationChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);

			this._orientation = new ObservableProperty(this, "orientation", String, Orientation.X, this.invalidates(AbstractChart.RENDER_CHART));
			this._markerBrushPalette = new ObservableProperty(this, "markerBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._markerStyle = new ObservableProperty(this, "markerStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._labels = new ObservableProperty(this, "labels", Array, new Array(), this.invalidates(AbstractChart.PROCESS_DATA));
			this._labelStyle = new ObservableProperty(this, "labelStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));

			this._valueDatas = new Array();
			this._absoluteDatas = new Array();
			this._relativeDatas = new Array();
			this._seriesSprites = new Array();
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
					value = Orientation.X;
					break;
			}
			this._orientation.value = value;
		}

		public function get markerBrushPalette() : IBrushPalette
		{
			return this._markerBrushPalette.value;
		}
		public function set markerBrushPalette(value:IBrushPalette) : void
		{
			this._markerBrushPalette.value = value;
		}

		public function get markerStyle() : Style
		{
			return this._markerStyle.value;
		}
		public function set markerStyle(value:Style) : void
		{
			this._markerStyle.value = value;
		}

		public function get labels() : Array
		{
			return this._labels.value.concat();
		}
		public function set labels(value:Array) : void
		{
			this._labels.value = value ? value.concat() : new Array();
		}

		public function get labelStyle() : Style
		{
			return this._labelStyle.value;
		}
		public function set labelStyle(value:Style) : void
		{
			this._labelStyle.value = value;
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			this.invalidate(LayoutSprite.MEASURE);

			var valueDatas:Array = this._valueDatas = new Array();
			var valueData:ValueData;
			var seriesSprites:Array = this._seriesSprites;
			var seriesSpriteMap:Object = new Object();
			var numSeriesSprites:int = seriesSprites.length;
			var numSeries:int = 0;
			var seriesSprite:SeriesSprite;
			var markerSprite:MarkerSprite;
			var labels:Array = this._labels.value;
			var numLabels:int = labels.length;
			var label:String;
			var series:String;
			var value:*;
			var fields:Array;
			var rowData:Object;
			var numDataRows:int;
			var numDataColumns:int;
			var i:int;
			var j:int;

			for (i = 0; i < numLabels; i++)
			{
				label = labels[i];
				if (!label)
					label = "";

				seriesSprite = seriesSpriteMap[label];
				if (!seriesSprite)
				{
					if (numSeries < numSeriesSprites)
					{
						seriesSprite = seriesSprites[numSeries];
					}
					else
					{
						seriesSprite = seriesSpriteMap[label] = new SeriesSprite();
						seriesSprites.push(seriesSprite);
						this.addChild(seriesSprite);
					}
					numSeries++;

					seriesSprite.field = label;
					seriesSprite.numMarkerSprites = seriesSprite.markerSprites.length;
					seriesSprite.numMarkers = 0;
				}
			}

			if (data)
			{
				numDataRows = data.numRows;
				numDataColumns = data.numColumns;

				if ((numDataRows > 0) && (numDataColumns > 2))
				{
					fields = new Array();
					for (i = 0; i < numDataColumns; i++)
						fields.push(data.getColumnName(i));

					for (i = 0; i < numDataRows; i++)
					{
						value = data.getValue(i, 2);
						label = (value == null) ? "" : String(value);

						value = data.getValue(i, 1);
						series = (value == null) ? "" : String(value);

						value = data.getValue(i, 0);

						rowData = new Object();
						rowData[fields[0]] = value;
						rowData[fields[1]] = series;
						rowData[fields[2]] = label;
						for (j = 3; j < numDataColumns; j++)
							rowData[fields[j]] = data.getValue(i, j);

						seriesSprite = seriesSpriteMap[series];
						if (!seriesSprite)
						{
							if (numSeries < numSeriesSprites)
							{
								seriesSprite = seriesSprites[numSeries];
							}
							else
							{
								seriesSprite = seriesSpriteMap[series] = new SeriesSprite();
								seriesSprites.push(seriesSprite);
								this.addChild(seriesSprite);
							}
							numSeries++;

							seriesSprite.field = series;
							seriesSprite.numMarkerSprites = seriesSprite.markerSprites.length;
							seriesSprite.numMarkers = 0;
						}

						if (seriesSprite.numMarkers < seriesSprite.numMarkerSprites)
						{
							markerSprite = seriesSprite.markerSprites[seriesSprite.numMarkers];
						}
						else
						{
							markerSprite = new MarkerSprite();
							markerSprite.chart = this;
							seriesSprite.markerSprites.push(markerSprite);
							seriesSprite.addChild(markerSprite);
						}
						seriesSprite.numMarkers++;

						valueData = new ValueData(value);
						valueDatas.push(valueData);

						markerSprite.valueData = valueData;
						markerSprite.seriesName = series;
						markerSprite.fields = fields.concat();
						markerSprite.data = rowData;
						markerSprite.dataRowIndex = i;
						markerSprite.label.text = label;
					}
				}
			}

			// remove unused marker sprites
			for (i = 0; i < numSeries; i++)
			{
				seriesSprite = seriesSprites[i];
				for (j = seriesSprite.markerSprites.length - 1; j >= seriesSprite.numMarkers; j--)
				{
					markerSprite = seriesSprite.markerSprites.pop();
					seriesSprite.removeChild(markerSprite);
				}
			}

			// remove unused series sprites
			for (i = seriesSprites.length - 1; i >= numSeries; i--)
			{
				seriesSprite = seriesSprites.pop();
				this.removeChild(seriesSprite);
			}
		}

		protected override function processValuesOverride(axis:IAxis) : void
		{
			var absoluteDatas:Array = this._absoluteDatas = new Array();

			if (!axis)
				return;

			for each (var valueData:ValueData in this._valueDatas)
			{
				valueData.absolute = axis.valueToAbsolute(valueData.value);
				if (valueData.absolute == valueData.absolute)
					absoluteDatas.push(valueData);
			}
		}

		protected override function processAbsolutesOverride(axis:IAxis) : void
		{
			var relativeDatas:Array = this._relativeDatas = new Array();

			if (!axis)
				return;

			for each (var valueData:ValueData in this._absoluteDatas)
			{
				valueData.relative = axis.absoluteToRelative(valueData.absolute);
				if (valueData.relative == valueData.relative)
					relativeDatas.push(valueData);
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
			var markerStyle:Style = this._markerStyle.value;

			var markerBrush:IBrush;
			var markerShape:IShape = new UniformSizeShape(new RectangleShape());

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

				swatches.push(new SeriesSwatch([ markerShape ], [ markerBrush ], [ markerStyle ], 1));
			}

			return swatches;
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var labelStyle:Style = this._labelStyle.value;

			var seriesSprite:SeriesSprite;
			var markerSprite:MarkerSprite;
			var markerLabel:Label;
			var labelSize:Size = new Size(Infinity, Infinity);

			for each (seriesSprite in this._seriesSprites)
			{
				for each (markerSprite in seriesSprite.markerSprites)
				{
					markerLabel = markerSprite.label;
					Style.applyStyle(markerLabel, labelStyle);
					markerLabel.measure(labelSize);
				}
			}

			return super.measureOverride(availableSize);
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var renderKey:Object = new Object();

			var isOrientationY:Boolean = (this._orientation.value == Orientation.Y);
			var markerBrushPalette:IBrushPalette = this._markerBrushPalette.value;
			var markerStyle:Style = this._markerStyle.value;

			var seriesSprites:Array = this._seriesSprites;
			var numSeriesSprites:int = seriesSprites.length;
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;
			var markerSprites:Array;
			var numMarkerSprites:int;
			var markerSprite:MarkerSprite;
			var markerLabel:Label;

			var markerBrush:IBrush;
			var markerGraphics:Graphics;

			var pointerSize:Number = 4;
			var halfWidth:Number;
			var halfHeight:Number;
			var p0:Point = new Point();
			var p1:Point = new Point();
			var p2:Point = new Point();
			var p3:Point = new Point();
			var p4:Point = new Point();
			var p5:Point = new Point();
			var p6:Point = new Point();
			var i:int;
			var j:int;

			var relativeDatas:Array = this._relativeDatas;
			var valueData:ValueData;
			for each (valueData in relativeDatas)
			{
				valueData.renderKey = renderKey;
				if (isOrientationY)
					valueData.pixel = Math.round(chartHeight * (1 - valueData.relative));
				else
					valueData.pixel = Math.round(chartWidth * valueData.relative);
			}

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

				for (j = 0; j < numMarkerSprites; j++)
				{
					markerSprite = markerSprites[j];
					markerSprite.visible = false;

					markerLabel = markerSprite.label;

					markerGraphics = markerSprite.graphics;
					markerGraphics.clear();

					valueData = markerSprite.valueData;

					if ((valueData.renderKey == renderKey) && (valueData.relative >= 0) && (valueData.relative <= 1))
					{
						halfWidth = Math.round(Math.max(pointerSize, markerLabel.measuredWidth / 2));
						halfHeight = Math.round(Math.max(pointerSize, markerLabel.measuredHeight / 2));

						if (isOrientationY)
						{
							p0.x = 0;
							p0.y = valueData.pixel;
							p1.x = p0.x + pointerSize;
							p1.y = p0.y - pointerSize;
							p2.x = p1.x;
							p2.y = p0.y - halfHeight;
							p3.x = p2.x + halfWidth * 2;
							p3.y = p2.y;
							p4.x = p3.x;
							p4.y = p0.y + halfHeight;
							p5.x = p2.x;
							p5.y = p4.y;
							p6.x = p5.x;
							p6.y = p0.y + pointerSize;

							markerLabel.x = p2.x;
							markerLabel.y = p2.y;

							markerSprite.tipPlacement = Tooltip.RIGHT;
							markerSprite.tipBounds = new Rectangle(p3.x, p3.y, 0, p4.y - p3.y);
						}
						else
						{
							p0.x = valueData.pixel;
							p0.y = chartHeight;
							p1.x = p0.x - pointerSize;
							p1.y = p0.y - pointerSize;
							p2.x = p0.x - halfWidth;
							p2.y = p1.y;
							p3.x = p2.x;
							p3.y = p2.y - halfHeight * 2;
							p4.x = p0.x + halfWidth;
							p4.y = p3.y;
							p5.x = p4.x;
							p5.y = p2.y;
							p6.x = p0.x + pointerSize;
							p6.y = p5.y;

							markerLabel.x = p3.x;
							markerLabel.y = p3.y;

							markerSprite.tipPlacement = Tooltip.TOP;
							markerSprite.tipBounds = new Rectangle(p3.x, p3.y, p4.x - p3.x, 0);
						}

						markerBrush.beginBrush(markerGraphics);
						markerBrush.moveTo(p0.x, p0.y);
						markerBrush.lineTo(p1.x, p1.y);
						markerBrush.lineTo(p2.x, p2.y);
						markerBrush.lineTo(p3.x, p3.y);
						markerBrush.lineTo(p4.x, p4.y);
						markerBrush.lineTo(p5.x, p5.y);
						markerBrush.lineTo(p6.x, p6.y);
						markerBrush.lineTo(p0.x, p0.y);
						markerBrush.endBrush();

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

import com.jasongatt.controls.OverflowMode;
import com.splunk.charting.charts.DataSprite;
import com.splunk.controls.Label;
import flash.display.Sprite;
import flash.filters.DropShadowFilter;
import flash.text.TextFormat;

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
	public var markerSprites:Array;
	public var numMarkerSprites:int = 0;
	public var numMarkers:int = 0;

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

	public var valueData:ValueData;
	public var label:Label;

	// Constructor

	public function MarkerSprite()
	{
		this.label = new Label();
		this.label.overflowMode = OverflowMode.ELLIPSIS_MIDDLE;

		this.filters = [ new DropShadowFilter(0, 45, 0x000000, 0.5, 4, 4, 1, 3) ];

		this.mouseChildren = false;

		this.addChild(this.label);
	}

}

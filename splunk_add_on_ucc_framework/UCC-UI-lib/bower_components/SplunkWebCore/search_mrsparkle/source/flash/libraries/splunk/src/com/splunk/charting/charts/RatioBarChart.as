package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.graphics.shapes.UniformSizeShape;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.layout.Size;
	import com.jasongatt.layout.Visibility;
	import com.jasongatt.motion.GroupTween;
	import com.jasongatt.motion.PropertyTween;
	import com.jasongatt.motion.TweenRunner;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.controls.Label;
	import com.splunk.controls.Tooltip;
	import com.splunk.data.IDataTable;
	import com.splunk.data.ResultsDataTable;
	import com.splunk.palettes.brush.IBrushPalette;
	import com.splunk.palettes.brush.SolidFillBrushPalette;
	import com.splunk.palettes.color.ListColorPalette;
	import com.splunk.palettes.shape.IShapePalette;
	import com.splunk.services.search.data.ResultsData;
	import com.splunk.utils.LayoutUtil;
	import com.splunk.utils.Style;
	import flash.display.CapsStyle;
	import flash.display.Graphics;
	import flash.display.LineScaleMode;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class RatioBarChart extends AbstractChart
	{

		// Private Properties

		private var _orientation:ObservableProperty;
		private var _barBrushPalette:ObservableProperty;
		private var _barStyle:ObservableProperty;
		private var _barCollapsingThreshold:ObservableProperty;
		private var _barCollapsingLabel:ObservableProperty;
		private var _labelStyle:ObservableProperty;
		private var _labelLineBrush:ObservableProperty;
		private var _showLabels:ObservableProperty;
		private var _showPercent:ObservableProperty;

		private var _barLabels:Array;
		private var _barRatios:Array;
		private var _seriesSprites:Array;

		private var _seriesMask:Shape;
		private var _seriesContainer:Sprite;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function RatioBarChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);
			var lineBrush:SolidStrokeBrush = new SolidStrokeBrush(1, 0x000000, 1, true, LineScaleMode.NORMAL, CapsStyle.SQUARE);

			this._orientation = new ObservableProperty(this, "orientation", String, Orientation.X, this.invalidates(LayoutSprite.MEASURE));
			this._barBrushPalette = new ObservableProperty(this, "barBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._barStyle = new ObservableProperty(this, "barStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._barCollapsingThreshold = new ObservableProperty(this, "barCollapsingThreshold", Number, 0.01, this.invalidates(AbstractChart.PROCESS_DATA));
			this._barCollapsingLabel = new ObservableProperty(this, "barCollapsingLabel", String, "other", this.invalidates(AbstractChart.PROCESS_DATA));
			this._labelStyle = new ObservableProperty(this, "labelStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._labelLineBrush = new ObservableProperty(this, "labelLineBrush", IBrush, lineBrush, this.invalidates(AbstractChart.RENDER_CHART));
			this._showLabels = new ObservableProperty(this, "showLabels", Boolean, true, this.invalidates(LayoutSprite.MEASURE));
			this._showPercent = new ObservableProperty(this, "showPercent", Boolean, false, this.invalidates(LayoutSprite.MEASURE));

			this._barLabels = new Array();
			this._barRatios = new Array();
			this._seriesSprites = new Array();

			this._seriesMask = new Shape();

			this._seriesContainer = new Sprite();
			this._seriesContainer.mouseEnabled = false;
			this._seriesContainer.mask = this._seriesMask;

			this.addChild(this._seriesContainer);
			this.addChild(this._seriesMask);
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

		public function get barBrushPalette() : IBrushPalette
		{
			return this._barBrushPalette.value;
		}
		public function set barBrushPalette(value:IBrushPalette) : void
		{
			this._barBrushPalette.value = value;
		}

		public function get barStyle() : Style
		{
			return this._barStyle.value;
		}
		public function set barStyle(value:Style) : void
		{
			this._barStyle.value = value;
		}

		public function get barCollapsingThreshold() : Number
		{
			return this._barCollapsingThreshold.value;
		}
		public function set barCollapsingThreshold(value:Number) : void
		{
			this._barCollapsingThreshold.value = value;
		}

		public function get barCollapsingLabel() : String
		{
			return this._barCollapsingLabel.value;
		}
		public function set barCollapsingLabel(value:String) : void
		{
			this._barCollapsingLabel.value = value;
		}

		public function get labelStyle() : Style
		{
			return this._labelStyle.value;
		}
		public function set labelStyle(value:Style) : void
		{
			this._labelStyle.value = value;
		}

		public function get labelLineBrush() : IBrush
		{
			return this._labelLineBrush.value;
		}
		public function set labelLineBrush(value:IBrush) : void
		{
			this._labelLineBrush.value = value;
		}

		public function get showLabels() : Boolean
		{
			return this._showLabels.value;
		}
		public function set showLabels(value:Boolean) : void
		{
			this._showLabels.value = value;
		}

		public function get showPercent() : Boolean
		{
			return this._showPercent.value;
		}
		public function set showPercent(value:Boolean) : void
		{
			this._showPercent.value = value;
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			this.invalidate(LayoutSprite.MEASURE);

			var barLabels:Array = this._barLabels;
			var barRatios:Array = this._barRatios;
			var seriesSprites:Array = this._seriesSprites;
			var numProcessedBars:int = 0;

			if (data)
			{
				var numDataColumns:int = data.numColumns;

				if (numDataColumns > 1)
				{
					var numRows:int = data.numRows;

					var value1:*;
					var value2:*;
					var label:String;
					var value:Number;
					var numValues:int;
					var sum:Number = 0;
					var sumOffset:Number = 0;
					var valueSum:Number = 0;
					var i:int;

					var labels:Array = new Array();
					var values:Array = new Array();
					var rowIndexes:Array = new Array();

					var collapseThreshold:Number = this._barCollapsingThreshold.value;
					var collapseLabel:String = this._barCollapsingLabel.value;
					var collapseIndexes:Array = new Array();
					var collapseCount:int;
					var collapseIndex:int;
					var collapseValue:Number = 0;

					var field1:String = data.getColumnName(0);
					var field2:String = data.getColumnName(1);
					var field3:String = field2 + "%";

					var numSeriesSprites:int = seriesSprites.length;
					var seriesSprite:SeriesSprite;
					var barSprite:BarSprite;

					var resultsDataTable:ResultsDataTable = data as ResultsDataTable;
					var resultsData:ResultsData = resultsDataTable ? resultsDataTable.resultsData : null;
					var results:Array = resultsData ? resultsData.results : null;
					var totalCount:Number = (results && (results.length > 0)) ? NumberUtil.parseNumber(results[0]._tc) : NaN;

					// extract labels and values from data and compute sum
					for (i = 0; i < numRows; i++)
					{
						value1 = data.getValue(i, 0);
						if (value1 == null)
							continue;

						value2 = data.getValue(i, 1);
						if (value2 == null)
							continue;

						label = String(value1);
						if (!label)
							continue;

						value = NumberUtil.parseNumber(value2);
						if ((value != value) || (value <= 0))
							continue;

						sum += value;

						labels.push(label);
						values.push(value);
						rowIndexes.push(i);
					}

					// compute sumOffset
					sumOffset = ((sum < totalCount) && ((sum / totalCount) < 0.99)) ? (totalCount - sum) : 0;

					// compute bars to collapse
					numValues = values.length;
					for (i = 0; i < numValues; i++)
					{
						value = values[i];
						if ((value / sum) < collapseThreshold)
							collapseIndexes.push(i);
					}

					// collapse bars
					collapseCount = collapseIndexes.length;
					if (collapseCount > 1)
					{
						for (i = collapseCount - 1; i >= 0; i--)
						{
							collapseIndex = collapseIndexes[i];
							collapseValue += values[collapseIndex];
							labels.splice(collapseIndex, 1);
							values.splice(collapseIndex, 1);
							rowIndexes.splice(collapseIndex, 1);
						}
					}

					// generate new bar and update sum if bars were collapsed or sumOffset > 0
					if ((collapseValue > 0) || (sumOffset > 0))
					{
						labels.push(collapseLabel);
						values.push(collapseValue + sumOffset);
						rowIndexes.push(-1);
						sum += sumOffset;
					}

					// create bars
					numValues = values.length;
					for (i = 0; i < numValues; i++)
					{
						value = values[i];
						valueSum += value;

						if (i < numSeriesSprites)
						{
							barLabels[i] = labels[i];
							barRatios[i] = valueSum / sum;
							seriesSprite = seriesSprites[i];
						}
						else
						{
							barLabels.push(labels[i]);
							barRatios.push(valueSum / sum);
							seriesSprite = new SeriesSprite();
							seriesSprites.push(seriesSprite);
							this._seriesContainer.addChild(seriesSprite);
						}

						seriesSprite.field = labels[i];

						barSprite = seriesSprite.barSprite;
						barSprite.chart = this;
						barSprite.tipPlacement = Tooltip.LEFT_RIGHT;
						barSprite.seriesName = labels[i];
						barSprite.fields = [ field1, field2, field3 ];
						barSprite.data = new Object();
						barSprite.data[field1] = labels[i];
						barSprite.data[field2] = values[i];
						barSprite.data[field3] = (Math.round((value / sum) * 10000) / 100) + "%";
						barSprite.dataRowIndex = rowIndexes[i];
					}

					numProcessedBars = numValues;
				}
			}

			for (i = seriesSprites.length - 1; i >= numProcessedBars; i--)
			{
				barLabels.pop();
				barRatios.pop();
				seriesSprite = seriesSprites.pop();
				this._seriesContainer.removeChild(seriesSprite);
			}
		}

		protected override function updateLegendLabelsOverride(data:IDataTable) : Array
		{
			var labels:Array = new Array();

			var barLabels:Array = this._barLabels;
			var numLabels:int = barLabels.length;
			for (var i:int = 0; i < numLabels; i++)
				labels.push(barLabels[i]);

			return labels;
		}

		protected override function updateLegendSwatchesOverride(legend:ILegend, labels:Array) : Array
		{
			var swatches:Array = new Array();

			var barBrushPalette:IBrushPalette = this._barBrushPalette.value;
			var barStyle:Style = this._barStyle.value;

			var barBrush:IBrush;
			var barShape:IShape = new UniformSizeShape(new RectangleShape());

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

				swatches.push(new SeriesSwatch([ barShape ], [ barBrush ], [ barStyle ], 1));
			}

			return swatches;
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var labelStyle:Style = this._labelStyle.value;
			var showLabels:Boolean = this._showLabels.value;
			var showPercent:Boolean = this._showPercent.value;

			var seriesSprite:SeriesSprite;
			var barSprite:BarSprite;
			var barLabel:Label;
			var barText:String;
			var labelSize:Size;

			if (this._orientation.value == Orientation.Y)
				labelSize = new Size(Math.max((availableSize.width / 2) - 20, 0), Infinity);
			else
				labelSize = new Size(Infinity, Math.max((availableSize.height / 2) - 20, 0));

			for each (seriesSprite in this._seriesSprites)
			{
				barSprite = seriesSprite.barSprite;
				barLabel = barSprite.label;

				barText = "";
				if (barSprite.seriesName)
					barText += barSprite.seriesName;
				if (showPercent && barSprite.data && barSprite.fields && (barSprite.fields.length > 2))
					barText += ", " + barSprite.data[barSprite.fields[2]] + "";

				barLabel.text = barText;
				Style.applyStyle(barLabel, labelStyle);
				barLabel.visibility = showLabels ? Visibility.VISIBLE : Visibility.COLLAPSED;
				barLabel.measure(labelSize);
			}

			return super.measureOverride(availableSize);
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var seriesSprites:Array = this._seriesSprites;
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;

			var isOrientationY:Boolean = (this._orientation.value == Orientation.Y);
			var barBrushPalette:IBrushPalette = this._barBrushPalette.value;
			var barStyle:Style = this._barStyle.value;
			var barSprite:BarSprite;
			var barLabel:Label;
			var barGraphics:Graphics;
			var barBrush:IBrush;
			var barShape:RectangleShape = new RectangleShape();
			var barRatios:Array = this._barRatios;

			var numSeriesSprites:int = seriesSprites.length;
			var x1:Number;
			var x2:Number;
			var y1:Number;
			var y2:Number;
			var i:int;

			var brushBounds:Array;
			var showLabels:Boolean = this._showLabels.value;
			var labelLineBrush:IBrush = this._labelLineBrush.value;
			var labelBounds:Rectangle;
			var labelBoundsList:Array = new Array();
			var points1:Array = new Array();
			var points2:Array = new Array();
			var p1:Point;
			var p2:Point;
			var p3:Point;

			if (!labelLineBrush)
				labelLineBrush = new SolidStrokeBrush(1, 0x000000, 1, true, LineScaleMode.NORMAL, CapsStyle.SQUARE);

			if (isOrientationY)
			{
				x1 = 0;
				x2 = showLabels ? Math.round(chartWidth / 2) : Math.round(chartWidth);
				y1 = 0;
				y2 = 0;
				brushBounds = [ new Point(x1, 0), new Point(x2, 0), new Point(x2, chartHeight), new Point(x1, chartHeight) ];
			}
			else
			{
				x1 = 0;
				x2 = 0;
				y1 = 0;
				y2 = showLabels ? Math.round(chartHeight / 2) : Math.round(chartHeight);
				brushBounds = [ new Point(0, y1), new Point(chartWidth, y1), new Point(chartWidth, y2), new Point(0, y2) ];
			}

			seriesCount = legend ? legend.numLabels : numSeriesSprites;

			for (i = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = seriesSprites[i];
				barSprite = seriesSprite.barSprite;

				barGraphics = barSprite.graphics;
				barGraphics.clear();

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				barBrush = barBrushPalette ? barBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!barBrush)
					barBrush = new SolidFillBrush(0x000000, 1);

				if (isOrientationY)
				{
					y1 = y2;
					y2 = Math.round(chartHeight * barRatios[i]);
				}
				else
				{
					x1 = x2;
					x2 = Math.round(chartWidth * barRatios[i]);
				}

				if (showLabels)
				{
					barLabel = barSprite.label;

					if (isOrientationY)
					{
						p1 = new Point(x2 + 1, Math.round((y1 + y2) / 2));
						p2 = new Point(x2 + 10, p1.y);
						labelBounds = new Rectangle(x2 + 20, p2.y - barLabel.measuredHeight / 2, barLabel.measuredWidth, barLabel.measuredHeight);
					}
					else
					{
						p1 = new Point(Math.round((x1 + x2) / 2), y2 + 1);
						p2 = new Point(p1.x, y2 + 10);
						labelBounds = new Rectangle(p2.x - barLabel.measuredWidth / 2, y2 + 20, barLabel.measuredWidth, barLabel.measuredHeight);
					}

					labelBoundsList.push(labelBounds);
					points1.push(p1);
					points2.push(p2);
				}

				barShape.draw(barGraphics, x1, y1, x2 - x1, y2 - y1, barBrush, null, brushBounds);

				Style.applyStyle(barSprite, barStyle);

				barSprite.tipBounds = new Rectangle(Math.round((x1 + x2) / 2), Math.round((y1 + y2) / 2), 0, 0);
			}

			if (showLabels)
			{
				if (isOrientationY)
				{
					labelBoundsList = LayoutUtil.unoverlap(labelBoundsList, "y", new Rectangle(0, 0, chartWidth, chartHeight));

					for (i = 0; i < numSeriesSprites; i++)
					{
						seriesSprite = seriesSprites[i];
						barSprite = seriesSprite.barSprite;
						barLabel = barSprite.label;

						labelBounds = labelBoundsList[i];

						p1 = points1[i];
						p2 = points2[i];
						p3 = new Point(x2 + 20, Math.round(labelBounds.y + labelBounds.height / 2));

						labelLineBrush.beginBrush(barSprite.graphics);
						labelLineBrush.moveTo(p1.x, p1.y);
						labelLineBrush.lineTo(p2.x, p2.y);
						labelLineBrush.lineTo(p3.x, p3.y);
						labelLineBrush.endBrush();

						barLabel.x = Math.round(labelBounds.x);
						barLabel.y = Math.round(labelBounds.y);
					}
				}
				else
				{
					labelBoundsList = LayoutUtil.unoverlap(labelBoundsList, "x", new Rectangle(0, 0, chartWidth, chartHeight));

					for (i = 0; i < numSeriesSprites; i++)
					{
						seriesSprite = seriesSprites[i];
						barSprite = seriesSprite.barSprite;
						barLabel = barSprite.label;

						labelBounds = labelBoundsList[i];

						p1 = points1[i];
						p2 = points2[i];
						p3 = new Point(Math.round(labelBounds.x + labelBounds.width / 2), y2 + 20);

						labelLineBrush.beginBrush(barSprite.graphics);
						labelLineBrush.moveTo(p1.x, p1.y);
						labelLineBrush.lineTo(p2.x, p2.y);
						labelLineBrush.lineTo(p3.x, p3.y);
						labelLineBrush.endBrush();

						barLabel.x = Math.round(labelBounds.x);
						barLabel.y = Math.round(labelBounds.y);
					}
				}
			}

			var maskGraphics:Graphics = this._seriesMask.graphics;
			maskGraphics.clear();
			maskGraphics.beginFill(0x000000, 1);
			maskGraphics.drawRect(0, 0, chartWidth, chartHeight);
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

import com.jasongatt.controls.OverflowMode;
import com.splunk.charting.charts.DataSprite;
import com.splunk.controls.Label;
import flash.display.Sprite;
import flash.text.TextFormat;

class SeriesSprite extends Sprite
{

	// Public Properties

	public var field:String;
	public var barSprite:BarSprite;

	// Constructor

	public function SeriesSprite()
	{
		this.barSprite = new BarSprite();

		this.mouseEnabled = false;

		this.addChild(this.barSprite);
	}

}

class BarSprite extends DataSprite
{

	// Public Properties

	public var label:Label;

	// Constructor

	public function BarSprite()
	{
		this.label = new Label();
		this.label.overflowMode = OverflowMode.ELLIPSIS_MIDDLE;

		this.addChild(this.label);
	}

}

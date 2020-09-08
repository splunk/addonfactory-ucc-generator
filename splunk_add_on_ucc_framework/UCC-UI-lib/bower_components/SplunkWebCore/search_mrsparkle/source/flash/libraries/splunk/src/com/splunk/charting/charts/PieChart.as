package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.TransformShape;
	import com.jasongatt.graphics.shapes.UniformSizeShape;
	import com.jasongatt.graphics.shapes.WedgeShape;
	import com.jasongatt.layout.LayoutSprite;
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

	public class PieChart extends AbstractChart
	{

		// Private Properties

		private var _sliceBrushPalette:ObservableProperty;
		private var _sliceStyle:ObservableProperty;
		private var _sliceCollapsingThreshold:ObservableProperty;
		private var _sliceCollapsingLabel:ObservableProperty;
		private var _labelStyle:ObservableProperty;
		private var _labelLineBrush:ObservableProperty;
		private var _showLabels:ObservableProperty;
		private var _showPercent:ObservableProperty;

		private var _sliceLabels:Array;
		private var _sliceShapes:Array;
		private var _seriesSprites:Array;

		private var _seriesMask:Shape;
		private var _seriesContainer:Sprite;

		private var _highlightedElement:DataSprite;

		// Constructor

		public function PieChart()
		{
			var colorPalette:ListColorPalette = new ListColorPalette([ 0xCC0000, 0xCCCC00, 0x00CC00, 0x00CCCC, 0x0000CC ], true);
			var lineBrush:SolidStrokeBrush = new SolidStrokeBrush(1, 0x000000, 1, true, LineScaleMode.NORMAL, CapsStyle.SQUARE);

			this._sliceBrushPalette = new ObservableProperty(this, "sliceBrushPalette", IBrushPalette, new SolidFillBrushPalette(colorPalette, 1), this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._sliceStyle = new ObservableProperty(this, "sliceStyle", Style, null, this.invalidates(AbstractChart.UPDATE_LEGEND_SWATCHES));
			this._sliceCollapsingThreshold = new ObservableProperty(this, "sliceCollapsingThreshold", Number, 0.01, this.invalidates(AbstractChart.PROCESS_DATA));
			this._sliceCollapsingLabel = new ObservableProperty(this, "sliceCollapsingLabel", String, "other", this.invalidates(AbstractChart.PROCESS_DATA));
			this._labelStyle = new ObservableProperty(this, "labelStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._labelLineBrush = new ObservableProperty(this, "labelLineBrush", IBrush, lineBrush, this.invalidates(AbstractChart.RENDER_CHART));
			this._showLabels = new ObservableProperty(this, "showLabels", Boolean, true, this.invalidates(LayoutSprite.MEASURE));
			this._showPercent = new ObservableProperty(this, "showPercent", Boolean, false, this.invalidates(LayoutSprite.MEASURE));

			this._sliceLabels = new Array();
			this._sliceShapes = new Array();
			this._seriesSprites = new Array();

			this._seriesMask = new Shape();

			this._seriesContainer = new Sprite();
			this._seriesContainer.mouseEnabled = false;
			this._seriesContainer.mask = this._seriesMask;

			this.addChild(this._seriesContainer);
			this.addChild(this._seriesMask);
		}

		// Public Getters/Setters

		public function get sliceBrushPalette() : IBrushPalette
		{
			return this._sliceBrushPalette.value;
		}
		public function set sliceBrushPalette(value:IBrushPalette) : void
		{
			this._sliceBrushPalette.value = value;
		}

		public function get sliceStyle() : Style
		{
			return this._sliceStyle.value;
		}
		public function set sliceStyle(value:Style) : void
		{
			this._sliceStyle.value = value;
		}

		public function get sliceCollapsingThreshold() : Number
		{
			return this._sliceCollapsingThreshold.value;
		}
		public function set sliceCollapsingThreshold(value:Number) : void
		{
			this._sliceCollapsingThreshold.value = value;
		}

		public function get sliceCollapsingLabel() : String
		{
			return this._sliceCollapsingLabel.value;
		}
		public function set sliceCollapsingLabel(value:String) : void
		{
			this._sliceCollapsingLabel.value = value;
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

			var sliceLabels:Array = this._sliceLabels;
			var sliceShapes:Array = this._sliceShapes;
			var seriesSprites:Array = this._seriesSprites;
			var numProcessedSlices:int = 0;

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

					var collapseThreshold:Number = this._sliceCollapsingThreshold.value;
					var collapseLabel:String = this._sliceCollapsingLabel.value;
					var collapseIndexes:Array = new Array();
					var collapseCount:int;
					var collapseIndex:int;
					var collapseValue:Number = 0;

					var field1:String = data.getColumnName(0);
					var field2:String = data.getColumnName(1);
					var field3:String = field2 + "%";

					var numSeriesSprites:int = seriesSprites.length;
					var seriesSprite:SeriesSprite;
					var sliceSprite:SliceSprite;
					var sliceShape:WedgeShape;
					var angle1:Number = 0;
					var angle2:Number = 0;

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

					// compute slices to collapse
					numValues = values.length;
					for (i = 0; i < numValues; i++)
					{
						value = values[i];
						if ((value / sum) < collapseThreshold)
							collapseIndexes.push(i);
					}

					// collapse slices
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

					// generate new slice and update sum if slices were collapsed or sumOffset > 0
					if ((collapseValue > 0) || (sumOffset > 0))
					{
						labels.push(collapseLabel);
						values.push(collapseValue + sumOffset);
						rowIndexes.push(-1);
						sum += sumOffset;
					}

					// create slices
					numValues = values.length;
					for (i = 0; i < numValues; i++)
					{
						value = values[i];
						valueSum += value;

						if (i < numSeriesSprites)
						{
							sliceLabels[i] = labels[i];
							sliceShape = sliceShapes[i];
							seriesSprite = seriesSprites[i];
						}
						else
						{
							sliceLabels.push(labels[i]);
							sliceShape = new WedgeShape();
							sliceShapes.push(sliceShape);
							seriesSprite = new SeriesSprite();
							seriesSprites.push(seriesSprite);
							this._seriesContainer.addChild(seriesSprite);
						}

						seriesSprite.field = labels[i];

						sliceSprite = seriesSprite.sliceSprite;
						sliceSprite.chart = this;
						sliceSprite.tipPlacement = Tooltip.LEFT_RIGHT;
						sliceSprite.seriesName = labels[i];
						sliceSprite.fields = [ field1, field2, field3 ];
						sliceSprite.data = new Object();
						sliceSprite.data[field1] = labels[i];
						sliceSprite.data[field2] = values[i];
						sliceSprite.data[field3] = (Math.round((value / sum) * 10000) / 100) + "%";
						sliceSprite.dataRowIndex = rowIndexes[i];

						angle1 = angle2;
						angle2 = 360 * (valueSum / sum);
						sliceShape.startAngle = angle1 - 90;
						sliceShape.arcAngle = angle2 - angle1;
					}

					numProcessedSlices = numValues;
				}
			}

			for (i = seriesSprites.length - 1; i >= numProcessedSlices; i--)
			{
				sliceLabels.pop();
				sliceShapes.pop();
				seriesSprite = seriesSprites.pop();
				this._seriesContainer.removeChild(seriesSprite);
			}
		}

		protected override function updateLegendLabelsOverride(data:IDataTable) : Array
		{
			var labels:Array = new Array();

			var sliceLabels:Array = this._sliceLabels;
			var numLabels:int = sliceLabels.length;
			for (var i:int = 0; i < numLabels; i++)
				labels.push(sliceLabels[i]);

			return labels;
		}

		protected override function updateLegendSwatchesOverride(legend:ILegend, labels:Array) : Array
		{
			var swatches:Array = new Array();

			var sliceBrushPalette:IBrushPalette = this._sliceBrushPalette.value;
			var sliceStyle:Style = this._sliceStyle.value;
			var sliceBrush:IBrush;
			var sliceShape:IShape = new UniformSizeShape(new TransformShape(new WedgeShape(-90, 90), -1, 0, 2, 2));

			var numLabels:int = labels.length;
			var label:String;
			var labelIndex:int;
			var labelCount:int = legend ? legend.numLabels : numLabels;

			for (var i:int = 0; i < numLabels; i++)
			{
				label = labels[i];
				labelIndex = legend ? legend.getLabelIndex(label) : i;

				sliceBrush = sliceBrushPalette ? sliceBrushPalette.getBrush(label, labelIndex, labelCount) : null;
				if (!sliceBrush)
					sliceBrush = new SolidFillBrush(0x000000, 1);

				swatches.push(new SeriesSwatch([ sliceShape ], [ sliceBrush ], [ sliceStyle ], 1));
			}

			return swatches;
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var labelStyle:Style = this._labelStyle.value;
			var showLabels:Boolean = this._showLabels.value;
			var showPercent:Boolean = this._showPercent.value;

			var seriesSprite:SeriesSprite;
			var sliceSprite:SliceSprite;
			var sliceLabel:Label;
			var sliceText:String;
			var labelSize:Size = new Size(Math.max((availableSize.width / 3) - 30, 0), Infinity);

			for each (seriesSprite in this._seriesSprites)
			{
				sliceSprite = seriesSprite.sliceSprite;
				sliceLabel = sliceSprite.label;

				sliceText = "";
				if (sliceSprite.seriesName)
					sliceText += sliceSprite.seriesName;
				if (showPercent && sliceSprite.data && sliceSprite.fields && (sliceSprite.fields.length > 2))
					sliceText += ", " + sliceSprite.data[sliceSprite.fields[2]] + "";

				sliceLabel.text = sliceText;
				Style.applyStyle(sliceLabel, labelStyle);
				sliceLabel.visibility = showLabels ? Visibility.VISIBLE : Visibility.COLLAPSED;
				sliceLabel.measure(labelSize);
			}

			return super.measureOverride(availableSize);
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var showLabels:Boolean = this._showLabels.value;

			var seriesSprites:Array = this._seriesSprites;
			var seriesSprite:SeriesSprite;
			var seriesIndex:int;
			var seriesCount:int;

			var sliceBrushPalette:IBrushPalette = this._sliceBrushPalette.value;
			var sliceStyle:Style = this._sliceStyle.value;
			var sliceSprite:SliceSprite;
			var sliceLabel:Label;
			var sliceGraphics:Graphics;
			var sliceBrush:IBrush;
			var sliceShapes:Array = this._sliceShapes;
			var sliceShape:WedgeShape;
			var sliceRadius:Number = showLabels ? Math.min(chartWidth / 3, chartHeight - 30) : Math.min(chartWidth - 4, chartHeight - 4);
			sliceRadius = Math.round(Math.max(sliceRadius, 0) / 2);

			var numSeriesSprites:int = seriesSprites.length;
			var halfWidth:Number = Math.round(chartWidth / 2);
			var halfHeight:Number = Math.round(chartHeight / 2);
			var x1:Number = halfWidth - sliceRadius;
			var x2:Number = halfWidth + sliceRadius;
			var y1:Number = halfHeight - sliceRadius;
			var y2:Number = halfHeight + sliceRadius;
			var rTip:Number = sliceRadius * (2 / 3);
			var r1:Number = sliceRadius + 2;
			var r2:Number = sliceRadius + 10;
			var a:Number;
			var i:int;

			var labelLineBrush:IBrush = this._labelLineBrush.value;
			var labelBounds:Rectangle;
			var leftSliceSprites:Array = new Array();
			var leftLabelBoundsList:Array = new Array();
			var leftPoints1:Array = new Array();
			var leftPoints2:Array = new Array();
			var rightSliceSprites:Array = new Array();
			var rightLabelBoundsList:Array = new Array();
			var rightPoints1:Array = new Array();
			var rightPoints2:Array = new Array();
			var p1:Point;
			var p2:Point;
			var p3:Point;
			var p4:Point;

			if (!labelLineBrush)
				labelLineBrush = new SolidStrokeBrush(1, 0x000000, 1, true, LineScaleMode.NORMAL, CapsStyle.SQUARE);

			seriesCount = legend ? legend.numLabels : numSeriesSprites;

			for (i = 0; i < numSeriesSprites; i++)
			{
				seriesSprite = seriesSprites[i];
				sliceSprite = seriesSprite.sliceSprite;

				sliceGraphics = sliceSprite.graphics;
				sliceGraphics.clear();

				seriesIndex = legend ? legend.getLabelIndex(seriesSprite.field) : i;

				sliceBrush = sliceBrushPalette ? sliceBrushPalette.getBrush(seriesSprite.field, seriesIndex, seriesCount) : null;
				if (!sliceBrush)
					sliceBrush = new SolidFillBrush(0x000000, 1);

				sliceShape = sliceShapes[i];

				a = (sliceShape.startAngle + sliceShape.arcAngle / 2) * (Math.PI / 180);

				if (showLabels)
				{
					sliceLabel = sliceSprite.label;

					p1 = new Point(halfWidth + r1 * Math.cos(a), halfHeight + r1 * Math.sin(a));
					p2 = new Point(halfWidth + r2 * Math.cos(a), Math.round(halfHeight + r2 * Math.sin(a)));

					if (p2.x < halfWidth)
					{
						labelBounds = new Rectangle(x1 - sliceLabel.measuredWidth - 30, p2.y - sliceLabel.measuredHeight / 2, sliceLabel.measuredWidth, sliceLabel.measuredHeight);
						leftSliceSprites.unshift(sliceSprite);
						leftLabelBoundsList.unshift(labelBounds);
						leftPoints1.unshift(p1);
						leftPoints2.unshift(p2);
					}
					else
					{
						labelBounds = new Rectangle(x2 + 30, p2.y - sliceLabel.measuredHeight / 2, sliceLabel.measuredWidth, sliceLabel.measuredHeight);
						rightSliceSprites.push(sliceSprite);
						rightLabelBoundsList.push(labelBounds);
						rightPoints1.push(p1);
						rightPoints2.push(p2);
					}
				}

				sliceShape.draw(sliceGraphics, x1, y1, x2 - x1, y2 - y1, sliceBrush);

				Style.applyStyle(sliceSprite, sliceStyle);

				sliceSprite.tipBounds = new Rectangle(Math.round(halfWidth + rTip * Math.cos(a)), Math.round(halfHeight + rTip * Math.sin(a)), 0, 0);
			}

			if (showLabels)
			{
				leftLabelBoundsList = LayoutUtil.unoverlap(leftLabelBoundsList, "y", new Rectangle(0, 0, x1, chartHeight));
				rightLabelBoundsList = LayoutUtil.unoverlap(rightLabelBoundsList, "y", new Rectangle(x2, 0, chartWidth - x2, chartHeight));

				numSeriesSprites = leftSliceSprites.length;
				for (i = 0; i < numSeriesSprites; i++)
				{
					sliceSprite = leftSliceSprites[i];
					sliceLabel = sliceSprite.label;

					labelBounds = leftLabelBoundsList[i];

					p1 = leftPoints1[i];
					p2 = leftPoints2[i];
					p3 = new Point(x1 - 20, p2.y);
					p4 = new Point(x1 - 30, Math.round(labelBounds.y + labelBounds.height / 2));

					labelLineBrush.beginBrush(sliceSprite.graphics);
					labelLineBrush.moveTo(p1.x, p1.y);
					labelLineBrush.lineTo(p2.x, p2.y);
					labelLineBrush.lineTo(p3.x, p3.y);
					labelLineBrush.lineTo(p4.x, p4.y);
					labelLineBrush.endBrush();

					sliceLabel.x = Math.round(labelBounds.x);
					sliceLabel.y = Math.round(labelBounds.y);
				}

				numSeriesSprites = rightSliceSprites.length;
				for (i = 0; i < numSeriesSprites; i++)
				{
					sliceSprite = rightSliceSprites[i];
					sliceLabel = sliceSprite.label;

					labelBounds = rightLabelBoundsList[i];

					p1 = rightPoints1[i];
					p2 = rightPoints2[i];
					p3 = new Point(x2 + 20, p2.y);
					p4 = new Point(x2 + 30, Math.round(labelBounds.y + labelBounds.height / 2));

					labelLineBrush.beginBrush(sliceSprite.graphics);
					labelLineBrush.moveTo(p1.x, p1.y);
					labelLineBrush.lineTo(p2.x, p2.y);
					labelLineBrush.lineTo(p3.x, p3.y);
					labelLineBrush.lineTo(p4.x, p4.y);
					labelLineBrush.endBrush();

					sliceLabel.x = Math.round(labelBounds.x);
					sliceLabel.y = Math.round(labelBounds.y);
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
	public var sliceSprite:SliceSprite;

	// Constructor

	public function SeriesSprite()
	{
		this.sliceSprite = new SliceSprite();

		this.mouseEnabled = false;

		this.addChild(this.sliceSprite);
	}

}

class SliceSprite extends DataSprite
{

	// Public Properties

	public var label:Label;

	// Constructor

	public function SliceSprite()
	{
		this.label = new Label();
		this.label.overflowMode = OverflowMode.ELLIPSIS_MIDDLE;

		this.addChild(this.label);
	}

}

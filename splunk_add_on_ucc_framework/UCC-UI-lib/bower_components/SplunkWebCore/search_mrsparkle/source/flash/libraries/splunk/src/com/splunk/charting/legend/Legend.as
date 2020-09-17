package com.splunk.charting.legend
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.layout.Size;
	import com.jasongatt.motion.GroupTween;
	import com.jasongatt.motion.PropertyTween;
	import com.jasongatt.motion.TweenRunner;
	import com.splunk.charting.charts.AbstractChart;
	import com.splunk.charting.charts.SeriesSwatchSprite;
	import com.splunk.charting.layout.IPlacement;
	import com.splunk.charting.layout.Placement;
	import com.splunk.controls.Label;
	import com.splunk.utils.Style;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;

	public class Legend extends AbstractLegend implements IPlacement
	{

		// Public Static Constants

		public static const PROCESS_ITEMS:ValidatePass = new ValidatePass(Legend, "processItems", 0.4);

		// Private Properties

		private var _masterLegend:ObservableProperty;
		private var _placement:ObservableProperty;
		private var _orientation:ObservableProperty;
		private var _swatchPlacement:ObservableProperty;
		private var _swatchStyle:ObservableProperty;
		private var _labelStyle:ObservableProperty;
		private var _itemStyle:ObservableProperty;

		private var _swatches:Array;
		private var _labels:Array;
		private var _items:Array;
		private var _actualOrientation:String;
		private var _columnWidths:Array;
		private var _rowHeights:Array;
		private var _highlightedLabel:String;
		private var _cachedMasterLegendNumLabels:int = -1;
		private var _cachedMasterLegendLabelMap:Object;

		// Constructor

		public function Legend()
		{
			this._masterLegend = new ObservableProperty(this, "masterLegend", ILegend, null, this._masterLegend_changed);
			this._placement = new ObservableProperty(this, "placement", String, Placement.RIGHT, this.invalidates(LayoutSprite.MEASURE));
			this._orientation = new ObservableProperty(this, "orientation", String, null, this.invalidates(LayoutSprite.MEASURE));
			this._swatchPlacement = new ObservableProperty(this, "swatchPlacement", String, Placement.LEFT, this.invalidates(LayoutSprite.MEASURE));
			this._swatchStyle = new ObservableProperty(this, "swatchStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._labelStyle = new ObservableProperty(this, "labelStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._itemStyle = new ObservableProperty(this, "itemStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));

			this._swatches = new Array();
			this._labels = new Array();
			this._items = new Array();
		}

		// Public Getters/Setters

		public function get masterLegend() : ILegend
		{
			return this._masterLegend.value;
		}
		public function set masterLegend(value:ILegend) : void
		{
			this._masterLegend.value = value;
		}

		public function get placement() : String
		{
			return this._placement.value;
		}
		public function set placement(value:String) : void
		{
			switch (value)
			{
				case Placement.LEFT:
				case Placement.RIGHT:
				case Placement.TOP:
				case Placement.BOTTOM:
				case Placement.CENTER:
					break;
				default:
					value = Placement.RIGHT;
					break;
			}
			this._placement.value = value;
		}

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
					value = null;
					break;
			}
			this._orientation.value = value;
		}

		public function get swatchPlacement() : String
		{
			return this._swatchPlacement.value;
		}
		public function set swatchPlacement(value:String) : void
		{
			switch (value)
			{
				case Placement.LEFT:
				case Placement.RIGHT:
				case Placement.TOP:
				case Placement.BOTTOM:
					break;
				default:
					value = Placement.LEFT;
					break;
			}
			this._swatchPlacement.value = value;
		}

		public function get swatchStyle() : Style
		{
			return this._swatchStyle.value;
		}
		public function set swatchStyle(value:Style) : void
		{
			this._swatchStyle.value = value;
		}

		public function get labelStyle() : Style
		{
			return this._labelStyle.value;
		}
		public function set labelStyle(value:Style) : void
		{
			this._labelStyle.value = value;
		}

		public function get itemStyle() : Style
		{
			return this._itemStyle.value;
		}
		public function set itemStyle(value:Style) : void
		{
			this._itemStyle.value = value;
		}

		// Public Methods

		public function processItems() : void
		{
			this.validatePreceding(Legend.PROCESS_ITEMS);

			if (this.isValid(Legend.PROCESS_ITEMS))
				return;

			this.invalidate(LayoutSprite.MEASURE);

			var items:Array = this._items;
			var numItems:int = items.length;
			var item:LegendItem;
			var i:int;

			var swatches:Array = this._swatches;
			var labels:Array = this._labels;

			var numSwatches:int = swatches.length;
			var numLabels:int = labels.length;
			var numData:int = Math.max(numSwatches, numLabels);

			for (i = 0; i < numData; i++)
			{
				if (i < numItems)
				{
					item = items[i];
				}
				else
				{
					item = new LegendItem();
					items.push(item);
					this.addChild(item);
				}

				item.swatch = (i < numSwatches) ? swatches[i] : null;
				item.label = (i < numLabels) ? labels[i] : "";
			}

			for (i = items.length - 1; i >= numData; i--)
			{
				item = items.pop();
				this.removeChild(item);
			}

			if (this._highlightedLabel)
				this._highlightItem(this._highlightedLabel);

			this.setValid(Legend.PROCESS_ITEMS);
		}

		public function highlightItem(label:String) : void
		{
			if (!label)
				label = null;

			if (this._highlightedLabel == label)
				return;

			this._highlightedLabel = label;

			this._highlightItem(label);
		}

		// Protected Methods

		protected override function getNumLabelsOverride() : int
		{
			var masterLegend:ILegend = this._masterLegend.value;
			if (masterLegend)
			{
				var value:int = this._cachedMasterLegendNumLabels;
				if (value < 0)
					value = this._cachedMasterLegendNumLabels = masterLegend.numLabels;
				return value;
			}

			return -1;
		}

		protected override function getLabelIndexOverride(label:String) : int
		{
			var masterLegend:ILegend = this._masterLegend.value;
			if (masterLegend)
			{
				var labelMap:Object = this._cachedMasterLegendLabelMap;
				if (!labelMap)
					labelMap = this._cachedMasterLegendLabelMap = new Object();
				var index:* = labelMap[label];
				if (index == null)
					index = labelMap[label] = masterLegend.getLabelIndex(label);
				return int(index);
			}

			return -1;
		}

		protected override function updateLabelsOverride(labels:Array) : Boolean
		{
			this._labels = labels;

			this.invalidate(Legend.PROCESS_ITEMS);

			var masterLegend:ILegend = this._masterLegend.value;
			if (masterLegend)
			{
				masterLegend.setLabels(this, labels);
				return true;
			}

			return false;
		}

		protected override function updateSwatchesOverride(swatches:Array) : Boolean
		{
			this._swatches = swatches;

			this.invalidate(Legend.PROCESS_ITEMS);

			var masterLegend:ILegend = this._masterLegend.value;
			if (masterLegend)
			{
				masterLegend.setSwatches(this, swatches);
				return true;
			}

			return false;
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var swatchPlacement:String = this._swatchPlacement.value;
			var swatchStyle:Style = this._swatchStyle.value;
			var labelStyle:Style = this._labelStyle.value;
			var itemStyle:Style = this._itemStyle.value;

			var childSize:Size = new Size(availableSize.width, Infinity);
			var swatchSize:Size = new Size();
			var items:Array = this._items;
			var item:LegendItem;

			for each (item in items)
			{
				item.swatchPlacement = swatchPlacement;
				item.swatchStyle = swatchStyle;
				item.measureSwatch(childSize);
				swatchSize.width = Math.max(item.swatchMeasuredWidth, swatchSize.width);
				swatchSize.height = Math.max(item.swatchMeasuredHeight, swatchSize.height);
			}

			for each (item in items)
			{
				Style.applyStyle(item, itemStyle);
				item.swatchLayoutSize = swatchSize;
				item.labelStyle = labelStyle;
				item.measure(childSize);
			}

			var orientation:String = this._orientation.value;
			if (orientation == null)
			{
				switch (this._placement.value)
				{
					case Placement.TOP:
					case Placement.BOTTOM:
						orientation = Orientation.X;
						break;
					default:
						orientation = Orientation.Y;
						break;
				}
			}
			this._actualOrientation = orientation;

			var measuredSize:Size = new Size();

			if (orientation == Orientation.X)
			{
				var numItems:int = items.length;
				var numColumns:int = numItems;
				var numRows:int = 1;
				var itemIndex:int;
				var columnIndex:int;
				var rowIndex:int;
				var columnWidth:Number;
				var rowHeight:Number;
				var columnWidths:Array;
				var rowHeights:Array;

				columnWidths = new Array(numItems);
				for (itemIndex = 0; itemIndex < numItems; itemIndex++)
				{
					item = items[itemIndex];
					columnWidth = item.measuredWidth;
					measuredSize.width += columnWidth;
					columnWidths[itemIndex] = columnWidth;
				}

				while ((numColumns > 1) && (measuredSize.width > availableSize.width))
				{
					numColumns--;
					numRows = Math.ceil(numItems / numColumns);
					numColumns = Math.ceil(numItems / numRows);

					measuredSize.width = 0;
					columnWidths = new Array(numColumns);
					for (columnIndex = 0; columnIndex < numColumns; columnIndex++)
					{
						columnWidth = 0;
						for (rowIndex = 0; rowIndex < numRows; rowIndex++)
						{
							itemIndex = columnIndex + rowIndex * numColumns;
							if (itemIndex < numItems)
							{
								item = items[itemIndex];
								columnWidth = Math.max(item.measuredWidth, columnWidth);
							}
						}
						measuredSize.width += columnWidth;
						columnWidths[columnIndex] = columnWidth;
					}
				}

				rowHeights = new Array(numRows);
				for (rowIndex = 0; rowIndex < numRows; rowIndex++)
				{
					rowHeight = 0;
					for (columnIndex = 0; columnIndex < numColumns; columnIndex++)
					{
						itemIndex = columnIndex + rowIndex * numColumns;
						if (itemIndex < numItems)
						{
							item = items[itemIndex];
							rowHeight = Math.max(item.measuredHeight, rowHeight);
						}
					}
					measuredSize.height += rowHeight;
					rowHeights[rowIndex] = rowHeight;
				}

				this._columnWidths = columnWidths;
				this._rowHeights = rowHeights;
			}
			else
			{
				for each (item in items)
				{
					measuredSize.width = Math.max(item.measuredWidth, measuredSize.width);
					measuredSize.height += item.measuredHeight;
				}

				this._columnWidths = null;
				this._rowHeights = null;

				measuredSize.width = Math.min(measuredSize.width, availableSize.width);
			}

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var childBounds:Rectangle = new Rectangle();
			var items:Array = this._items;
			var item:LegendItem;

			if (this._actualOrientation == Orientation.X)
			{
				var columnWidths:Array = this._columnWidths;
				var rowHeights:Array = this._rowHeights;
				var numColumns:int = columnWidths ? columnWidths.length : 0;
				var numRows:int = rowHeights ? rowHeights.length : 0;
				var numItems:int = items.length;
				var columnIndex:int;
				var rowIndex:int;
				var itemIndex:int;

				layoutSize = new Size();

				for (rowIndex = 0; rowIndex < numRows; rowIndex++)
				{
					childBounds.height = rowHeights[rowIndex];
					for (columnIndex = 0; columnIndex < numColumns; columnIndex++)
					{
						itemIndex = columnIndex + rowIndex * numColumns;
						if (itemIndex < numItems)
						{
							item = items[itemIndex];
							childBounds.width = columnWidths[columnIndex];
							item.layout(childBounds);
							childBounds.x += childBounds.width;
						}
					}

					layoutSize.width = Math.max(layoutSize.width, childBounds.x);

					childBounds.x = 0;
					childBounds.y += childBounds.height;
				}

				layoutSize.height = childBounds.y;
			}
			else
			{
				childBounds.width = layoutSize.width;
				for each (item in items)
				{
					childBounds.height = item.measuredHeight;
					item.layout(childBounds);
					childBounds.y += childBounds.height;
				}

				layoutSize = new Size(childBounds.width, childBounds.y);
			}

			return layoutSize;
		}

		protected override function onChildAdded(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildRemoved(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildOrderChanged() : void
		{
			this.invalidate(LayoutSprite.LAYOUT);
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			switch (pass)
			{
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

		// Private Methods

		private function _highlightItem(label:String) : void
		{
			var tweens:Array = new Array();

			var a:Number = AbstractChart.HIGHLIGHT_RATIO;

			var items:Array = this._items;
			var numItems:int = items.length;
			var item:LegendItem;
			for (var i:int = 0; i < numItems; i++)
			{
				item = items[i];
				if (label && (item.label != label))
					tweens.push(new PropertyTween(item, "alpha", null, a));
				else
					tweens.push(new PropertyTween(item, "alpha", null, 1));
			}

			if (tweens.length > 0)
				TweenRunner.start(new GroupTween(tweens, AbstractChart.HIGHLIGHT_EASER), AbstractChart.HIGHLIGHT_DURATION);
		}

		private function _masterLegend_changed(e:ChangedEvent) : void
		{
			switch (e.changeType)
			{
				case LegendChangeType.LABEL_INDEX_MAP:
					this._cachedMasterLegendNumLabels = -1;
					this._cachedMasterLegendLabelMap = null;
					break;
				case PropertyChangedEvent.PROPERTY:
					var propertyChangedEvent:PropertyChangedEvent = e as PropertyChangedEvent;
					if (propertyChangedEvent && (propertyChangedEvent.source == this._masterLegend))
					{
						var oldLegend:ILegend = propertyChangedEvent.oldValue as ILegend;
						var newLegend:ILegend = propertyChangedEvent.newValue as ILegend;

						if (oldLegend)
						{
							oldLegend.removeEventListener(LegendEvent.SET_LABELS, this.dispatchEvent);
							oldLegend.removeEventListener(LegendEvent.SET_SWATCHES, this.dispatchEvent);

							oldLegend.unregister(this);
						}

						this._cachedMasterLegendNumLabels = -1;
						this._cachedMasterLegendLabelMap = null;

						if (newLegend)
						{
							newLegend.register(this);

							newLegend.addEventListener(LegendEvent.SET_LABELS, this.dispatchEvent);
							newLegend.addEventListener(LegendEvent.SET_SWATCHES, this.dispatchEvent);

							newLegend.setLabels(this, this._labels);
							newLegend.setSwatches(this, this._swatches);
						}

						this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, LegendChangeType.LABEL_INDEX_MAP));
					}
					break;
			}
		}

	}

}

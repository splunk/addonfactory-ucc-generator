package com.splunk.charting.legend
{

	import com.jasongatt.controls.OverflowMode;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.Alignment;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.splunk.charting.charts.SeriesSwatch;
	import com.splunk.charting.charts.SeriesSwatchSprite;
	import com.splunk.charting.layout.Placement;
	import com.splunk.controls.Label;
	import com.splunk.utils.Style;
	import flash.display.Graphics;
	import flash.geom.Rectangle;

	public class LegendItem extends LayoutSprite
	{

		// Private Properties

		private var _swatch:ObservableProperty;
		private var _swatchPlacement:ObservableProperty;
		private var _swatchStyle:ObservableProperty;
		private var _swatchLayoutSize:ObservableProperty;
		private var _label:ObservableProperty;
		private var _labelStyle:ObservableProperty;

		private var _swatchSprite:SeriesSwatchSprite;
		private var _labelSprite:Label;
		private var _cachedSwatchPlacement:String;
		private var _cachedSwatchLayoutSize:Size;

		// Constructor

		public function LegendItem()
		{
			this._swatch = new ObservableProperty(this, "swatch", SeriesSwatch, null, this.invalidates(LayoutSprite.MEASURE));
			this._swatchPlacement = new ObservableProperty(this, "swatchPlacement", String, Placement.LEFT, this.invalidates(LayoutSprite.MEASURE));
			this._swatchStyle = new ObservableProperty(this, "swatchStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._swatchLayoutSize = new ObservableProperty(this, "swatchLayoutSize", Size, new Size(), this.invalidates(LayoutSprite.MEASURE));
			this._label = new ObservableProperty(this, "label", String, null, this.invalidates(LayoutSprite.MEASURE));
			this._labelStyle = new ObservableProperty(this, "labelStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));

			this._swatchSprite = new SeriesSwatchSprite();
			this._swatchSprite.alignmentX = Alignment.CENTER;
			this._swatchSprite.alignmentY = Alignment.CENTER;

			this._labelSprite = new Label();
			this._labelSprite.overflowMode = OverflowMode.ELLIPSIS_MIDDLE;
			this._labelSprite.alignmentY = Alignment.CENTER;

			this.mouseChildren = false;

			this.addChild(this._swatchSprite);
			this.addChild(this._labelSprite);
		}

		// Public Getters/Setters

		public function get swatch() : SeriesSwatch
		{
			return this._swatch.value;
		}
		public function set swatch(value:SeriesSwatch) : void
		{
			this._swatch.value = value;
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

		public function get swatchMeasuredWidth() : Number
		{
			return this._swatchSprite.measuredWidth;
		}

		public function get swatchMeasuredHeight() : Number
		{
			return this._swatchSprite.measuredHeight;
		}

		public function get swatchLayoutSize() : Size
		{
			return this._swatchLayoutSize.value.clone();
		}
		public function set swatchLayoutSize(value:Size) : void
		{
			this._swatchLayoutSize.value = value ? value.clone() : new Size();
		}

		public function get label() : String
		{
			return this._label.value;
		}
		public function set label(value:String) : void
		{
			this._label.value = value;
		}

		public function get labelStyle() : Style
		{
			return this._labelStyle.value;
		}
		public function set labelStyle(value:Style) : void
		{
			this._labelStyle.value = value;
		}

		// Public Methods

		public function measureSwatch(availableSize:Size) : void
		{
			var swatchPlacement:String = this._cachedSwatchPlacement = this._swatchPlacement.value;

			var swatchSize:Size;
			switch (swatchPlacement)
			{
				case Placement.LEFT:
				case Placement.RIGHT:
					swatchSize = new Size(availableSize.width / 2, availableSize.height);
					break;
				default:
					swatchSize = new Size(availableSize.width, availableSize.height / 2);
					break;
			}

			var swatchSprite:SeriesSwatchSprite = this._swatchSprite;
			Style.applyStyle(swatchSprite, this._swatchStyle.value);
			swatchSprite.swatch = this._swatch.value;
			swatchSprite.measure(swatchSize);
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var swatchPlacement:String = this._cachedSwatchPlacement;
			var swatchLayoutSize:Size = this._cachedSwatchLayoutSize = this._swatchLayoutSize.value;

			var labelSize:Size;
			switch (swatchPlacement)
			{
				case Placement.LEFT:
				case Placement.RIGHT:
					labelSize = new Size(Math.max(availableSize.width - swatchLayoutSize.width, 0), availableSize.height);
					break;
				default:
					labelSize = new Size(availableSize.width, Math.max(availableSize.height - swatchLayoutSize.height, 0));
					break;
			}

			var labelSprite:Label = this._labelSprite;
			switch (swatchPlacement)
			{
				case Placement.LEFT:
					labelSprite.alignmentX = 0;
					break;
				case Placement.RIGHT:
					labelSprite.alignmentX = 1;
					break;
				default:
					labelSprite.alignmentX = 0.5;
					break;
			}
			labelSprite.text = this._label.value;
			Style.applyStyle(labelSprite, this._labelStyle.value);
			labelSprite.measure(labelSize);

			var measuredSize:Size = new Size();
			switch (swatchPlacement)
			{
				case Placement.LEFT:
				case Placement.RIGHT:
					measuredSize.width = swatchLayoutSize.width + labelSprite.measuredWidth;
					measuredSize.height = Math.max(swatchLayoutSize.height, labelSprite.measuredHeight);
					break;
				default:
					measuredSize.width = Math.max(swatchLayoutSize.width, labelSprite.measuredWidth);
					measuredSize.height = swatchLayoutSize.height + labelSprite.measuredHeight;
					break;
			}

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var swatchPlacement:String = this._cachedSwatchPlacement;
			var swatchLayoutSize:Size = this._cachedSwatchLayoutSize;

			var swatchBounds:Rectangle;
			var labelBounds:Rectangle;
			switch (swatchPlacement)
			{
				case Placement.LEFT:
					swatchBounds = new Rectangle(0, 0, swatchLayoutSize.width, layoutSize.height);
					labelBounds = new Rectangle(swatchBounds.width, 0, Math.max(layoutSize.width - swatchBounds.width, 0), layoutSize.height);
					break;
				case Placement.RIGHT:
					swatchBounds = new Rectangle(Math.max(layoutSize.width - swatchLayoutSize.width, 0), 0, swatchLayoutSize.width, layoutSize.height);
					labelBounds = new Rectangle(0, 0, Math.max(layoutSize.width - swatchBounds.width, 0), layoutSize.height);
					break;
				case Placement.TOP:
					swatchBounds = new Rectangle(0, 0, layoutSize.width, swatchLayoutSize.height);
					labelBounds = new Rectangle(0, swatchBounds.height, layoutSize.width, Math.max(layoutSize.height - swatchBounds.height, 0));
					break;
				default:
					swatchBounds = new Rectangle(0, Math.max(layoutSize.height - swatchLayoutSize.height, 0), layoutSize.width, swatchLayoutSize.height);
					labelBounds = new Rectangle(0, 0, layoutSize.width, Math.max(layoutSize.height - swatchBounds.height, 0));
					break;
			}

			this._swatchSprite.layout(swatchBounds);
			this._labelSprite.layout(labelBounds);

			// draw hit area
			var graphics:Graphics = this.graphics;
			graphics.clear();
			graphics.beginFill(0x000000, 0);
			graphics.drawRect(0, 0, layoutSize.width, layoutSize.height);

			return layoutSize;
		}

	}

}

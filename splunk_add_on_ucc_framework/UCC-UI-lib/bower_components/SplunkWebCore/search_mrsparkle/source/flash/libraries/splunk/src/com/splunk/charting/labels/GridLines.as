package com.splunk.charting.labels
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.layout.Size;
	import com.splunk.charting.layout.Placement;
	import flash.display.Graphics;

	public class GridLines extends LayoutSprite
	{

		// Private Properties

		private var _axisLabels:ObservableProperty;
		private var _majorLineBrush:ObservableProperty;
		private var _minorLineBrush:ObservableProperty;
		private var _showMajorLines:ObservableProperty;
		private var _showMinorLines:ObservableProperty;

		// Constructor

		public function GridLines()
		{
			this._axisLabels = new ObservableProperty(this, "axisLabels", AbstractAxisLabels, null, this.invalidates(LayoutSprite.LAYOUT));
			this._majorLineBrush = new ObservableProperty(this, "majorLineBrush", IBrush, new SolidStrokeBrush(1, 0x000000, 1), this.invalidates(LayoutSprite.LAYOUT));
			this._minorLineBrush = new ObservableProperty(this, "minorLineBrush", IBrush, new SolidStrokeBrush(1, 0x000000, 1), this.invalidates(LayoutSprite.LAYOUT));
			this._showMajorLines = new ObservableProperty(this, "showMajorLines", Boolean, true, this.invalidates(LayoutSprite.LAYOUT));
			this._showMinorLines = new ObservableProperty(this, "showMinorLines", Boolean, false, this.invalidates(LayoutSprite.LAYOUT));

			this.mouseEnabled = false;
			this.snap = true;
		}

		// Public Getters/Setters

		public function get axisLabels() : AbstractAxisLabels
		{
			return this._axisLabels.value;
		}
		public function set axisLabels(value:AbstractAxisLabels) : void
		{
			this._axisLabels.value = value;
		}

		public function get majorLineBrush() : IBrush
		{
			return this._majorLineBrush.value;
		}
		public function set majorLineBrush(value:IBrush) : void
		{
			this._majorLineBrush.value = value;
		}

		public function get minorLineBrush() : IBrush
		{
			return this._minorLineBrush.value;
		}
		public function set minorLineBrush(value:IBrush) : void
		{
			this._minorLineBrush.value = value;
		}

		public function get showMajorLines() : Boolean
		{
			return this._showMajorLines.value;
		}
		public function set showMajorLines(value:Boolean) : void
		{
			this._showMajorLines.value = value;
		}

		public function get showMinorLines() : Boolean
		{
			return this._showMinorLines.value;
		}
		public function set showMinorLines(value:Boolean) : void
		{
			this._showMinorLines.value = value;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			return new Size();
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var axisLabels:AbstractAxisLabels = this._axisLabels.value;
			var majorLineBrush:IBrush = this._majorLineBrush.value;
			if (!majorLineBrush)
				majorLineBrush = new SolidStrokeBrush(1, 0x000000, 1);
			var minorLineBrush:IBrush = this._minorLineBrush.value;
			if (!minorLineBrush)
				minorLineBrush = new SolidStrokeBrush(1, 0x000000, 1);
			var showMinorLines:Boolean = this._showMinorLines.value;
			var showMajorLines:Boolean = this._showMajorLines.value;

			var graphics:Graphics = this.graphics;

			graphics.clear();

			if (axisLabels == null)
				return layoutSize;

			var majorPositions:Array = axisLabels.majorPositions;
			var minorPositions:Array = showMajorLines ? axisLabels.minorPositions : axisLabels.allPositions;
			var position:Number;

			var placement:String = axisLabels.placement;
			if ((placement == Placement.LEFT) || (placement == Placement.RIGHT))
			{
				if (showMinorLines)
				{
					for each (position in minorPositions)
					{
						position = Math.round(layoutSize.height * (1 - position));
						minorLineBrush.beginBrush(graphics);
						minorLineBrush.moveTo(0, position);
						minorLineBrush.lineTo(layoutSize.width, position);
						minorLineBrush.endBrush();
					}
				}
				if (showMajorLines)
				{
					for each (position in majorPositions)
					{
						position = Math.round(layoutSize.height * (1 - position));
						majorLineBrush.beginBrush(graphics);
						majorLineBrush.moveTo(0, position);
						majorLineBrush.lineTo(layoutSize.width, position);
						majorLineBrush.endBrush();
					}
				}
			}
			else
			{
				if (showMinorLines)
				{
					for each (position in minorPositions)
					{
						position = Math.round(layoutSize.width * position);
						minorLineBrush.beginBrush(graphics);
						minorLineBrush.moveTo(position, 0);
						minorLineBrush.lineTo(position, layoutSize.height);
						minorLineBrush.endBrush();
					}
				}
				if (showMajorLines)
				{
					for each (position in majorPositions)
					{
						position = Math.round(layoutSize.width * position);
						majorLineBrush.beginBrush(graphics);
						majorLineBrush.moveTo(position, 0);
						majorLineBrush.lineTo(position, layoutSize.height);
						majorLineBrush.endBrush();
					}
				}
			}

			return layoutSize;
		}

	}

}

package com.splunk.charting.labels
{

	import com.jasongatt.controls.OverflowMode;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.Alignment;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.splunk.charting.layout.IPlacement;
	import com.splunk.charting.layout.Placement;
	import com.splunk.controls.Label;

	public class AxisTitle extends Label implements IPlacement
	{

		// Private Properties

		private var _placement:ObservableProperty;
		private var _rotation:ObservableProperty;

		// Constructor

		public function AxisTitle()
		{
			this._placement = new ObservableProperty(this, "placement", String, Placement.BOTTOM, this.invalidates(LayoutSprite.MEASURE));
			this._rotation = new ObservableProperty(this, "rotation", Number, NaN, this.invalidates(LayoutSprite.MEASURE));

			this.overflowMode = OverflowMode.ELLIPSIS_MIDDLE;
			this.alignmentX = Alignment.CENTER;
			this.alignmentY = Alignment.CENTER;
		}

		// Public Getters/Setters

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
					break;
				default:
					value = Placement.BOTTOM;
					break;
			}
			this._placement.value = value;
		}

		public override function get rotation() : Number
		{
			return this._rotation.value;
		}
		public override function set rotation(value:Number) : void
		{
			this._rotation.value = value;
		}

		// Public Methods

		public override function measure(availableSize:Size = null) : void
		{
			var rotation:Number = this._rotation.value;
			if (rotation != rotation)
			{
				switch (this._placement.value)
				{
					case Placement.LEFT:
						rotation = -90;
						break;
					case Placement.RIGHT:
						rotation = 90;
						break;
					default:
						rotation = 0;
						break;
				}
			}

			super.rotation = rotation;

			super.measure(availableSize);
		}

	}

}

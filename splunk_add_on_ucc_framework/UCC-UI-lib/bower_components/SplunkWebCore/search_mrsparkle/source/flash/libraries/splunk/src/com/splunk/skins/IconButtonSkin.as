package com.splunk.skins
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.utils.NumberUtil;
	import flash.display.Graphics;

	public class IconButtonSkin extends ButtonSkin
	{

		// Private Properties

		private var _upIconBrush:ObservableProperty;
		private var _upIconShape:ObservableProperty;
		private var _overIconBrush:ObservableProperty;
		private var _overIconShape:ObservableProperty;
		private var _downIconBrush:ObservableProperty;
		private var _downIconShape:ObservableProperty;
		private var _disabledIconBrush:ObservableProperty;
		private var _disabledIconShape:ObservableProperty;
		private var _iconSize:ObservableProperty;

		// Constructor

		public function IconButtonSkin()
		{
			this._upIconBrush = new ObservableProperty(this, "upIconBrush", IBrush, new SolidFillBrush(0xFFFFFF));
			this._upIconShape = new ObservableProperty(this, "upIconShape", IShape, new RectangleShape());
			this._overIconBrush = new ObservableProperty(this, "overIconBrush", IBrush, null);
			this._overIconShape = new ObservableProperty(this, "overIconShape", IShape, null);
			this._downIconBrush = new ObservableProperty(this, "downIconBrush", IBrush, null);
			this._downIconShape = new ObservableProperty(this, "downIconShape", IShape, null);
			this._disabledIconBrush = new ObservableProperty(this, "disabledIconBrush", IBrush, null);
			this._disabledIconShape = new ObservableProperty(this, "disabledIconShape", IShape, null);
			this._iconSize = new ObservableProperty(this, "iconSize", Number, 0.5);
		}

		// Public Getters/Setters

		public function get upIconBrush() : IBrush
		{
			return this._upIconBrush.value;
		}
		public function set upIconBrush(value:IBrush) : void
		{
			this._upIconBrush.value = value;
		}

		public function get upIconShape() : IShape
		{
			return this._upIconShape.value;
		}
		public function set upIconShape(value:IShape) : void
		{
			this._upIconShape.value = value;
		}

		public function get overIconBrush() : IBrush
		{
			return this._overIconBrush.value;
		}
		public function set overIconBrush(value:IBrush) : void
		{
			this._overIconBrush.value = value;
		}

		public function get overIconShape() : IShape
		{
			return this._overIconShape.value;
		}
		public function set overIconShape(value:IShape) : void
		{
			this._overIconShape.value = value;
		}

		public function get downIconBrush() : IBrush
		{
			return this._downIconBrush.value;
		}
		public function set downIconBrush(value:IBrush) : void
		{
			this._downIconBrush.value = value;
		}

		public function get downIconShape() : IShape
		{
			return this._downIconShape.value;
		}
		public function set downIconShape(value:IShape) : void
		{
			this._downIconShape.value = value;
		}

		public function get disabledIconBrush() : IBrush
		{
			return this._disabledIconBrush.value;
		}
		public function set disabledIconBrush(value:IBrush) : void
		{
			this._disabledIconBrush.value = value;
		}

		public function get disabledIconShape() : IShape
		{
			return this._disabledIconShape.value;
		}
		public function set disabledIconShape(value:IShape) : void
		{
			this._disabledIconShape.value = value;
		}

		public function get iconSize() : Number
		{
			return this._iconSize.value;
		}
		public function set iconSize(value:Number) : void
		{
			this._iconSize.value = value;
		}

		// Public Methods

		public override function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, state:String = null) : void
		{
			super.draw(graphics, x, y, width, height, state);

			var iconBrush:IBrush;
			var iconShape:IShape;

			switch (state)
			{
				case "disabled":
					iconBrush = this._disabledIconBrush.value;
					if (!iconBrush)
						iconBrush = this._upIconBrush.value;

					iconShape = this._disabledIconShape.value;
					if (!iconShape)
						iconShape = this._upIconShape.value;

					break;
				case "down":
					iconBrush = this._downIconBrush.value;
					if (!iconBrush)
					{
						iconBrush = this._overIconBrush.value;
						if (!iconBrush)
							iconBrush = this._upIconBrush.value;
					}

					iconShape = this._downIconShape.value;
					if (!iconShape)
					{
						iconShape = this._overIconShape.value;
						if (!iconShape)
							iconShape = this._upIconShape.value;
					}

					break;
				case "over":
					iconBrush = this._overIconBrush.value;
					if (!iconBrush)
						iconBrush = this._upIconBrush.value;

					iconShape = this._overIconShape.value;
					if (!iconShape)
						iconShape = this._upIconShape.value;

					break;
				default:
					iconBrush = this._upIconBrush.value;
					iconShape = this._upIconShape.value;
					break;
			}

			if (!iconBrush || !iconShape)
				return;

			var iconSize:Number = NumberUtil.minMax(this._iconSize.value, 0, 1);
			iconSize = (width < height) ? width * iconSize : height * iconSize;

			var x1:Number = (width - iconSize) / 2;
			var y1:Number = (height - iconSize) / 2;
			var x2:Number = x1 + iconSize;
			var y2:Number = y1 + iconSize;

			iconShape.draw(graphics, x1, y1, x2 - x1, y2 - y1, iconBrush);
		}

	}

}

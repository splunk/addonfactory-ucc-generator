package com.splunk.skins
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.GradientFillBrush;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RoundedRectangleShape;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.utils.Style;
	import flash.display.GradientType;
	import flash.display.Graphics;
	import flash.geom.Matrix;

	public class ButtonSkin extends ObservableObject implements IGraphicSkin, IStyleSkin
	{

		// Private Properties

		private var _upBrush:ObservableProperty;
		private var _upShape:ObservableProperty;
		private var _upStyle:ObservableProperty;
		private var _overBrush:ObservableProperty;
		private var _overShape:ObservableProperty;
		private var _overStyle:ObservableProperty;
		private var _downBrush:ObservableProperty;
		private var _downShape:ObservableProperty;
		private var _downStyle:ObservableProperty;
		private var _disabledBrush:ObservableProperty;
		private var _disabledShape:ObservableProperty;
		private var _disabledStyle:ObservableProperty;
		private var _defaultWidth:ObservableProperty;
		private var _defaultHeight:ObservableProperty;

		// Constructor

		public function ButtonSkin()
		{
			var upBrush:GradientFillBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xABABAB, 0xA2A2A2, 0x969696, 0x8A8A8A ], [ 1, 1, 1, 1 ], [ 0, 127, 128, 255 ]);
			upBrush.tileTransform = new Matrix(0, 1, -1, 0);

			var overBrush:GradientFillBrush = new GradientFillBrush(GradientType.LINEAR, [ 0x969696, 0x8D8D8D, 0x808080, 0x747474 ], [ 1, 1, 1, 1 ], [ 0, 127, 128, 255 ]);
			overBrush.tileTransform = new Matrix(0, 1, -1, 0);

			var downBrush:GradientFillBrush = new GradientFillBrush(GradientType.LINEAR, [ 0x747474, 0x808080, 0x8D8D8D, 0x969696 ], [ 1, 1, 1, 1 ], [ 0, 127, 128, 255 ]);
			downBrush.tileTransform = new Matrix(0, 1, -1, 0);

			var disabledBrush:GradientFillBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xDDDDDD, 0xD4D4D4, 0xC8C8C8, 0xBCBCBC ], [ 1, 1, 1, 1 ], [ 0, 127, 128, 255 ]);
			disabledBrush.tileTransform = new Matrix(0, 1, -1, 0);

			this._upBrush = new ObservableProperty(this, "upBrush", IBrush, upBrush);
			this._upShape = new ObservableProperty(this, "upShape", IShape, new RoundedRectangleShape(5));
			this._upStyle = new ObservableProperty(this, "upStyle", Style, null);
			this._overBrush = new ObservableProperty(this, "overBrush", IBrush, overBrush);
			this._overShape = new ObservableProperty(this, "overShape", IShape, null);
			this._overStyle = new ObservableProperty(this, "overStyle", Style, null);
			this._downBrush = new ObservableProperty(this, "downBrush", IBrush, downBrush);
			this._downShape = new ObservableProperty(this, "downShape", IShape, null);
			this._downStyle = new ObservableProperty(this, "downStyle", Style, null);
			this._disabledBrush = new ObservableProperty(this, "disabledBrush", IBrush, disabledBrush);
			this._disabledShape = new ObservableProperty(this, "disabledShape", IShape, null);
			this._disabledStyle = new ObservableProperty(this, "disabledStyle", Style, null);
			this._defaultWidth = new ObservableProperty(this, "defaultWidth", Number, 100);
			this._defaultHeight = new ObservableProperty(this, "defaultHeight", Number, 20);
		}

		// Public Getters/Setters

		public function get upBrush() : IBrush
		{
			return this._upBrush.value;
		}
		public function set upBrush(value:IBrush) : void
		{
			this._upBrush.value = value;
		}

		public function get upShape() : IShape
		{
			return this._upShape.value;
		}
		public function set upShape(value:IShape) : void
		{
			this._upShape.value = value;
		}

		public function get upStyle() : Style
		{
			return this._upStyle.value;
		}
		public function set upStyle(value:Style) : void
		{
			this._upStyle.value = value;
		}

		public function get overBrush() : IBrush
		{
			return this._overBrush.value;
		}
		public function set overBrush(value:IBrush) : void
		{
			this._overBrush.value = value;
		}

		public function get overShape() : IShape
		{
			return this._overShape.value;
		}
		public function set overShape(value:IShape) : void
		{
			this._overShape.value = value;
		}

		public function get overStyle() : Style
		{
			return this._overStyle.value;
		}
		public function set overStyle(value:Style) : void
		{
			this._overStyle.value = value;
		}

		public function get downBrush() : IBrush
		{
			return this._downBrush.value;
		}
		public function set downBrush(value:IBrush) : void
		{
			this._downBrush.value = value;
		}

		public function get downShape() : IShape
		{
			return this._downShape.value;
		}
		public function set downShape(value:IShape) : void
		{
			this._downShape.value = value;
		}

		public function get downStyle() : Style
		{
			return this._downStyle.value;
		}
		public function set downStyle(value:Style) : void
		{
			this._downStyle.value = value;
		}

		public function get disabledBrush() : IBrush
		{
			return this._disabledBrush.value;
		}
		public function set disabledBrush(value:IBrush) : void
		{
			this._disabledBrush.value = value;
		}

		public function get disabledShape() : IShape
		{
			return this._disabledShape.value;
		}
		public function set disabledShape(value:IShape) : void
		{
			this._disabledShape.value = value;
		}

		public function get disabledStyle() : Style
		{
			return this._disabledStyle.value;
		}
		public function set disabledStyle(value:Style) : void
		{
			this._disabledStyle.value = value;
		}

		public function get defaultWidth() : Number
		{
			return this._defaultWidth.value;
		}
		public function set defaultWidth(value:Number) : void
		{
			this._defaultWidth.value = value;
		}

		public function get defaultHeight() : Number
		{
			return this._defaultHeight.value;
		}
		public function set defaultHeight(value:Number) : void
		{
			this._defaultHeight.value = value;
		}

		// Public Methods

		public function getChildSkin(name:String) : ISkin
		{
			return null;
		}

		public function getStyle(state:String = null) : Style
		{
			var upStyle:Style = this._upStyle.value;
			var overStyle:Style;
			var downStyle:Style;
			var disabledStyle:Style;

			switch (state)
			{
				case "disabled":
					disabledStyle = this._disabledStyle.value;
					break;
				case "down":
					downStyle = this._downStyle.value;
					overStyle = this._overStyle.value;
					break;
				case "over":
					overStyle = this._overStyle.value;
					break;
			}

			return Style.mergeStyles(upStyle, overStyle, downStyle, disabledStyle);
		}

		public function getPreferredSize(availableSize:Size) : Size
		{
			return new Size(NumberUtil.maxMin(this._defaultWidth.value, availableSize.width, 0), NumberUtil.maxMin(this._defaultHeight.value, availableSize.height, 0));
		}

		public function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, state:String = null) : void
		{
			var brush:IBrush;
			var shape:IShape;

			switch (state)
			{
				case "disabled":
					brush = this._disabledBrush.value;
					if (!brush)
						brush = this._upBrush.value;

					shape = this._disabledShape.value;
					if (!shape)
						shape = this._upShape.value;

					break;
				case "down":
					brush = this._downBrush.value;
					if (!brush)
					{
						brush = this._overBrush.value;
						if (!brush)
							brush = this._upBrush.value;
					}

					shape = this._downShape.value;
					if (!shape)
					{
						shape = this._overShape.value;
						if (!shape)
							shape = this._upShape.value;
					}

					break;
				case "over":
					brush = this._overBrush.value;
					if (!brush)
						brush = this._upBrush.value;

					shape = this._overShape.value;
					if (!shape)
						shape = this._upShape.value;

					break;
				default:
					brush = this._upBrush.value;
					shape = this._upShape.value;
					break;
			}

			if (!brush || !shape)
				return;

			shape.draw(graphics, x, y, width, height, brush);
		}

	}

}

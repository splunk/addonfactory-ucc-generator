package com.splunk.skins
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.GroupBrush;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.utils.Style;
	import flash.display.Graphics;

	public class ListSkin extends ObservableObject implements IBorderSkin, IStyleSkin
	{

		// Private Properties

		private var _brush:ObservableProperty;
		private var _shape:ObservableProperty;
		private var _style:ObservableProperty;
		private var _disabledBrush:ObservableProperty;
		private var _disabledShape:ObservableProperty;
		private var _disabledStyle:ObservableProperty;
		private var _border:ObservableProperty;
		private var _defaultWidth:ObservableProperty;
		private var _defaultHeight:ObservableProperty;
		private var _itemSkin:ObservableProperty;
		private var _scrollBarSkin:ObservableProperty;

		// Constructor

		public function ListSkin()
		{
			var brush:IBrush = new GroupBrush([ new SolidFillBrush(0xFFFFFF), new SolidStrokeBrush(1, 0xCCCCCC, 1, true) ]);

			var disabledBrush:IBrush = new GroupBrush([ new SolidFillBrush(0xEEEEEE), new SolidStrokeBrush(1, 0xCCCCCC, 1, true) ]);

			var itemSkin:LabelButtonSkin = new LabelButtonSkin();
			itemSkin.upLabelStyle = new Style();
			itemSkin.upLabelStyle.textColor = 0x000000;
			itemSkin.upBrush = null;
			itemSkin.upShape = new RectangleShape();
			itemSkin.upStyle = null;
			itemSkin.overLabelStyle = new Style();
			itemSkin.overLabelStyle.textColor = 0xFFFFFF;
			itemSkin.overBrush = new SolidFillBrush(0x969696);
			itemSkin.downBrush = new SolidFillBrush(0x747474);
			itemSkin.disabledBrush = null;

			this._brush = new ObservableProperty(this, "brush", IBrush, brush);
			this._shape = new ObservableProperty(this, "shape", IShape, new RectangleShape());
			this._style = new ObservableProperty(this, "style", Style, null);
			this._disabledBrush = new ObservableProperty(this, "disabledBrush", IBrush, disabledBrush);
			this._disabledShape = new ObservableProperty(this, "disabledShape", IShape, null);
			this._disabledStyle = new ObservableProperty(this, "disabledStyle", Style, null);
			this._border = new ObservableProperty(this, "border", Margin, new Margin(1, 0, 1, 0));
			this._defaultWidth = new ObservableProperty(this, "defaultWidth", Number, 100);
			this._defaultHeight = new ObservableProperty(this, "defaultHeight", Number, 20);
			this._itemSkin = new ObservableProperty(this, "itemSkin", ISkin, itemSkin);
			this._scrollBarSkin = new ObservableProperty(this, "scrollBarSkin", ISkin, new ScrollBarSkin());
		}

		// Public Getters/Setters

		public function get brush() : IBrush
		{
			return this._brush.value;
		}
		public function set brush(value:IBrush) : void
		{
			this._brush.value = value;
		}

		public function get shape() : IShape
		{
			return this._shape.value;
		}
		public function set shape(value:IShape) : void
		{
			this._shape.value = value;
		}

		public function get style() : Style
		{
			return this._style.value;
		}
		public function set style(value:Style) : void
		{
			this._style.value = value;
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

		public function get border() : Margin
		{
			return this._border.value.clone();
		}
		public function set border(value:Margin) : void
		{
			value = value ? value.clone() : new Margin();
			if (!value.equals(this._border.value))
				this._border.value = value;
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

		public function get itemSkin() : ISkin
		{
			return this._itemSkin.value;
		}
		public function set itemSkin(value:ISkin) : void
		{
			this._itemSkin.value = value;
		}

		public function get scrollBarSkin() : ISkin
		{
			return this._scrollBarSkin.value;
		}
		public function set scrollBarSkin(value:ISkin) : void
		{
			this._scrollBarSkin.value = value;
		}

		// Public Methods

		public function getChildSkin(name:String) : ISkin
		{
			switch (name)
			{
				case "item":
					return this._itemSkin.value;
				case "scrollBar":
					return this._scrollBarSkin.value;
				default:
					return null;
			}
		}

		public function getStyle(state:String = null) : Style
		{
			var style:Style = this._style.value;
			var disabledStyle:Style = (state == "disabled") ? this._disabledStyle.value : null;

			return Style.mergeStyles(style, disabledStyle);
		}

		public function getBorderMargin() : Margin
		{
			return this._border.value.clone();
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
						brush = this._brush.value;

					shape = this._disabledShape.value;
					if (!shape)
						shape = this._shape.value;

					break;
				default:
					brush = this._brush.value;
					shape = this._shape.value;
					break;
			}

			if (!brush || !shape)
				return;

			shape.draw(graphics, x, y, width, height, brush);
		}

	}

}

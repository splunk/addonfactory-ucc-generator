package com.splunk.skins
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.GroupBrush;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RoundedRectangleShape;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.utils.Style;
	import flash.display.Graphics;

	public class TextInputSkin extends ObservableObject implements IBorderSkin, IStyleSkin
	{

		// Private Properties

		private var _brush:ObservableProperty;
		private var _shape:ObservableProperty;
		private var _style:ObservableProperty;
		private var _textStyle:ObservableProperty;
		private var _disabledBrush:ObservableProperty;
		private var _disabledShape:ObservableProperty;
		private var _disabledStyle:ObservableProperty;
		private var _disabledTextStyle:ObservableProperty;
		private var _border:ObservableProperty;
		private var _defaultWidth:ObservableProperty;
		private var _defaultHeight:ObservableProperty;

		// Constructor

		public function TextInputSkin()
		{
			var brush:IBrush = new GroupBrush([ new SolidFillBrush(0xFFFFFF), new SolidStrokeBrush(1, 0xCCCCCC, 1, true) ]);

			var disabledBrush:IBrush = new GroupBrush([ new SolidFillBrush(0xEEEEEE), new SolidStrokeBrush(1, 0xCCCCCC, 1, true) ]);

			var disabledTextStyle:Style = new Style();
			disabledTextStyle.textColor = 0x999999;

			this._brush = new ObservableProperty(this, "brush", IBrush, brush);
			this._shape = new ObservableProperty(this, "shape", IShape, new RoundedRectangleShape(3));
			this._style = new ObservableProperty(this, "style", Style, null);
			this._textStyle = new ObservableProperty(this, "textStyle", Style, null);
			this._disabledBrush = new ObservableProperty(this, "disabledBrush", IBrush, disabledBrush);
			this._disabledShape = new ObservableProperty(this, "disabledShape", IShape, null);
			this._disabledStyle = new ObservableProperty(this, "disabledStyle", Style, null);
			this._disabledTextStyle = new ObservableProperty(this, "disabledTextStyle", Style, disabledTextStyle);
			this._border = new ObservableProperty(this, "border", Margin, new Margin(1, 0, 1, 0));
			this._defaultWidth = new ObservableProperty(this, "defaultWidth", Number, 100);
			this._defaultHeight = new ObservableProperty(this, "defaultHeight", Number, 20);
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

		public function get textStyle() : Style
		{
			return this._textStyle.value;
		}
		public function set textStyle(value:Style) : void
		{
			this._textStyle.value = value;
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

		public function get disabledTextStyle() : Style
		{
			return this._disabledTextStyle.value;
		}
		public function set disabledTextStyle(value:Style) : void
		{
			this._disabledTextStyle.value = value;
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

		// Public Methods

		public function getChildSkin(name:String) : ISkin
		{
			if (name == "text")
				return new TextSkin(this._textStyle.value, this._disabledTextStyle.value);
			return null;
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

import com.splunk.skins.ISkin;
import com.splunk.skins.IStyleSkin;
import com.splunk.utils.Style;

class TextSkin implements IStyleSkin
{

	// Private Properties

	private var _style:Style;
	private var _disabledStyle:Style;

	// Constructor

	public function TextSkin(style:Style, disabledStyle:Style)
	{
		this._style = style;
		this._disabledStyle = disabledStyle;
	}

	// Public Methods

	public function getChildSkin(name:String) : ISkin
	{
		return null;
	}

	public function getStyle(state:String = null) : Style
	{
		var style:Style = this._style;
		var disabledStyle:Style = (state == "disabled") ? this._disabledStyle : null;

		return Style.mergeStyles(style, disabledStyle);
	}

}

package com.splunk.skins
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.shapes.TriangleShape;
	import com.splunk.utils.Style;
	import flash.filters.DropShadowFilter;
	import flash.geom.Point;

	public class NumericStepperSkin extends ObservableObject implements IStyleSkin
	{

		// Private Properties

		private var _style:ObservableProperty;
		private var _disabledStyle:ObservableProperty;
		private var _arrowUpSkin:ObservableProperty;
		private var _arrowDownSkin:ObservableProperty;
		private var _promptSkin:ObservableProperty;

		// Constructor

		public function NumericStepperSkin()
		{
			var arrowUpSkin:IconButtonSkin = new IconButtonSkin();
			arrowUpSkin.upIconShape = new TriangleShape(new Point(0, 0.7), new Point(1, 0.7), new Point(0.5, 0.2));
			arrowUpSkin.upIconShape["snap"] = true;
			arrowUpSkin.upShape["cornerRadiusTL"] = 0;
			arrowUpSkin.upShape["cornerRadiusTR"] = 3;
			arrowUpSkin.upShape["cornerRadiusBR"] = 0;
			arrowUpSkin.upShape["cornerRadiusBL"] = 0;
			arrowUpSkin.iconSize = 0.65;
			arrowUpSkin.defaultWidth = 16;
			arrowUpSkin.defaultHeight = 8;

			var arrowDownSkin:IconButtonSkin = new IconButtonSkin();
			arrowDownSkin.upIconShape = new TriangleShape(new Point(0, 0.3), new Point(1, 0.3), new Point(0.5, 0.8));
			arrowDownSkin.upIconShape["snap"] = true;
			arrowDownSkin.upShape["cornerRadiusTL"] = 0;
			arrowDownSkin.upShape["cornerRadiusTR"] = 0;
			arrowDownSkin.upShape["cornerRadiusBR"] = 3;
			arrowDownSkin.upShape["cornerRadiusBL"] = 0;
			arrowDownSkin.iconSize = 0.65;
			arrowDownSkin.defaultWidth = 16;
			arrowDownSkin.defaultHeight = 8;

			this._style = new ObservableProperty(this, "style", Style, null);
			this._disabledStyle = new ObservableProperty(this, "disabledStyle", Style, null);
			this._arrowUpSkin = new ObservableProperty(this, "arrowUpSkin", ISkin, arrowUpSkin);
			this._arrowDownSkin = new ObservableProperty(this, "arrowDownSkin", ISkin, arrowDownSkin);
			this._promptSkin = new ObservableProperty(this, "promptSkin", ISkin, new TextInputSkin());
		}

		// Public Getters/Setters

		public function get style() : Style
		{
			return this._style.value;
		}
		public function set style(value:Style) : void
		{
			this._style.value = value;
		}

		public function get disabledStyle() : Style
		{
			return this._disabledStyle.value;
		}
		public function set disabledStyle(value:Style) : void
		{
			this._disabledStyle.value = value;
		}

		public function get arrowUpSkin() : ISkin
		{
			return this._arrowUpSkin.value;
		}
		public function set arrowUpSkin(value:ISkin) : void
		{
			this._arrowUpSkin.value = value;
		}

		public function get arrowDownSkin() : ISkin
		{
			return this._arrowDownSkin.value;
		}
		public function set arrowDownSkin(value:ISkin) : void
		{
			this._arrowDownSkin.value = value;
		}

		public function get promptSkin() : ISkin
		{
			return this._promptSkin.value;
		}
		public function set promptSkin(value:ISkin) : void
		{
			this._promptSkin.value = value;
		}

		// Public Methods

		public function getChildSkin(name:String) : ISkin
		{
			switch (name)
			{
				case "arrowUp":
					return this._arrowUpSkin.value;
				case "arrowDown":
					return this._arrowDownSkin.value;
				case "prompt":
					return this._promptSkin.value;
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

	}

}

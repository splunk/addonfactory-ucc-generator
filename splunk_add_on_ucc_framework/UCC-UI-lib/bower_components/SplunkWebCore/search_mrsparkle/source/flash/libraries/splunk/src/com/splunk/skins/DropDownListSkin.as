package com.splunk.skins
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.shapes.TriangleShape;
	import com.splunk.utils.Style;
	import flash.filters.DropShadowFilter;
	import flash.geom.Point;

	public class DropDownListSkin extends ObservableObject implements IStyleSkin
	{

		// Private Properties

		private var _style:ObservableProperty;
		private var _disabledStyle:ObservableProperty;
		private var _anchorSkin:ObservableProperty;
		private var _promptSkin:ObservableProperty;
		private var _listSkin:ObservableProperty;

		// Constructor

		public function DropDownListSkin()
		{
			var anchorSkin:IconButtonSkin = new IconButtonSkin();
			anchorSkin.upIconShape = new TriangleShape(new Point(0, 0.3), new Point(1, 0.3), new Point(0.5, 0.8));
			anchorSkin.upIconShape["snap"] = true;
			anchorSkin.upShape["cornerRadiusTL"] = 0;
			anchorSkin.upShape["cornerRadiusTR"] = 3;
			anchorSkin.upShape["cornerRadiusBR"] = 3;
			anchorSkin.upShape["cornerRadiusBL"] = 0;
			anchorSkin.defaultWidth = anchorSkin.defaultHeight = 16;

			var listSkin:ListSkin = new ListSkin();
			listSkin.style = new Style();
			listSkin.style.filters = [ new DropShadowFilter(2, 45, 0x000000, 0.3, 4, 4, 1, 3) ];

			this._style = new ObservableProperty(this, "style", Style, null);
			this._disabledStyle = new ObservableProperty(this, "disabledStyle", Style, null);
			this._anchorSkin = new ObservableProperty(this, "anchorSkin", ISkin, anchorSkin);
			this._promptSkin = new ObservableProperty(this, "promptSkin", ISkin, new TextInputSkin());
			this._listSkin = new ObservableProperty(this, "listSkin", ISkin, listSkin);
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

		public function get anchorSkin() : ISkin
		{
			return this._anchorSkin.value;
		}
		public function set anchorSkin(value:ISkin) : void
		{
			this._anchorSkin.value = value;
		}

		public function get promptSkin() : ISkin
		{
			return this._promptSkin.value;
		}
		public function set promptSkin(value:ISkin) : void
		{
			this._promptSkin.value = value;
		}

		public function get listSkin() : ISkin
		{
			return this._listSkin.value;
		}
		public function set listSkin(value:ISkin) : void
		{
			this._listSkin.value = value;
		}

		// Public Methods

		public function getChildSkin(name:String) : ISkin
		{
			switch (name)
			{
				case "anchor":
					return this._anchorSkin.value;
				case "prompt":
					return this._promptSkin.value;
				case "list":
					return this._listSkin.value;
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

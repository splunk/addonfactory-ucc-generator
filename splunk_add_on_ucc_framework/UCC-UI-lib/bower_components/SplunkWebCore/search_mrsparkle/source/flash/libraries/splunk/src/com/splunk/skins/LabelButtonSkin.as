package com.splunk.skins
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.Margin;
	import com.splunk.utils.Style;

	public class LabelButtonSkin extends ButtonSkin
	{

		// Private Properties

		private var _upLabelStyle:ObservableProperty;
		private var _overLabelStyle:ObservableProperty;
		private var _downLabelStyle:ObservableProperty;
		private var _disabledLabelStyle:ObservableProperty;

		// Constructor

		public function LabelButtonSkin()
		{
			var upLabelStyle:Style = new Style();
			upLabelStyle.textColor = 0xFFFFFF;

			this._upLabelStyle = new ObservableProperty(this, "upLabelStyle", Style, upLabelStyle);
			this._overLabelStyle = new ObservableProperty(this, "overLabelStyle", Style, null);
			this._downLabelStyle = new ObservableProperty(this, "downLabelStyle", Style, null);
			this._disabledLabelStyle = new ObservableProperty(this, "disabledLabelStyle", Style, null);

			this.upStyle = new Style();
			this.upStyle.padding = new Margin(4, 4, 2, 2);
		}

		// Public Getters/Setters

		public function get upLabelStyle() : Style
		{
			return this._upLabelStyle.value;
		}
		public function set upLabelStyle(value:Style) : void
		{
			this._upLabelStyle.value = value;
		}

		public function get overLabelStyle() : Style
		{
			return this._overLabelStyle.value;
		}
		public function set overLabelStyle(value:Style) : void
		{
			this._overLabelStyle.value = value;
		}

		public function get downLabelStyle() : Style
		{
			return this._downLabelStyle.value;
		}
		public function set downLabelStyle(value:Style) : void
		{
			this._downLabelStyle.value = value;
		}

		public function get disabledLabelStyle() : Style
		{
			return this._disabledLabelStyle.value;
		}
		public function set disabledLabelStyle(value:Style) : void
		{
			this._disabledLabelStyle.value = value;
		}

		// Public Methods

		public override function getChildSkin(name:String) : ISkin
		{
			if (name == "label")
				return new LabelSkin(this._upLabelStyle.value, this._overLabelStyle.value, this._downLabelStyle.value, this._disabledLabelStyle.value);
			return null;
		}

	}

}

import com.splunk.skins.ISkin;
import com.splunk.skins.IStyleSkin;
import com.splunk.utils.Style;

class LabelSkin implements IStyleSkin
{

	// Private Properties

	private var _upStyle:Style;
	private var _overStyle:Style;
	private var _downStyle:Style;
	private var _disabledStyle:Style;

	// Constructor

	public function LabelSkin(upStyle:Style, overStyle:Style, downStyle:Style, disabledStyle:Style)
	{
		this._upStyle = upStyle;
		this._overStyle = overStyle;
		this._downStyle = downStyle;
		this._disabledStyle = disabledStyle;
	}

	// Public Methods

	public function getChildSkin(name:String) : ISkin
	{
		return null;
	}

	public function getStyle(state:String = null) : Style
	{
		var upStyle:Style = this._upStyle;
		var overStyle:Style;
		var downStyle:Style;
		var disabledStyle:Style;

		switch (state)
		{
			case "disabled":
				disabledStyle = this._disabledStyle;
				break;
			case "down":
				downStyle = this._downStyle;
				overStyle = this._overStyle;
				break;
			case "over":
				overStyle = this._overStyle;
				break;
		}

		return Style.mergeStyles(upStyle, overStyle, downStyle, disabledStyle);
	}

}

package com.splunk.controls
{

	import com.splunk.skins.ISkin;
	import com.splunk.skins.IStyleSkin;
	import com.splunk.skins.LabelButtonSkin;
	import com.splunk.utils.Style;

	public class LabelButton extends Button
	{

		// Private Properties

		private var _label:Label;

		private var _cachedLabelSkin:ISkin;

		// Constructor

		public function LabelButton()
		{
			this._label = new Label();

			this.skin = new LabelButtonSkin();

			this.addChild(this._label);
		}

		// Public Getters/Setters

		public function get label() : Label
		{
			return this._label;
		}

		// Protected Methods

		protected override function updateSkinOverride(skin:ISkin) : void
		{
			this._cachedLabelSkin = skin ? skin.getChildSkin("label") : null;

			super.updateSkinOverride(skin);
		}

		protected override function updateStateOverride(state:String) : void
		{
			var labelStyle:Style;
			var labelStyleSkin:IStyleSkin = this._cachedLabelSkin as IStyleSkin;
			if (labelStyleSkin)
				labelStyle = labelStyleSkin.getStyle(state);
			Style.applyStyle(this._label, labelStyle);

			super.updateStateOverride(state);
		}

	}

}

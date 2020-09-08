package com.splunk.controls
{

	import com.splunk.skins.ISkin;
	import com.jasongatt.core.DisableEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.utils.DisplayListDepthSort;

	public /*abstract*/ class AbstractControl extends LayoutSprite
	{

		// Public Static Constants

		public static const UPDATE_SKIN:ValidatePass = new ValidatePass(AbstractControl, "updateSkin", 0.1, new DisplayListDepthSort());
		public static const UPDATE_STATE:ValidatePass = new ValidatePass(AbstractControl, "updateState", 0.2, new DisplayListDepthSort());

		// Private Properties

		private var _skin:ObservableProperty;
		private var _state:ObservableProperty;

		// Constructor

		public function AbstractControl()
		{
			this._skin = new ObservableProperty(this, "skin", ISkin, null, this.invalidates(AbstractControl.UPDATE_SKIN));
			this._state = new ObservableProperty(this, "state", String, null, this.invalidates(AbstractControl.UPDATE_STATE));

			this.snap = true;

			this.addEventListener(DisableEvent.DISABLED, this._self_disabled, false, int.MAX_VALUE);
			this.addEventListener(DisableEvent.ENABLED, this._self_enabled, false, int.MAX_VALUE);

			this.invalidate(AbstractControl.UPDATE_SKIN);
		}

		// Public Getters/Setters

		public function get skin() : ISkin
		{
			return this._skin.value;
		}
		public function set skin(value:ISkin) : void
		{
			this._skin.value = value;
		}

		public function get state() : String
		{
			return this._state.value;
		}
		public function set state(value:String) : void
		{
			this._state.value = value;
		}

		// Public Methods

		public function updateSkin() : void
		{
			this.validatePreceding(AbstractControl.UPDATE_SKIN);

			if (this.isValid(AbstractControl.UPDATE_SKIN))
				return;

			this.invalidate(AbstractControl.UPDATE_STATE);
			this.invalidate(LayoutSprite.MEASURE);

			this.updateSkinOverride(this._skin.value);

			this.setValid(AbstractControl.UPDATE_SKIN);
		}

		public function updateState() : void
		{
			this.validatePreceding(AbstractControl.UPDATE_STATE);

			if (this.isValid(AbstractControl.UPDATE_STATE))
				return;

			this.updateStateOverride(this._state.value);

			this.setValid(AbstractControl.UPDATE_STATE);
		}

		// Protected Methods

		protected function updateSkinOverride(skin:ISkin) : void
		{
		}

		protected function updateStateOverride(state:String) : void
		{
		}

		protected function onDisabled() : void
		{
			this.state = "disabled";
		}

		protected function onEnabled() : void
		{
			this.state = null;
		}

		// Private Methods

		private function _self_disabled(e:DisableEvent) : void
		{
			this.onDisabled();
		}

		private function _self_enabled(e:DisableEvent) : void
		{
			this.onEnabled();
		}

	}

}

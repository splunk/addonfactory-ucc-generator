package com.splunk.controls
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.MarginUtil;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.skins.IBorderSkin;
	import com.splunk.skins.ISkin;
	import com.splunk.skins.IStyleSkin;
	import com.splunk.skins.NumericStepperSkin;
	import com.splunk.utils.Style;
	import flash.display.DisplayObject;
	import flash.events.Event;
	import flash.geom.Rectangle;

	[Event(name="valueChanged", type="flash.events.Event")]

	public class NumericStepper extends AbstractControl
	{

		// Public Static Constants

		public static const VALUE_CHANGED:String = "valueChanged";

		// Private Properties

		private var _value:ObservableProperty;
		private var _minimumValue:ObservableProperty;
		private var _maximumValue:ObservableProperty;

		private var _prompt:TextInput;
		private var _arrowButtonUp:Button;
		private var _arrowButtonDown:Button;

		private var _cachedSkin:ISkin;
		private var _cachedPromptSkin:ISkin;
		private var _cachedBorder:Margin;

		// Constructor

		public function NumericStepper()
		{
			this._value = new ObservableProperty(this, "value", Number, 0, this._value_changed);
			this._minimumValue = new ObservableProperty(this, "minimumValue", Number, -Infinity);
			this._maximumValue = new ObservableProperty(this, "maximumValue", Number, Infinity);

			this._prompt = new TextInput();
			this._prompt.restrict = "0-9\\.\\-";
			this._prompt.addEventListener(TextInput.VALUE_CHANGED, this._prompt_valueChanged);

			this._arrowButtonUp = new Button();
			this._arrowButtonUp.autoRepeat = true;
			this._arrowButtonUp.addEventListener(AbstractButton.BUTTON_DOWN, this._arrowButtonUp_buttonDown);

			this._arrowButtonDown = new Button();
			this._arrowButtonDown.autoRepeat = true;
			this._arrowButtonDown.addEventListener(AbstractButton.BUTTON_DOWN, this._arrowButtonDown_buttonDown);

			this.skin = new NumericStepperSkin();

			this.addChild(this._prompt);
			this.addChild(this._arrowButtonUp);
			this.addChild(this._arrowButtonDown);
		}

		// Public Getters/Setters

		public function get value() : Number
		{
			return this._value.value;
		}
		public function set value(value:Number) : void
		{
			this._updateValue(value);
		}

		public function get minimumValue() : Number
		{
			return this._minimumValue.value;
		}
		public function set minimumValue(value:Number) : void
		{
			this._minimumValue.value = (value == value) ? value : -Infinity;
			this._updateValue();
		}

		public function get maximumValue() : Number
		{
			return this._maximumValue.value;
		}
		public function set maximumValue(value:Number) : void
		{
			this._maximumValue.value = (value == value) ? value : Infinity;
			this._updateValue();
		}

		// Protected Methods

		protected override function updateSkinOverride(skin:ISkin) : void
		{
			var promptSkin:ISkin;
			var arrowUpSkin:ISkin;
			var arrowDownSkin:ISkin;

			if (skin)
			{
				promptSkin = skin.getChildSkin("prompt");
				arrowUpSkin = skin.getChildSkin("arrowUp");
				arrowDownSkin = skin.getChildSkin("arrowDown");
			}

			this._prompt.skin = promptSkin;
			this._prompt.updateSkin();

			this._arrowButtonUp.skin = arrowUpSkin;
			this._arrowButtonUp.updateSkin();

			this._arrowButtonDown.skin = arrowDownSkin;
			this._arrowButtonDown.updateSkin();

			this._cachedSkin = skin;
			this._cachedPromptSkin = promptSkin;
		}

		protected override function updateStateOverride(state:String) : void
		{
			var style:Style;
			var styleSkin:IStyleSkin = this._cachedSkin as IStyleSkin;
			if (styleSkin)
				style = styleSkin.getStyle(state);
			Style.applyStyle(this, style);
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var availableWidth:Number = Math.floor(availableSize.width);
			var availableHeight:Number = Math.floor(availableSize.height);

			var measuredSize:Size = new Size();

			var promptBorderSkin:IBorderSkin = this._cachedPromptSkin as IBorderSkin;
			var border:Margin = promptBorderSkin ? MarginUtil.round(promptBorderSkin.getBorderMargin()) : new Margin();
			var borderX:Number = border.left + border.right;
			var borderY:Number = border.top + border.bottom;

			var availableWidth2:Number = Math.max(availableWidth - borderX, 0);
			var availableHeight2:Number = Math.max(availableHeight - borderY, 0);

			this._arrowButtonUp.measure(new Size(availableWidth2, Math.ceil(availableHeight2 / 2)));
			this._arrowButtonDown.measure(new Size(availableWidth2, Math.floor(availableHeight2 / 2)));
			this._prompt.measure(new Size(Math.round(Math.max(availableWidth - Math.max(this._arrowButtonUp.measuredWidth, this._arrowButtonDown.measuredWidth), 0)), availableHeight));

			measuredSize.width = Math.round(this._prompt.measuredWidth + Math.max(this._arrowButtonUp.measuredWidth, this._arrowButtonDown.measuredWidth));
			measuredSize.height = Math.round(Math.max(this._prompt.measuredHeight, this._arrowButtonUp.measuredHeight + this._arrowButtonDown.measuredHeight + borderY));

			this._cachedBorder = border;

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var layoutWidth:Number = Math.round(layoutSize.width);
			var layoutHeight:Number = Math.round(layoutSize.height);

			var border:Margin = this._cachedBorder;
			var layoutHeight2:Number = Math.max(layoutHeight - border.top - border.bottom, 0);

			var buttonWidth:Number = Math.round(Math.max(this._arrowButtonUp.measuredWidth, this._arrowButtonDown.measuredWidth));
			var buttonX:Number = Math.max(layoutWidth - border.right - buttonWidth, border.left);

			this._prompt.layout(new Rectangle(0, 0, layoutWidth, layoutHeight));
			this._arrowButtonUp.layout(new Rectangle(buttonX, border.top, buttonWidth, Math.ceil(layoutHeight2 / 2)));
			this._arrowButtonDown.layout(new Rectangle(buttonX, border.top + Math.ceil(layoutHeight2 / 2), buttonWidth, Math.floor(layoutHeight2 / 2)));

			return layoutSize;
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			switch (pass)
			{
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

		// Private Methods

		private function _updateValue(value:Number = NaN) : void
		{
			if (value != value)
				value = this._value.value;

			var maximumValue:Number = this._maximumValue.value;
			var minimumValue:Number = this._minimumValue.value;

			value = NumberUtil.maxMin(value, maximumValue, minimumValue);

			if (value == maximumValue)
				this._arrowButtonUp.disable(this._maximumValue);
			else
				this._arrowButtonUp.enable(this._maximumValue);

			if (value == minimumValue)
				this._arrowButtonDown.disable(this._minimumValue);
			else
				this._arrowButtonDown.enable(this._minimumValue);

			this._prompt.removeEventListener(TextInput.VALUE_CHANGED, this._prompt_valueChanged);
			this._prompt.value = String(value);
			this._prompt.addEventListener(TextInput.VALUE_CHANGED, this._prompt_valueChanged);

			this._value.value = value;
		}

		private function _value_changed(e:ChangedEvent) : void
		{
			this.dispatchEvent(new Event(NumericStepper.VALUE_CHANGED));
		}

		private function _prompt_valueChanged(e:Event) : void
		{
			this._updateValue(NumberUtil.parseNumber(this._prompt.value));
		}

		private function _arrowButtonUp_buttonDown(e:Event) : void
		{
			this.value++;
		}

		private function _arrowButtonDown_buttonDown(e:Event) : void
		{
			this.value--;
		}

	}

}

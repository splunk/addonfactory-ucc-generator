package com.splunk.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.splunk.utils.Style;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;
	import flash.text.TextFormat;

	public class ValueTip extends LayoutSprite
	{

		// Private Properties

		private var _value:ObservableProperty;
		private var _valueStyle:ObservableProperty;

		private var _valueField:Label;

		// Constructor

		public function ValueTip()
		{
			this._value = new ObservableProperty(this, "value", Object, null, this.invalidates(LayoutSprite.MEASURE));
			this._valueStyle = new ObservableProperty(this, "valueStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));

			this._valueField = new Label();
			this._valueField.defaultTextFormat = new TextFormat("_sans", 12, 0xFFFFFF);
			this._valueField.wordWrap = true;

			this.mouseEnabled = false;
			this.mouseChildren = false;

			this.addChild(this._valueField);
		}

		// Public Getters/Setters

		public function get value() : *
		{
			return this._value.value;
		}
		public function set value(value:*) : void
		{
			this._value.value = value;
		}

		public function get valueStyle() : Style
		{
			return this._valueStyle.value;
		}
		public function set valueStyle(value:Style) : void
		{
			this._valueStyle.value = value;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var value:* = this._value.value;
			var valueStyle:Style = this._valueStyle.value;

			this._valueField.text = (value != null) ? String(value) : "(null)";
			Style.applyStyle(this._valueField, valueStyle);
			this._valueField.measure(availableSize);

			return new Size(this._valueField.measuredWidth, this._valueField.measuredHeight);
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			this._valueField.layout(new Rectangle(0, 0, layoutSize.width, layoutSize.height));
			return layoutSize;
		}

		protected override function onChildAdded(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildRemoved(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildOrderChanged() : void
		{
			this.invalidate(LayoutSprite.LAYOUT);
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

	}

}

package com.splunk.particles.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.LayoutSprite;
	import com.splunk.palettes.color.IColorPalette;
	import com.splunk.particles.IParticle;
	import com.splunk.utils.Style;

	public class LabelElementRenderer extends AbstractElementRenderer
	{

		// Private Properties

		private var _labelColorPalette:ObservableProperty;
		private var _labelStyle:ObservableProperty;
		private var _defaultLabelColor:ObservableProperty;

		// Constructor

		public function LabelElementRenderer()
		{
			this._labelColorPalette = new ObservableProperty(this, "labelColorPalette", IColorPalette, null, this.invalidates(AbstractElementRenderer.UPDATE_ELEMENTS));
			this._labelStyle = new ObservableProperty(this, "labelStyle", Style, null, this.invalidates(AbstractElementRenderer.UPDATE_ELEMENTS));
			this._defaultLabelColor = new ObservableProperty(this, "defaultLabelColor", uint, 0x000000, this.invalidates(AbstractElementRenderer.UPDATE_ELEMENTS));
		}

		// Public Getters/Setters

		public function get labelColorPalette() : IColorPalette
		{
			return this._labelColorPalette.value;
		}
		public function set labelColorPalette(value:IColorPalette) : void
		{
			this._labelColorPalette.value = value;
		}

		public function get labelStyle() : Style
		{
			return this._labelStyle.value;
		}
		public function set labelStyle(value:Style) : void
		{
			this._labelStyle.value = value;
		}

		public function get defaultLabelColor() : uint
		{
			return this._defaultLabelColor.value;
		}
		public function set defaultLabelColor(value:uint) : void
		{
			this._defaultLabelColor.value = value;
		}

		// Protected Methods

		protected override function updateElementsOverride(elements:Array) : void
		{
			var labelColorPalette:IColorPalette = this._labelColorPalette.value;
			var labelStyle:Style = this._labelStyle.value;
			var defaultLabelColor:uint = this._defaultLabelColor.value;
			for each (var labelElement:LabelElement in elements)
			{
				labelElement.text = labelElement.fieldValueString;
				labelElement.textColor = labelColorPalette ? labelColorPalette.getColor(labelElement.fieldValueString, 0, 1) : defaultLabelColor;
				Style.applyStyle(labelElement, labelStyle);
			}
		}

		protected override function createElementOverride(fieldValue:*) : LayoutSprite
		{
			var fieldValueString:String = String(fieldValue);

			var labelColorPalette:IColorPalette = this._labelColorPalette.value;
			var labelStyle:Style = this._labelStyle.value;
			var defaultLabelColor:uint = this._defaultLabelColor.value;

			var labelElement:LabelElement = new LabelElement(fieldValueString);

			labelElement.text = fieldValueString;
			labelElement.textColor = labelColorPalette ? labelColorPalette.getColor(fieldValueString, 0, 1) : defaultLabelColor;
			Style.applyStyle(labelElement, labelStyle);

			return labelElement;
		}

	}

}

import com.splunk.controls.Label;

class LabelElement extends Label
{

	// Public Properties

	public var fieldValueString:String;

	// Constructor

	public function LabelElement(fieldValueString:String)
	{
		this.fieldValueString = fieldValueString;
	}

}

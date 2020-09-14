package com.splunk.palettes.color
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import flash.events.EventDispatcher;

	public class BrightnessColorPalette extends ObservableObject implements IColorPalette
	{

		// Private Properties

		private var _colorPalette:ObservableProperty;
		private var _brightness:ObservableProperty;

		private var _cachedColorPalette:IColorPalette;
		private var _cachedBrightness:Number;

		// Constructor

		public function BrightnessColorPalette(colorPalette:IColorPalette = null, brightness:Number = 0)
		{
			this._colorPalette = new ObservableProperty(this, "colorPalette", IColorPalette, colorPalette);
			this._brightness = new ObservableProperty(this, "brightness", Number, brightness);

			this._cachedColorPalette = colorPalette;
			this._cachedBrightness = brightness;
		}

		// Public Getters/Setters

		public function get colorPalette() : IColorPalette
		{
			return this._colorPalette.value;
		}
		public function set colorPalette(value:IColorPalette) : void
		{
			this._colorPalette.value = this._cachedColorPalette = value;
		}

		public function get brightness() : Number
		{
			return this._brightness.value;
		}
		public function set brightness(value:Number) : void
		{
			this._brightness.value = this._cachedBrightness = value;
		}

		// Public Methods

		public function getColor(field:String, index:int, count:int) : uint
		{
			var colorPalette:IColorPalette = this._cachedColorPalette;
			if (!colorPalette)
				return 0x000000;

			var color:uint = colorPalette.getColor(field, index, count);
			var r:uint = (color >> 16) & 0xFF;
			var g:uint = (color >> 8) & 0xFF;
			var b:uint = color & 0xFF;
			var c:uint;

			var brightness:Number = this._cachedBrightness;
			if (brightness < 0)
			{
				brightness = -brightness;
				c = 0x00;
			}
			else
			{
				c = 0xFF;
			}

			if (brightness > 1)
				brightness = 1;

			r += Math.round((c - r) * brightness);
			g += Math.round((c - g) * brightness);
			b += Math.round((c - b) * brightness);

			return ((r << 16) | (g << 8) | b);
		}

	}

}

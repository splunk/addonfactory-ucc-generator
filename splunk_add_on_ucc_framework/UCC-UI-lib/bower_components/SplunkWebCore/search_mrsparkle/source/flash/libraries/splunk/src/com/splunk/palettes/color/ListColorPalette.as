package com.splunk.palettes.color
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import flash.events.EventDispatcher;

	public class ListColorPalette extends ObservableObject implements IColorPalette
	{

		// Private Properties

		private var _colors:ObservableProperty;
		private var _interpolate:ObservableProperty;

		private var _cachedColors:Array;
		private var _cachedInterpolate:Boolean;

		// Constructor

		public function ListColorPalette(colors:Array = null, interpolate:Boolean = false)
		{
			colors = colors ? colors.concat() : new Array();

			this._colors = new ObservableProperty(this, "colors", Array, colors);
			this._interpolate = new ObservableProperty(this, "interpolate", Boolean, interpolate);

			this._cachedColors = colors;
			this._cachedInterpolate = interpolate;
		}

		// Public Getters/Setters

		public function get colors() : Array
		{
			return this._colors.value.concat();
		}
		public function set colors(value:Array) : void
		{
			this._colors.value = this._cachedColors = value ? value.concat() : new Array();
		}

		public function get interpolate() : Boolean
		{
			return this._interpolate.value;
		}
		public function set interpolate(value:Boolean) : void
		{
			this._interpolate.value = this._cachedInterpolate = value;
		}

		// Public Methods

		public function getColor(field:String, index:int, count:int) : uint
		{
			var colors:Array = this._cachedColors;
			var numColors:int = colors.length;

			if (numColors == 0)
				return 0x000000;

			if (index < 0)
				index = 0;

			if (this._cachedInterpolate)
			{
				if (count < 1)
					count = 1;
				if (index > count)
					index = count;

				var p:Number = (count == 1) ? 0 : (numColors - 1) * (index / (count - 1));
				var index1:int = Math.floor(p);
				var index2:int = Math.min(index1 + 1, numColors - 1);
				p -= index1;

				return this._interpolateColors(colors[index1], colors[index2], p);
			}

			return colors[index % numColors];
		}

		// Private Methods

		private function _interpolateColors(color1:uint, color2:uint, p:Number) : uint
		{
			var r1:uint = (color1 >> 16) & 0xFF;
			var g1:uint = (color1 >> 8) & 0xFF;
			var b1:uint = color1 & 0xFF;

			var r2:uint = (color2 >> 16) & 0xFF;
			var g2:uint = (color2 >> 8) & 0xFF;
			var b2:uint = color2 & 0xFF;

			var r:uint = r1 + Math.round((r2 - r1) * p);
			var g:uint = g1 + Math.round((g2 - g1) * p);
			var b:uint = b1 + Math.round((b2 - b1) * p);

			return ((r << 16) | (g << 8) | b);
		}

	}

}

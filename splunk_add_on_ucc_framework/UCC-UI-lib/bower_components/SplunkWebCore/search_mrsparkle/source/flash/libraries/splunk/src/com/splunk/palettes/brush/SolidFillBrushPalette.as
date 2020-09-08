package com.splunk.palettes.brush
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.splunk.palettes.color.IColorPalette;
	import flash.events.EventDispatcher;

	public class SolidFillBrushPalette extends ObservableObject implements IBrushPalette
	{

		// Private Properties

		private var _colorPalette:ObservableProperty;
		private var _alpha:ObservableProperty;

		private var _cachedColorPalette:IColorPalette;
		private var _cachedAlpha:Number;

		// Constructor

		public function SolidFillBrushPalette(colorPalette:IColorPalette = null, alpha:Number = 1)
		{
			this._colorPalette = new ObservableProperty(this, "colorPalette", IColorPalette, colorPalette);
			this._alpha = new ObservableProperty(this, "alpha", Number, alpha);

			this._cachedColorPalette = colorPalette;
			this._cachedAlpha = alpha;
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

		public function get alpha() : Number
		{
			return this._alpha.value;
		}
		public function set alpha(value:Number) : void
		{
			this._alpha.value = this._cachedAlpha = value;
		}

		// Public Methods

		public function getBrush(field:String, index:int, count:int) : IBrush
		{
			var colorPalette:IColorPalette = this._cachedColorPalette;
			var color:uint = colorPalette ? colorPalette.getColor(field, index, count) : 0x000000;
			return new SolidFillBrush(color, this._cachedAlpha);
		}

	}

}

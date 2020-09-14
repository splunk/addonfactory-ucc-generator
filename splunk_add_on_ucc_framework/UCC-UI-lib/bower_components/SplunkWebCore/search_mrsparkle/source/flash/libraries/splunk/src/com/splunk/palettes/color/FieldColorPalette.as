package com.splunk.palettes.color
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import flash.events.Event;
	import flash.events.EventDispatcher;

	public class FieldColorPalette extends ObservableObject implements IColorPalette
	{

		// Private Properties

		private var _fieldColors:ObservableProperty;
		private var _defaultColorPalette:ObservableProperty;

		private var _cachedFieldColorMap:Object;
		private var _cachedDefaultColorPalette:IColorPalette;

		// Constructor

		public function FieldColorPalette(fieldColors:Object = null, defaultColorPalette:IColorPalette = null)
		{
			fieldColors = this._cloneFieldColors(fieldColors);

			this._fieldColors = new ObservableProperty(this, "fieldColors", Object, fieldColors, this._updateFieldColorMap);
			this._defaultColorPalette = new ObservableProperty(this, "defaultColorPalette", IColorPalette, defaultColorPalette);

			this._cachedDefaultColorPalette = defaultColorPalette;

			this._updateFieldColorMap();
		}

		// Public Getters/Setters

		public function get fieldColors() : Object
		{
			return this._cloneFieldColors(this._fieldColors.value);
		}
		public function set fieldColors(value:Object) : void
		{
			this._fieldColors.value = this._cloneFieldColors(value);
		}

		public function get defaultColorPalette() : IColorPalette
		{
			return this._defaultColorPalette.value;
		}
		public function set defaultColorPalette(value:IColorPalette) : void
		{
			this._defaultColorPalette.value = this._cachedDefaultColorPalette = value;
		}

		// Public Methods

		public function getColor(field:String, index:int, count:int) : uint
		{
			if (field)
			{
				var color:* = this._cachedFieldColorMap[field];
				if (color != null)
					return uint(color);
			}

			var defaultColorPalette:IColorPalette = this._cachedDefaultColorPalette;
			if (defaultColorPalette)
				return defaultColorPalette.getColor(field, index, count);

			return 0x000000;
		}

		// Private Methods

		private function _cloneFieldColors(fieldColors:Object) : Object
		{
			var fieldColors2:Object = new Object();

			for (var field:String in fieldColors)
				fieldColors2[field] = uint(fieldColors[field]);

			return fieldColors2;
		}

		private function _updateFieldColorMap(e:Event = null) : void
		{
			this._cachedFieldColorMap = this._fieldColors.value;
		}

	}

}

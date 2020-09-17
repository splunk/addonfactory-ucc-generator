package com.splunk.palettes.brush
{

	import com.jasongatt.core.ObservableArrayProperty;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.events.EventDispatcher;

	public class ListBrushPalette extends ObservableObject implements IBrushPalette
	{

		// Private Properties

		private var _brushes:ObservableArrayProperty;

		private var _cachedBrushes:Array;

		// Constructor

		public function ListBrushPalette(brushes:Array = null)
		{
			brushes = brushes ? brushes.concat() : new Array();

			this._brushes = new ObservableArrayProperty(this, "brushes", brushes);

			this._cachedBrushes = brushes;
		}

		// Public Getters/Setters

		public function get brushes() : Array
		{
			return this._brushes.value.concat();
		}
		public function set brushes(value:Array) : void
		{
			this._brushes.value = this._cachedBrushes = value ? value.concat() : new Array();
		}

		// Public Methods

		public function getBrush(field:String, index:int, count:int) : IBrush
		{
			var brushes:Array = this._cachedBrushes;
			var numBrushes:int = brushes.length;

			if (numBrushes == 0)
				return null;

			index = Math.max(index, 0);

			return brushes[index % numBrushes];
		}

	}

}

package com.splunk.palettes.brush
{

	import com.jasongatt.core.ObservableArrayProperty;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.graphics.brushes.GroupBrush;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.events.EventDispatcher;

	public class GroupBrushPalette extends ObservableObject implements IBrushPalette
	{

		// Private Properties

		private var _brushPalettes:ObservableArrayProperty;

		private var _cachedBrushPalettes:Array;

		// Constructor

		public function GroupBrushPalette(brushPalettes:Array = null)
		{
			brushPalettes = brushPalettes ? brushPalettes.concat() : new Array();

			this._brushPalettes = new ObservableArrayProperty(this, "brushPalettes", brushPalettes);

			this._cachedBrushPalettes = brushPalettes;
		}

		// Public Getters/Setters

		public function get brushPalettes() : Array
		{
			return this._brushPalettes.value.concat();
		}
		public function set brushPalettes(value:Array) : void
		{
			this._brushPalettes.value = this._cachedBrushPalettes = value ? value.concat() : new Array();
		}

		// Public Methods

		public function getBrush(field:String, index:int, count:int) : IBrush
		{
			var brushes:Array = new Array();
			for each (var brushPalette:IBrushPalette in this._cachedBrushPalettes)
				brushes.push(brushPalette.getBrush(field, index, count));
			return new GroupBrush(brushes);
		}

	}

}

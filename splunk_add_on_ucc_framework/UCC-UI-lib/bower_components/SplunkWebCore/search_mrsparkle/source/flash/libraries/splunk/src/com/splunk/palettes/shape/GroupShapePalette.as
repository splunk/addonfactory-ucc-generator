package com.splunk.palettes.shape
{

	import com.jasongatt.core.ObservableArrayProperty;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.graphics.shapes.GroupShape;
	import com.jasongatt.graphics.shapes.IShape;
	import flash.events.EventDispatcher;

	public class GroupShapePalette extends ObservableObject implements IShapePalette
	{

		// Private Properties

		private var _shapePalettes:ObservableArrayProperty;

		private var _cachedShapePalettes:Array;

		// Constructor

		public function GroupShapePalette(shapePalettes:Array = null)
		{
			shapePalettes = shapePalettes ? shapePalettes.concat() : new Array();

			this._shapePalettes = new ObservableArrayProperty(this, "shapePalettes", shapePalettes);

			this._cachedShapePalettes = shapePalettes;
		}

		// Public Getters/Setters

		public function get shapePalettes() : Array
		{
			return this._shapePalettes.value.concat();
		}
		public function set shapePalettes(value:Array) : void
		{
			this._shapePalettes.value = this._cachedShapePalettes = value ? value.concat() : new Array();
		}

		// Public Methods

		public function getShape(field:String, index:int, count:int) : IShape
		{
			var shapes:Array = new Array();
			for each (var shapePalette:IShapePalette in this._cachedShapePalettes)
				shapes.push(shapePalette.getShape(field, index, count));
			return new GroupShape(shapes);
		}

	}

}

package com.splunk.palettes.shape
{

	import com.jasongatt.core.ObservableArrayProperty;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.graphics.shapes.IShape;
	import flash.events.EventDispatcher;

	public class ListShapePalette extends ObservableObject implements IShapePalette
	{

		// Private Properties

		private var _shapes:ObservableArrayProperty;

		private var _cachedShapes:Array;

		// Constructor

		public function ListShapePalette(shapes:Array = null)
		{
			shapes = shapes ? shapes.concat() : new Array();

			this._shapes = new ObservableArrayProperty(this, "shapes", shapes);

			this._cachedShapes = shapes;
		}

		// Public Getters/Setters

		public function get shapes() : Array
		{
			return this._shapes.value.concat();
		}
		public function set shapes(value:Array) : void
		{
			this._shapes.value = this._cachedShapes = value ? value.concat() : new Array();
		}

		// Public Methods

		public function getShape(field:String, index:int, count:int) : IShape
		{
			var shapes:Array = this._cachedShapes;
			var numShapes:int = shapes.length;

			if (numShapes == 0)
				return null;

			index = Math.max(index, 0);

			return shapes[index % numShapes];
		}

	}

}

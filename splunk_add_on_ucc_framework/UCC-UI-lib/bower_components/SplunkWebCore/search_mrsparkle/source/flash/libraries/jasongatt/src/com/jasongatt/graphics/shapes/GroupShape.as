package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableArrayProperty;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.display.Graphics;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;

	public class GroupShape extends ObservableObject implements IShape
	{

		// Private Properties

		private var _shapes:ObservableArrayProperty;
		private var _brushes:ObservableArrayProperty;

		private var _cachedShapes:Array;
		private var _cachedBrushes:Array;

		// Constructor

		public function GroupShape(shapes:Array = null, brushes:Array = null)
		{
			shapes = shapes ? shapes.concat() : new Array();
			brushes = brushes ? brushes.concat() : new Array();

			this._shapes = new ObservableArrayProperty(this, "shapes", shapes);
			this._brushes = new ObservableArrayProperty(this, "brushes", brushes);

			this._cachedShapes = shapes;
			this._cachedBrushes = brushes;
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

		public function get brushes() : Array
		{
			return this._brushes.value.concat();
		}
		public function set brushes(value:Array) : void
		{
			this._brushes.value = this._cachedBrushes = value ? value.concat() : new Array();
		}

		// Public Methods

		public function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, brush:IBrush = null, matrix:Matrix = null, bounds:Array = null) : void
		{
			var shapes:Array = this._cachedShapes;
			var brushes:Array = this._cachedBrushes;

			var numShapes:int = shapes.length;
			var numBrushes:int = brushes.length;

			var curShape:IShape;
			var curBrush:IBrush;

			for (var i:int = 0; i < numShapes; i++)
			{
				curShape = shapes[i];
				if (i < numBrushes)
				{
					curBrush = brushes[i];
					if (!curBrush)
						curBrush = brush;
				}
				else
				{
					curBrush = brush;
				}
				curShape.draw(graphics, x, y, width, height, curBrush, matrix, bounds);
			}
		}

	}

}

package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.display.Graphics;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;

	public class UniformSizeShape extends ObservableObject implements IShape
	{

		// Private Properties

		private var _shape:ObservableProperty;

		private var _cachedShape:IShape;

		// Constructor

		public function UniformSizeShape(shape:IShape = null)
		{
			this._shape = new ObservableProperty(this, "shape", IShape, shape);

			this._cachedShape = shape;
		}

		// Public Getters/Setters

		public function get shape() : IShape
		{
			return this._shape.value;
		}
		public function set shape(value:IShape) : void
		{
			this._shape.value = this._cachedShape = value;
		}

		// Public Methods

		public function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, brush:IBrush = null, matrix:Matrix = null, bounds:Array = null) : void
		{
			var shape:IShape = this._cachedShape;
			if (!shape)
				return;

			var size:Number = Math.min(width, height);
			shape.draw(graphics, x + (width - size) / 2, y + (height - size) / 2, size, size, brush, matrix, bounds);
		}

	}

}

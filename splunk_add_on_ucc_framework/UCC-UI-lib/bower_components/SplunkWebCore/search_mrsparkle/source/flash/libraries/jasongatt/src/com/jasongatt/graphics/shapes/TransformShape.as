package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.display.Graphics;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;

	public class TransformShape extends ObservableObject implements IShape
	{

		// Private Properties

		private var _shape:ObservableProperty;
		private var _offsetX:ObservableProperty;
		private var _offsetY:ObservableProperty;
		private var _scaleX:ObservableProperty;
		private var _scaleY:ObservableProperty;

		private var _cachedShape:IShape;
		private var _cachedOffsetX:Number;
		private var _cachedOffsetY:Number;
		private var _cachedScaleX:Number;
		private var _cachedScaleY:Number;

		// Constructor

		public function TransformShape(shape:IShape = null, offsetX:Number = 0, offsetY:Number = 0, scaleX:Number = 1, scaleY:Number = 1)
		{
			this._shape = new ObservableProperty(this, "shape", IShape, shape);
			this._offsetX = new ObservableProperty(this, "offsetX", Number, offsetX);
			this._offsetY = new ObservableProperty(this, "offsetY", Number, offsetY);
			this._scaleX = new ObservableProperty(this, "scaleX", Number, scaleX);
			this._scaleY = new ObservableProperty(this, "scaleY", Number, scaleY);

			this._cachedShape = shape;
			this._cachedOffsetX = offsetX;
			this._cachedOffsetY = offsetY;
			this._cachedScaleX = scaleX;
			this._cachedScaleY = scaleY;
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

		public function get offsetX() : Number
		{
			return this._offsetX.value;
		}
		public function set offsetX(value:Number) : void
		{
			this._offsetX.value = this._cachedOffsetX = value;
		}

		public function get offsetY() : Number
		{
			return this._offsetY.value;
		}
		public function set offsetY(value:Number) : void
		{
			this._offsetY.value = this._cachedOffsetY = value;
		}

		public function get scaleX() : Number
		{
			return this._scaleX.value;
		}
		public function set scaleX(value:Number) : void
		{
			this._scaleX.value = this._cachedScaleX = value;
		}

		public function get scaleY() : Number
		{
			return this._scaleY.value;
		}
		public function set scaleY(value:Number) : void
		{
			this._scaleY.value = this._cachedScaleY = value;
		}

		// Public Methods

		public function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, brush:IBrush = null, matrix:Matrix = null, bounds:Array = null) : void
		{
			var shape:IShape = this._cachedShape;
			if (!shape)
				return;

			shape.draw(graphics, x + width * this._cachedOffsetX, y + height * this._cachedOffsetY, width * this._cachedScaleX, height * this._cachedScaleY, brush, matrix, bounds);
		}

	}

}

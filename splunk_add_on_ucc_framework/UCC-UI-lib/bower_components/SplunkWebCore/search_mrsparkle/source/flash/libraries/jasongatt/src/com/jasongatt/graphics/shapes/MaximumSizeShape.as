package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.display.Graphics;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;

	public class MaximumSizeShape extends ObservableObject implements IShape
	{

		// Private Properties

		private var _shape:ObservableProperty;
		private var _maximumWidth:ObservableProperty;
		private var _maximumHeight:ObservableProperty;

		private var _cachedShape:IShape;
		private var _cachedMaximumWidth:Number;
		private var _cachedMaximumHeight:Number;

		// Constructor

		public function MaximumSizeShape(shape:IShape = null, maximumWidth:Number = Infinity, maximumHeight:Number = Infinity)
		{
			this._shape = new ObservableProperty(this, "shape", IShape, shape);
			this._maximumWidth = new ObservableProperty(this, "maximumWidth", Number, maximumWidth);
			this._maximumHeight = new ObservableProperty(this, "maximumHeight", Number, maximumHeight);

			this._cachedShape = shape;
			this._cachedMaximumWidth = maximumWidth;
			this._cachedMaximumHeight = maximumHeight;
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

		public function get maximumWidth() : Number
		{
			return this._maximumWidth.value;
		}
		public function set maximumWidth(value:Number) : void
		{
			this._maximumWidth.value = this._cachedMaximumWidth = value;
		}

		public function get maximumHeight() : Number
		{
			return this._maximumHeight.value;
		}
		public function set maximumHeight(value:Number) : void
		{
			this._maximumHeight.value = this._cachedMaximumHeight = value;
		}

		// Public Methods

		public function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, brush:IBrush = null, matrix:Matrix = null, bounds:Array = null) : void
		{
			var shape:IShape = this._cachedShape;
			if (!shape)
				return;

			var width2:Number = Math.min(width, this._cachedMaximumWidth);
			var height2:Number = Math.min(height, this._cachedMaximumHeight);
			shape.draw(graphics, x + (width - width2) / 2, y + (height - height2) / 2, width2, height2, brush, matrix, bounds);
		}

	}

}

package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableObject;
	import flash.display.Graphics;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;
	import flash.geom.Point;

	public /*abstract*/ class AbstractBrush extends ObservableObject implements IBrush
	{

		// Private Properties

		private var _graphics:Graphics;
		private var _matrix:Matrix;
		private var _bounds:Array;
		private var _instructions:Array;

		// Constructor

		public function AbstractBrush()
		{
		}

		// Public Methods

		public function beginBrush(graphics:Graphics, matrix:Matrix = null, bounds:Array = null) : void
		{
			if (!graphics)
				throw new TypeError("Parameter graphics must be non-null.");

			this.endBrush();

			this._graphics = graphics;
			this._matrix = matrix ? matrix.clone() : null;
			if (bounds)
			{
				var bounds2:Array = this._bounds = new Array();
				for each (var point:Point in bounds)
					bounds2.push(point.clone());
			}
			this._instructions = new Array();
		}

		public function endBrush() : void
		{
			if (!this._graphics)
				return;

			this.draw(this._graphics, this._matrix, this._bounds, this._instructions);

			this._graphics = null;
			this._matrix = null;
			this._bounds = null;
			this._instructions = null;
		}

		public function moveTo(x:Number, y:Number) : void
		{
			if (!this._graphics)
				return;

			this._instructions.push(new MoveToInstruction(x, y));
		}

		public function lineTo(x:Number, y:Number) : void
		{
			if (!this._graphics)
				return;

			this._instructions.push(new LineToInstruction(x, y));
		}

		public function curveTo(controlX:Number, controlY:Number, anchorX:Number, anchorY:Number) : void
		{
			if (!this._graphics)
				return;

			this._instructions.push(new CurveToInstruction(controlX, controlY, anchorX, anchorY));
		}

		// Protected Methods

		protected function draw(graphics:Graphics, matrix:Matrix, bounds:Array, instructions:Array) : void
		{
		}

	}

}

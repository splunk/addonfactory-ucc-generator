package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.DrawingUtils;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.display.Graphics;
	import flash.geom.Matrix;
	import flash.geom.Point;

	public class WedgeShape extends AbstractShape
	{

		// Private Properties

		private var _startAngle:ObservableProperty;
		private var _arcAngle:ObservableProperty;

		private var _cachedStartAngle:Number;
		private var _cachedArcAngle:Number;

		// Constructor

		public function WedgeShape(startAngle:Number = 0, arcAngle:Number = 360)
		{
			this._startAngle = new ObservableProperty(this, "startAngle", Number, startAngle);
			this._arcAngle = new ObservableProperty(this, "arcAngle", Number, arcAngle);

			this._cachedStartAngle = startAngle;
			this._cachedArcAngle = arcAngle;
		}

		// Public Getters/Setters

		public function get startAngle() : Number
		{
			return this._startAngle.value;
		}
		public function set startAngle(value:Number) : void
		{
			this._startAngle.value = this._cachedStartAngle = value;
		}

		public function get arcAngle() : Number
		{
			return this._arcAngle.value;
		}
		public function set arcAngle(value:Number) : void
		{
			this._arcAngle.value = this._cachedArcAngle = value;
		}

		// Public Methods

		public override function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, brush:IBrush = null, matrix:Matrix = null, bounds:Array = null) : void
		{
			if (!bounds)
				bounds = [ new Point(x, y), new Point(x + width, y), new Point(x + width, y + height), new Point(x, y + height) ];
			super.draw(graphics, x, y, width, height, brush, matrix, bounds);
		}

		// Protected Methods

		protected override function drawOverride(width:Number, height:Number, brush:IBrush) : void
		{
			var startAngle:Number = this._cachedStartAngle;
			var arcAngle:Number = this._cachedArcAngle;
			var radiusX:Number = width / 2;
			var radiusY:Number = height / 2;
			var x1:Number = radiusX;
			var y1:Number = radiusY;
			var x2:Number = x1 + Math.cos(startAngle / 180 * Math.PI) * radiusX;
			var y2:Number = y1 + Math.sin(startAngle / 180 * Math.PI) * radiusY;

			brush.moveTo(x1, y1);
			brush.lineTo(x2, y2);
			DrawingUtils.arcTo(brush, x2, y2, startAngle, arcAngle, radiusX, radiusY);
			brush.lineTo(x1, y1);
		}

	}

}

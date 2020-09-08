package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.geom.Point;

	public class LineShape extends AbstractShape
	{

		// Private Properties

		private var _p1:ObservableProperty;
		private var _p2:ObservableProperty;

		private var _cachedP1:Point;
		private var _cachedP2:Point;

		// Constructor

		public function LineShape(p1:Point = null, p2:Point = null)
		{
			p1 = p1 ? p1.clone() : new Point(0, 0.5);
			p2 = p2 ? p2.clone() : new Point(1, 0.5);

			this._p1 = new ObservableProperty(this, "p1", Point, p1);
			this._p2 = new ObservableProperty(this, "p2", Point, p2);

			this._cachedP1 = p1;
			this._cachedP2 = p2;
		}

		// Public Getters/Setters

		public function get p1() : Point
		{
			return this._p1.value.clone();
		}
		public function set p1(value:Point) : void
		{
			this._p1.value = this._cachedP1 = value ? value.clone() : new Point(0, 0.5);
		}

		public function get p2() : Point
		{
			return this._p2.value.clone();
		}
		public function set p2(value:Point) : void
		{
			this._p2.value = this._cachedP2 = value ? value.clone() : new Point(1, 0.5);
		}

		// Protected Methods

		protected override function drawOverride(width:Number, height:Number, brush:IBrush) : void
		{
			var p1:Point = this._cachedP1;
			var p2:Point = this._cachedP2;

			brush.moveTo(p1.x * width, p1.y * height);
			brush.lineTo(p2.x * width, p2.y * height);
		}

	}

}

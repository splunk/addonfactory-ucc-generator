package com.jasongatt.graphics.shapes
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import flash.geom.Point;

	public class TriangleShape extends AbstractShape
	{

		// Private Properties

		private var _p1:ObservableProperty;
		private var _p2:ObservableProperty;
		private var _p3:ObservableProperty;

		private var _cachedP1:Point;
		private var _cachedP2:Point;
		private var _cachedP3:Point;

		// Constructor

		public function TriangleShape(p1:Point = null, p2:Point = null, p3:Point = null)
		{
			p1 = p1 ? p1.clone() : new Point(0.5, 0);
			p2 = p2 ? p2.clone() : new Point(1, 1);
			p3 = p3 ? p3.clone() : new Point(0, 1);

			this._p1 = new ObservableProperty(this, "p1", Point, p1);
			this._p2 = new ObservableProperty(this, "p2", Point, p2);
			this._p3 = new ObservableProperty(this, "p3", Point, p3);

			this._cachedP1 = p1;
			this._cachedP2 = p2;
			this._cachedP3 = p3;
		}

		// Public Getters/Setters

		public function get p1() : Point
		{
			return this._p1.value.clone();
		}
		public function set p1(value:Point) : void
		{
			this._p1.value = this._cachedP1 = value ? value.clone() : new Point(0.5, 0);
		}

		public function get p2() : Point
		{
			return this._p2.value.clone();
		}
		public function set p2(value:Point) : void
		{
			this._p2.value = this._cachedP2 = value ? value.clone() : new Point(1, 1);
		}

		public function get p3() : Point
		{
			return this._p3.value.clone();
		}
		public function set p3(value:Point) : void
		{
			this._p3.value = this._cachedP3 = value ? value.clone() : new Point(0, 1);
		}

		// Protected Methods

		protected override function drawOverride(width:Number, height:Number, brush:IBrush) : void
		{
			var p1:Point = this._cachedP1;
			var p2:Point = this._cachedP2;
			var p3:Point = this._cachedP3;

			p1 = new Point(width * p1.x, height * p1.y);
			p2 = new Point(width * p2.x, height * p2.y);
			p3 = new Point(width * p3.x, height * p3.y);

			brush.moveTo(p1.x, p1.y);
			brush.lineTo(p2.x, p2.y);
			brush.lineTo(p3.x, p3.y);
			brush.lineTo(p1.x, p1.y);
		}

	}

}

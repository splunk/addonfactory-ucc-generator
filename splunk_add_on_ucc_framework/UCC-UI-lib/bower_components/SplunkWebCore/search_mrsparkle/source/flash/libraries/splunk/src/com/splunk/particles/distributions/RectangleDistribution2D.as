package com.splunk.particles.distributions
{

	import flash.geom.Point;

	public class RectangleDistribution2D implements IDistribution2D
	{

		// Public Properties

		public var x:Number;
		public var y:Number;
		public var width:Number;
		public var height:Number;

		// Constructor

		public function RectangleDistribution2D(x:Number = 0, y:Number = 0, width:Number = 0, height:Number = 0)
		{
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}

		// Public Methods

		public function getRandomPoint() : Point
		{
			return new Point(this.x + this.width * Math.random(), this.y + this.height * Math.random());
		}

		public function getArea() : Number
		{
			var width:Number = Math.abs(this.width) + 1;
			var height:Number = Math.abs(this.height) + 1;
			return width * height;
		}

		public function containsPoint(point:Point) : Boolean
		{
			var x1:Number = this.x;
			var x2:Number = x1 + this.width;
			var y1:Number = this.y;
			var y2:Number = y1 + this.height;

			var temp:Number;

			if (x1 > x2)
			{
				temp = x1;
				x1 = x2;
				x2 = temp;
			}

			if (y1 > y2)
			{
				temp = y1;
				y1 = y2;
				y2 = temp;
			}

			if ((point.x < x1) || (point.x > x2) || (point.y < y1) || (point.y > y2))
				return false;

			return true;
		}

	}

}

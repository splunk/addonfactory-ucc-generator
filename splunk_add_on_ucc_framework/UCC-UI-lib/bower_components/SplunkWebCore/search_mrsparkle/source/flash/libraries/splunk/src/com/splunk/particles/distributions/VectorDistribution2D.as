package com.splunk.particles.distributions
{

	import flash.geom.Point;

	public class VectorDistribution2D implements IDistribution2D
	{

		// Public Properties

		public var length:Number;
		public var lengthVariance:Number;
		public var angle:Number;
		public var angleVariance:Number;

		// Constructor

		public function VectorDistribution2D(length:Number = 0, lengthVariance:Number = 0, angle:Number = 0, angleVariance:Number = 0)
		{
			this.length = length;
			this.lengthVariance = lengthVariance;
			this.angle = angle;
			this.angleVariance = angleVariance;
		}

		// Public Methods

		public function getRandomPoint() : Point
		{
			var length:Number = this.length * (1 + this.lengthVariance * (Math.random() * 2 - 1));
			var angle:Number = (this.angle + this.angleVariance * (Math.random() * 2 - 1)) * (Math.PI / 180);

			return new Point(length * Math.cos(angle), length * Math.sin(angle));
		}

		public function getArea() : Number
		{
			var length:Number = this.length;
			var lengthVariance:Number = this.lengthVariance;
			var length1:Number = length * (1 - lengthVariance);
			var length2:Number = length * (1 + lengthVariance);

			var arcRatio:Number = Math.abs(this.angleVariance) / 180;
			var area1:Number = Math.PI * length1 * length1 * arcRatio;
			var area2:Number = Math.PI * length2 * length2 * arcRatio;
			var area:Number = ((length1 * length2) < 0) ? area2 + area1 : Math.abs(area2 - area1);

			return area + Math.abs(length2 - length1) + 1;
		}

		public function containsPoint(point:Point) : Boolean
		{
			var x:Number = point.x;
			var y:Number = point.y;
			var r:Number = Math.sqrt(x * x + y * y);
			var a:Number = Math.atan2(y, x) * (180 / Math.PI);

			var length:Number = this.length;
			var lengthVariance:Number = this.lengthVariance;
			var length1:Number = length * (1 - lengthVariance);
			var length2:Number = length * (1 + lengthVariance);

			var angle:Number = this.angle;
			var angleVariance:Number = Math.min(Math.abs(this.angleVariance), 180);
			angle -= angleVariance;
			angleVariance *= 2;

			if ((length1 * length2) < 0)
			{
				if (!this._isPointInSegment(r, a, length1, angle, angleVariance) && !this._isPointInSegment(r, a, length2, angle, angleVariance))
					return false;
			}
			else if (Math.abs(length1) > Math.abs(length2))
			{
				if (!this._isPointInSegment(r, a, length1, angle, angleVariance) || this._isPointInSegment(r, a, length2, angle, angleVariance, false))
					return false;
			}
			else
			{
				if (!this._isPointInSegment(r, a, length2, angle, angleVariance) || this._isPointInSegment(r, a, length1, angle, angleVariance, false))
					return false;
			}

			return true;
		}

		// Private Methods

		private function _isPointInSegment(pointRadius:Number, pointAngle:Number, segmentRadius:Number, segmentAngle:Number, segmentArc:Number, inclusive:Boolean = true) : Boolean
		{
			if (pointRadius < 0)
			{
				pointRadius = -pointRadius;
				pointAngle += 180;
			}

			if (segmentRadius < 0)
			{
				segmentRadius = -segmentRadius;
				segmentAngle += 180;
			}

			if (inclusive)
			{
				if (pointRadius > segmentRadius)
					return false;
			}
			else
			{
				if (pointRadius >= segmentRadius)
					return false;
			}

			pointAngle %= 360;
			if (pointAngle < 0)
				pointAngle += 360;

			segmentAngle %= 360;
			if (segmentAngle < 0)
				segmentAngle += 360;

			var segmentEndAngle:Number = segmentAngle + segmentArc;
			if (segmentEndAngle >= 360)
			{
				segmentEndAngle %= 360;
				if ((pointAngle < segmentAngle) && (pointAngle > segmentEndAngle))
					return false;
			}
			else
			{
				if ((pointAngle < segmentAngle) || (pointAngle > segmentEndAngle))
					return false;
			}

			return true;
		}

	}

}

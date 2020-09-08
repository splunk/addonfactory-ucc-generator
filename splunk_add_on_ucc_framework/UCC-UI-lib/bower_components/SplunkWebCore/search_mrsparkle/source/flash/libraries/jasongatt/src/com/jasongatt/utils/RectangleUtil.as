package com.jasongatt.utils
{

	import flash.geom.Rectangle;

	public final class RectangleUtil
	{

		// Public Static Methods

		public static function round(r:Rectangle) : Rectangle
		{
			var x1:Number = r.x;
			var y1:Number = r.y;
			var x2:Number = x1 + r.width;
			var y2:Number = y1 + r.height;

			x1 = Math.round(x1);
			y1 = Math.round(y1);
			x2 = Math.round(x2);
			y2 = Math.round(y2);

			return new Rectangle(x1, y1, x2 - x1, y2 - y1);
		}

		public static function interpolate(r1:Rectangle, r2:Rectangle, f:Number) : Rectangle
		{
			var g:Number = 1 - f;
			return new Rectangle(r1.x * g + r2.x * f,
			                     r1.y * g + r2.y * f,
			                     r1.width * g + r2.width * f,
			                     r1.height * g + r2.height * f);
		}

		public static function approxEqual(r1:Rectangle, r2:Rectangle, threshold:Number = NaN) : Boolean
		{
			if ((r1.x == r2.x) &&
			    (r1.y == r2.y) &&
			    (r1.width == r2.width) &&
			    (r1.height == r2.height))
				return true;
			return (NumberUtil.approxEqual(r1.x, r2.x, threshold) &&
			        NumberUtil.approxEqual(r1.y, r2.y, threshold) &&
			        NumberUtil.approxEqual(r1.width, r2.width, threshold) &&
			        NumberUtil.approxEqual(r1.height, r2.height, threshold));
		}

		public static function hasNaN(r:Rectangle) : Boolean
		{
			return ((r.x != r.x) ||
			        (r.y != r.y) ||
			        (r.width != r.width) ||
			        (r.height != r.height));
		}

		public static function hasInfinity(r:Rectangle) : Boolean
		{
			return ((r.x == Infinity) || (r.x == -Infinity) ||
			        (r.y == Infinity) || (r.y == -Infinity) ||
			        (r.width == Infinity) || (r.width == -Infinity) ||
			        (r.height == Infinity) || (r.height == -Infinity));
		}

		public static function hasPositiveInfinity(r:Rectangle) : Boolean
		{
			return ((r.x == Infinity) ||
			        (r.y == Infinity) ||
			        (r.width == Infinity) ||
			        (r.height == Infinity));
		}

		public static function hasNegativeInfinity(r:Rectangle) : Boolean
		{
			return ((r.x == -Infinity) ||
			        (r.y == -Infinity) ||
			        (r.width == -Infinity) ||
			        (r.height == -Infinity));
		}

		public static function isFinite(r:Rectangle) : Boolean
		{
			return (((r.x - r.x) == 0) &&
			        ((r.y - r.y) == 0) &&
			        ((r.width - r.width) == 0) &&
			        ((r.height - r.height) == 0));
		}

	}

}

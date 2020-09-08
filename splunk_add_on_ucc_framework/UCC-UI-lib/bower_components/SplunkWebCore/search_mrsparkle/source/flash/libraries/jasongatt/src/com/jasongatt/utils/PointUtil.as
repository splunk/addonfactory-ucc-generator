package com.jasongatt.utils
{

	import flash.geom.Point;

	public final class PointUtil
	{

		// Public Static Methods

		public static function round(p:Point) : Point
		{
			return new Point(Math.round(p.x), Math.round(p.y));
		}

		public static function interpolate(p1:Point, p2:Point, f:Number) : Point
		{
			var g:Number = 1 - f;
			return new Point(p1.x * g + p2.x * f,
			                 p1.y * g + p2.y * f);
		}

		public static function approxEqual(p1:Point, p2:Point, threshold:Number = NaN) : Boolean
		{
			if ((p1.x == p2.x) &&
			    (p1.y == p2.y))
				return true;
			return (NumberUtil.approxEqual(p1.x, p2.x, threshold) &&
			        NumberUtil.approxEqual(p1.y, p2.y, threshold));
		}

		public static function hasNaN(p:Point) : Boolean
		{
			return ((p.x != p.x) ||
			        (p.y != p.y));
		}

		public static function hasInfinity(p:Point) : Boolean
		{
			return ((p.x == Infinity) || (p.x == -Infinity) ||
			        (p.y == Infinity) || (p.y == -Infinity));
		}

		public static function hasPositiveInfinity(p:Point) : Boolean
		{
			return ((p.x == Infinity) ||
			        (p.y == Infinity));
		}

		public static function hasNegativeInfinity(p:Point) : Boolean
		{
			return ((p.x == -Infinity) ||
			        (p.y == -Infinity));
		}

		public static function isFinite(p:Point) : Boolean
		{
			return (((p.x - p.x) == 0) &&
			        ((p.y - p.y) == 0));
		}

	}

}

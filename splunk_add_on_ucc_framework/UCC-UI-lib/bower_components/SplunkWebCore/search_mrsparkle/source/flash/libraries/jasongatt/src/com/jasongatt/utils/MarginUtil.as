package com.jasongatt.utils
{

	import com.jasongatt.layout.Margin;

	public final class MarginUtil
	{

		// Public Static Methods

		public static function round(m:Margin) : Margin
		{
			return new Margin(Math.round(m.left), Math.round(m.right), Math.round(m.top), Math.round(m.bottom));
		}

		public static function interpolate(m1:Margin, m2:Margin, f:Number) : Margin
		{
			var g:Number = 1 - f;
			return new Margin(m1.left * g + m2.left * f,
			                  m1.right * g + m2.right * f,
			                  m1.top * g + m2.top * f,
			                  m1.bottom * g + m2.bottom * f);
		}

		public static function approxEqual(m1:Margin, m2:Margin, threshold:Number = NaN) : Boolean
		{
			if ((m1.left == m2.left) &&
			    (m1.right == m2.right) &&
			    (m1.top == m2.top) &&
			    (m1.bottom == m2.bottom))
				return true;
			return (NumberUtil.approxEqual(m1.left, m2.left, threshold) &&
			        NumberUtil.approxEqual(m1.right, m2.right, threshold) &&
			        NumberUtil.approxEqual(m1.top, m2.top, threshold) &&
			        NumberUtil.approxEqual(m1.bottom, m2.bottom, threshold));
		}

		public static function hasNaN(m:Margin) : Boolean
		{
			return ((m.left != m.left) ||
			        (m.right != m.right) ||
			        (m.top != m.top) ||
			        (m.bottom != m.bottom));
		}

		public static function hasInfinity(m:Margin) : Boolean
		{
			return ((m.left == Infinity) || (m.left == -Infinity) ||
			        (m.right == Infinity) || (m.right == -Infinity) ||
			        (m.top == Infinity) || (m.top == -Infinity) ||
			        (m.bottom == Infinity) || (m.bottom == -Infinity));
		}

		public static function hasPositiveInfinity(m:Margin) : Boolean
		{
			return ((m.left == Infinity) ||
			        (m.right == Infinity) ||
			        (m.top == Infinity) ||
			        (m.bottom == Infinity));
		}

		public static function hasNegativeInfinity(m:Margin) : Boolean
		{
			return ((m.left == -Infinity) ||
			        (m.right == -Infinity) ||
			        (m.top == -Infinity) ||
			        (m.bottom == -Infinity));
		}

		public static function isFinite(m:Margin) : Boolean
		{
			return (((m.left - m.left) == 0) &&
			        ((m.right - m.right) == 0) &&
			        ((m.top - m.top) == 0) &&
			        ((m.bottom - m.bottom) == 0));
		}

	}

}

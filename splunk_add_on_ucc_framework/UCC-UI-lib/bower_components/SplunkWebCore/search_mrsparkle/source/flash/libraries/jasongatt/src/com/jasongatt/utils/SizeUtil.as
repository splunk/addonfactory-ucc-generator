package com.jasongatt.utils
{

	import com.jasongatt.layout.Size;

	public final class SizeUtil
	{

		// Public Static Methods

		public static function round(s:Size) : Size
		{
			return new Size(Math.round(s.width), Math.round(s.height));
		}

		public static function interpolate(s1:Size, s2:Size, f:Number) : Size
		{
			var g:Number = 1 - f;
			return new Size(s1.width * g + s2.width * f,
			                s1.height * g + s2.height * f);
		}

		public static function approxEqual(s1:Size, s2:Size, threshold:Number = NaN) : Boolean
		{
			if ((s1.width == s2.width) &&
			    (s1.height == s2.height))
				return true;
			return (NumberUtil.approxEqual(s1.width, s2.width, threshold) &&
			        NumberUtil.approxEqual(s1.height, s2.height, threshold));
		}

		public static function hasNaN(s:Size) : Boolean
		{
			return ((s.width != s.width) ||
			        (s.height != s.height));
		}

		public static function hasInfinity(s:Size) : Boolean
		{
			return ((s.width == Infinity) || (s.width == -Infinity) ||
			        (s.height == Infinity) || (s.height == -Infinity));
		}

		public static function hasPositiveInfinity(s:Size) : Boolean
		{
			return ((s.width == Infinity) ||
			        (s.height == Infinity));
		}

		public static function hasNegativeInfinity(s:Size) : Boolean
		{
			return ((s.width == -Infinity) ||
			        (s.height == -Infinity));
		}

		public static function isFinite(s:Size) : Boolean
		{
			return (((s.width - s.width) == 0) &&
			        ((s.height - s.height) == 0));
		}

	}

}

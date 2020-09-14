package com.jasongatt.utils
{

	public final class NumberUtil
	{

		// Public Static Constants

		public static const EPSILON:Number = NumberUtil._computeEpsilon();
		public static const PRECISION:int = NumberUtil._computePrecision();

		// Public Static Methods

		public static function parseNumber(value:*) : Number
		{
			if (value == null)
				return NaN;
			if (value is Number)
				return value;
			if (value is String)
				return value ? Number(value) : NaN;
			if (value is Boolean)
				return value ? 1 : 0;
			return NaN;
		}

		public static function toPrecision(n:Number, precision:int = 0) : Number
		{
			if (precision < 1)
				precision = NumberUtil.PRECISION + precision;

			if (precision < 1)
				precision = 1;
			else if (precision > 21)
				precision = 21;

			// Flash Player bug with Number.toPrecision method.
			// Some values return incorrect formats (i.e. (1e+24).toPrecision(12) returns "0.e+34").
			//return Number(n.toPrecision(precision));

			// This produces equivalent results to a correctly working Number.toPrecision method.
			if ((n != 0) && (n > -Infinity) && (n < Infinity))
			{
				var significand:Number = n;
				var exponent:Number = 0;
				var str:String = n.toExponential(20);
				var eIndex:int = str.indexOf("e");
				if (eIndex >= 0)
				{
					significand = Number(str.substring(0, eIndex));
					exponent = Number(str.substring(eIndex + 1, str.length));
				}
				significand = Math.round(significand * Math.pow(10, precision - 1));
				n = significand * Math.pow(10, exponent - precision + 1);
			}
			return n;
		}

		public static function toFixed(n:Number, decimalDigits:int = 0) : Number
		{
			if (decimalDigits < 0)
				decimalDigits = 0;
			else if (decimalDigits > 20)
				decimalDigits = 20;

			return Number(n.toFixed(decimalDigits));
		}

		public static function roundTo(n:Number, units:Number = 1) : Number
		{
			return NumberUtil.toPrecision(Math.round(n / units) * units, -1);
		}

		public static function minMax(n:Number, min:Number, max:Number) : Number
		{
			if (n < min)
				n = min;
			if (n > max)
				n = max;
			return n;
		}

		public static function maxMin(n:Number, max:Number, min:Number) : Number
		{
			if (n > max)
				n = max;
			if (n < min)
				n = min;
			return n;
		}

		public static function interpolate(n1:Number, n2:Number, f:Number) : Number
		{
			return n1 * (1 - f) + n2 * f;
		}

		public static function approxZero(n:Number, threshold:Number = NaN) : Boolean
		{
			if (n == 0)
				return true;
			if (threshold != threshold)
				threshold = NumberUtil.EPSILON;
			if (n < 0)
				return (-n < threshold);
			return (n < threshold);
		}

		public static function approxOne(n:Number, threshold:Number = NaN) : Boolean
		{
			if (n == 1)
				return true;
			n -= 1;
			if (threshold != threshold)
				threshold = NumberUtil.EPSILON;
			if (n < 0)
				return (-n < threshold);
			return (n < threshold);
		}

		public static function approxEqual(n1:Number, n2:Number, threshold:Number = NaN) : Boolean
		{
			if (n1 == n2)
				return true;
			n1 -= n2;
			if (threshold != threshold)
				threshold = NumberUtil.EPSILON;
			if (n1 < 0)
				return (-n1 < threshold);
			return (n1 < threshold);
		}

		public static function approxLessThan(n1:Number, n2:Number, threshold:Number = NaN) : Boolean
		{
			return ((n1 < n2) && !NumberUtil.approxEqual(n1, n2, threshold));
		}

		public static function approxLessThanOrEqual(n1:Number, n2:Number, threshold:Number = NaN) : Boolean
		{
			return ((n1 < n2) || NumberUtil.approxEqual(n1, n2, threshold));
		}

		public static function approxGreaterThan(n1:Number, n2:Number, threshold:Number = NaN) : Boolean
		{
			return ((n1 > n2) && !NumberUtil.approxEqual(n1, n2, threshold));
		}

		public static function approxGreaterThanOrEqual(n1:Number, n2:Number, threshold:Number = NaN) : Boolean
		{
			return ((n1 > n2) || NumberUtil.approxEqual(n1, n2, threshold));
		}

		// Private Static Methods

		private static function _computeEpsilon() : Number
		{
			var eps:Number = 1;
			var temp:Number = 1;
			while((1 + temp) > 1)
			{
				eps = temp;
				temp /= 2;
			}
			return eps;
		}

		private static function _computePrecision() : int
		{
			var prec:int = 0;
			var temp:Number = 9;
			while ((temp % 10) == 9)
			{
				prec++;
				temp = temp * 10 + 9;
			}
			return prec;
		}

	}

}

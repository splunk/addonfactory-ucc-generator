package com.jasongatt.utils
{

	import flash.geom.Matrix;

	public final class MatrixUtil
	{

		// Public Static Methods

		public static function determinant(m:Matrix) : Number
		{
			return (m.a * m.d) - (m.b * m.c);
		}

		public static function interpolate(m1:Matrix, m2:Matrix, f:Number) : Matrix
		{
			var g:Number = 1 - f;
			return new Matrix(m1.a * g + m2.a * f,
			                  m1.b * g + m2.b * f,
			                  m1.c * g + m2.c * f,
			                  m1.d * g + m2.d * f,
			                  m1.tx * g + m2.tx * f,
			                  m1.ty * g + m2.ty * f);
		}

		public static function equal(m1:Matrix, m2:Matrix) : Boolean
		{
			return ((m1.a == m2.a) &&
			        (m1.b == m2.b) &&
			        (m1.c == m2.c) &&
			        (m1.d == m2.d) &&
			        (m1.tx == m2.tx) &&
			        (m1.ty == m2.ty));
		}

		public static function approxEqual(m1:Matrix, m2:Matrix, threshold:Number = NaN) : Boolean
		{
			if ((m1.a == m2.a) &&
			    (m1.b == m2.b) &&
			    (m1.c == m2.c) &&
			    (m1.d == m2.d) &&
			    (m1.tx == m2.tx) &&
			    (m1.ty == m2.ty))
				return true;
			return (NumberUtil.approxEqual(m1.a, m2.a, threshold) &&
			        NumberUtil.approxEqual(m1.b, m2.b, threshold) &&
			        NumberUtil.approxEqual(m1.c, m2.c, threshold) &&
			        NumberUtil.approxEqual(m1.d, m2.d, threshold) &&
			        NumberUtil.approxEqual(m1.tx, m2.tx, threshold) &&
			        NumberUtil.approxEqual(m1.ty, m2.ty, threshold));
		}

		public static function hasInverse(m:Matrix) : Boolean
		{
			var det:Number = Math.abs(MatrixUtil.determinant(m));
			return ((det > 0) && (det < Infinity));
		}

		public static function hasNaN(m:Matrix) : Boolean
		{
			return ((m.a != m.a) ||
			        (m.b != m.b) ||
			        (m.c != m.c) ||
			        (m.d != m.d) ||
			        (m.tx != m.tx) ||
			        (m.ty != m.ty));
		}

		public static function hasInfinity(m:Matrix) : Boolean
		{
			return ((m.a == Infinity) || (m.a == -Infinity) ||
			        (m.b == Infinity) || (m.b == -Infinity) ||
			        (m.c == Infinity) || (m.c == -Infinity) ||
			        (m.d == Infinity) || (m.d == -Infinity) ||
			        (m.tx == Infinity) || (m.tx == -Infinity) ||
			        (m.ty == Infinity) || (m.ty == -Infinity));
		}

		public static function hasPositiveInfinity(m:Matrix) : Boolean
		{
			return ((m.a == Infinity) ||
			        (m.b == Infinity) ||
			        (m.c == Infinity) ||
			        (m.d == Infinity) ||
			        (m.tx == Infinity) ||
			        (m.ty == Infinity));
		}

		public static function hasNegativeInfinity(m:Matrix) : Boolean
		{
			return ((m.a == -Infinity) ||
			        (m.b == -Infinity) ||
			        (m.c == -Infinity) ||
			        (m.d == -Infinity) ||
			        (m.tx == -Infinity) ||
			        (m.ty == -Infinity));
		}

		public static function isFinite(m:Matrix) : Boolean
		{
			return (((m.a - m.a) == 0) &&
			        ((m.b - m.b) == 0) &&
			        ((m.c - m.c) == 0) &&
			        ((m.d - m.d) == 0) &&
			        ((m.tx - m.tx) == 0) &&
			        ((m.ty - m.ty) == 0));
		}

		public static function isIdentity(m:Matrix) : Boolean
		{
			return ((m.a == 1) &&
			        (m.b == 0) &&
			        (m.c == 0) &&
			        (m.d == 1) &&
			        (m.tx == 0) &&
			        (m.ty == 0));
		}

	}

}

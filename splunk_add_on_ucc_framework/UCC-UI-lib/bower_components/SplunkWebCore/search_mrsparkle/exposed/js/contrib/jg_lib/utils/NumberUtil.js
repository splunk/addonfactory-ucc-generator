/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(NumberUtil)
	{

		// Public Static Constants

		NumberUtil.PRECISION = (function()
		{
			var prec = 0;
			var test = 9;
			var loops = 0;
			while ((test % 10) === 9)
			{
				prec++;
				test = test * 10 + 9;
				if (++loops > 100)
					break;
			}
			return prec;
		})();

		NumberUtil.EPSILON = (function()
		{
			var eps = 1;
			var test = 1;
			var loops = 0;
			while ((1 + test) > 1)
			{
				eps = test;
				test /= 2;
				if (++loops > 100)
					break;
			}
			return eps;
		})();

		// Public Static Methods

		NumberUtil.interpolate = function(num1, num2, ratio)
		{
			return num1 * (1 - ratio) + num2 * ratio;
		};

		NumberUtil.minMax = function(num, min, max)
		{
			num = +num;
			min = +min;
			max = +max;

			if (num < min)
				num = min;
			if (num > max)
				num = max;

			return num;
		};

		NumberUtil.maxMin = function(num, max, min)
		{
			num = +num;
			max = +max;
			min = +min;

			if (num > max)
				num = max;
			if (num < min)
				num = min;

			return num;
		};

		NumberUtil.roundTo = function(num, units)
		{
			num = +num;
			units = (units != null) ? +units : 1;

			if (units > 0)
				num = Math.round(num / units) * units;

			return NumberUtil.toPrecision(num);
		};

		NumberUtil.floorTo = function(num, units)
		{
			num = +num;
			units = (units != null) ? +units : 1;

			if (units > 0)
				num = Math.floor(num / units) * units;

			return NumberUtil.toPrecision(num);
		};

		NumberUtil.ceilTo = function(num, units)
		{
			num = +num;
			units = (units != null) ? +units : 1;

			if (units > 0)
				num = Math.ceil(num / units) * units;

			return NumberUtil.toPrecision(num);
		};

		NumberUtil.toPrecision = function(num, digits)
		{
			num = +num;
			digits = (digits != null) ? +digits : 0;

			if (digits > 0)
				digits = Math.floor(digits);
			else if (digits < 0)
				digits = NumberUtil.PRECISION + Math.ceil(digits);
			else
				digits = NumberUtil.PRECISION;

			if (digits < 1)
				digits = 1;
			else if (digits > 21)
				digits = 21;

			return +(num.toPrecision(digits));
		};

		NumberUtil.approxZero = function(num, threshold)
		{
			num = +num;

			if (num === 0)
				return true;

			threshold = (threshold != null) ? +threshold : NumberUtil.EPSILON;

			return (num < 0) ? (-num < threshold) : (num < threshold);
		};

		NumberUtil.approxOne = function(num, threshold)
		{
			num = +num;

			if (num === 1)
				return true;

			threshold = (threshold != null) ? +threshold : NumberUtil.EPSILON;
			num -= 1;

			return (num < 0) ? (-num < threshold) : (num < threshold);
		};

		NumberUtil.approxEqual = function(num1, num2, threshold)
		{
			num1 = +num1;
			num2 = +num2;

			if (num1 === num2)
				return true;

			threshold = (threshold != null) ? +threshold : NumberUtil.EPSILON;
			num1 -= num2;

			return (num1 < 0) ? (-num1 < threshold) : (num1 < threshold);
		};

		NumberUtil.approxLessThan = function(num1, num2, threshold)
		{
			num1 = +num1;
			num2 = +num2;

			return ((num1 < num2) && !NumberUtil.approxEqual(num1, num2, threshold));
		};

		NumberUtil.approxLessThanOrEqual = function(num1, num2, threshold)
		{
			num1 = +num1;
			num2 = +num2;

			return ((num1 < num2) || NumberUtil.approxEqual(num1, num2, threshold));
		};

		NumberUtil.approxGreaterThan = function(num1, num2, threshold)
		{
			num1 = +num1;
			num2 = +num2;

			return ((num1 > num2) && !NumberUtil.approxEqual(num1, num2, threshold));
		};

		NumberUtil.approxGreaterThanOrEqual = function(num1, num2, threshold)
		{
			num1 = +num1;
			num2 = +num2;

			return ((num1 > num2) || NumberUtil.approxEqual(num1, num2, threshold));
		};

	});

});

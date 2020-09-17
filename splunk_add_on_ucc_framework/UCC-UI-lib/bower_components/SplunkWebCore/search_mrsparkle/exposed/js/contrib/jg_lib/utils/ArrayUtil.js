/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");

	return Class(module.id, function(ArrayUtil)
	{

		// Public Static Methods

		ArrayUtil.indexOf = function(arr, value, start)
		{
			var l = arr.length;
			var i = 0;

			if (start != null)
			{
				start = +start;
				if (start >= 0)
					i = Math.floor(start);
				else if (start < 0)
					i = Math.max(l + Math.ceil(start), 0);
			}

			for (i; i < l; i++)
			{
				if (arr[i] === value)
					return i;
			}

			return -1;
		};

		ArrayUtil.lastIndexOf = function(arr, value, start)
		{
			var l = arr.length;
			var i = l - 1;

			if (start != null)
			{
				start = +start;
				if (start >= 0)
					i = Math.min(Math.floor(start), l - 1);
				else if (start < 0)
					i = l + Math.ceil(start);
			}

			for (i; i >= 0; i--)
			{
				if (arr[i] === value)
					return i;
			}

			return -1;
		};

		ArrayUtil.binarySearch = function(arr, value, comparator)
		{
			var high = arr.length - 1;
			if (high < 0)
				return -1;

			if (!comparator)
				comparator = _naturalComparator;

			var low = 0;
			var mid;
			var comp;

			while (low <= high)
			{
				mid = low + Math.floor((high - low) / 2);
				comp = comparator(arr[mid], value);
				if (comp < 0)
					low = mid + 1;
				else if (comp > 0)
					high = mid - 1;
				else
					return mid;
			}

			return -low - 1;
		};

		// Private Static Methods

		var _naturalComparator = function(value1, value2)
		{
			if (value1 < value2)
				return -1;
			if (value1 > value2)
				return 1;
			return 0;
		};

	});

});

package com.jasongatt.utils
{

	public final class ArrayUtil
	{

		// Private Static Constants

		private static const _NATURAL_COMPARATOR:IComparator = new NaturalComparator();

		// Public Static Methods

		public static function sort(a:Array, comparator:IComparator = null) : void
		{
			if (!a)
				throw new TypeError("Parameter a must be non-null.");

			if (!comparator)
				comparator = ArrayUtil._NATURAL_COMPARATOR;

			a.sort(comparator.compare);
		}

		public static function binarySearch(a:Array, value:*, comparator:IComparator = null) : int
		{
			if (!a)
				throw new TypeError("Parameter a must be non-null.");

			var high:int = a.length - 1;
			if (high < 0)
				return -1;

			if (!comparator)
				comparator = ArrayUtil._NATURAL_COMPARATOR;

			var low:int = 0;
			var mid:int;
			var comp:Number;

			while (low <= high)
			{
				mid = low + (high - low) / 2;
				comp = comparator.compare(value, a[mid]);
				if (comp < 0)
					high = mid - 1;
				else if (comp > 0)
					low = mid + 1;
				else
					return mid;
			}

			return -low - 1;
		}

	}

}

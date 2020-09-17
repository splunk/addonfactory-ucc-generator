package com.jasongatt.utils
{

	public class SequentialNumericComparator implements IComparator
	{

		// Private Static Constants

		private static const _NUMERIC_PATTERN:RegExp = /\d+/g;

		// Constructor

		public function SequentialNumericComparator()
		{
		}

		// Public Methods

		public function compare(value1:*, value2:*) : Number
		{
			var pattern:RegExp = SequentialNumericComparator._NUMERIC_PATTERN;
			var str1:String = String(value1);
			var str2:String = String(value2);
			var arr1:Array = str1.match(pattern);
			var arr2:Array = str2.match(pattern);
			var len1:int = arr1.length;
			var len2:int = arr2.length;
			var len:int = (len1 < len2) ? len1 : len2;
			var num1:Number;
			var num2:Number;
			for (var i:int = 0; i < len; i++)
			{
				num1 = Number(arr1[i]);
				num2 = Number(arr2[i]);
				if (num1 < num2)
					return -1;
				if (num1 > num2)
					return 1;
			}
			if (len1 < len2)
				return -1;
			if (len1 > len2)
				return 1;
			return 0;
		}

	}

}

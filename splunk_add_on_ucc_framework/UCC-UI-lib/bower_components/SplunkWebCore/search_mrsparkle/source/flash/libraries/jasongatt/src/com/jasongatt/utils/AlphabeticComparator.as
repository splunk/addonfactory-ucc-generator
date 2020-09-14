package com.jasongatt.utils
{

	public class AlphabeticComparator implements IComparator
	{

		// Constructor

		public function AlphabeticComparator()
		{
		}

		// Public Methods

		public function compare(value1:*, value2:*) : Number
		{
			var str1:String = String(value1).toLowerCase();
			var str2:String = String(value2).toLowerCase();
			if (str1 < str2)
				return -1;
			if (str1 > str2)
				return 1;
			return 0;
		}

	}

}

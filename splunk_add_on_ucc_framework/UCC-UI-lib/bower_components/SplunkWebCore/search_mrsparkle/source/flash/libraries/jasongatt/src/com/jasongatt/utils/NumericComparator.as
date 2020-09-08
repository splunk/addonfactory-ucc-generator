package com.jasongatt.utils
{

	public class NumericComparator implements IComparator
	{

		// Constructor

		public function NumericComparator()
		{
		}

		// Public Methods

		public function compare(value1:*, value2:*) : Number
		{
			var num1:Number = NumberUtil.parseNumber(value1);
			var num2:Number = NumberUtil.parseNumber(value2);
			if (num1 < num2)
				return -1;
			if (num1 > num2)
				return 1;
			return 0;
		}

	}

}

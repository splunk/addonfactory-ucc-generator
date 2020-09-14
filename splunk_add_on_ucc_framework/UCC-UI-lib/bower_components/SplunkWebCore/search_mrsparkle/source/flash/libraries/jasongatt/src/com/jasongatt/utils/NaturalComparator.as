package com.jasongatt.utils
{

	public class NaturalComparator implements IComparator
	{

		// Constructor

		public function NaturalComparator()
		{
		}

		// Public Methods

		public function compare(value1:*, value2:*) : Number
		{
			if (value1 < value2)
				return -1;
			if (value1 > value2)
				return 1;
			return 0;
		}

	}

}

package com.jasongatt.utils
{

	public class ReverseComparator implements IComparator
	{

		// Private Properties

		private var _comparator:IComparator;

		// Constructor

		public function ReverseComparator(comparator:IComparator = null)
		{
			this._comparator = comparator;
		}

		// Public Getters/Setters

		public function get comparator() : IComparator
		{
			return this._comparator;
		}
		public function set comparator(value:IComparator) : void
		{
			this._comparator = value;
		}

		// Public Methods

		public function compare(value1:*, value2:*) : Number
		{
			var comparator:IComparator = this._comparator;
			if (comparator)
				return -comparator.compare(value1, value2);
			return 0;
		}

	}

}

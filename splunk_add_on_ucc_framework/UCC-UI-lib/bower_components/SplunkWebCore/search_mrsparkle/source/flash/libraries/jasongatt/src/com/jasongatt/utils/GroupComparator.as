package com.jasongatt.utils
{

	public class GroupComparator implements IComparator
	{

		// Private Properties

		private var _comparators:Array;

		// Constructor

		public function GroupComparator(comparators:Array = null)
		{
			this._comparators = comparators ? comparators.concat() : new Array();
		}

		// Public Getters/Setters

		public function get comparators() : Array
		{
			return this._comparators.concat();
		}
		public function set comparators(value:Array) : void
		{
			this._comparators = value ? value.concat() : new Array();
		}

		// Public Methods

		public function compare(value1:*, value2:*) : Number
		{
			var comparator:IComparator;
			var result:Number;
			for each (comparator in this._comparators)
			{
				result = comparator.compare(value1, value2);
				if (result != 0)
					return result;
			}
			return 0;
		}

	}

}

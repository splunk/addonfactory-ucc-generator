package com.jasongatt.utils
{

	public class PropertyComparator implements IComparator
	{

		// Private Properties

		private var _propertyName:String;
		private var _comparator:IComparator;

		// Constructor

		public function PropertyComparator(propertyName:String = null, comparator:IComparator = null)
		{
			this._propertyName = propertyName;
			this._comparator = comparator;
		}

		// Public Getters/Setters

		public function get propertyName() : String
		{
			return this._propertyName;
		}
		public function set propertyName(value:String) : void
		{
			this._propertyName = value;
		}

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
			var propertyName:String = this._propertyName;
			var comparator:IComparator = this._comparator;
			if ((propertyName != null) && comparator)
			{
				value1 = (value1 != null) ? value1[propertyName] : null;
				value2 = (value2 != null) ? value2[propertyName] : null;
				return comparator.compare(value1, value2);
			}
			return 0;
		}

	}

}

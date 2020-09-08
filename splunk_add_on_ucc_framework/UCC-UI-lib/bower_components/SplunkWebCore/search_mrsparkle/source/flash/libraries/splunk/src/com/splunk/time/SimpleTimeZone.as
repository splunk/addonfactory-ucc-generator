package com.splunk.time
{

	public class SimpleTimeZone implements ITimeZone
	{

		// Private Properties

		private var _offset:Number;

		// Constructor

		public function SimpleTimeZone(offset:Number = 0)
		{
			this._offset = offset;
		}

		// Public Getters/Setters

		public function get standardOffset() : Number
		{
			return this._offset;
		}

		// Public Methods

		public function getOffset(time:Number) : Number
		{
			return this._offset;
		}

	}

}

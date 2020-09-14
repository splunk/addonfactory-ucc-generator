package com.splunk.time
{

	public class LocalTimeZone implements ITimeZone
	{

		// Constructor

		public function LocalTimeZone()
		{
		}

		// Public Getters/Setters

		public function get standardOffset() : Number
		{
			var date:Date = new Date(0);
			return -date.timezoneOffset * 60;
		}

		// Public Methods

		public function getOffset(time:Number) : Number
		{
			var date:Date = new Date(time * 1000);
			return -date.timezoneOffset * 60;
		}

	}

}

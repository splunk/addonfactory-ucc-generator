package com.splunk.time
{

	public interface ITimeZone
	{

		// Getters/Setters

		function get standardOffset() : Number;

		// Methods

		function getOffset(time:Number) : Number;

	}

}

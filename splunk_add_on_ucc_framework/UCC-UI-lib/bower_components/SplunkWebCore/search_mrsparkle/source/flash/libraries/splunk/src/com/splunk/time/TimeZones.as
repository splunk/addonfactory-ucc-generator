package com.splunk.time
{

	public final class TimeZones
	{

		// Public Static Constants

		public static const LOCAL:ITimeZone = new LocalTimeZone();
		public static const UTC:ITimeZone = new SimpleTimeZone(0);

	}

}

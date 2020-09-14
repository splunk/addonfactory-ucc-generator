package com.splunk.services.events
{

	/**
	 * The ServiceErrorType class defines constants for the values of the
	 * <code>errorType</code> property of the ServiceErrorEvent class.
	 * 
	 * @see ServiceErrorEvent
	 */
	public final class ServiceErrorType
	{

		/**
		 * The error was caused by an IO failure.
		 */
		public static const IO:String = "io";

		/**
		 * The error was caused by a security restriction.
		 */
		public static const SECURITY:String = "security";

		/**
		 * The error was caused by an invalid HTTP status code.
		 */
		public static const HTTP_STATUS:String = "httpStatus";

		/**
		 * The error was caused by a required service not being connected.
		 */
		public static const CONNECTION:String = "connection";

		/**
		 * The error was caused by a data processing failure.
		 */
		public static const DATA:String = "data";

	}

}

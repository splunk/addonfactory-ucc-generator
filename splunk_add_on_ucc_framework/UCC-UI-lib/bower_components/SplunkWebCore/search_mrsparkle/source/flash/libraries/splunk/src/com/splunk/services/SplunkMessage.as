package com.splunk.services
{

	/**
	 * The SplunkMessage class captures message information received from a
	 * SplunkResponse instance.
	 * 
	 * @see SplunkResponse
	 */
	public class SplunkMessage
	{

		// Public Static Constants

		/**
		 * Defines the value of the <code>type</code> property of an
		 * <code>ERROR</code> message object.
		 */
		public static const ERROR:String = "ERROR";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>WARN</code> message object.
		 */
		public static const WARN:String = "WARN";

		/**
		 * Defines the value of the <code>type</code> property of an
		 * <code>INFO</code> message object.
		 */
		public static const INFO:String = "INFO";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>DEBUG</code> message object.
		 */
		public static const DEBUG:String = "DEBUG";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>PERSISTENT</code> message object.
		 */
		public static const PERSISTENT:String = "PERSISTENT";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>SIGNAL</code> message object.
		 */
		public static const SIGNAL:String = "SIGNAL";

		// Private Properties

		private var _type:String;
		private var _message:String;

		// Constructor

		/**
		 * Creates a new SplunkMessage object that contains message information
		 * received from a SplunkResponse instance.
		 * 
		 * @param type The type of the message.
		 * @param message The body of the message.
		 */
		public function SplunkMessage(type:String, message:String)
		{
			this._type = type;
			this._message = message;
		}

		// Public Getters/Setters

		/**
		 * The type of the message.
		 */
		public function get type() : String
		{
			return this._type;
		}

		/**
		 * The body of the message.
		 */
		public function get message() : String
		{
			return this._message;
		}

		// Public Methods

		/**
		 * Returns a String representation of this SplunkMessage object. The
		 * string is in the following format:
		 * 
		 * <p><code>type: message</code></p>
		 * 
		 * @return The string representation of this SplunkMessage object.
		 */
		public function toString() : String
		{
			return this._type + ": " + this._message;
		}

	}

}

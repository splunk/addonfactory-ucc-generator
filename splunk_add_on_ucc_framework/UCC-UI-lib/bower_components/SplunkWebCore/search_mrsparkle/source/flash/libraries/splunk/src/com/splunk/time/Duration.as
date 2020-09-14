package com.splunk.time
{

	/**
	 * The Duration class represents nominal duration information.
	 */
	public class Duration
	{

		// Private Static Constants

		private static const _ISO_DURATION_PATTERN:RegExp = /  P  (?:(\-?\d+(?:\.\d+)?)Y)?  (?:(\-?\d+(?:\.\d+)?)M)?  (?:(\-?\d+(?:\.\d+)?)D)?  (?:T  (?:(\-?\d+(?:\.\d+)?)H)?  (?:(\-?\d+(?:\.\d+)?)M)?  (?:(\-?\d+(?:\.\d+)?)S)?  )?  /x;

		// Public Properties

		/**
		 * The number of years of this Duration object.
		 */
		public var years:Number;

		/**
		 * The number of months of this Duration object.
		 */
		public var months:Number;

		/**
		 * The number of days of this Duration object.
		 */
		public var days:Number;

		/**
		 * The number of hours of this Duration object.
		 */
		public var hours:Number;

		/**
		 * The number of minutes of this Duration object.
		 */
		public var minutes:Number;

		/**
		 * The number of seconds of this Duration object.
		 */
		public var seconds:Number;

		// Constructor

		/**
		 * Creates a new Duration object that holds the specified duration.
		 * 
		 * <p>The Duration() constructor takes up to six parameters (years,
		 * months, ..., seconds) to specify a duration. The duration that the
		 * newly constructed Duration object contains depends on the number, and
		 * data type, of arguments passed.</p>
		 * 
		 * <ul>
		 * <li>If you pass no arguments, the Duration object is assigned a
		 * duration of 0.</li>
		 * <li>If you pass one argument of data type String, and the string
		 * contains a valid ISO-8601 duration, the Duration object is assigned a
		 * duration based on that value.</li>
		 * <li>If you pass one or more arguments of data type Number, the Duration
		 * object is assigned a duration value based on the argument values
		 * passed, which represent the duration's years, months, days, hours,
		 * minutes, and seconds.</li>
		 * </ul>
		 * 
		 * <p>If you pass a string to the Duration class constructor, the string
		 * must be in strict well-formed ISO-8601 format. The following list
		 * indicates the valid formats:</p>
		 * 
		 * <ul>
		 * <li><code>PnYnMnDTnHnMnS</code> (for instance,
		 * <code>"P1Y12M31DT23H59M59.999S"</code>)</li>
		 * </ul>
		 * 
		 * @param yearsOrTimestring A valid ISO-8601 duration string or the number
		 * of years.
		 * @param months The number of months.
		 * @param days The number of days.
		 * @param hours The number of hours.
		 * @param minutes The number of minutes.
		 * @param seconds The number of seconds.
		 */
		public function Duration(yearsOrTimestring:* = null, months:Number = 0, days:Number = 0, hours:Number = 0, minutes:Number = 0, seconds:Number = 0)
		{
			if ((arguments.length == 1) && (yearsOrTimestring is String))
			{
				var matches:Array = Duration._ISO_DURATION_PATTERN.exec(yearsOrTimestring as String) as Array;
				var numMatches:int = matches ? matches.length : 0;
				var match:String;

				match = (numMatches > 1) ? matches[1] : null;
				this.years = match ? Number(match) : 0;

				match = (numMatches > 2) ? matches[2] : null;
				this.months = match ? Number(match) : 0;

				match = (numMatches > 3) ? matches[3] : null;
				this.days = match ? Number(match) : 0;

				match = (numMatches > 4) ? matches[4] : null;
				this.hours = match ? Number(match) : 0;

				match = (numMatches > 5) ? matches[5] : null;
				this.minutes = match ? Number(match) : 0;

				match = (numMatches > 6) ? matches[6] : null;
				this.seconds = match ? Number(match) : 0;
			}
			else
			{
				this.years = (yearsOrTimestring is Number) ? yearsOrTimestring : 0;
				this.months = months;
				this.days = days;
				this.hours = hours;
				this.minutes = minutes;
				this.seconds = seconds;
			}
		}

		// Public Methods

		/**
		 * Creates a copy of this Duration object.
		 * 
		 * @return The new Duration object.
		 */
		public function clone() : Duration
		{
			return new Duration(this.years, this.months, this.days, this.hours, this.minutes, this.seconds);
		}

		/**
		 * Determines whether two Duration objects are equal. Two Duration objects
		 * are equal if they have the same property values.
		 * 
		 * @param toCompare The Duration object to be compared.
		 * 
		 * @return <code>true</code> if the object is equal to this Duration
		 * object; <code>false</code> if it is not equal.
		 */
		public function equals(toCompare:Duration) : Boolean
		{
			return ((this.years == toCompare.years) &&
			        (this.months == toCompare.months) &&
			        (this.days == toCompare.days) &&
			        (this.hours == toCompare.hours) &&
			        (this.minutes == toCompare.minutes) &&
			        (this.seconds == toCompare.seconds));
		}

		/**
		 * Returns a String representation of this Duration object. The format for
		 * the output is:
		 * 
		 * <p><code>PnYnMnDTnHnMnS</code></p>
		 * 
		 * <p>For example:</p>
		 * 
		 * <p><code>P1Y12M31DT23H59M59.999S</code></p>
		 * 
		 * @return The string representation of this Duration object.
		 */
		public function toString() : String
		{
			var str:String = "";
			str += "P" + this.years + "Y" + this.months + "M" + this.days + "D";
			str += "T" + this.hours + "H" + this.minutes + "M" + this.seconds + "S";
			return str;
		}

	}

}

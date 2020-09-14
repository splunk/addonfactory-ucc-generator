package com.splunk.time
{

	/**
	 * The DateTime class represents date, time, and time zone information.
	 * Unlike the native Flash Date class, which operates in the local time zone
	 * setting on the operating system that is running Flash Player, this class
	 * lets you perform date and time operations relative to any time zone.
	 * 
	 * <p>The DateTime class conforms more closely to ISO-8601 and therefore has
	 * some differences from the native Flash Date class.</p>
	 * 
	 * <ul>
	 * <li>It is a seconds-based system as opposed to a milliseconds-based
	 * system.</li>
	 * <li>The <code>milliseconds</code> property has been removed in favor of
	 * allowing fractional values for the <code>seconds</code> property.</li>
	 * <li>The <code>time</code> property is seconds-based instead of
	 * milliseconds-based.</li>
	 * <li>The <code>timezoneOffset</code> property has been renamed to
	 * <code>timeZoneOffset</code> and, instead of being an offset from local
	 * time in minutes, it is an offset from UTC in seconds.</li>
	 * <li>The <code>month</code> property ranges from 1 to 12 instead of 0 to
	 * 11.</li>
	 * <li>The <code>day</code> property has been renamed to
	 * <code>weekday</code>.</li>
	 * <li>The <code>date</code> property has been renamed to
	 * <code>day</code>.</li>
	 * <li>All properties can be assigned fractional values to support
	 * computations of arbitrary precision.</li>
	 * </ul>
	 */
	public class DateTime
	{

		// Private Static Constants

		private static const _ISO_DATE_TIME_PATTERN:RegExp = /  ([\+\-])?  (\d{4,})  (?:  (?:\-(\d{2}))  (?:  (?:\-(\d{2}))  (?:  (?:[T ](\d{2}))  (?:  (?:\:(\d{2}))  (?:  (?:\:(\d{2}(?:\.\d+)?))  )?  )?  (?:  (Z)  |  ([\+\-])(\d{2})  (?:\:(\d{2}))?  )?  )?  )?  )?  /x;

		// Private Properties

		private var _year:Number = 0;
		private var _month:Number = 1;
		private var _day:Number = 1;
		private var _weekday:Number = 0;
		private var _hours:Number = 0;
		private var _minutes:Number = 0;
		private var _seconds:Number = 0;
		private var _timeZone:ITimeZone = TimeZones.LOCAL;
		private var _timeZoneOffset:Number = 0;
		private var _time:Number = 0;

		private var _isValid:Boolean = true;

		// Constructor

		/**
		 * Creates a new DateTime object that holds the specified date, time, and
		 * time zone.
		 * 
		 * <p>The DateTime() constructor takes up to seven parameters (year,
		 * month, ..., timeZone) to specify a date, time, and time zone. The date
		 * that the newly constructed DateTime object contains depends on the
		 * number, and data type, of arguments passed.</p>
		 * 
		 * <ul>
		 * <li>If you pass no arguments, the DateTime object is assigned the
		 * current local date, time, and time zone.</li>
		 * <li>If you pass one argument of data type Number, the DateTime object
		 * is assigned a time value based on the number of seconds since
		 * January 1, 1970 0:00:000 GMT, as specified by the lone argument.</li>
		 * <li>If you pass one argument of data type String, and the string
		 * contains a valid ISO-8601 date, the DateTime object is assigned a time
		 * value based on that date.</li>
		 * <li>If you pass two or more arguments, the DateTime object is assigned
		 * a time value based on the argument values passed, which represent the
		 * date's year, month, day, hours, minutes, seconds, and time zone.</li>
		 * </ul>
		 * 
		 * <p>If you pass a string to the DateTime class constructor, the string
		 * must be in strict well-formed ISO-8601 format. The following list
		 * indicates the valid formats:</p>
		 * 
		 * <ul>
		 * <li><code>YYYY-MM-DDTHH:MM:SS.MMM-HH:MM</code> (for instance,
		 * <code>"2005-07-01T00:00:00.000-07:00"</code>)</li>
		 * <li><code>YYYY-MM-DD HH:MM:SS.MMM-HH:MM</code> (for instance,
		 * <code>"2005-07-01 00:00:00.000-07:00"</code>)</li>
		 * <li><code>YYYY-MM-DDTHH:MM:SS.MMMZ</code> (for instance,
		 * <code>"2005-07-01T00:00:00.000Z"</code>)</li>
		 * </ul>
		 * 
		 * @param yearOrTimevalue If other parameters are specified, this number
		 * represents a year (such as 1965); otherwise, it represents a time
		 * value. If the number represents a year, all four digits of the year
		 * must be specified. If the number represents a time value (no other
		 * parameters are specified), it is the number of seconds before or after
		 * 0:00:00 GMT January 1, 1970; a negative value represents a time before
		 * 0:00:00 GMT January 1, 1970, and a positive value represents a time
		 * after.
		 * @param month A number from 1 (January) to 12 (December).
		 * @param day A number from 1 to 31.
		 * @param hours A number from 0 (midnight) to 23 (11 p.m.).
		 * @param minutes A number from 0 to 59.
		 * @param seconds A number from 0 to 59.
		 * @param timeZone A time zone, represented by an
		 * <code>ITimeZone</code> object.
		 */
		public function DateTime(yearOrTimevalue:Object = null, month:Number = 1, day:Number = 1, hours:Number = 0, minutes:Number = 0, seconds:Number = 0, timeZone:ITimeZone = null)
		{
			switch (arguments.length)
			{
				case 0:
					var now:Date = new Date();
					this._time = now.time / 1000;
					this._updateProperties();
					break;
				case 1:
					if (yearOrTimevalue is Number)
					{
						this._time = yearOrTimevalue as Number;
						this._updateProperties();
					}
					else if (yearOrTimevalue is String)
					{
						var matches:Array = DateTime._ISO_DATE_TIME_PATTERN.exec(yearOrTimevalue as String) as Array;
						var numMatches:int = matches ? matches.length : 0;
						var match:String;

						match = (numMatches > 1) ? matches[1] : null;
						var yearSign:Number = (match == "-") ? -1 : 1;

						match = (numMatches > 2) ? matches[2] : null;
						this._year = match ? yearSign * Number(match) : 0;

						match = (numMatches > 3) ? matches[3] : null;
						this._month = match ? Number(match) : 1;

						match = (numMatches > 4) ? matches[4] : null;
						this._day = match ? Number(match) : 1;

						match = (numMatches > 5) ? matches[5] : null;
						this._hours = match ? Number(match) : 0;

						match = (numMatches > 6) ? matches[6] : null;
						this._minutes = match ? Number(match) : 0;

						match = (numMatches > 7) ? matches[7] : null;
						this._seconds = match ? Number(match) : 0;

						match = (numMatches > 8) ? matches[8] : null;
						var timeZoneUTC:Boolean = (match == "Z");

						match = (numMatches > 9) ? matches[9] : null;
						var timeZoneSign:Number = (match == "-") ? -1 : 1;

						match = (numMatches > 10) ? matches[10] : null;
						var timeZoneHours:Number = match ? Number(match) : NaN;

						match = (numMatches > 11) ? matches[11] : null;
						var timeZoneMinutes:Number = match ? Number(match) : NaN;

						if (timeZoneUTC)
							this._timeZone = TimeZones.UTC;
						else if ((timeZoneHours == timeZoneHours) && (timeZoneMinutes == timeZoneMinutes))
							this._timeZone = new SimpleTimeZone(timeZoneSign * (timeZoneHours * 60 + timeZoneMinutes) * 60);
						else
							this._timeZone = TimeZones.LOCAL;

						this._updateTime();
					}
					else
					{
						this._time = NaN;
						this._updateProperties();
					}
					break;
				default:
					if (yearOrTimevalue is Number)
					{
						this._year = yearOrTimevalue as Number;
						this._month = month;
						this._day = day;
						this._hours = hours;
						this._minutes = minutes;
						this._seconds = seconds;
						this._timeZone = timeZone ? timeZone : TimeZones.LOCAL;
						this._updateTime();
					}
					else
					{
						this._time = NaN;
						this._updateProperties();
					}
					break;
			}
		}

		// Public Getters/Setters

		/**
		 * The four-digit year (a number, such as 2000) of this DateTime object
		 * according to the time zone specified by <code>timeZone</code>.
		 */
		public function get year() : Number
		{
			return this._year;
		}
		public function set year(value:Number) : void
		{
			this._year = value;
			this._updateTime();
		}

		/**
		 * The month (1 for January, 2 for February, and so on) of this DateTime
		 * object according to the time zone specified by
		 * <code>timeZone</code>.
		 * 
		 * <p><b>Note:</b> This value differs from the value of
		 * <code>Date.month</code> (0 for January, 1 for February, and so on).</p>
		 */
		public function get month() : Number
		{
			return this._month;
		}
		public function set month(value:Number) : void
		{
			this._month = value;
			this._updateTime();
		}

		/**
		 * The day of the month (a number from 1 to 31) of this DateTime object
		 * according to the time zone specified by <code>timeZone</code>.
		 * 
		 * <p><b>Note:</b> This property is equivalent to <code>Date.date</code>.
		 * The <code>weekday</code> property is equivalent to
		 * <code>Date.day</code>.</p>
		 * 
		 * @see #weekday
		 */
		public function get day() : Number
		{
			return this._day;
		}
		public function set day(value:Number) : void
		{
			this._day = value;
			this._updateTime();
		}

		/**
		 * The day of the week (0 for Sunday, 1 for Monday, and so on) of this
		 * DateTime object according to the time zone specified by
		 * <code>timeZone</code>.
		 * 
		 * <p><b>Note:</b> This property is equivalent to
		 * <code>Date.day</code>.</p>
		 */
		public function get weekday() : Number
		{
			return this._weekday;
		}

		/**
		 * The hour (a number from 0 to 23) of the day of this DateTime object
		 * according to the time zone specified by <code>timeZone</code>.
		 */
		public function get hours() : Number
		{
			return this._hours;
		}
		public function set hours(value:Number) : void
		{
			this._hours = value;
			this._updateTime();
		}

		/**
		 * The minutes (a number from 0 to 59) portion of this DateTime object
		 * according to the time zone specified by <code>timeZone</code>.
		 */
		public function get minutes() : Number
		{
			return this._minutes;
		}
		public function set minutes(value:Number) : void
		{
			this._minutes = value;
			this._updateTime();
		}

		/**
		 * The seconds (a number from 0 to 59) portion of this DateTime object
		 * according to the time zone specified by <code>timeZone</code>.
		 */
		public function get seconds() : Number
		{
			return this._seconds;
		}
		public function set seconds(value:Number) : void
		{
			this._seconds = value;
			this._updateTime();
		}

		/**
		 * The time zone of this DateTime object, represented by an <code>ITimeZone</code> object.
		 */
		public function get timeZone() : ITimeZone
		{
			return this._timeZone;
		}
		public function set timeZone(value:ITimeZone) : void
		{
			this._timeZone = value ? value : TimeZones.LOCAL;
			this._updateTime();
		}

		/**
		 * The difference, in seconds, between the time represented by this
		 * DateTime object and universal time (UTC). Specifically, this value is
		 * the number of seconds you need to add to universal time (UTC) to equal
		 * the time represented by this DateTime object.
		 * 
		 * <p><b>Note:</b> This value conforms to ISO-8601 and differs from the
		 * value of <code>Date.timezoneOffset</code> (the number of minutes you
		 * need to add to the computer's local time to equal UTC).</p>
		 */
		public function get timeZoneOffset() : Number
		{
			return this._timeZoneOffset;
		}

		/**
		 * The number of seconds since midnight January 1, 1970, universal time,
		 * for this DateTime object.
		 * 
		 * <p><b>Note:</b> This value differs from the value of
		 * <code>Date.time</code> (the number of milliseconds since midnight
		 * January 1, 1970, universal time).</p>
		 */
		public function get time() : Number
		{
			return this._time;
		}
		public function set time(value:Number) : void
		{
			this._time = value;
			this._updateProperties();
		}

		// Public Methods

		/**
		 * Creates a DateTime object equivalent to this DateTime object in
		 * universal time (UTC).
		 * 
		 * @return A new DateTime object in universal time (UTC).
		 */
		public function toUTC() : DateTime
		{
			return this.toTimeZone(TimeZones.UTC);
		}

		/**
		 * Creates a DateTime object equivalent to this DateTime object in local
		 * time.
		 * 
		 * @return A new DateTime object in local time.
		 */
		public function toLocal() : DateTime
		{
			return this.toTimeZone(TimeZones.LOCAL);
		}

		/**
		 * Creates a DateTime object equivalent to this DateTime object in the
		 * given time zone.
		 * 
		 * @param timeZone The time zone, represented by an <code>ITimeZone</code>
		 * object, to convert to.
		 * 
		 * @return A new DateTime object in the given time zone.
		 */
		public function toTimeZone(timeZone:ITimeZone) : DateTime
		{
			var date:DateTime = new DateTime();
			date.timeZone = timeZone;
			date.time = this._time;
			return date;
		}

		/**
		 * Creates a copy of this DateTime object.
		 * 
		 * @return The new DateTime object.
		 */
		public function clone() : DateTime
		{
			var date:DateTime = new DateTime();
			date.timeZone = this._timeZone;
			date.time = this._time;
			return date;
		}

		/**
		 * Determines whether two DateTime objects are equal. Two DateTime objects
		 * are equal if they have the same <code>time</code> and
		 * <code>timeZoneOffset</code>.
		 * 
		 * @param toCompare The DateTime object to be compared.
		 * 
		 * @return <code>true</code> if the object is equal to this DateTime
		 * object; <code>false</code> if it is not equal.
		 */
		public function equals(toCompare:DateTime) : Boolean
		{
			return ((this._time == toCompare._time) && (this._timeZoneOffset == toCompare._timeZoneOffset));
		}

		/**
		 * Returns a String representation of this DateTime object. The date
		 * format for the output is:
		 * 
		 * <p><code>YYYY-MM-DDTHH:MM:SS.MMM-HH:MM</code></p>
		 * 
		 * <p>For example:</p>
		 * 
		 * <p><code>2005-07-01T00:00:00.000-07:00</code></p>
		 * 
		 * @return The string representation of this DateTime object.
		 */
		public function toString() : String
		{
			if (!this._isValid)
				return "Invalid Date";

			var str:String = "";
			if (this._year < 0)
				str += "-" + this._pad(-this._year, 4);
			else
				str += this._pad(this._year, 4);
			str += "-" + this._pad(this._month, 2) + "-" + this._pad(this._day, 2);
			str += "T" + this._pad(this._hours, 2) + ":" + this._pad(this._minutes, 2) + ":" + this._pad(this._seconds, 2, 3);

			var timeZoneOffset:Number = this._timeZoneOffset / 60;
			if (timeZoneOffset == 0)
			{
				str += "Z";
			}
			else
			{
				if (timeZoneOffset < 0)
					str += "-";
				else
					str += "+";
				if (timeZoneOffset < 0)
					timeZoneOffset = -timeZoneOffset;
				var timeZoneHours:Number = Math.floor(timeZoneOffset / 60);
				var timeZoneMinutes:Number = Math.floor(timeZoneOffset % 60);
				str += this._pad(timeZoneHours, 2) + ":" + this._pad(timeZoneMinutes, 2);
			}

			return str;
		}

		/**
		 * Returns the number of seconds since midnight January 1, 1970, universal
		 * time, for this DateTime object.
		 * 
		 * @return The number of seconds since January 1, 1970 that this DateTime
		 * object represents.
		 */
		public function valueOf() : Number
		{
			return this._time;
		}

		// Private Methods

		private function _updateTime() : void
		{
			if (this._validate())
			{
				var years:Number = this._year;
				var months:Number = this._month - 1;
				var days:Number = this._day - 1;
				var hours:Number = this._hours;
				var minutes:Number = this._minutes;
				var seconds:Number = this._seconds;

				var secondsPerMinute:Number = 60;
				var secondsPerHour:Number = secondsPerMinute * 60;
				var secondsPerDay:Number = secondsPerHour * 24;

				var totalMonths:Number = months + years * 12;
				var wholeMonths:Number = Math.floor(totalMonths);
				var subMonths:Number = totalMonths - wholeMonths;

				var totalSeconds:Number = seconds + (minutes * secondsPerMinute) + (hours * secondsPerHour) + (days * secondsPerDay);
				var wholeSeconds:Number = Math.floor(totalSeconds);
				var subSeconds:Number = totalSeconds - wholeSeconds;

				var date:Date = new Date(0);
				date.fullYearUTC = 0;
				date.monthUTC = wholeMonths;

				if (subMonths != 0)
				{
					date.monthUTC++;
					date.dateUTC = 0;

					var monthsTotalSeconds:Number = date.dateUTC * subMonths * secondsPerDay;
					var monthsWholeSeconds:Number = Math.floor(monthsTotalSeconds);
					var monthsSubSeconds:Number = monthsTotalSeconds - monthsWholeSeconds;

					wholeSeconds += monthsWholeSeconds;
					subSeconds += monthsSubSeconds;
					if (subSeconds >= 1)
					{
						subSeconds--;
						wholeSeconds++;
					}

					date.dateUTC = 1;
				}

				date.secondsUTC = wholeSeconds;

				var time:Number = (date.time / 1000) + subSeconds;
				var timeZone:ITimeZone = this._timeZone;

				this._time = time - timeZone.getOffset(time - timeZone.standardOffset);

				this._updateProperties();
			}
		}

		private function _updateProperties() : void
		{
			if (this._validate())
			{
				var time:Number = this._normalizePrecision(this._time);
				var timeZoneOffset:Number = this._normalizePrecision(this._timeZone.getOffset(time));

				var totalSeconds:Number = time + timeZoneOffset;
				var wholeSeconds:Number = Math.floor(totalSeconds);
				var subSeconds:Number = this._normalizePrecision(totalSeconds - wholeSeconds);
				if (subSeconds >= 1)
				{
					subSeconds = 0;
					wholeSeconds++;
				}

				var date:Date = new Date(wholeSeconds * 1000);

				this._year = date.fullYearUTC;
				this._month = date.monthUTC + 1;
				this._day = date.dateUTC;
				this._weekday = date.dayUTC;
				this._hours = date.hoursUTC;
				this._minutes = date.minutesUTC;
				this._seconds = date.secondsUTC + subSeconds;

				this._time = time;
				this._timeZoneOffset = timeZoneOffset;

				this._validate();
			}
		}

		private function _validate() : Boolean
		{
			if (this._isValid)
			{
				var checksum:Number = this._year + this._month + this._day + this._weekday + this._hours + this._minutes + this._seconds + this._timeZoneOffset + this._time;
				if ((checksum != checksum) || (checksum == Infinity) || (checksum == -Infinity) || !this._timeZone)
					this._isValid = false;
			}
			else
			{
				if ((this._year == this._year) && (this._year != Infinity) && (this._year != -Infinity))
				{
					this._month = 1;
					this._day = 1;
					this._hours = 0;
					this._minutes = 0;
					this._seconds = 0;
					this._isValid = true;
				}
				else if ((this._time == this._time) && (this._time != Infinity) && (this._time != -Infinity))
				{
					this._isValid = true;
				}
			}

			if (!this._isValid)
			{
				this._year = NaN;
				this._month = NaN;
				this._day = NaN;
				this._weekday = NaN;
				this._hours = NaN;
				this._minutes = NaN;
				this._seconds = NaN;
				this._timeZoneOffset = NaN;
				this._time = NaN;
			}

			return this._isValid;
		}

		private function _normalizePrecision(value:Number) : Number
		{
			return Number(value.toFixed(6));
		}

		private function _pad(value:Number, digits:int = 0, fractionDigits:int = 0) : String
		{
			if (value != value)
				return "NaN";
			if (value == Infinity)
				return "Infinity";
			if (value == -Infinity)
				return "-Infinity";

			var str:String = value.toFixed(20);

			var decimalIndex:int = str.indexOf(".");
			if (decimalIndex < 0)
				decimalIndex = str.length;
			else if (fractionDigits < 1)
				str = str.substring(0, decimalIndex);
			else
				str = str.substring(0, decimalIndex) + "." + str.substring(decimalIndex + 1, decimalIndex + fractionDigits + 1);

			for (var i:int = decimalIndex; i < digits; i++)
				str = "0" + str;

			return str;
		}

	}

}

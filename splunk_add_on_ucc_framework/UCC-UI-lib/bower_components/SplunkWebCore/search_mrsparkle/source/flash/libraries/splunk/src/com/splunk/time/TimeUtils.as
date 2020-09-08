package com.splunk.time
{

	public final class TimeUtils
	{

		// Public Static Constants

		public static const EPOCH:DateTime = new DateTime(0).toUTC();

		// Public Static Methods

		public static function daysInMonth(date:DateTime) : Number
		{
			date = new DateTime(date.year, date.month + 1, 0, 0, 0, 0, TimeZones.UTC);
			return date.day;
		}

		public static function addDurations(duration1:Duration, duration2:Duration) : Duration
		{
			return new Duration(duration1.years + duration2.years, duration1.months + duration2.months, duration1.days + duration2.days, duration1.hours + duration2.hours, duration1.minutes + duration2.minutes, duration1.seconds + duration2.seconds);
		}

		public static function addDateDuration(date:DateTime, duration:Duration) : DateTime
		{
			if ((duration.years == 0) && (duration.months == 0) && (duration.days == 0))
				date = date.clone();
			else
				date = new DateTime(date.year + duration.years, date.month + duration.months, date.day + duration.days, date.hours, date.minutes, date.seconds, date.timeZone);
			date.time += (duration.hours * 3600 + duration.minutes * 60 + duration.seconds);
			return date;
		}

		public static function subtractDates(date1:DateTime, date2:DateTime) : Duration
		{
			date2 = date2.toTimeZone(date1.timeZone);

			var isNegative:Boolean = (date1.time < date2.time);
			if (isNegative)
			{
				var temp:DateTime = date1;
				date1 = date2;
				date2 = temp;
			}

			var sameTimeZoneOffset:Boolean = (date1.timeZoneOffset == date2.timeZoneOffset);

			var years:Number;
			var months:Number;
			var days:Number;
			var hours:Number;
			var minutes:Number;
			var seconds:Number;

			var date3:DateTime;
			if (sameTimeZoneOffset)
			{
				date3 = date1;
			}
			else if ((date1.year == date2.year) && (date1.month == date2.month) && (date1.day == date2.day))
			{
				date3 = date2;
			}
			else
			{
				date3 = new DateTime(date1.year, date1.month, date1.day, date2.hours, date2.minutes, date2.seconds, date2.timeZone);
				if (date3.time > date1.time)
				{
					date3 = new DateTime(date1.year, date1.month, date1.day - 1, date2.hours, date2.minutes, date2.seconds, date2.timeZone);
					if ((date3.time < date2.time) || ((date3.year == date2.year) && (date3.month == date2.month) && (date3.day == date2.day)))
						date3 = date2;
				}
			}

			years = date3.year - date2.year;
			months = date3.month - date2.month;
			days = date3.day - date2.day;

			if (sameTimeZoneOffset)
			{
				hours = date3.hours - date2.hours;
				minutes = date3.minutes - date2.minutes;
				seconds = date3.seconds - date2.seconds;

				if (seconds < 0)
				{
					seconds += 60;
					minutes--;
				}

				if (minutes < 0)
				{
					minutes += 60;
					hours--;
				}

				if (hours < 0)
				{
					hours += 24;
					days--;
				}

				seconds = TimeUtils._normalizePrecision(seconds);
			}
			else
			{
				seconds = date1.time - date3.time;
				var wholeSeconds:Number = Math.floor(seconds);
				var subSeconds:Number = TimeUtils._normalizePrecision(seconds - wholeSeconds);
				if (subSeconds >= 1)
				{
					subSeconds = 0;
					wholeSeconds++;
				}

				minutes = Math.floor(wholeSeconds / 60);
				seconds = (wholeSeconds % 60) + subSeconds;

				hours = Math.floor(minutes / 60);
				minutes %= 60;
			}

			if (days < 0)
			{
				date3 = new DateTime(date2.year, date2.month + 1, 0, 0, 0, 0, TimeZones.UTC);
				days += date3.day;
				months--;
			}

			if (months < 0)
			{
				months += 12;
				years--;
			}

			if (isNegative)
			{
				years = -years;
				months = -months;
				days = -days;
				hours = -hours;
				minutes = -minutes;
				seconds = -seconds;
			}

			return new Duration(years, months, days, hours, minutes, seconds);
		}

		public static function subtractDurations(duration1:Duration, duration2:Duration) : Duration
		{
			return new Duration(duration1.years - duration2.years, duration1.months - duration2.months, duration1.days - duration2.days, duration1.hours - duration2.hours, duration1.minutes - duration2.minutes, duration1.seconds - duration2.seconds);
		}

		public static function subtractDateDuration(date:DateTime, duration:Duration) : DateTime
		{
			if ((duration.years == 0) && (duration.months == 0) && (duration.days == 0))
				date = date.clone();
			else
				date = new DateTime(date.year - duration.years, date.month - duration.months, date.day - duration.days, date.hours, date.minutes, date.seconds, date.timeZone);
			date.time -= (duration.hours * 3600 + duration.minutes * 60 + duration.seconds);
			return date;
		}

		public static function multiplyDuration(duration:Duration, scalar:Number) : Duration
		{
			return new Duration(duration.years * scalar, duration.months * scalar, duration.days * scalar, duration.hours * scalar, duration.minutes * scalar, duration.seconds * scalar);
		}

		public static function divideDuration(duration:Duration, scalar:Number) : Duration
		{
			return new Duration(duration.years / scalar, duration.months / scalar, duration.days / scalar, duration.hours / scalar, duration.minutes / scalar, duration.seconds / scalar);
		}

		public static function ceilDate(date:DateTime, units:Duration) : DateTime
		{
			var date2:DateTime = date.toTimeZone(new SimpleTimeZone(date.timeZoneOffset));
			TimeUtils._ceilDateInternal(date2, units);
			return TimeUtils._toTimeZoneStable(date2, date.timeZone);
		}

		public static function ceilDuration(duration:Duration, units:Duration = null, referenceDate:DateTime = null) : Duration
		{
			if (!referenceDate)
				referenceDate = TimeUtils.EPOCH;

			var date:DateTime = TimeUtils.addDateDuration(referenceDate, duration);
			var isNegative:Boolean = (date.time < referenceDate.time);
			duration = isNegative ? TimeUtils.subtractDates(referenceDate, date) : TimeUtils.subtractDates(date, referenceDate);

			if (!units)
			{
				units = new Duration();
				if (duration.years > 0)
					units.years = 1;
				else if (duration.months > 0)
					units.months = 1;
				else if (duration.days > 0)
					units.days = 1;
				else if (duration.hours > 0)
					units.hours = 1;
				else if (duration.minutes > 0)
					units.minutes = 1;
				else if (duration.seconds > 0)
					units.seconds = 1;
			}

			if (isNegative)
			{
				TimeUtils._floorDurationInternal(duration, units, date);
				return TimeUtils.multiplyDuration(duration, -1);
			}

			TimeUtils._ceilDurationInternal(duration, units, referenceDate);
			return duration;
		}

		public static function floorDate(date:DateTime, units:Duration) : DateTime
		{
			var date2:DateTime = date.toTimeZone(new SimpleTimeZone(date.timeZoneOffset));
			TimeUtils._floorDateInternal(date2, units);
			return TimeUtils._toTimeZoneStable(date2, date.timeZone);
		}

		public static function floorDuration(duration:Duration, units:Duration = null, referenceDate:DateTime = null) : Duration
		{
			if (!referenceDate)
				referenceDate = TimeUtils.EPOCH;

			var date:DateTime = TimeUtils.addDateDuration(referenceDate, duration);
			var isNegative:Boolean = (date.time < referenceDate.time);
			duration = isNegative ? TimeUtils.subtractDates(referenceDate, date) : TimeUtils.subtractDates(date, referenceDate);

			if (!units)
			{
				units = new Duration();
				if (duration.years > 0)
					units.years = 1;
				else if (duration.months > 0)
					units.months = 1;
				else if (duration.days > 0)
					units.days = 1;
				else if (duration.hours > 0)
					units.hours = 1;
				else if (duration.minutes > 0)
					units.minutes = 1;
				else if (duration.seconds > 0)
					units.seconds = 1;
			}

			if (isNegative)
			{
				TimeUtils._ceilDurationInternal(duration, units, date);
				return TimeUtils.multiplyDuration(duration, -1);
			}

			TimeUtils._floorDurationInternal(duration, units, referenceDate);
			return duration;
		}

		public static function roundDate(date:DateTime, units:Duration) : DateTime
		{
			var date2:DateTime = date.toTimeZone(new SimpleTimeZone(date.timeZoneOffset));
			TimeUtils._roundDateInternal(date2, units);
			return TimeUtils._toTimeZoneStable(date2, date.timeZone);
		}

		public static function roundDuration(duration:Duration, units:Duration = null, referenceDate:DateTime = null) : Duration
		{
			if (!referenceDate)
				referenceDate = TimeUtils.EPOCH;

			var date:DateTime = TimeUtils.addDateDuration(referenceDate, duration);
			var isNegative:Boolean = (date.time < referenceDate.time);
			duration = isNegative ? TimeUtils.subtractDates(referenceDate, date) : TimeUtils.subtractDates(date, referenceDate);

			if (!units)
			{
				units = new Duration();
				if (duration.years > 0)
					units.years = 1;
				else if (duration.months > 0)
					units.months = 1;
				else if (duration.days > 0)
					units.days = 1;
				else if (duration.hours > 0)
					units.hours = 1;
				else if (duration.minutes > 0)
					units.minutes = 1;
				else if (duration.seconds > 0)
					units.seconds = 1;
			}

			if (isNegative)
			{
				TimeUtils._roundDurationInternal(duration, units, date);
				return TimeUtils.multiplyDuration(duration, -1);
			}

			TimeUtils._roundDurationInternal(duration, units, referenceDate);
			return duration;
		}

		public static function normalizeDuration(duration:Duration, referenceDate:DateTime = null) : Duration
		{
			if (!referenceDate)
				referenceDate = TimeUtils.EPOCH;

			var date:DateTime = TimeUtils.addDateDuration(referenceDate, duration);
			return TimeUtils.subtractDates(date, referenceDate);
		}

		public static function durationToSeconds(duration:Duration, referenceDate:DateTime = null) : Number
		{
			if (!referenceDate)
				referenceDate = TimeUtils.EPOCH;

			var date:DateTime = TimeUtils.addDateDuration(referenceDate, duration);
			return TimeUtils._normalizePrecision(date.time - referenceDate.time);
		}

		public static function secondsToDuration(seconds:Number, referenceDate:DateTime = null) : Duration
		{
			if (!referenceDate)
				referenceDate = TimeUtils.EPOCH;

			var date:DateTime = new DateTime(referenceDate.time + seconds).toTimeZone(referenceDate.timeZone);
			return TimeUtils.subtractDates(date, referenceDate);
		}

		// Private Static Methods

		private static function _ceilDateInternal(date:DateTime, units:Duration) : void
		{
			var ceilYear:Boolean = (units.years > 0);
			var ceilMonth:Boolean = ceilYear || (units.months > 0);
			var ceilDay:Boolean = ceilMonth || (units.days > 0);
			var ceilHours:Boolean = ceilDay || (units.hours > 0);
			var ceilMinutes:Boolean = ceilHours || (units.minutes > 0);
			var ceilSeconds:Boolean = ceilMinutes || (units.seconds > 0);

			if (!ceilSeconds)
				return;

			if (date.seconds > 0)
			{
				if (units.seconds > 0)
					date.seconds = Math.min(Math.ceil(date.seconds / units.seconds) * units.seconds, 60);
				else
					date.seconds = 60;
			}

			if (!ceilMinutes)
				return;

			if (date.minutes > 0)
			{
				if (units.minutes > 0)
					date.minutes = Math.min(Math.ceil(date.minutes / units.minutes) * units.minutes, 60);
				else
					date.minutes = 60;
			}

			if (!ceilHours)
				return;

			if (date.hours > 0)
			{
				if (units.hours > 0)
					date.hours = Math.min(Math.ceil(date.hours / units.hours) * units.hours, 24);
				else
					date.hours = 24;
			}

			if (!ceilDay)
				return;

			if (date.day > 1)
			{
				var daysInMonth:Number = TimeUtils.daysInMonth(date);
				if (units.days > 0)
					date.day = Math.min(Math.ceil((date.day - 1) / units.days) * units.days, daysInMonth) + 1;
				else
					date.day = daysInMonth + 1;
			}

			if (!ceilMonth)
				return;

			if (date.month > 1)
			{
				if (units.months > 0)
					date.month = Math.min(Math.ceil((date.month - 1) / units.months) * units.months, 12) + 1;
				else
					date.month = 12 + 1;
			}

			if (!ceilYear)
				return;

			if (units.years > 0)
				date.year = Math.ceil(date.year / units.years) * units.years;
		}

		private static function _ceilDurationInternal(duration:Duration, units:Duration, referenceDate:DateTime) : void
		{
			var ceilYears:Boolean = (units.years > 0);
			var ceilMonths:Boolean = ceilYears || (units.months > 0);
			var ceilDays:Boolean = ceilMonths || (units.days > 0);
			var ceilHours:Boolean = ceilDays || (units.hours > 0);
			var ceilMinutes:Boolean = ceilHours || (units.minutes > 0);
			var ceilSeconds:Boolean = ceilMinutes || (units.seconds > 0);

			var daysInMonth:Number = TimeUtils.daysInMonth(referenceDate);

			if (!ceilSeconds)
				return;

			if (duration.seconds > 0)
			{
				if (units.seconds > 0)
					duration.seconds = Math.min(Math.ceil(duration.seconds / units.seconds) * units.seconds, 60);
				else
					duration.seconds = 60;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!ceilMinutes)
				return;

			if (duration.minutes > 0)
			{
				if (units.minutes > 0)
					duration.minutes = Math.min(Math.ceil(duration.minutes / units.minutes) * units.minutes, 60);
				else
					duration.minutes = 60;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!ceilHours)
				return;

			if (duration.hours > 0)
			{
				if (units.hours > 0)
					duration.hours = Math.min(Math.ceil(duration.hours / units.hours) * units.hours, 24);
				else
					duration.hours = 24;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!ceilDays)
				return;

			if (duration.days > 0)
			{
				if (units.days > 0)
					duration.days = Math.min(Math.ceil(duration.days / units.days) * units.days, daysInMonth);
				else
					duration.days = daysInMonth;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!ceilMonths)
				return;

			if (duration.months > 0)
			{
				if (units.months > 0)
					duration.months = Math.min(Math.ceil(duration.months / units.months) * units.months, 12);
				else
					duration.months = 12;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!ceilYears)
				return;

			if (units.years > 0)
			{
				duration.years = Math.ceil(duration.years / units.years) * units.years;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}
		}

		private static function _floorDateInternal(date:DateTime, units:Duration) : void
		{
			var floorYear:Boolean = (units.years > 0);
			var floorMonth:Boolean = floorYear || (units.months > 0);
			var floorDay:Boolean = floorMonth || (units.days > 0);
			var floorHours:Boolean = floorDay || (units.hours > 0);
			var floorMinutes:Boolean = floorHours || (units.minutes > 0);
			var floorSeconds:Boolean = floorMinutes || (units.seconds > 0);

			if (!floorSeconds)
				return;

			if (date.seconds > 0)
			{
				if (units.seconds > 0)
					date.seconds = Math.floor(date.seconds / units.seconds) * units.seconds;
				else
					date.seconds = 0;
			}

			if (!floorMinutes)
				return;

			if (date.minutes > 0)
			{
				if (units.minutes > 0)
					date.minutes = Math.floor(date.minutes / units.minutes) * units.minutes;
				else
					date.minutes = 0;
			}

			if (!floorHours)
				return;

			if (date.hours > 0)
			{
				if (units.hours > 0)
					date.hours = Math.floor(date.hours / units.hours) * units.hours;
				else
					date.hours = 0;
			}

			if (!floorDay)
				return;

			if (date.day > 1)
			{
				if (units.days > 0)
					date.day = Math.floor((date.day - 1) / units.days) * units.days + 1;
				else
					date.day = 1;
			}

			if (!floorMonth)
				return;

			if (date.month > 1)
			{
				if (units.months > 0)
					date.month = Math.floor((date.month - 1) / units.months) * units.months + 1;
				else
					date.month = 1;
			}

			if (!floorYear)
				return;

			if (units.years > 0)
				date.year = Math.floor(date.year / units.years) * units.years;
		}

		private static function _floorDurationInternal(duration:Duration, units:Duration, referenceDate:DateTime) : void
		{
			var floorYears:Boolean = (units.years > 0);
			var floorMonths:Boolean = floorYears || (units.months > 0);
			var floorDays:Boolean = floorMonths || (units.days > 0);
			var floorHours:Boolean = floorDays || (units.hours > 0);
			var floorMinutes:Boolean = floorHours || (units.minutes > 0);
			var floorSeconds:Boolean = floorMinutes || (units.seconds > 0);

			var daysInMonth:Number = TimeUtils.daysInMonth(referenceDate);

			if (!floorSeconds)
				return;

			if (duration.seconds > 0)
			{
				if (units.seconds > 0)
					duration.seconds = Math.floor(duration.seconds / units.seconds) * units.seconds;
				else
					duration.seconds = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!floorMinutes)
				return;

			if (duration.minutes > 0)
			{
				if (units.minutes > 0)
					duration.minutes = Math.floor(duration.minutes / units.minutes) * units.minutes;
				else
					duration.minutes = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!floorHours)
				return;

			if (duration.hours > 0)
			{
				if (units.hours > 0)
					duration.hours = Math.floor(duration.hours / units.hours) * units.hours;
				else
					duration.hours = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!floorDays)
				return;

			if (duration.days > 0)
			{
				if (units.days > 0)
					duration.days = Math.floor(duration.days / units.days) * units.days;
				else
					duration.days = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!floorMonths)
				return;

			if (duration.months > 0)
			{
				if (units.months > 0)
					duration.months = Math.floor(duration.months / units.months) * units.months;
				else
					duration.months = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!floorYears)
				return;

			if (units.years > 0)
			{
				duration.years = Math.floor(duration.years / units.years) * units.years;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}
		}

		private static function _roundDateInternal(date:DateTime, units:Duration) : void
		{
			var roundYear:Boolean = (units.years > 0);
			var roundMonth:Boolean = roundYear || (units.months > 0);
			var roundDay:Boolean = roundMonth || (units.days > 0);
			var roundHours:Boolean = roundDay || (units.hours > 0);
			var roundMinutes:Boolean = roundHours || (units.minutes > 0);
			var roundSeconds:Boolean = roundMinutes || (units.seconds > 0);

			if (!roundSeconds)
				return;

			if (date.seconds > 0)
			{
				if (units.seconds > 0)
					date.seconds = Math.min(Math.round(date.seconds / units.seconds) * units.seconds, 60);
				else if (date.seconds >= 30)
					date.seconds = 60;
				else
					date.seconds = 0;
			}

			if (!roundMinutes)
				return;

			if (date.minutes > 0)
			{
				if (units.minutes > 0)
					date.minutes = Math.min(Math.round(date.minutes / units.minutes) * units.minutes, 60);
				else if (date.minutes >= 30)
					date.minutes = 60;
				else
					date.minutes = 0;
			}

			if (!roundHours)
				return;

			if (date.hours > 0)
			{
				if (units.hours > 0)
					date.hours = Math.min(Math.round(date.hours / units.hours) * units.hours, 24);
				else if (date.hours >= 12)
					date.hours = 24;
				else
					date.hours = 0;
			}

			if (!roundDay)
				return;

			if (date.day > 1)
			{
				var daysInMonth:Number = TimeUtils.daysInMonth(date);
				if (units.days > 0)
					date.day = Math.min(Math.round((date.day - 1) / units.days) * units.days, daysInMonth) + 1;
				else if (date.day >= Math.floor(daysInMonth / 2 + 1))
					date.day = daysInMonth + 1;
				else
					date.day = 1;
			}

			if (!roundMonth)
				return;

			if (date.month > 1)
			{
				if (units.months > 0)
					date.month = Math.min(Math.round((date.month - 1) / units.months) * units.months, 12) + 1;
				else if (date.month >= (6 + 1))
					date.month = 12 + 1;
				else
					date.month = 1;
			}

			if (!roundYear)
				return;

			if (units.years > 0)
				date.year = Math.round(date.year / units.years) * units.years;
		}

		private static function _roundDurationInternal(duration:Duration, units:Duration, referenceDate:DateTime) : void
		{
			var roundYears:Boolean = (units.years > 0);
			var roundMonths:Boolean = roundYears || (units.months > 0);
			var roundDays:Boolean = roundMonths || (units.days > 0);
			var roundHours:Boolean = roundDays || (units.hours > 0);
			var roundMinutes:Boolean = roundHours || (units.minutes > 0);
			var roundSeconds:Boolean = roundMinutes || (units.seconds > 0);

			var daysInMonth:Number = TimeUtils.daysInMonth(referenceDate);

			if (!roundSeconds)
				return;

			if (duration.seconds > 0)
			{
				if (units.seconds > 0)
					duration.seconds = Math.min(Math.round(duration.seconds / units.seconds) * units.seconds, 60);
				else if (duration.seconds >= 30)
					duration.seconds = 60;
				else
					duration.seconds = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!roundMinutes)
				return;

			if (duration.minutes > 0)
			{
				if (units.minutes > 0)
					duration.minutes = Math.min(Math.round(duration.minutes / units.minutes) * units.minutes, 60);
				else if (duration.minutes >= 30)
					duration.minutes = 60;
				else
					duration.minutes = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!roundHours)
				return;

			if (duration.hours > 0)
			{
				if (units.hours > 0)
					duration.hours = Math.min(Math.round(duration.hours / units.hours) * units.hours, 24);
				else if (duration.hours >= 12)
					duration.hours = 24;
				else
					duration.hours = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!roundDays)
				return;

			if (duration.days > 0)
			{
				if (units.days > 0)
					duration.days = Math.min(Math.round(duration.days / units.days) * units.days, daysInMonth);
				else if (duration.days >= Math.floor(daysInMonth / 2))
					duration.days = daysInMonth;
				else
					duration.days = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!roundMonths)
				return;

			if (duration.months > 0)
			{
				if (units.months > 0)
					duration.months = Math.min(Math.round(duration.months / units.months) * units.months, 12);
				else if (duration.months >= 6)
					duration.months = 12;
				else
					duration.months = 0;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}

			if (!roundYears)
				return;

			if (units.years > 0)
			{
				duration.years = Math.round(duration.years / units.years) * units.years;
				TimeUtils._normalizeDuration(duration, daysInMonth);
			}
		}

		private static function _toTimeZoneStable(date:DateTime, timeZone:ITimeZone) : DateTime
		{
			var date2:DateTime = date.toTimeZone(timeZone);
			if ((date2.year == date.year) && (date2.month == date.month) && (date2.day == date.day) &&
			    (date2.hours == date.hours) && (date2.minutes == date.minutes) && (date2.seconds == date.seconds))
				return date2;

			var date3:DateTime = date.clone();
			date3.timeZone = timeZone;
			if ((date3.year == date.year) && (date3.month == date.month) && (date3.day == date.day) &&
			    (date3.hours == date.hours) && (date3.minutes == date.minutes) && (date3.seconds == date.seconds))
				return date3;

			return date2;
		}

		private static function _normalizeDuration(duration:Duration, daysInMonth:Number) : void
		{
			var years:Number = duration.years;
			var wholeYears:Number = Math.floor(years);
			var subYears:Number = years - wholeYears;

			var months:Number = duration.months + subYears * 12;
			var wholeMonths:Number = Math.floor(months);
			var subMonths:Number = months - wholeMonths;

			var days:Number = duration.days + subMonths * daysInMonth;
			var wholeDays:Number = Math.floor(days);
			var subDays:Number = days - wholeDays;

			var hours:Number = duration.hours + subDays * 24;
			var wholeHours:Number = Math.floor(hours);
			var subHours:Number = hours - wholeHours;

			var minutes:Number = duration.minutes + subHours * 60;
			var wholeMinutes:Number = Math.floor(minutes);
			var subMinutes:Number = minutes - wholeMinutes;

			var seconds:Number = duration.seconds + subMinutes * 60;
			var wholeSeconds:Number = Math.floor(seconds);
			var subSeconds:Number = _normalizePrecision(seconds - wholeSeconds);
			if (subSeconds >= 1)
			{
				subSeconds = 0;
				wholeSeconds++;
			}

			wholeMinutes += Math.floor(wholeSeconds / 60);
			wholeSeconds %= 60;

			wholeHours += Math.floor(wholeMinutes / 60);
			wholeMinutes %= 60;

			wholeDays += Math.floor(wholeHours / 24);
			wholeHours %= 24;

			wholeMonths += Math.floor(wholeDays / daysInMonth);
			wholeDays %= daysInMonth;

			wholeYears += Math.floor(wholeMonths / 12);
			wholeMonths %= 12;

			duration.years = wholeYears;
			duration.months = wholeMonths;
			duration.days = wholeDays;
			duration.hours = wholeHours;
			duration.minutes = wholeMinutes;
			duration.seconds = wholeSeconds + subSeconds;
		}

		private static function _normalizePrecision(value:Number) : Number
		{
			return Number(value.toFixed(6));
		}

	}

}

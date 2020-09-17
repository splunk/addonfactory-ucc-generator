package com.splunk.charting.axes
{

	import com.splunk.time.DateTime;

	public class TimeAxis extends AbstractAxis
	{

		// Public Static Constants

		public static const AUTO:DateTime = null;

		// Private Properties

		private var _mergedValueMinimum:Number;
		private var _mergedValueMaximum:Number;

		// Constructor

		public function TimeAxis(minimumTime:DateTime = null, maximumTime:DateTime = null)
		{
			this.minimum = minimumTime ? minimumTime.time : NaN;
			this.maximum = maximumTime ? maximumTime.time : NaN;

			this.updateRange();
		}

		// Public Getters/Setters

		public function get minimumTime() : DateTime
		{
			return this.absoluteToValue(this.minimum);
		}
		public function set minimumTime(value:DateTime) : void
		{
			this.minimum = this.valueToAbsolute(value);
		}

		public function get maximumTime() : DateTime
		{
			return this.absoluteToValue(this.maximum);
		}
		public function set maximumTime(value:DateTime) : void
		{
			this.maximum = this.valueToAbsolute(value);
		}

		public function get containedMinimumTime() : DateTime
		{
			return this.absoluteToValue(this.containedMinimum);
		}

		public function get containedMaximumTime() : DateTime
		{
			return this.absoluteToValue(this.containedMaximum);
		}

		public function get extendedMinimumTime() : DateTime
		{
			return this.absoluteToValue(this.extendedMinimum);
		}

		public function get extendedMaximumTime() : DateTime
		{
			return this.absoluteToValue(this.extendedMaximum);
		}


		public function get actualMinimumTime() : DateTime
		{
			return this.absoluteToValue(this.actualMinimum);
		}

		public function get actualMaximumTime() : DateTime
		{
			return this.absoluteToValue(this.actualMaximum);
		}

		// Protected Methods

		protected override function setValuesOverride(values:Array) : Array
		{
			var valueMinimum:Number = Infinity;
			var valueMaximum:Number = -Infinity;

			var dateValue:DateTime;
			var timeValue:Number;
			for each (var value:* in values)
			{
				dateValue = this._castValue(value);
				if (!dateValue)
					continue;

				timeValue = dateValue.time;

				if (timeValue < valueMinimum)
					valueMinimum = timeValue;
				if (timeValue > valueMaximum)
					valueMaximum = timeValue;
			}

			if (valueMinimum < valueMaximum)
				return [ valueMinimum, valueMaximum ];
			if (valueMinimum == valueMaximum)
				return [ valueMinimum ];
			return null;
		}

		protected override function updateValueMapOverride(values:Array) : void
		{
			var valueMinimum:Number = Infinity;
			var valueMaximum:Number = -Infinity;

			for each (var timeValue:Number in values)
			{
				if (timeValue < valueMinimum)
					valueMinimum = timeValue;
				if (timeValue > valueMaximum)
					valueMaximum = timeValue;
			}

			this._mergedValueMinimum = valueMinimum;
			this._mergedValueMaximum = valueMaximum;
		}

		protected override function updateValueRangeOverride() : void
		{
			this.valueRangeMinimum = this._mergedValueMinimum;
			this.valueRangeMaximum = this._mergedValueMaximum;
		}

		protected override function valueToAbsoluteOverride(value:*) : Number
		{
			var date:DateTime = this._castValue(value);
			if (date)
				return date.time;
			return NaN;
		}

		protected override function absoluteToValueOverride(absolute:Number) : *
		{
			if (absolute == absolute)
				return (new DateTime(absolute)).toUTC();
			return null;
		}

		protected override function defaultMinimumOverride(containedAbsolute:Number = NaN) : Number
		{
			var containedValue:DateTime = (containedAbsolute == containedAbsolute) ? new DateTime(containedAbsolute) : new DateTime();
			containedValue = containedValue.toUTC();
			containedValue.minutes = 0;
			containedValue.seconds = 0;
			return containedValue.time;
		}

		protected override function defaultMaximumOverride(containedAbsolute:Number = NaN) : Number
		{
			var containedValue:DateTime = (containedAbsolute == containedAbsolute) ? new DateTime(containedAbsolute) : new DateTime();
			containedValue = containedValue.toUTC();
			containedValue.minutes = 0;
			containedValue.seconds = 0;
			return containedValue.time + 3600;
		}

		// Private Methods

		private function _castValue(value:*) : DateTime
		{
			if (value == null)
				return null;
			if (value is DateTime)
				return (value.time == value.time) ? value : null;
			if (value is Date)
				return (value.time == value.time) ? new DateTime(value.time / 1000) : null;
			if (value is String)
			{
				if (!value)
					return null;
				var num:Number = Number(value);
				if (num == num)
					return new DateTime(num);
				var date:DateTime = new DateTime(value);
				if (date.time == date.time)
					return date;
				return null;
			}
			if (value is Number)
				return (value == value) ? new DateTime(value) : null;
			return null;
		}

	}

}

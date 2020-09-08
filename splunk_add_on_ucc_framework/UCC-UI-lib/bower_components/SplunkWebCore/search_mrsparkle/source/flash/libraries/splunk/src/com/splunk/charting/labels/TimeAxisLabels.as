package com.splunk.charting.labels
{

	import com.jasongatt.core.ObservableProperty;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.axes.TimeAxis;
	import com.splunk.time.DateTime;
	import com.splunk.time.Duration;
	import com.splunk.time.ITimeZone;
	import com.splunk.time.TimeUtils;
	import com.splunk.time.TimeZones;
	import flash.events.Event;

	public class TimeAxisLabels extends AbstractAxisLabels
	{

		// Public Static Constants

		public static const AUTO:Duration = null;

		// Private Properties

		private var _majorUnit:ObservableProperty;
		private var _minorUnit:ObservableProperty;
		private var _timeZone:ObservableProperty;

		private var _actualMajorUnit:Duration;
		private var _actualMinorUnit:Duration;

		// Constructor

		public function TimeAxisLabels()
		{
			this._majorUnit = new ObservableProperty(this, "majorUnit", Duration, TimeAxisLabels.AUTO, this._invalidatesUpdateAndCompute);
			this._minorUnit = new ObservableProperty(this, "minorUnit", Duration, TimeAxisLabels.AUTO, this.invalidates(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES));
			this._timeZone = new ObservableProperty(this, "timeZone", ITimeZone, TimeZones.LOCAL, this._invalidatesUpdateAndCompute);

			this._actualMajorUnit = new Duration();
			this._actualMinorUnit = new Duration();
		}

		// Public Getters/Setters

		public function get majorUnit() : Duration
		{
			var value:Duration = this._majorUnit.value;
			return value ? value.clone() : null;
		}
		public function set majorUnit(value:Duration) : void
		{
			this._majorUnit.value = value ? value.clone() : null;
		}

		public function get minorUnit() : Duration
		{
			var value:Duration = this._minorUnit.value;
			return value ? value.clone() : null;
		}
		public function set minorUnit(value:Duration) : void
		{
			this._minorUnit.value = value ? value.clone() : null;
		}

		public function get actualMajorUnit() : Duration
		{
			return this._actualMajorUnit.clone();
		}

		public function get actualMinorUnit() : Duration
		{
			return this._actualMinorUnit.clone();
		}

		public function get timeZone() : ITimeZone
		{
			return this._timeZone.value;
		}
		public function set timeZone(value:ITimeZone) : void
		{
			this._timeZone.value = value ? value : TimeZones.LOCAL;
		}

		// Protected Methods

		protected override function updateAxisExtendedRangeOverride(axis:IAxis) : Array
		{
			var maxMajorUnits:int = 50;
			var maxMinorUnits:int = 20;

			// get timeAxis and verify not null
			var timeAxis:TimeAxis = axis as TimeAxis;
			if (!timeAxis)
				return null;

			// get minimum and maximum and verify not equal
			var minimum:DateTime = timeAxis.containedMinimumTime;
			var maximum:DateTime = timeAxis.containedMaximumTime;
			if (minimum.time == maximum.time)
				return null;

			// swap minimum and maximum if needed
			if (minimum.time > maximum.time)
			{
				var temp:DateTime = minimum;
				minimum = maximum;
				maximum = temp;
			}

			// adjust minimum and maximum for timeZone
			var timeZone:ITimeZone = this._timeZone.value;
			minimum = minimum.toTimeZone(timeZone);
			maximum = maximum.toTimeZone(timeZone);

			// compute extended range
			var extendedMinimum:DateTime = minimum.clone();
			var extendedMaximum:DateTime = maximum.clone();
			var majorUnit:Duration = this._majorUnit.value;
			var useAutoUnits:Boolean = !majorUnit;
			var numComputations:int = useAutoUnits ? 2 : 1;  // compute extended range twice if auto units
			var majorUnitTime:Number;
			var numMajorUnits:Number;
			for (var i:int = 0; i < numComputations; i++)
			{
				if (useAutoUnits)
					majorUnit = this._computeAutoUnits(TimeUtils.subtractDates(extendedMaximum, extendedMinimum));

				// compute majorUnit time and verify greater than zero
				majorUnitTime = TimeUtils.durationToSeconds(majorUnit, extendedMinimum);
				if (majorUnitTime <= 0)
					return null;

				// scale majorUnit if numMajorUnits is greater than maxMajorUnits
				numMajorUnits = 1 + Math.floor((extendedMaximum.time - extendedMinimum.time) / majorUnitTime);
				majorUnit = TimeUtils.multiplyDuration(majorUnit, Math.ceil(numMajorUnits / maxMajorUnits));

				// snap minimum and maximum to majorUnit
				extendedMinimum = TimeUtils.ceilDate(minimum, majorUnit);
				if (extendedMinimum.time != minimum.time)
					extendedMinimum = TimeUtils.subtractDateDuration(extendedMinimum, majorUnit);
				extendedMaximum = extendedMinimum;
				while (extendedMaximum.time < maximum.time)
					extendedMaximum = TimeUtils.addDateDuration(extendedMaximum, majorUnit);
			}

			return [ extendedMinimum.time, extendedMaximum.time ];
		}

		protected override function computeTickAbsolutesOverride(axis:IAxis, majorTickAbsolutes:Array, minorTickAbsolutes:Array) : void
		{
			var maxMajorUnits:int = 50;
			var maxMinorUnits:int = 20;

			// set default values for actual units
			this._actualMajorUnit = new Duration();
			this._actualMinorUnit = new Duration();

			// get timeAxis and verify not null
			var timeAxis:TimeAxis = axis as TimeAxis;
			if (!timeAxis)
				return;

			// get minimum and maximum and verify not equal
			var minimum:DateTime = timeAxis.actualMinimumTime;
			var maximum:DateTime = timeAxis.actualMaximumTime;
			if (minimum.time == maximum.time)
				return;

			// swap minimum and maximum if needed
			if (minimum.time > maximum.time)
			{
				var temp:DateTime = minimum;
				minimum = maximum;
				maximum = temp;
			}

			// adjust minimum and maximum for timeZone
			var timeZone:ITimeZone = this._timeZone.value;
			minimum = minimum.toTimeZone(timeZone);
			maximum = maximum.toTimeZone(timeZone);

			// get majorUnit, compute auto units if necessary
			var majorUnit:Duration = this._majorUnit.value;
			if (!majorUnit)
				majorUnit = this._computeAutoUnits(TimeUtils.subtractDates(maximum, minimum));

			// compute majorUnit time and verify greater than zero
			var majorUnitTime:Number = TimeUtils.durationToSeconds(majorUnit, minimum);
			if (majorUnitTime <= 0)
				return;

			// scale majorUnit if numMajorUnits is greater than maxMajorUnits
			var numMajorUnits:Number = 1 + Math.floor((maximum.time - minimum.time) / majorUnitTime);
			majorUnit = TimeUtils.multiplyDuration(majorUnit, Math.ceil(numMajorUnits / maxMajorUnits));

			// update actualMajorUnit
			this._actualMajorUnit = majorUnit;

			// snap minimum and maximum to majorUnit
			minimum = TimeUtils.subtractDateDuration(TimeUtils.ceilDate(minimum, majorUnit), majorUnit);
			maximum = TimeUtils.ceilDate(maximum, majorUnit);

			// compute major absolutes
			var majorValue:DateTime;
			var majorUnitNum:int = 1;
			for (majorValue = minimum; majorValue.time <= maximum.time; majorUnitNum++)
			{
				majorTickAbsolutes.push(timeAxis.valueToAbsolute(majorValue));
				majorValue = TimeUtils.addDateDuration(minimum, TimeUtils.multiplyDuration(majorUnit, majorUnitNum));
			}

			// get minorUnit, compute auto units if necessary
			var minorUnit:Duration = this._minorUnit.value;
			if (!minorUnit)
				minorUnit = this._computeAutoUnits(majorUnit);

			// compute minorUnit time and verify between zero and majorUnit
			var minorUnitTime:Number = TimeUtils.durationToSeconds(minorUnit, minimum);
			if ((minorUnitTime <= 0) || (minorUnitTime >= majorUnitTime))
				return;

			// scale minorUnit if numMinorUnits is greater than maxMinorUnits
			var numMinorUnits:Number = 1 + Math.floor(majorUnitTime / minorUnitTime);
			minorUnit = TimeUtils.multiplyDuration(minorUnit, Math.ceil(numMinorUnits / maxMinorUnits));

			// update actualMinorUnit
			this._actualMinorUnit = minorUnit;

			// compute minor absolutes
			var minorMin:DateTime;
			var minorMax:DateTime;
			var minorValue:DateTime;
			var minorUnitNum:int;
			majorUnitNum = 1;
			for (majorValue = minimum; majorValue.time < maximum.time; majorUnitNum++)
			{
				minorMin = majorValue;
				minorMax = TimeUtils.addDateDuration(minimum, TimeUtils.multiplyDuration(majorUnit, majorUnitNum));

				minorUnitNum = 1;
				minorValue = TimeUtils.addDateDuration(minorMin, TimeUtils.multiplyDuration(minorUnit, minorUnitNum));
				minorUnitNum++;
				for (minorValue; minorValue.time < minorMax.time; minorUnitNum++)
				{
					minorTickAbsolutes.push(timeAxis.valueToAbsolute(minorValue));
					minorValue = TimeUtils.addDateDuration(minorMin, TimeUtils.multiplyDuration(minorUnit, minorUnitNum));
				}

				majorValue = minorMax;
			}
		}

		protected override function absoluteToValue(axis:IAxis, absolute:Number) : *
		{
			if (!(axis is TimeAxis))
				return null;

			var date:DateTime = super.absoluteToValue(axis, absolute) as DateTime;
			if (!date)
				return null;

			return date.toTimeZone(this._timeZone.value);
		}

		protected override function defaultMajorFormat(value:*) : String
		{
			return this._formatValue(value, this._actualMajorUnit);
		}

		protected override function defaultMinorFormat(value:*) : String
		{
			return this._formatValue(value, this._actualMinorUnit);
		}

		// Private Methods

		private function _computeAutoUnits(range:Duration) : Duration
		{
			if (TimeUtils.durationToSeconds(range) <= 0)
				return new Duration();

			var date:DateTime = new DateTime(range.years, range.months + 1, range.days + 1, range.hours, range.minutes, range.seconds, TimeZones.UTC);

			range = new Duration(date.year, date.month - 1, date.day - 1, date.hours, date.minutes, date.seconds);

			var diff:Number;
			var significand:Number;
			var exponent:Number;
			var str:String;
			var eIndex:int;

			diff = range.years;
			if (diff > 2)
			{
				significand = diff / 10;
				exponent = 0;

				if (significand > 0)
				{
					str = significand.toExponential(20);
					eIndex = str.indexOf("e");
					if (eIndex >= 0)
					{
						significand = Number(str.substring(0, eIndex));
						exponent = Number(str.substring(eIndex + 1, str.length));
					}
				}

				significand = Math.ceil(significand);

				if (significand > 5)
					significand = 10;
				else if (significand > 2)
					significand = 5;

				return new Duration(Math.ceil(significand * Math.pow(10, exponent)));
			}

			diff = range.months + diff * 12;
			if (diff > 2)
			{
				if (diff > 18)
					return new Duration(0, 4);
				else if (diff > 12)
					return new Duration(0, 3);
				else if (diff > 6)
					return new Duration(0, 2);
				else
					return new Duration(0, 1);
			}

			diff = range.days + diff * 30;
			if (diff > 2)
			{
				if (diff > 49)
					return new Duration(0, 0, 14);
				else if (diff > 28)
					return new Duration(0, 0, 7);
				else if (diff > 14)
					return new Duration(0, 0, 4);
				else if (diff > 7)
					return new Duration(0, 0, 2);
				else
					return new Duration(0, 0, 1);
			}

			diff = range.hours + diff * 24;
			if (diff > 2)
			{
				if (diff > 36)
					return new Duration(0, 0, 0, 12);
				else if (diff > 24)
					return new Duration(0, 0, 0, 6);
				else if (diff > 12)
					return new Duration(0, 0, 0, 4);
				else if (diff > 6)
					return new Duration(0, 0, 0, 2);
				else
					return new Duration(0, 0, 0, 1);
			}

			diff = range.minutes + diff * 60;
			if (diff > 2)
			{
				if (diff > 105)
					return new Duration(0, 0, 0, 0, 30);
				else if (diff > 70)
					return new Duration(0, 0, 0, 0, 15);
				else if (diff > 35)
					return new Duration(0, 0, 0, 0, 10);
				else if (diff > 14)
					return new Duration(0, 0, 0, 0, 5);
				else if (diff > 7)
					return new Duration(0, 0, 0, 0, 2);
				else
					return new Duration(0, 0, 0, 0, 1);
			}

			diff = range.seconds + diff * 60;
			if (diff > 2)
			{
				if (diff > 105)
					return new Duration(0, 0, 0, 0, 0, 30);
				else if (diff > 70)
					return new Duration(0, 0, 0, 0, 0, 15);
				else if (diff > 35)
					return new Duration(0, 0, 0, 0, 0, 10);
				else if (diff > 14)
					return new Duration(0, 0, 0, 0, 0, 5);
				else if (diff > 7)
					return new Duration(0, 0, 0, 0, 0, 2);
				else
					return new Duration(0, 0, 0, 0, 0, 1);
			}

			significand = diff / 10;
			exponent = 0;

			if (significand > 0)
			{
				str = significand.toExponential(20);
				eIndex = str.indexOf("e");
				if (eIndex >= 0)
				{
					significand = Number(str.substring(0, eIndex));
					exponent = Number(str.substring(eIndex + 1, str.length));
				}
			}

			significand = Math.ceil(significand);

			if (significand > 5)
				significand = 10;
			else if (significand > 2)
				significand = 5;

			return new Duration(0, 0, 0, 0, 0, significand * Math.pow(10, exponent));
		}

		private function _formatValue(value:DateTime, unit:Duration) : String
		{
			if (!value)
				return "";
			if (unit.years > 0)
				return String(value.year);
			if (unit.months > 0)
				return String(value.month);
			if (unit.days > 0)
				return String(value.day);
			if (unit.hours > 0)
				return String(value.hours);
			if (unit.minutes > 0)
				return String(value.minutes);
			if (unit.seconds > 0)
				return String(Math.floor(value.seconds));
			return value.toString();
		}

		private function _invalidatesUpdateAndCompute(e:Event) : void
		{
			this.invalidate(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);
			this.invalidate(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);
		}

	}

}

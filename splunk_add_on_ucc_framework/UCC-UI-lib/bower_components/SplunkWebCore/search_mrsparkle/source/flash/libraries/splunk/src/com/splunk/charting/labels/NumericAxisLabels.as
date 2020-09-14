package com.splunk.charting.labels
{

	import com.jasongatt.core.ObservableProperty;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.axes.NumericAxis;
	import com.splunk.charting.scale.IScale;
	import flash.events.Event;

	public class NumericAxisLabels extends AbstractAxisLabels
	{

		// Public Static Constants

		public static const AUTO:Number = NaN;

		// Private Properties

		private var _majorUnit:ObservableProperty;
		private var _minorUnit:ObservableProperty;
		private var _scaleMajorUnit:ObservableProperty;
		private var _scaleMinorUnit:ObservableProperty;
		private var _integerUnits:ObservableProperty;

		private var _actualMajorUnit:Number;
		private var _actualMinorUnit:Number;

		// Constructor

		public function NumericAxisLabels()
		{
			this._majorUnit = new ObservableProperty(this, "majorUnit", Number, NumericAxisLabels.AUTO, this._invalidatesUpdateAndCompute);
			this._minorUnit = new ObservableProperty(this, "minorUnit", Number, NumericAxisLabels.AUTO, this.invalidates(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES));
			this._scaleMajorUnit = new ObservableProperty(this, "scaleMajorUnit", Boolean, true, this._invalidatesUpdateAndCompute);
			this._scaleMinorUnit = new ObservableProperty(this, "scaleMinorUnit", Boolean, false, this.invalidates(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES));
			this._integerUnits = new ObservableProperty(this, "integerUnits", Boolean, false, this._invalidatesUpdateAndCompute);

			this._actualMajorUnit = 0;
			this._actualMinorUnit = 0;
		}

		// Public Getters/Setters

		public function get majorUnit() : Number
		{
			return this._majorUnit.value;
		}
		public function set majorUnit(value:Number) : void
		{
			this._majorUnit.value = value;
		}

		public function get minorUnit() : Number
		{
			return this._minorUnit.value;
		}
		public function set minorUnit(value:Number) : void
		{
			this._minorUnit.value = value;
		}

		public function get actualMajorUnit() : Number
		{
			return this._actualMajorUnit;
		}

		public function get actualMinorUnit() : Number
		{
			return this._actualMinorUnit;
		}

		public function get scaleMajorUnit() : Boolean
		{
			return this._scaleMajorUnit.value;
		}
		public function set scaleMajorUnit(value:Boolean) : void
		{
			this._scaleMajorUnit.value = value;
		}

		public function get scaleMinorUnit() : Boolean
		{
			return this._scaleMinorUnit.value;
		}
		public function set scaleMinorUnit(value:Boolean) : void
		{
			this._scaleMinorUnit.value = value;
		}

		public function get integerUnits() : Boolean
		{
			return this._integerUnits.value;
		}
		public function set integerUnits(value:Boolean) : void
		{
			this._integerUnits.value = value;
		}

		// Protected Methods

		protected override function updateAxisExtendedRangeOverride(axis:IAxis) : Array
		{
			var maxMajorUnits:int = 50;
			var maxMinorUnits:int = 20;

			// get numericAxis and verify not null
			var numericAxis:NumericAxis = axis as NumericAxis;
			if (!numericAxis)
				return null;

			// get contained minimum and maximum and verify not equal
			var minimum:Number = numericAxis.containedMinimumNumber;
			var maximum:Number = numericAxis.containedMaximumNumber;
			if (minimum == maximum)
				return null;

			// scale minimum and maximum if required
			var scale:IScale = numericAxis.scale;
			var scaleMajorUnit:Boolean = scale && this._scaleMajorUnit.value;
			if (scaleMajorUnit)
			{
				minimum = scale.valueToScale(minimum);
				maximum = scale.valueToScale(maximum);
			}

			// swap minimum and maximum if needed
			if (minimum > maximum)
			{
				var temp:Number = minimum;
				minimum = maximum;
				maximum = temp;
			}

			// compute extended range
			var extendedMinimum:Number = minimum;
			var extendedMaximum:Number = maximum;
			var majorUnit:Number = this._majorUnit.value;
			var useAutoUnits:Boolean = (majorUnit != majorUnit);
			var numComputations:int = useAutoUnits ? 2 : 1;  // compute extended range twice if auto units
			var integerUnits:Boolean = this._integerUnits.value;
			var numMajorUnits:Number;
			for (var i:int = 0; i < numComputations; i++)
			{
				if (useAutoUnits)
					majorUnit = this._computeAutoUnits(extendedMaximum - extendedMinimum);

				// verify majorUnit is greater than zero
				if (majorUnit <= 0)
					return null;

				// snap majorUnit to integer if required
				if (integerUnits && ((extendedMaximum - extendedMinimum) >= 1))
					majorUnit = Math.max(Math.round(majorUnit), 1);

				// scale majorUnit if numMajorUnits is greater than maxMajorUnits
				numMajorUnits = 1 + Math.floor((extendedMaximum - extendedMinimum) / majorUnit);
				majorUnit *= Math.ceil(numMajorUnits / maxMajorUnits);

				// snap minimum and maximum to majorUnit
				extendedMinimum = Math.ceil(minimum / majorUnit) * majorUnit;
				if (extendedMinimum != minimum)
					extendedMinimum -= majorUnit;
				extendedMaximum = Math.ceil(maximum / majorUnit) * majorUnit;
			}

			// convert extendedMinimum and extendedMaximum to absolute if necessary
			if (!scaleMajorUnit)
			{
				extendedMinimum = axis.valueToAbsolute(extendedMinimum);
				extendedMaximum = axis.valueToAbsolute(extendedMaximum);
			}

			return [ extendedMinimum, extendedMaximum ];
		}

		protected override function computeTickAbsolutesOverride(axis:IAxis, majorTickAbsolutes:Array, minorTickAbsolutes:Array) : void
		{
			var maxMajorUnits:int = 50;
			var maxMinorUnits:int = 20;

			// set default values for actual units
			this._actualMajorUnit = 0;
			this._actualMinorUnit = 0;

			// get numericAxis and verify not null
			var numericAxis:NumericAxis = axis as NumericAxis;
			if (!numericAxis)
				return;

			// get minimum and maximum and verify not equal
			var minimum:Number = numericAxis.actualMinimumNumber;
			var maximum:Number = numericAxis.actualMaximumNumber;
			if (minimum == maximum)
				return;

			// scale minimum and maximum if required
			var scale:IScale = numericAxis.scale;
			var scaleMajorUnit:Boolean = scale && this._scaleMajorUnit.value;
			if (scaleMajorUnit)
			{
				minimum = scale.valueToScale(minimum);
				maximum = scale.valueToScale(maximum);
			}

			// swap minimum and maximum if needed
			if (minimum > maximum)
			{
				var temp:Number = minimum;
				minimum = maximum;
				maximum = temp;
			}

			// get majorUnit, compute auto units if necessary
			var majorUnit:Number = this._majorUnit.value;
			if (majorUnit != majorUnit)
				majorUnit = this._computeAutoUnits(maximum - minimum);

			// verify majorUnit is greater than zero
			if (majorUnit <= 0)
				return;

			// snap majorUnit to integer if required
			var integerUnits:Boolean = this._integerUnits.value;
			if (integerUnits && ((maximum - minimum) >= 1))
				majorUnit = Math.max(Math.round(majorUnit), 1);

			// scale majorUnit if numMajorUnits is greater than maxMajorUnits
			var numMajorUnits:Number = 1 + Math.floor((maximum - minimum) / majorUnit);
			majorUnit *= Math.ceil(numMajorUnits / maxMajorUnits);

			// update actualMajorUnit
			this._actualMajorUnit = majorUnit;

			// snap minimum and maximum to majorUnit
			minimum = Math.ceil(minimum / majorUnit) * majorUnit - majorUnit;
			maximum = Math.ceil(maximum / majorUnit) * majorUnit;

			// compute major absolutes
			var majorValue:Number;
			var absolute:Number;
			for (majorValue = minimum; majorValue <= maximum; majorValue += majorUnit)
			{
				if (scaleMajorUnit)
					absolute = numericAxis.valueToAbsolute(scale.scaleToValue(majorValue));
				else
					absolute = numericAxis.valueToAbsolute(majorValue);
				majorTickAbsolutes.push(absolute);
			}

			// get minorUnit, compute auto units if necessary
			var minorUnit:Number = this._minorUnit.value;
			if (minorUnit != minorUnit)
				minorUnit = this._computeAutoUnits(majorUnit);

			// verify minorUnit is between zero and majorUnit
			if ((minorUnit <= 0) || (minorUnit >= majorUnit))
				return;

			// scale minorUnit if numMinorUnits is greater than maxMinorUnits
			var numMinorUnits:Number = 1 + Math.floor(majorUnit / minorUnit);
			minorUnit *= Math.ceil(numMinorUnits / maxMinorUnits);

			// update actualMinorUnit
			this._actualMinorUnit = minorUnit;

			// compute minor absolutes
			var minorMin:Number;
			var minorMax:Number;
			var minorValue:Number;
			var scaleMinorUnit:Boolean = scale && this._scaleMinorUnit.value;
			for (majorValue = minimum; majorValue < maximum; majorValue += majorUnit)
			{
				minorMin = majorValue;
				minorMax = majorValue + majorUnit;
				for (minorValue = minorMin + minorUnit; minorValue < minorMax; minorValue += minorUnit)
				{
					if (scaleMajorUnit)
					{
						if (scaleMinorUnit)
							absolute = numericAxis.valueToAbsolute(scale.scaleToValue(minorValue));
						else
							absolute = numericAxis.valueToAbsolute(scale.scaleToValue(minorMin) + (scale.scaleToValue(minorMax) - scale.scaleToValue(minorMin)) * ((minorValue - minorMin) / (minorMax - minorMin)));
					}
					else
					{
						absolute = numericAxis.valueToAbsolute(minorValue);
					}
					minorTickAbsolutes.push(absolute);
				}
			}
		}

		protected override function absoluteToValue(axis:IAxis, absolute:Number) : *
		{
			if (!(axis is NumericAxis))
				return NaN;
			return super.absoluteToValue(axis, absolute);
		}

		// Private Methods

		private function _computeAutoUnits(range:Number) : Number
		{
			if (range <= 0)
				return 0;

			var significand:Number = range / 10;
			var exponent:Number = 0;

			if (significand > 0)
			{
				var str:String = significand.toExponential(20);
				var eIndex:int = str.indexOf("e");
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

			return significand * Math.pow(10, exponent);
		}

		private function _invalidatesUpdateAndCompute(e:Event) : void
		{
			this.invalidate(AbstractAxisLabels.UPDATE_AXIS_EXTENDED_RANGE);
			this.invalidate(AbstractAxisLabels.COMPUTE_TICK_ABSOLUTES);
		}

	}

}

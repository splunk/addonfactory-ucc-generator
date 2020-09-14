package com.splunk.charting.axes
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.scale.IScale;

	public class NumericAxis extends AbstractAxis
	{

		// Public Static Constants

		public static const AUTO:Number = NaN;

		// Private Properties

		private var _minimumNumber:ObservableProperty;
		private var _maximumNumber:ObservableProperty;
		private var _scale:ObservableProperty;
		private var _includeZero:ObservableProperty;

		private var _mergedValueMinimum:Number;
		private var _mergedValueMaximum:Number;
		private var _cachedScale:IScale;

		// Constructor

		public function NumericAxis(minimumNumber:Number = NaN, maximumNumber:Number = NaN, scale:IScale = null)
		{
			this._minimumNumber = new ObservableProperty(this, "minimumNumber", Number, minimumNumber, this.updateRange);
			this._maximumNumber = new ObservableProperty(this, "maximumNumber", Number, maximumNumber, this.updateRange);
			this._scale = new ObservableProperty(this, "scale", IScale, scale, this._scale_changed);
			this._includeZero = new ObservableProperty(this, "includeZero", Boolean, false, this.updateRange);

			this._cachedScale = scale;

			this.updateRange();
		}

		// Public Getters/Setters

		public function get minimumNumber() : Number
		{
			return this._minimumNumber.value;
		}
		public function set minimumNumber(value:Number) : void
		{
			this._minimumNumber.value = value;
		}

		public function get maximumNumber() : Number
		{
			return this._maximumNumber.value;
		}
		public function set maximumNumber(value:Number) : void
		{
			this._maximumNumber.value = value;
		}

		public function get scale() : IScale
		{
			return this._scale.value;
		}
		public function set scale(value:IScale) : void
		{
			this._scale.value = value;
		}

		public function get includeZero() : Boolean
		{
			return this._includeZero.value;
		}
		public function set includeZero(value:Boolean) : void
		{
			this._includeZero.value = value;
		}

		public function get containedMinimumNumber() : Number
		{
			return this.absoluteToValue(this.containedMinimum);
		}

		public function get containedMaximumNumber() : Number
		{
			return this.absoluteToValue(this.containedMaximum);
		}

		public function get extendedMinimumNumber() : Number
		{
			return this.absoluteToValue(this.extendedMinimum);
		}

		public function get extendedMaximumNumber() : Number
		{
			return this.absoluteToValue(this.extendedMaximum);
		}

		public function get actualMinimumNumber() : Number
		{
			return this.absoluteToValue(this.actualMinimum);
		}

		public function get actualMaximumNumber() : Number
		{
			return this.absoluteToValue(this.actualMaximum);
		}

		// Protected Methods

		protected override function setValuesOverride(values:Array) : Array
		{
			var valueMinimum:Number = Infinity;
			var valueMaximum:Number = -Infinity;

			var numericValue:Number;
			for each (var value:* in values)
			{
				numericValue = NumberUtil.parseNumber(value);
				if (numericValue < valueMinimum)
					valueMinimum = numericValue;
				if (numericValue > valueMaximum)
					valueMaximum = numericValue;
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

			for each (var numericValue:Number in values)
			{
				if (numericValue < valueMinimum)
					valueMinimum = numericValue;
				if (numericValue > valueMaximum)
					valueMaximum = numericValue;
			}

			this._mergedValueMinimum = valueMinimum;
			this._mergedValueMaximum = valueMaximum;
		}

		protected override function updateValueRangeOverride() : void
		{
			var valueMinimum:Number = this._mergedValueMinimum;
			var valueMaximum:Number = this._mergedValueMaximum;
			if (this._includeZero.value)
			{
				if (0 < valueMinimum)
					valueMinimum = 0;
				if (0 > valueMaximum)
					valueMaximum = 0;
			}

			this.valueRangeMinimum = this.valueToAbsolute(valueMinimum);
			this.valueRangeMaximum = this.valueToAbsolute(valueMaximum);
		}

		protected override function valueToAbsoluteOverride(value:*) : Number
		{
			return this._cachedScale ? this._cachedScale.valueToScale(NumberUtil.parseNumber(value)) : NumberUtil.parseNumber(value);
		}

		protected override function absoluteToValueOverride(absolute:Number) : *
		{
			return this._cachedScale ? this._cachedScale.scaleToValue(absolute) : absolute;
		}

		protected override function getMinimumOverride() : Number
		{
			return this.valueToAbsolute(this._minimumNumber.value);
		}

		protected override function setMinimumOverride(value:Number) : void
		{
			this._minimumNumber.value = this.absoluteToValue(value);
		}

		protected override function getMaximumOverride() : Number
		{
			return this.valueToAbsolute(this._maximumNumber.value);
		}

		protected override function setMaximumOverride(value:Number) : void
		{
			this._maximumNumber.value = this.absoluteToValue(value);
		}

		protected override function defaultMinimumOverride(containedAbsolute:Number = NaN) : Number
		{
			var containedValue:Number = (containedAbsolute == containedAbsolute) ? this.absoluteToValue(containedAbsolute) : 0;
			containedValue = Math.floor(containedValue / 10) * 10;
			return this.valueToAbsolute(containedValue);
		}

		protected override function defaultMaximumOverride(containedAbsolute:Number = NaN) : Number
		{
			var containedValue:Number = (containedAbsolute == containedAbsolute) ? this.absoluteToValue(containedAbsolute) : 0;
			containedValue = Math.floor(containedValue / 10) * 10;
			return this.valueToAbsolute(containedValue + 100);
		}

		// Private Methods

		private function _scale_changed(e:ChangedEvent) : void
		{
			this._cachedScale = this._scale.value;
			this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, AxisChangeType.VALUE_ABSOLUTE_MAP));
			this.updateRange();
		}

	}

}

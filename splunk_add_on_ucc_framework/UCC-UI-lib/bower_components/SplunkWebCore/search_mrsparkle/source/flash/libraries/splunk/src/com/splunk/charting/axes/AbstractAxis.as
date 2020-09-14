package com.splunk.charting.axes
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.distortion.IDistortion;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;

	[Event(name="setValues", type="com.splunk.charting.axes.AxisEvent")]
	[Event(name="setRange", type="com.splunk.charting.axes.AxisEvent")]
	[Event(name="setExtendedRange", type="com.splunk.charting.axes.AxisEvent")]
	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public /*abstract*/ class AbstractAxis extends EventDispatcher implements IAxis
	{

		// Public Static Constants

		public static const AUTO:Number = NaN;

		// Protected Properties

		protected var valueRangeMinimum:Number;
		protected var valueRangeMaximum:Number;

		// Private Properties

		private var _minimum:ObservableProperty;
		private var _maximum:ObservableProperty;
		private var _distortion:ObservableProperty;
		private var _reverse:ObservableProperty;
		private var _containedMinimum:Number;
		private var _containedMaximum:Number;
		private var _extendedMinimum:Number;
		private var _extendedMaximum:Number;
		private var _actualMinimum:Number;
		private var _actualMaximum:Number;

		private var _targetMap:Dictionary;
		private var _targetList:Array;
		private var _mergedAbsoluteMinimum:Number;
		private var _mergedAbsoluteMaximum:Number;
		private var _mergedExtendedMinimum:Number;
		private var _mergedExtendedMaximum:Number;
		private var _actualRange:Number;
		private var _cachedDistortion:IDistortion;
		private var _cachedReverse:Boolean = false;
		private var _isSettingValues:Boolean = false;
		private var _isSettingRange:Boolean = false;
		private var _isSettingExtendedRange:Boolean = false;

		// Constructor

		public function AbstractAxis()
		{
			this._minimum = new ObservableProperty(this, "minimum", Number, AbstractAxis.AUTO, this.updateRange);
			this._maximum = new ObservableProperty(this, "maximum", Number, AbstractAxis.AUTO, this.updateRange);
			this._distortion = new ObservableProperty(this, "distortion", IDistortion, null, this._distortion_changed);
			this._reverse = new ObservableProperty(this, "reverse", Boolean, false, this._reverse_changed);

			this._targetMap = new Dictionary();
			this._targetList = new Array();

			this._updateValueMap();
			this._updateAbsoluteMap();
			this._updateExtendedMap();
		}

		// Public Getters/Setters

		public function get minimum() : Number
		{
			return this.getMinimumOverride();
		}
		public function set minimum(value:Number) : void
		{
			this.setMinimumOverride(value);
		}

		public function get maximum() : Number
		{
			return this.getMaximumOverride();
		}
		public function set maximum(value:Number) : void
		{
			this.setMaximumOverride(value);
		}

		public function get distortion() : IDistortion
		{
			return this._distortion.value;
		}
		public function set distortion(value:IDistortion) : void
		{
			this._distortion.value = value;
		}

		public function get reverse() : Boolean
		{
			return this._reverse.value;
		}
		public function set reverse(value:Boolean) : void
		{
			this._reverse.value = value;
		}

		public function get containedMinimum() : Number
		{
			return this._containedMinimum;
		}

		public function get containedMaximum() : Number
		{
			return this._containedMaximum;
		}

		public function get extendedMinimum() : Number
		{
			return this._extendedMinimum;
		}

		public function get extendedMaximum() : Number
		{
			return this._extendedMaximum;
		}

		public function get actualMinimum() : Number
		{
			return this._actualMinimum;
		}

		public function get actualMaximum() : Number
		{
			return this._actualMaximum;
		}

		// Public Methods

		public function register(target:Object) : void
		{
			if (!target)
				throw new TypeError("Parameter target must be non-null.");

			var targetData:TargetData = this._targetMap[target];
			if (targetData)
				return;

			targetData = new TargetData();
			this._targetMap[target] = targetData;
			this._targetList.push(targetData);
		}

		public function unregister(target:Object) : void
		{
			var targetData:TargetData = this._targetMap[target];
			if (!targetData)
				return;

			var targetIndex:int = this._targetList.indexOf(targetData);
			if (targetIndex >= 0)
				this._targetList.splice(targetIndex, 1);
			delete this._targetMap[target];

			this._updateValueMap();
			this._updateAbsoluteMap();
			this._updateExtendedMap();
			this.updateRange();
		}

		public function setValues(target:Object, values:Array) : void
		{
			var targetData:TargetData = this._targetMap[target];
			if (!targetData)
				return;

			targetData.values = values ? this.setValuesOverride(values.concat()) : null;

			if (!this._isSettingValues)
			{
				this._isSettingValues = true;
				this.dispatchEvent(new AxisEvent(AxisEvent.SET_VALUES));
				this._updateValueMap();
				this._isSettingValues = false;
				this.updateRange();
			}
		}

		public function setRange(target:Object, absolute1:Number, absolute2:Number = NaN) : void
		{
			var targetData:TargetData = this._targetMap[target];
			if (!targetData)
				return;

			var absoluteMinimum:Number = Infinity;
			var absoluteMaximum:Number = -Infinity;

			if (absolute1 < absoluteMinimum)
				absoluteMinimum = absolute1;
			if (absolute1 > absoluteMaximum)
				absoluteMaximum = absolute1;

			if (absolute2 < absoluteMinimum)
				absoluteMinimum = absolute2;
			if (absolute2 > absoluteMaximum)
				absoluteMaximum = absolute2;

			targetData.absoluteMinimum = absoluteMinimum;
			targetData.absoluteMaximum = absoluteMaximum;

			if (!this._isSettingRange)
			{
				this._isSettingRange = true;
				this.dispatchEvent(new AxisEvent(AxisEvent.SET_RANGE));
				this._updateAbsoluteMap();
				this._isSettingRange = false;
				this.updateRange();
			}
		}

		public function setExtendedRange(target:Object, absolute1:Number, absolute2:Number = NaN) : void
		{
			var targetData:TargetData = this._targetMap[target];
			if (!targetData)
				return;

			var absoluteMinimum:Number = Infinity;
			var absoluteMaximum:Number = -Infinity;

			if (absolute1 < absoluteMinimum)
				absoluteMinimum = absolute1;
			if (absolute1 > absoluteMaximum)
				absoluteMaximum = absolute1;

			if (absolute2 < absoluteMinimum)
				absoluteMinimum = absolute2;
			if (absolute2 > absoluteMaximum)
				absoluteMaximum = absolute2;

			targetData.extendedMinimum = absoluteMinimum;
			targetData.extendedMaximum = absoluteMaximum;

			if (!this._isSettingExtendedRange)
			{
				this._isSettingExtendedRange = true;
				this.dispatchEvent(new AxisEvent(AxisEvent.SET_EXTENDED_RANGE));
				this._updateExtendedMap();
				this._isSettingExtendedRange = false;
				this.updateRange();
			}
		}

		public function valueToAbsolute(value:*) : Number
		{
			return this.valueToAbsoluteOverride(value);
		}

		public function absoluteToValue(absolute:Number) : *
		{
			return this.absoluteToValueOverride(absolute);
		}

		public function absoluteToRelative(absolute:Number) : Number
		{
			var relative:Number = (absolute - this._actualMinimum) / this._actualRange;

			if (this._cachedDistortion)
				relative = this._cachedDistortion.positionToDistortion(relative);

			if (this._cachedReverse)
				relative = 1 - relative;

			return relative;
		}

		public function relativeToAbsolute(relative:Number) : Number
		{
			if (this._cachedReverse)
				relative = 1 - relative;

			if (this._cachedDistortion)
				relative = this._cachedDistortion.distortionToPosition(relative);

			return this._actualMinimum + this._actualRange * relative;
		}

		// Protected Methods

		protected function updateRange(e:Event = null) : void
		{
			this.valueRangeMinimum = Infinity;
			this.valueRangeMaximum = -Infinity;
			this.updateValueRangeOverride();

			var containedMinimum:Number = Math.min(this.valueRangeMinimum, this._mergedAbsoluteMinimum);
			var containedMaximum:Number = Math.max(this.valueRangeMaximum, this._mergedAbsoluteMaximum);
			if (containedMinimum == containedMaximum)
			{
				containedMinimum = this.defaultMinimumOverride(containedMinimum);
				containedMaximum = this.defaultMaximumOverride(containedMaximum);
			}
			else
			{
				if (containedMinimum == Infinity)
					containedMinimum = this.defaultMinimumOverride();
				if (containedMaximum == -Infinity)
					containedMaximum = this.defaultMaximumOverride();
			}

			var extendedMinimum:Number = Math.min(containedMinimum, this._mergedExtendedMinimum);
			var extendedMaximum:Number = Math.max(containedMaximum, this._mergedExtendedMaximum);

			var minimum:Number = this.getMinimumOverride();
			var maximum:Number = this.getMaximumOverride();

			var actualMinimum:Number = (minimum == minimum) ? minimum : extendedMinimum;
			var actualMaximum:Number = (maximum == maximum) ? maximum : extendedMaximum;
			if (actualMinimum > actualMaximum)
			{
				var temp:Number = actualMinimum;
				actualMinimum = actualMaximum;
				actualMaximum = temp;
			}

			var containedRangeChanged:Boolean = false;
			var extendedRangeChanged:Boolean = false;
			var actualRangeChanged:Boolean = false;

			if ((containedMinimum != this._containedMinimum) || (containedMaximum != this._containedMaximum))
			{
				this._containedMinimum = containedMinimum;
				this._containedMaximum = containedMaximum;
				containedRangeChanged = true;
			}

			if ((extendedMinimum != this._extendedMinimum) || (extendedMaximum != this._extendedMaximum))
			{
				this._extendedMinimum = extendedMinimum;
				this._extendedMaximum = extendedMaximum;
				extendedRangeChanged = true;
			}

			if ((actualMinimum != this._actualMinimum) || (actualMaximum != this._actualMaximum))
			{
				this._actualMinimum = actualMinimum;
				this._actualMaximum = actualMaximum;
				this._actualRange = Math.max(actualMaximum - actualMinimum, NumberUtil.EPSILON);
				actualRangeChanged = true;
			}

			if (containedRangeChanged)
				this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, AxisChangeType.CONTAINED_RANGE));
			if (extendedRangeChanged)
				this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, AxisChangeType.EXTENDED_RANGE));
			if (actualRangeChanged)
			{
				this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, AxisChangeType.ACTUAL_RANGE));
				this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, AxisChangeType.ABSOLUTE_RELATIVE_MAP));
			}
		}

		protected function setValuesOverride(values:Array) : Array
		{
			return values;
		}

		protected function updateValueMapOverride(values:Array) : void
		{
		}

		protected function updateValueRangeOverride() : void
		{
		}

		protected function valueToAbsoluteOverride(value:*) : Number
		{
			return NaN;
		}

		protected function absoluteToValueOverride(absolute:Number) : *
		{
			return null;
		}

		protected function getMinimumOverride() : Number
		{
			return this._minimum.value;
		}

		protected function setMinimumOverride(value:Number) : void
		{
			this._minimum.value = value;
		}

		protected function getMaximumOverride() : Number
		{
			return this._maximum.value;
		}

		protected function setMaximumOverride(value:Number) : void
		{
			this._maximum.value = value;
		}

		protected function defaultMinimumOverride(containedAbsolute:Number = NaN) : Number
		{
			return (containedAbsolute == containedAbsolute) ? containedAbsolute - 1 : -1;
		}

		protected function defaultMaximumOverride(containedAbsolute:Number = NaN) : Number
		{
			return (containedAbsolute == containedAbsolute) ? containedAbsolute + 1 : 1;
		}

		// Private Methods

		private function _updateValueMap() : void
		{
			var values:Array = new Array();

			for each (var targetData:TargetData in this._targetList)
			{
				if (targetData.values)
					values = values.concat(targetData.values);
			}

			this.updateValueMapOverride(values);
		}

		private function _updateAbsoluteMap() : void
		{
			var absoluteMinimum:Number = Infinity;
			var absoluteMaximum:Number = -Infinity;

			for each (var targetData:TargetData in this._targetList)
			{
				if (targetData.absoluteMinimum < absoluteMinimum)
					absoluteMinimum = targetData.absoluteMinimum;
				if (targetData.absoluteMaximum > absoluteMaximum)
					absoluteMaximum = targetData.absoluteMaximum;
			}

			this._mergedAbsoluteMinimum = absoluteMinimum;
			this._mergedAbsoluteMaximum = absoluteMaximum;
		}

		private function _updateExtendedMap() : void
		{
			var extendedMinimum:Number = Infinity;
			var extendedMaximum:Number = -Infinity;

			for each (var targetData:TargetData in this._targetList)
			{
				if (targetData.extendedMinimum < extendedMinimum)
					extendedMinimum = targetData.extendedMinimum;
				if (targetData.extendedMaximum > extendedMaximum)
					extendedMaximum = targetData.extendedMaximum;
			}

			this._mergedExtendedMinimum = extendedMinimum;
			this._mergedExtendedMaximum = extendedMaximum;
		}

		private function _distortion_changed(e:ChangedEvent) : void
		{
			this._cachedDistortion = this._distortion.value;
			this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, AxisChangeType.ABSOLUTE_RELATIVE_MAP));
		}

		private function _reverse_changed(e:ChangedEvent) : void
		{
			this._cachedReverse = this._reverse.value;
			this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, AxisChangeType.ABSOLUTE_RELATIVE_MAP));
		}

	}

}

class TargetData
{

	// Public Properties

	public var values:Array;
	public var absoluteMinimum:Number = Infinity;
	public var absoluteMaximum:Number = -Infinity;
	public var extendedMinimum:Number = Infinity;
	public var extendedMaximum:Number = -Infinity;

	// Constructor

	public function TargetData()
	{
	}

}

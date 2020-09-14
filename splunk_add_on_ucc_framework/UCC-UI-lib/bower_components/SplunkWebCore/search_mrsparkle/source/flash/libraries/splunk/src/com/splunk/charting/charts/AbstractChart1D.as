package com.splunk.charting.charts
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.core.ValidatePass;
	import com.splunk.charting.axes.AxisChangeType;
	import com.splunk.charting.axes.AxisEvent;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.axes.NumericAxis;
	import com.splunk.data.IDataTable;
	import flash.events.Event;

	public /*abstract*/ class AbstractChart1D extends AbstractChart
	{

		// Public Static Constants

		public static const UPDATE_AXIS_VALUES:ValidatePass = new ValidatePass(AbstractChart1D, "updateAxisValues", 0.11);
		public static const PROCESS_VALUES:ValidatePass = new ValidatePass(AbstractChart1D, "processValues", 0.12);
		public static const UPDATE_AXIS_RANGE:ValidatePass = new ValidatePass(AbstractChart1D, "updateAxisRange", 0.13);
		public static const PROCESS_ABSOLUTES:ValidatePass = new ValidatePass(AbstractChart1D, "processAbsolutes", 0.14);

		// Private Properties

		private var _axis:ObservableProperty;

		// Constructor

		public function AbstractChart1D()
		{
			this._axis = new ObservableProperty(this, "axis", IAxis, null, this._axis_changed);
		}

		// Public Getters/Setters

		public function get axis() : IAxis
		{
			return this._axis.value;
		}
		public function set axis(value:IAxis) : void
		{
			this._axis.value = value;
		}

		// Public Methods

		public function updateAxisValues() : void
		{
			this.validatePreceding(AbstractChart1D.UPDATE_AXIS_VALUES);

			if (this.isValid(AbstractChart1D.UPDATE_AXIS_VALUES))
				return;

			this.invalidate(AbstractChart1D.PROCESS_VALUES);

			var values:Array;

			var axis:IAxis = this._axis.value;
			if (axis)
				values = this.updateAxisValuesOverride();

			this.setValid(AbstractChart1D.UPDATE_AXIS_VALUES);

			// this must run last to avoid recursion
			if (axis)
				axis.setValues(this._axis, values);
		}

		public function processValues() : void
		{
			this.validatePreceding(AbstractChart1D.PROCESS_VALUES);

			if (this.isValid(AbstractChart1D.PROCESS_VALUES))
				return;

			this.invalidate(AbstractChart1D.UPDATE_AXIS_RANGE);

			this.processValuesOverride(this._axis.value);

			this.setValid(AbstractChart1D.PROCESS_VALUES);
		}

		public function updateAxisRange() : void
		{
			this.validatePreceding(AbstractChart1D.UPDATE_AXIS_RANGE);

			if (this.isValid(AbstractChart1D.UPDATE_AXIS_RANGE))
				return;

			this.invalidate(AbstractChart1D.PROCESS_ABSOLUTES);

			var absolute1:Number = NaN;
			var absolute2:Number = NaN;

			var axis:IAxis = this._axis.value;
			if (axis)
			{
				var range:Array = this.updateAxisRangeOverride();
				if (range)
				{
					if (range.length > 0)
						absolute1 = range[0];
					if (range.length > 1)
						absolute2 = range[1];
				}
			}

			this.setValid(AbstractChart1D.UPDATE_AXIS_RANGE);

			// this must run last to avoid recursion
			if (axis)
				axis.setRange(this._axis, absolute1, absolute2);
		}

		public function processAbsolutes() : void
		{
			this.validatePreceding(AbstractChart1D.PROCESS_ABSOLUTES);

			if (this.isValid(AbstractChart1D.PROCESS_ABSOLUTES))
				return;

			this.invalidate(AbstractChart.RENDER_CHART);

			this.processAbsolutesOverride(this._axis.value);

			this.setValid(AbstractChart1D.PROCESS_ABSOLUTES);
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			this.invalidate(AbstractChart1D.UPDATE_AXIS_VALUES);
		}

		protected function updateAxisValuesOverride() : Array
		{
			return null;
		}

		protected function processValuesOverride(axis:IAxis) : void
		{
		}

		protected function updateAxisRangeOverride() : Array
		{
			return null;
		}

		protected function processAbsolutesOverride(axis:IAxis) : void
		{
		}

		// Private Methods

		private function _axis_changed(e:ChangedEvent) : void
		{
			switch (e.changeType)
			{
				case AxisChangeType.VALUE_ABSOLUTE_MAP:
					this.invalidate(AbstractChart1D.PROCESS_VALUES);
					break;
				case AxisChangeType.ABSOLUTE_RELATIVE_MAP:
					this.invalidate(AbstractChart1D.PROCESS_ABSOLUTES);
					break;
				case PropertyChangedEvent.PROPERTY:
					var propertyChangedEvent:PropertyChangedEvent = e as PropertyChangedEvent;
					if (propertyChangedEvent && (propertyChangedEvent.source == this._axis))
					{
						var oldAxis:IAxis = propertyChangedEvent.oldValue as IAxis;
						var newAxis:IAxis = propertyChangedEvent.newValue as IAxis;

						if (oldAxis)
						{
							oldAxis.removeEventListener(AxisEvent.SET_RANGE, this.validates(AbstractChart1D.UPDATE_AXIS_RANGE));
							oldAxis.removeEventListener(AxisEvent.SET_VALUES, this.validates(AbstractChart1D.UPDATE_AXIS_VALUES));
							oldAxis.unregister(this._axis);
						}

						if (newAxis)
						{
							newAxis.register(this._axis);
							newAxis.addEventListener(AxisEvent.SET_VALUES, this.validates(AbstractChart1D.UPDATE_AXIS_VALUES));
							newAxis.addEventListener(AxisEvent.SET_RANGE, this.validates(AbstractChart1D.UPDATE_AXIS_RANGE));
							this.invalidate(AbstractChart1D.UPDATE_AXIS_VALUES);
						}

						this.invalidate(AbstractChart1D.PROCESS_VALUES);
					}
					break;
			}
		}

	}

}

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

	public /*abstract*/ class AbstractChart2D extends AbstractChart
	{

		// Public Static Constants

		public static const UPDATE_AXIS_VALUES_X:ValidatePass = new ValidatePass(AbstractChart2D, "updateAxisValuesX", 0.11);
		public static const UPDATE_AXIS_VALUES_Y:ValidatePass = new ValidatePass(AbstractChart2D, "updateAxisValuesY", 0.11);
		public static const PROCESS_VALUES_X:ValidatePass = new ValidatePass(AbstractChart2D, "processValuesX", 0.12);
		public static const PROCESS_VALUES_Y:ValidatePass = new ValidatePass(AbstractChart2D, "processValuesY", 0.12);
		public static const UPDATE_AXIS_RANGE_X:ValidatePass = new ValidatePass(AbstractChart2D, "updateAxisRangeX", 0.13);
		public static const UPDATE_AXIS_RANGE_Y:ValidatePass = new ValidatePass(AbstractChart2D, "updateAxisRangeY", 0.13);
		public static const PROCESS_ABSOLUTES_X:ValidatePass = new ValidatePass(AbstractChart2D, "processAbsolutesX", 0.14);
		public static const PROCESS_ABSOLUTES_Y:ValidatePass = new ValidatePass(AbstractChart2D, "processAbsolutesY", 0.14);

		// Private Properties

		private var _axisX:ObservableProperty;
		private var _axisY:ObservableProperty;

		// Constructor

		public function AbstractChart2D()
		{
			this._axisX = new ObservableProperty(this, "axisX", IAxis, null, this._axisX_changed);
			this._axisY = new ObservableProperty(this, "axisY", IAxis, null, this._axisY_changed);
		}

		// Public Getters/Setters

		public function get axisX() : IAxis
		{
			return this._axisX.value;
		}
		public function set axisX(value:IAxis) : void
		{
			this._axisX.value = value;
		}

		public function get axisY() : IAxis
		{
			return this._axisY.value;
		}
		public function set axisY(value:IAxis) : void
		{
			this._axisY.value = value;
		}

		// Public Methods

		public function updateAxisValuesX() : void
		{
			this.validatePreceding(AbstractChart2D.UPDATE_AXIS_VALUES_X);

			if (this.isValid(AbstractChart2D.UPDATE_AXIS_VALUES_X))
				return;

			this.invalidate(AbstractChart2D.PROCESS_VALUES_X);

			var values:Array;

			var axisX:IAxis = this._axisX.value;
			if (axisX)
				values = this.updateAxisValuesXOverride();

			this.setValid(AbstractChart2D.UPDATE_AXIS_VALUES_X);

			// this must run last to avoid recursion
			if (axisX)
				axisX.setValues(this._axisX, values);
		}

		public function updateAxisValuesY() : void
		{
			this.validatePreceding(AbstractChart2D.UPDATE_AXIS_VALUES_Y);

			if (this.isValid(AbstractChart2D.UPDATE_AXIS_VALUES_Y))
				return;

			this.invalidate(AbstractChart2D.PROCESS_VALUES_Y);

			var values:Array;

			var axisY:IAxis = this._axisY.value;
			if (axisY)
				values = this.updateAxisValuesYOverride();

			this.setValid(AbstractChart2D.UPDATE_AXIS_VALUES_Y);

			// this must run last to avoid recursion
			if (axisY)
				axisY.setValues(this._axisY, values);
		}

		public function processValuesX() : void
		{
			this.validatePreceding(AbstractChart2D.PROCESS_VALUES_X);

			if (this.isValid(AbstractChart2D.PROCESS_VALUES_X))
				return;

			this.invalidate(AbstractChart2D.UPDATE_AXIS_RANGE_X);

			this.processValuesXOverride(this._axisX.value);

			this.setValid(AbstractChart2D.PROCESS_VALUES_X);
		}

		public function processValuesY() : void
		{
			this.validatePreceding(AbstractChart2D.PROCESS_VALUES_Y);

			if (this.isValid(AbstractChart2D.PROCESS_VALUES_Y))
				return;

			this.invalidate(AbstractChart2D.UPDATE_AXIS_RANGE_Y);

			this.processValuesYOverride(this._axisY.value);

			this.setValid(AbstractChart2D.PROCESS_VALUES_Y);
		}

		public function updateAxisRangeX() : void
		{
			this.validatePreceding(AbstractChart2D.UPDATE_AXIS_RANGE_X);

			if (this.isValid(AbstractChart2D.UPDATE_AXIS_RANGE_X))
				return;

			this.invalidate(AbstractChart2D.PROCESS_ABSOLUTES_X);

			var absolute1:Number = NaN;
			var absolute2:Number = NaN;

			var axisX:IAxis = this._axisX.value;
			if (axisX)
			{
				var range:Array = this.updateAxisRangeXOverride();
				if (range)
				{
					if (range.length > 0)
						absolute1 = range[0];
					if (range.length > 1)
						absolute2 = range[1];
				}
			}

			this.setValid(AbstractChart2D.UPDATE_AXIS_RANGE_X);

			// this must run last to avoid recursion
			if (axisX)
				axisX.setRange(this._axisX, absolute1, absolute2);
		}

		public function updateAxisRangeY() : void
		{
			this.validatePreceding(AbstractChart2D.UPDATE_AXIS_RANGE_Y);

			if (this.isValid(AbstractChart2D.UPDATE_AXIS_RANGE_Y))
				return;

			this.invalidate(AbstractChart2D.PROCESS_ABSOLUTES_Y);

			var absolute1:Number = NaN;
			var absolute2:Number = NaN;

			var axisY:IAxis = this._axisY.value;
			if (axisY)
			{
				var range:Array = this.updateAxisRangeYOverride();
				if (range)
				{
					if (range.length > 0)
						absolute1 = range[0];
					if (range.length > 1)
						absolute2 = range[1];
				}
			}

			this.setValid(AbstractChart2D.UPDATE_AXIS_RANGE_Y);

			// this must run last to avoid recursion
			if (axisY)
				axisY.setRange(this._axisY, absolute1, absolute2);
		}

		public function processAbsolutesX() : void
		{
			this.validatePreceding(AbstractChart2D.PROCESS_ABSOLUTES_X);

			if (this.isValid(AbstractChart2D.PROCESS_ABSOLUTES_X))
				return;

			this.invalidate(AbstractChart.RENDER_CHART);

			this.processAbsolutesXOverride(this._axisX.value);

			this.setValid(AbstractChart2D.PROCESS_ABSOLUTES_X);
		}

		public function processAbsolutesY() : void
		{
			this.validatePreceding(AbstractChart2D.PROCESS_ABSOLUTES_Y);

			if (this.isValid(AbstractChart2D.PROCESS_ABSOLUTES_Y))
				return;

			this.invalidate(AbstractChart.RENDER_CHART);

			this.processAbsolutesYOverride(this._axisY.value);

			this.setValid(AbstractChart2D.PROCESS_ABSOLUTES_Y);
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			this.invalidate(AbstractChart2D.UPDATE_AXIS_VALUES_X);
			this.invalidate(AbstractChart2D.UPDATE_AXIS_VALUES_Y);
		}

		protected function updateAxisValuesXOverride() : Array
		{
			return null;
		}

		protected function updateAxisValuesYOverride() : Array
		{
			return null;
		}

		protected function processValuesXOverride(axisX:IAxis) : void
		{
		}

		protected function processValuesYOverride(axisY:IAxis) : void
		{
		}

		protected function updateAxisRangeXOverride() : Array
		{
			return null;
		}

		protected function updateAxisRangeYOverride() : Array
		{
			return null;
		}

		protected function processAbsolutesXOverride(axisX:IAxis) : void
		{
		}

		protected function processAbsolutesYOverride(axisY:IAxis) : void
		{
		}

		// Private Methods

		private function _axisX_changed(e:ChangedEvent) : void
		{
			switch (e.changeType)
			{
				case AxisChangeType.VALUE_ABSOLUTE_MAP:
					this.invalidate(AbstractChart2D.PROCESS_VALUES_X);
					break;
				case AxisChangeType.ABSOLUTE_RELATIVE_MAP:
					this.invalidate(AbstractChart2D.PROCESS_ABSOLUTES_X);
					break;
				case PropertyChangedEvent.PROPERTY:
					var propertyChangedEvent:PropertyChangedEvent = e as PropertyChangedEvent;
					if (propertyChangedEvent && (propertyChangedEvent.source == this._axisX))
					{
						var oldAxis:IAxis = propertyChangedEvent.oldValue as IAxis;
						var newAxis:IAxis = propertyChangedEvent.newValue as IAxis;

						if (oldAxis)
						{
							oldAxis.removeEventListener(AxisEvent.SET_RANGE, this.validates(AbstractChart2D.UPDATE_AXIS_RANGE_X));
							oldAxis.removeEventListener(AxisEvent.SET_VALUES, this.validates(AbstractChart2D.UPDATE_AXIS_VALUES_X));
							oldAxis.unregister(this._axisX);
						}

						if (newAxis)
						{
							newAxis.register(this._axisX);
							newAxis.addEventListener(AxisEvent.SET_VALUES, this.validates(AbstractChart2D.UPDATE_AXIS_VALUES_X));
							newAxis.addEventListener(AxisEvent.SET_RANGE, this.validates(AbstractChart2D.UPDATE_AXIS_RANGE_X));
							this.invalidate(AbstractChart2D.UPDATE_AXIS_VALUES_X);
						}

						this.invalidate(AbstractChart2D.PROCESS_VALUES_X);
					}
					break;
			}
		}

		private function _axisY_changed(e:ChangedEvent) : void
		{
			switch (e.changeType)
			{
				case AxisChangeType.VALUE_ABSOLUTE_MAP:
					this.invalidate(AbstractChart2D.PROCESS_VALUES_Y);
					break;
				case AxisChangeType.ABSOLUTE_RELATIVE_MAP:
					this.invalidate(AbstractChart2D.PROCESS_ABSOLUTES_Y);
					break;
				case PropertyChangedEvent.PROPERTY:
					var propertyChangedEvent:PropertyChangedEvent = e as PropertyChangedEvent;
					if (propertyChangedEvent && (propertyChangedEvent.source == this._axisY))
					{
						var oldAxis:IAxis = propertyChangedEvent.oldValue as IAxis;
						var newAxis:IAxis = propertyChangedEvent.newValue as IAxis;

						if (oldAxis)
						{
							oldAxis.removeEventListener(AxisEvent.SET_RANGE, this.validates(AbstractChart2D.UPDATE_AXIS_RANGE_Y));
							oldAxis.removeEventListener(AxisEvent.SET_VALUES, this.validates(AbstractChart2D.UPDATE_AXIS_VALUES_Y));
							oldAxis.unregister(this._axisY);
						}

						if (newAxis)
						{
							newAxis.register(this._axisY);
							newAxis.addEventListener(AxisEvent.SET_VALUES, this.validates(AbstractChart2D.UPDATE_AXIS_VALUES_Y));
							newAxis.addEventListener(AxisEvent.SET_RANGE, this.validates(AbstractChart2D.UPDATE_AXIS_RANGE_Y));
							this.invalidate(AbstractChart2D.UPDATE_AXIS_VALUES_Y);
						}

						this.invalidate(AbstractChart2D.PROCESS_VALUES_Y);
					}
					break;
			}
		}

	}

}

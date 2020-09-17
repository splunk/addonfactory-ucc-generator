package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.layout.Orientation;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.data.IDataTable;
	import flash.display.Graphics;
	import flash.geom.Point;

	public class ValueMarker extends AbstractChart1D
	{

		// Private Properties

		private var _value:ObservableProperty;
		private var _orientation:ObservableProperty;
		private var _lineBrush:ObservableProperty;

		private var _actualValue:* = null;
		private var _actualAbsolute:Number = NaN;
		private var _actualRelative:Number = NaN;

		// Constructor

		public function ValueMarker()
		{
			var lineBrush:IBrush = new SolidStrokeBrush(1, 0x000000, 1);

			this._value = new ObservableProperty(this, "value", Object, null, this.invalidates(AbstractChart.PROCESS_DATA));
			this._orientation = new ObservableProperty(this, "orientation", String, Orientation.X, this.invalidates(AbstractChart.RENDER_CHART));
			this._lineBrush = new ObservableProperty(this, "lineBrush", IBrush, lineBrush, this.invalidates(AbstractChart.RENDER_CHART));

			this.mouseEnabled = false;
		}

		// Public Getters/Setters

		public function get value() : *
		{
			return this._value.value;
		}
		public function set value(value:*) : void
		{
			this._value.value = value;
		}

		public function get orientation() : String
		{
			return this._orientation.value;
		}
		public function set orientation(value:String) : void
		{
			switch (value)
			{
				case Orientation.X:
				case Orientation.Y:
					break;
				default:
					value = Orientation.X;
					break;
			}
			this._orientation.value = value;
		}

		public function get lineBrush() : IBrush
		{
			return this._lineBrush.value;
		}
		public function set lineBrush(value:IBrush) : void
		{
			this._lineBrush.value = value;
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			var value:* = this._value.value;

			if ((value == null) && data && (data.numColumns > 0) && (data.numRows > 0))
				value = data.getValue(0, 0);

			this._actualValue = value;
		}

		protected override function processValuesOverride(axis:IAxis) : void
		{
			var absolute:Number = NaN;

			if (axis)
			{
				var value:* = this._actualValue;
				if (value != null)
					absolute = axis.valueToAbsolute(value);
			}

			this._actualAbsolute = absolute;
		}

		protected override function processAbsolutesOverride(axis:IAxis) : void
		{
			var relative:Number = NaN;

			if (axis)
			{
				var absolute:Number = this._actualAbsolute;
				if (absolute == absolute)
					relative = axis.absoluteToRelative(absolute);
			}

			this._actualRelative = relative;
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var graphics:Graphics = this.graphics;

			graphics.clear();

			var relative:Number = this._actualRelative;
			if ((relative != relative) || (relative < 0) || (relative > 1))
				return;

			var brushBounds:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];

			var lineBrush:IBrush = this._lineBrush.value;
			if (!lineBrush)
				lineBrush = new SolidStrokeBrush(1, 0x000000, 1);

			var pixel:Number;

			lineBrush.beginBrush(graphics, null, brushBounds);

			if (this._orientation.value == Orientation.Y)
			{
				pixel = Math.round(chartHeight * (1 - relative));
				lineBrush.moveTo(0, pixel);
				lineBrush.lineTo(chartWidth, pixel);
			}
			else
			{
				pixel = Math.round(chartWidth * relative);
				lineBrush.moveTo(pixel, 0);
				lineBrush.lineTo(pixel, chartHeight);
			}

			lineBrush.endBrush();
		}

	}

}

package com.splunk.charting.charts
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.charting.axes.IAxis;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.data.IDataTable;
	import flash.display.Graphics;
	import flash.geom.Point;

	public class RangeMarker extends AbstractChart1D
	{

		// Private Properties

		private var _minimumValue:ObservableProperty;
		private var _maximumValue:ObservableProperty;
		private var _orientation:ObservableProperty;
		private var _lineBrush:ObservableProperty;
		private var _innerFillBrush:ObservableProperty;
		private var _outerFillBrush:ObservableProperty;

		private var _actualMinimumValue:* = null;
		private var _actualMaximumValue:* = null;
		private var _actualMinimumAbsolute:Number = NaN;
		private var _actualMaximumAbsolute:Number = NaN;
		private var _actualMinimumRelative:Number = NaN;
		private var _actualMaximumRelative:Number = NaN;

		// Constructor

		public function RangeMarker()
		{
			var innerFillBrush:IBrush = new SolidFillBrush(0x000000, 0.25);
			var lineBrush:IBrush = new SolidStrokeBrush(1, 0x000000, 1);

			this._minimumValue = new ObservableProperty(this, "minimumValue", Object, null, this.invalidates(AbstractChart.PROCESS_DATA));
			this._maximumValue = new ObservableProperty(this, "maximumValue", Object, null, this.invalidates(AbstractChart.PROCESS_DATA));
			this._orientation = new ObservableProperty(this, "orientation", String, Orientation.X, this.invalidates(AbstractChart.RENDER_CHART));
			this._lineBrush = new ObservableProperty(this, "lineBrush", IBrush, lineBrush, this.invalidates(AbstractChart.RENDER_CHART));
			this._innerFillBrush = new ObservableProperty(this, "innerFillBrush", IBrush, innerFillBrush, this.invalidates(AbstractChart.RENDER_CHART));
			this._outerFillBrush = new ObservableProperty(this, "outerFillBrush", IBrush, null, this.invalidates(AbstractChart.RENDER_CHART));

			this.mouseEnabled = false;
		}

		// Public Getters/Setters

		public function get minimumValue() : *
		{
			return this._minimumValue.value;
		}
		public function set minimumValue(value:*) : void
		{
			this._minimumValue.value = value;
		}

		public function get maximumValue() : *
		{
			return this._maximumValue.value;
		}
		public function set maximumValue(value:*) : void
		{
			this._maximumValue.value = value;
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

		public function get innerFillBrush() : IBrush
		{
			return this._innerFillBrush.value;
		}
		public function set innerFillBrush(value:IBrush) : void
		{
			this._innerFillBrush.value = value;
		}

		public function get outerFillBrush() : IBrush
		{
			return this._outerFillBrush.value;
		}
		public function set outerFillBrush(value:IBrush) : void
		{
			this._outerFillBrush.value = value;
		}

		// Protected Methods

		protected override function processDataOverride(data:IDataTable) : void
		{
			super.processDataOverride(data);

			var minimumValue:* = this._minimumValue.value;
			var maximumValue:* = this._maximumValue.value;

			if ((minimumValue == null) || (maximumValue == null))
			{
				if (data && (data.numColumns > 0))
				{
					var numRows:int = data.numRows;
					if ((minimumValue == null) && (numRows > 0))
						minimumValue = data.getValue(0, 0);
					if ((maximumValue == null) && (numRows > 1))
						maximumValue = data.getValue(1, 0);
				}
			}

			this._actualMinimumValue = minimumValue;
			this._actualMaximumValue = maximumValue;
		}

		protected override function processValuesOverride(axis:IAxis) : void
		{
			var minimumAbsolute:Number = NaN;
			var maximumAbsolute:Number = NaN;

			if (axis)
			{
				var minimumValue:* = this._actualMinimumValue;
				if (minimumValue != null)
					minimumAbsolute = axis.valueToAbsolute(minimumValue);

				var maximumValue:* = this._actualMaximumValue;
				if (maximumValue != null)
					maximumAbsolute = axis.valueToAbsolute(maximumValue);
			}

			this._actualMinimumAbsolute = minimumAbsolute;
			this._actualMaximumAbsolute = maximumAbsolute;
		}

		protected override function processAbsolutesOverride(axis:IAxis) : void
		{
			var minimumRelative:Number = NaN;
			var maximumRelative:Number = NaN;

			if (axis)
			{
				var minimumAbsolute:Number = this._actualMinimumAbsolute;
				var maximumAbsolute:Number = this._actualMaximumAbsolute;  // flash bug: stack overflow occurs if placed between if statements

				if (minimumAbsolute == minimumAbsolute)
					minimumRelative = axis.absoluteToRelative(minimumAbsolute);

				if (maximumAbsolute == maximumAbsolute)
					maximumRelative = axis.absoluteToRelative(maximumAbsolute);
			}

			this._actualMinimumRelative = minimumRelative;
			this._actualMaximumRelative = maximumRelative;
		}

		protected override function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
			var graphics:Graphics = this.graphics;

			graphics.clear();

			var minimumRelative:Number = this._actualMinimumRelative;
			var maximumRelative:Number = this._actualMaximumRelative;

			if ((minimumRelative != minimumRelative) && (maximumRelative != maximumRelative))
				return;

			if (minimumRelative != minimumRelative)
				minimumRelative = maximumRelative;
			else if (maximumRelative != maximumRelative)
				maximumRelative = minimumRelative;

			if (minimumRelative > maximumRelative)
			{
				var temp:Number = minimumRelative;
				minimumRelative = maximumRelative;
				maximumRelative = temp;
			}

			var minimumRelative2:Number = NumberUtil.minMax(minimumRelative, 0, 1);
			var maximumRelative2:Number = NumberUtil.minMax(maximumRelative, 0, 1);

			var brushBounds:Array = [ new Point(0, 0), new Point(chartWidth, 0), new Point(chartWidth, chartHeight), new Point(0, chartHeight) ];

			var lineBrush:IBrush = this._lineBrush.value;
			var innerFillBrush:IBrush = this._innerFillBrush.value;
			var outerFillBrush:IBrush = this._outerFillBrush.value;

			var pixel1:Number;
			var pixel2:Number;

			if (this._orientation.value == Orientation.Y)
			{
				pixel1 = Math.round(chartHeight * (1 - minimumRelative2));
				pixel2 = Math.round(chartHeight * (1 - maximumRelative2));

				if (outerFillBrush)
				{
					outerFillBrush.beginBrush(graphics, null, brushBounds);
					outerFillBrush.moveTo(0, 0);
					outerFillBrush.lineTo(chartWidth, 0);
					outerFillBrush.lineTo(chartWidth, pixel1);
					outerFillBrush.lineTo(0, pixel1);
					outerFillBrush.lineTo(0, 0);
					outerFillBrush.endBrush();

					outerFillBrush.beginBrush(graphics, null, brushBounds);
					outerFillBrush.moveTo(0, pixel2);
					outerFillBrush.lineTo(chartWidth, pixel2);
					outerFillBrush.lineTo(chartWidth, chartHeight);
					outerFillBrush.lineTo(0, chartHeight);
					outerFillBrush.lineTo(0, pixel2);
					outerFillBrush.endBrush();
				}

				if (innerFillBrush)
				{
					innerFillBrush.beginBrush(graphics, null, brushBounds);
					innerFillBrush.moveTo(0, pixel1);
					innerFillBrush.lineTo(chartWidth, pixel1);
					innerFillBrush.lineTo(chartWidth, pixel2);
					innerFillBrush.lineTo(0, pixel2);
					innerFillBrush.lineTo(0, pixel1);
					innerFillBrush.endBrush();
				}

				if (lineBrush)
				{
					if ((minimumRelative >= 0) && (minimumRelative <= 1))
					{
						pixel1 = Math.round(chartHeight * (1 - minimumRelative));
						lineBrush.beginBrush(graphics, null, brushBounds);
						lineBrush.moveTo(0, pixel1);
						lineBrush.lineTo(chartWidth, pixel1);
						lineBrush.endBrush();
					}

					if ((maximumRelative >= 0) && (maximumRelative <= 1))
					{
						pixel2 = Math.round(chartHeight * (1 - maximumRelative));
						lineBrush.beginBrush(graphics, null, brushBounds);
						lineBrush.moveTo(0, pixel2);
						lineBrush.lineTo(chartWidth, pixel2);
						lineBrush.endBrush();
					}
				}
			}
			else
			{
				pixel1 = Math.round(chartWidth * minimumRelative2);
				pixel2 = Math.round(chartWidth * maximumRelative2);

				if (outerFillBrush)
				{
					outerFillBrush.beginBrush(graphics, null, brushBounds);
					outerFillBrush.moveTo(0, 0);
					outerFillBrush.lineTo(pixel1, 0);
					outerFillBrush.lineTo(pixel1, chartHeight);
					outerFillBrush.lineTo(0, chartHeight);
					outerFillBrush.lineTo(0, 0);
					outerFillBrush.endBrush();

					outerFillBrush.beginBrush(graphics, null, brushBounds);
					outerFillBrush.moveTo(pixel2, 0);
					outerFillBrush.lineTo(chartWidth, 0);
					outerFillBrush.lineTo(chartWidth, chartHeight);
					outerFillBrush.lineTo(pixel2, chartHeight);
					outerFillBrush.lineTo(pixel2, 0);
					outerFillBrush.endBrush();
				}

				if (innerFillBrush)
				{
					innerFillBrush.beginBrush(graphics, null, brushBounds);
					innerFillBrush.moveTo(pixel1, 0);
					innerFillBrush.lineTo(pixel2, 0);
					innerFillBrush.lineTo(pixel2, chartHeight);
					innerFillBrush.lineTo(pixel1, chartHeight);
					innerFillBrush.lineTo(pixel1, 0);
					innerFillBrush.endBrush();
				}

				if (lineBrush)
				{
					if ((minimumRelative >= 0) && (minimumRelative <= 1))
					{
						pixel1 = Math.round(chartWidth * minimumRelative);
						lineBrush.beginBrush(graphics, null, brushBounds);
						lineBrush.moveTo(pixel1, 0);
						lineBrush.lineTo(pixel1, chartHeight);
						lineBrush.endBrush();
					}

					if ((maximumRelative >= 0) && (maximumRelative <= 1))
					{
						pixel2 = Math.round(chartWidth * maximumRelative);
						lineBrush.beginBrush(graphics, null, brushBounds);
						lineBrush.moveTo(pixel2, 0);
						lineBrush.lineTo(pixel2, chartHeight);
						lineBrush.endBrush();
					}
				}
			}
		}

	}

}

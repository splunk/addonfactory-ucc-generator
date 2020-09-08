package
{

	import com.jasongatt.core.ValidateEvent;
	import com.jasongatt.layout.GroupLayout;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.layout.StackLayout;
	import com.splunk.charting.charts.AbstractChart;
	import com.splunk.charting.labels.AbstractAxisLabels;
	import com.splunk.charting.labels.GridLines;
	import com.splunk.charting.labels.NumericAxisLabels;
	import com.splunk.charting.labels.TimeAxisLabels;
	import com.splunk.charting.layout.Placement;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.charting.legend.Legend;
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;

	public class SeriesLayout extends EventDispatcher
	{

		// Private Properties

		private var _numericAxisFormat:Function;
		private var _timeAxisFormat:Function;
		private var _charts:Array;
		private var _legends:Array;
		private var _axisLabels:Array;
		private var _gridLines:Array;
		private var _leftLayout:StackLayout;
		private var _centerLayout:GroupLayout;
		private var _rightLayout:StackLayout;

		// Constructor

		public function SeriesLayout()
		{
			this._leftLayout = new StackLayout();
			this._leftLayout.orientation = Orientation.X;
			this._leftLayout.alignmentX = 1;
			this._leftLayout.snap = true;

			this._centerLayout = new GroupLayout();
			this._centerLayout.snap = true;

			this._rightLayout = new StackLayout();
			this._rightLayout.orientation = Orientation.X;
			this._rightLayout.alignmentX = 0;
			this._rightLayout.snap = true;
		}

		// Public Getters/Setters

		public function get numericAxisFormat() : Function
		{
			return this._numericAxisFormat;
		}
		public function set numericAxisFormat(value:Function) : void
		{
			this._numericAxisFormat = value;
		}

		public function get timeAxisFormat() : Function
		{
			return this._timeAxisFormat;
		}
		public function set timeAxisFormat(value:Function) : void
		{
			this._timeAxisFormat = value;
		}

		public function get charts() : Array
		{
			var value:Array = this._charts;
			return value ? value.concat() : null;
		}
		public function set charts(value:Array) : void
		{
			var oldCharts:Dictionary = new Dictionary();
			var newCharts:Dictionary = new Dictionary();
			var chart:AbstractChart;

			for each (chart in this._charts)
				oldCharts[chart] = chart;

			for each (chart in value)
			{
				if (oldCharts[chart])
					delete oldCharts[chart];
				else
					newCharts[chart] = chart;
			}

			for each (chart in oldCharts)
			{
				chart.removeEventListener(ValidateEvent.VALIDATED, this._chart_validated);
				if (chart.parent == this._centerLayout)
					this._centerLayout.removeChild(chart);
			}

			this._charts = value ? value.concat() : null;

			for each (chart in newCharts)
				chart.addEventListener(ValidateEvent.VALIDATED, this._chart_validated);
		}

		public function get legends() : Array
		{
			var value:Array = this._legends;
			return value ? value.concat() : null;
		}
		public function set legends(value:Array) : void
		{
			var oldLegends:Dictionary = new Dictionary();
			var newLegends:Dictionary = new Dictionary();
			var legend:ILegend;
			var visualLegend:Legend;

			for each (legend in this._legends)
				oldLegends[legend] = legend;

			for each (legend in value)
			{
				if (oldLegends[legend])
					delete oldLegends[legend];
				else
					newLegends[legend] = legend;
			}

			for each (legend in oldLegends)
			{
				visualLegend = legend as Legend;
				if (visualLegend)
				{
					if ((visualLegend.parent == this._leftLayout) || (visualLegend.parent == this._rightLayout))
						visualLegend.parent.removeChild(visualLegend);
				}
			}

			this._legends = value ? value.concat() : null;
		}

		public function get axisLabels() : Array
		{
			var value:Array = this._axisLabels;
			return value ? value.concat() : null;
		}
		public function set axisLabels(value:Array) : void
		{
			var oldAxisLabels:Dictionary = new Dictionary();
			var newAxisLabels:Dictionary = new Dictionary();
			var axisLabel:AbstractAxisLabels;

			for each (axisLabel in this._axisLabels)
				oldAxisLabels[axisLabel] = axisLabel;

			for each (axisLabel in value)
			{
				if (oldAxisLabels[axisLabel])
					delete oldAxisLabels[axisLabel];
				else
					newAxisLabels[axisLabel] = axisLabel;
			}

			for each (axisLabel in oldAxisLabels)
			{
				if ((axisLabel.parent == this._leftLayout) || (axisLabel.parent == this._rightLayout))
					axisLabel.parent.removeChild(axisLabel);
			}

			this._axisLabels = value ? value.concat() : null;

			for each (axisLabel in newAxisLabels)
			{
				if (axisLabel is NumericAxisLabels)
				{
					axisLabel.majorLabelFormat = this._getNumericAxisFormat(NumericAxisLabels(axisLabel));
					axisLabel.minorLabelFormat = this._getNumericAxisFormat(NumericAxisLabels(axisLabel));
				}
				else if (axisLabel is TimeAxisLabels)
				{
					axisLabel.majorLabelFormat = this._getTimeAxisFormat(TimeAxisLabels(axisLabel));
					axisLabel.minorLabelFormat = this._getTimeAxisFormat(TimeAxisLabels(axisLabel));
				}
			}
		}

		public function get gridLines() : Array
		{
			var value:Array = this._gridLines;
			return value ? value.concat() : null;
		}
		public function set gridLines(value:Array) : void
		{
			var oldGridLines:Dictionary = new Dictionary();
			var newGridLines:Dictionary = new Dictionary();
			var gridLine:GridLines;

			for each (gridLine in this._gridLines)
				oldGridLines[gridLine] = gridLine;

			for each (gridLine in value)
			{
				if (oldGridLines[gridLine])
					delete oldGridLines[gridLine];
				else
					newGridLines[gridLine] = gridLine;
			}

			for each (gridLine in oldGridLines)
			{
				if (gridLine.parent == this._centerLayout)
					this._centerLayout.removeChild(gridLine);
			}

			this._gridLines = value ? value.concat() : null;
		}

		public function get leftLayout() : StackLayout
		{
			return this._leftLayout;
		}

		public function get centerLayout() : GroupLayout
		{
			return this._centerLayout;
		}

		public function get rightLayout() : StackLayout
		{
			return this._rightLayout;
		}

		// Public Methods

		public function updateLayout() : void
		{
			var leftLayout:StackLayout = this._leftLayout;
			var centerLayout:GroupLayout = this._centerLayout;
			var rightLayout:StackLayout = this._rightLayout;

			var leftIndex:int = 0;
			var centerIndex:int = 0;
			var rightIndex:int = 0;

			var gridLines:Array = this._gridLines;
			var charts:Array = this._charts;
			var axisLabels:Array = this._axisLabels;
			var legends:Array = this._legends;

			var gridLine:GridLines;
			var chart:AbstractChart;
			var axisLabel:AbstractAxisLabels;
			var legend:Legend;

			var numAxisLabels:int = axisLabels ? axisLabels.length : 0;
			var numLegends:int = legends ? legends.length : 0;
			var i:int;

			for each (gridLine in gridLines)
			{
				if (!centerLayout.contains(gridLine) || (centerLayout.getChildIndex(gridLine) != centerIndex))
					centerLayout.addChildAt(gridLine, centerIndex);
				centerIndex++;
			}

			for each (chart in charts)
			{
				if (!centerLayout.contains(chart) || (centerLayout.getChildIndex(chart) != centerIndex))
					centerLayout.addChildAt(chart, centerIndex);
				centerIndex++;
			}

			for (i = 0; i < numAxisLabels; i++)
			{
				axisLabel = axisLabels[i];
				if (axisLabel.placement == Placement.RIGHT)
				{
					if (!rightLayout.contains(axisLabel) || (rightLayout.getChildIndex(axisLabel) != rightIndex))
						rightLayout.addChildAt(axisLabel, rightIndex);
					rightIndex++;
				}
			}

			for (i = 0; i < numLegends; i++)
			{
				legend = legends[i] as Legend;
				if (legend && (legend.placement == Placement.RIGHT))
				{
					if (!rightLayout.contains(legend) || (rightLayout.getChildIndex(legend) != rightIndex))
						rightLayout.addChildAt(legend, rightIndex);
					rightIndex++;
				}
			}

			for (i = numLegends - 1; i >= 0; i--)
			{
				legend = legends[i] as Legend;
				if (legend && (legend.placement == Placement.LEFT))
				{
					if (!leftLayout.contains(legend) || (leftLayout.getChildIndex(legend) != leftIndex))
						leftLayout.addChildAt(legend, leftIndex);
					leftIndex++;
				}
			}

			for (i = numAxisLabels - 1; i >= 0; i--)
			{
				axisLabel = axisLabels[i];
				if (axisLabel.placement == Placement.LEFT)
				{
					if (!leftLayout.contains(axisLabel) || (leftLayout.getChildIndex(axisLabel) != leftIndex))
						leftLayout.addChildAt(axisLabel, leftIndex);
					leftIndex++;
				}
			}
		}

		// Private Methods

		private function _getNumericAxisFormat(numericAxisLabels:NumericAxisLabels) : Function
		{
			if (this._numericAxisFormat != null)
				return this._numericAxisFormat(numericAxisLabels);
			return null;
		}

		private function _getTimeAxisFormat(timeAxisLabels:TimeAxisLabels) : Function
		{
			if (this._timeAxisFormat != null)
				return this._timeAxisFormat(timeAxisLabels);
			return null;
		}

		private function _chart_validated(e:ValidateEvent) : void
		{
			this.dispatchEvent(e);
		}

	}

}

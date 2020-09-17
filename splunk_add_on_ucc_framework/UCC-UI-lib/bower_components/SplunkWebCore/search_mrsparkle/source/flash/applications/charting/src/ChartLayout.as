package
{

	import com.splunk.charting.labels.AbstractAxisLabels;
	import com.splunk.charting.labels.AxisTitle;
	import com.splunk.charting.labels.NumericAxisLabels;
	import com.splunk.charting.labels.TimeAxisLabels;
	import com.splunk.charting.layout.CartesianLayout;
	import com.splunk.charting.layout.Placement;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.charting.legend.Legend;
	import flash.utils.Dictionary;

	public class ChartLayout extends CartesianLayout
	{

		// Private Properties

		private var _numericAxisFormat:Function;
		private var _timeAxisFormat:Function;
		private var _series:Array;
		private var _legends:Array;
		private var _axisLabels:Array;
		private var _axisTitles:Array;

		private var _leftLayout:SeriesDistributedLayout;
		private var _centerLayout:SeriesDistributedLayout;
		private var _rightLayout:SeriesDistributedLayout;

		// Constructor

		public function ChartLayout()
		{
			this._leftLayout = new SeriesDistributedLayout();
			this._leftLayout.placement = Placement.LEFT;
			this._leftLayout.snap = true;

			this._centerLayout = new SeriesDistributedLayout();
			this._centerLayout.placement = Placement.CENTER;
			this._centerLayout.snap = true;

			this._rightLayout = new SeriesDistributedLayout();
			this._rightLayout.placement = Placement.RIGHT;
			this._rightLayout.snap = true;

			this.snap = true;

			this.addChild(this._leftLayout);
			this.addChild(this._rightLayout);
			this.addChild(this._centerLayout);
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

		public function get series() : Array
		{
			var value:Array = this._series;
			return value ? value.concat() : null;
		}
		public function set series(value:Array) : void
		{
			var oldSeries:Dictionary = new Dictionary();
			var newSeries:Dictionary = new Dictionary();
			var series:SeriesLayout;

			for each (series in this._series)
				oldSeries[series] = series;

			for each (series in value)
			{
				if (oldSeries[series])
					delete oldSeries[series];
				else
					newSeries[series] = series;
			}

			for each (series in oldSeries)
			{
				this._leftLayout.removeChild(series.leftLayout);
				this._centerLayout.removeChild(series.centerLayout);
				this._rightLayout.removeChild(series.rightLayout);
			}

			this._series = value ? value.concat() : null;
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
				if (visualLegend && (visualLegend.parent == this))
					this.removeChild(visualLegend);
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
				if (axisLabel.parent == this)
					this.removeChild(axisLabel);
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

		public function get axisTitles() : Array
		{
			var value:Array = this._axisTitles;
			return value ? value.concat() : null;
		}
		public function set axisTitles(value:Array) : void
		{
			var oldAxisTitles:Dictionary = new Dictionary();
			var newAxisTitles:Dictionary = new Dictionary();
			var axisTitle:AxisTitle;

			for each (axisTitle in this._axisTitles)
				oldAxisTitles[axisTitle] = axisTitle;

			for each (axisTitle in value)
			{
				if (oldAxisTitles[axisTitle])
					delete oldAxisTitles[axisTitle];
				else
					newAxisTitles[axisTitle] = axisTitle;
			}

			for each (axisTitle in oldAxisTitles)
			{
				if (axisTitle.parent == this)
					this.removeChild(axisTitle);
			}

			this._axisTitles = value ? value.concat() : null;
		}

		// Public Methods

		public function updateLayout() : void
		{
			var leftLayout:SeriesDistributedLayout = this._leftLayout;
			var centerLayout:SeriesDistributedLayout = this._centerLayout;
			var rightLayout:SeriesDistributedLayout = this._rightLayout;

			var selfIndex:int = 0;
			var leftIndex:int = 0;
			var centerIndex:int = 0;
			var rightIndex:int = 0;

			var axisLabels:Array = this._axisLabels;
			var series:Array = this._series;
			var axisTitles:Array = this._axisTitles;
			var legends:Array = this._legends;

			var axisLabel:AbstractAxisLabels;
			var seriesLayout:SeriesLayout;
			var axisTitle:AxisTitle;
			var legend:ILegend;
			var visualLegend:Legend;

			for each (axisLabel in axisLabels)
			{
				if (!this.contains(axisLabel) || (this.getChildIndex(axisLabel) != selfIndex))
					this.addChildAt(axisLabel, selfIndex);
				selfIndex++;
			}

			for each (seriesLayout in series)
			{
				seriesLayout.updateLayout();

				if (!leftLayout.contains(seriesLayout.leftLayout) || (leftLayout.getChildIndex(seriesLayout.leftLayout) != leftIndex))
					leftLayout.addChildAt(seriesLayout.leftLayout, leftIndex);
				leftIndex++;

				if (!centerLayout.contains(seriesLayout.centerLayout) || (centerLayout.getChildIndex(seriesLayout.centerLayout) != centerIndex))
					centerLayout.addChildAt(seriesLayout.centerLayout, centerIndex);
				centerIndex++;

				if (!rightLayout.contains(seriesLayout.rightLayout) || (rightLayout.getChildIndex(seriesLayout.rightLayout) != rightIndex))
					rightLayout.addChildAt(seriesLayout.rightLayout, rightIndex);
				rightIndex++;
			}

			if (!this.contains(leftLayout) || (this.getChildIndex(leftLayout) != selfIndex))
				this.addChildAt(leftLayout, selfIndex);
			selfIndex++;

			if (!this.contains(rightLayout) || (this.getChildIndex(rightLayout) != selfIndex))
				this.addChildAt(rightLayout, selfIndex);
			selfIndex++;

			if (!this.contains(centerLayout) || (this.getChildIndex(centerLayout) != selfIndex))
				this.addChildAt(centerLayout, selfIndex);
			selfIndex++;

			for each (axisTitle in axisTitles)
			{
				if (!this.contains(axisTitle) || (this.getChildIndex(axisTitle) != selfIndex))
					this.addChildAt(axisTitle, selfIndex);
				selfIndex++;
			}

			for each (legend in legends)
			{
				visualLegend = legend as Legend;
				if (visualLegend)
				{
					if (!this.contains(visualLegend) || (this.getChildIndex(visualLegend) != selfIndex))
						this.addChildAt(visualLegend, selfIndex);
					selfIndex++;
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

	}

}

import com.jasongatt.core.ObservableProperty;
import com.jasongatt.layout.DistributedLayout;
import com.jasongatt.layout.LayoutSprite;
import com.splunk.charting.layout.IPlacement;
import com.splunk.charting.layout.Placement;

class SeriesDistributedLayout extends DistributedLayout implements IPlacement
{

	// Private Properties

	private var _placement:ObservableProperty;

	// Constructor

	public function SeriesDistributedLayout()
	{
		this._placement = new ObservableProperty(this, "placement", String, Placement.CENTER, this.invalidates(LayoutSprite.MEASURE));
	}

	// Public Getters/Setters

	public function get placement() : String
	{
		return this._placement.value;
	}
	public function set placement(value:String) : void
	{
		switch (value)
		{
			case Placement.LEFT:
			case Placement.RIGHT:
			case Placement.TOP:
			case Placement.BOTTOM:
			case Placement.CENTER:
				break;
			default:
				value = Placement.CENTER;
				break;
		}
		this._placement.value = value;
	}

}

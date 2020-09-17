package com.splunk.charting.charts
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.motion.easers.CubicEaser;
	import com.jasongatt.motion.easers.EaseDirection;
	import com.jasongatt.motion.easers.IEaser;
	import com.splunk.charting.legend.ILegend;
	import com.splunk.charting.legend.LegendChangeType;
	import com.splunk.charting.legend.LegendEvent;
	import com.splunk.data.IDataTable;

	public /*abstract*/ class AbstractChart extends LayoutSprite
	{

		// Public Static Constants

		public static const HIGHLIGHT_RATIO:Number = 0.2;
		public static const HIGHLIGHT_DURATION:Number = 0.3;
		public static const HIGHLIGHT_EASER:IEaser = new CubicEaser(EaseDirection.OUT);
		public static const PROCESS_DATA:ValidatePass = new ValidatePass(AbstractChart, "processData", 0.1);
		public static const UPDATE_LEGEND_LABELS:ValidatePass = new ValidatePass(AbstractChart, "updateLegendLabels", 0.2);
		public static const UPDATE_LEGEND_SWATCHES:ValidatePass = new ValidatePass(AbstractChart, "updateLegendSwatches", 0.3);
		public static const RENDER_CHART:ValidatePass = new ValidatePass(AbstractChart, "renderChart", 2.1);

		// Private Properties

		private var _data:ObservableProperty;
		private var _legend:ObservableProperty;

		private var _labels:Array;
		private var _chartWidth:Number = 0;
		private var _chartHeight:Number = 0;
		private var _highlightedSeriesName:String;
		private var _highlightedElement:DataSprite;
		private var _swatchesMap:Object;

		// Constructor

		public function AbstractChart()
		{
			this._data = new ObservableProperty(this, "data", IDataTable, null, this._data_changed);
			this._legend = new ObservableProperty(this, "legend", ILegend, null, this._legend_changed);

			this.snap = true;
		}

		// Public Getters/Setters

		public function get data() : IDataTable
		{
			return this._data.value;
		}
		public function set data(value:IDataTable) : void
		{
			this._data.value = value;
		}

		public function get legend() : ILegend
		{
			return this._legend.value;
		}
		public function set legend(value:ILegend) : void
		{
			this._legend.value = value;
		}

		// Public Methods

		public function processData() : void
		{
			this.validatePreceding(AbstractChart.PROCESS_DATA);

			if (this.isValid(AbstractChart.PROCESS_DATA))
				return;

			this.invalidate(AbstractChart.UPDATE_LEGEND_LABELS);

			this.processDataOverride(this._data.value);

			this.setValid(AbstractChart.PROCESS_DATA);
		}

		public function updateLegendLabels() : void
		{
			this.validatePreceding(AbstractChart.UPDATE_LEGEND_LABELS);

			if (this.isValid(AbstractChart.UPDATE_LEGEND_LABELS))
				return;

			this.invalidate(AbstractChart.UPDATE_LEGEND_SWATCHES);

			var labels:Array;
			var legend:ILegend = this._legend.value;
			var data:IDataTable = this._data.value;
			if (data)
				labels = this.updateLegendLabelsOverride(data);
			this._labels = labels;

			this.setValid(AbstractChart.UPDATE_LEGEND_LABELS);

			// this must run last to avoid recursion
			if (legend)
				legend.setLabels(this._legend, labels);
		}

		public function updateLegendSwatches() : void
		{
			this.validatePreceding(AbstractChart.UPDATE_LEGEND_SWATCHES);

			if (this.isValid(AbstractChart.UPDATE_LEGEND_SWATCHES))
				return;

			this.invalidate(AbstractChart.RENDER_CHART);

			var swatches:Array;
			var swatchesMap:Object;
			var legend:ILegend = this._legend.value;
			var labels:Array = this._labels;
			if (labels)
			{
				swatches = this.updateLegendSwatchesOverride(legend, labels);
				swatchesMap = new Object();

				var numSwatches:int = swatches ? Math.min(labels.length, swatches.length) : 0;
				for (var i:int = 0; i < numSwatches; i++)
					swatchesMap[labels[i]] = swatches[i];
			}
			this._swatchesMap = swatchesMap;

			this.setValid(AbstractChart.UPDATE_LEGEND_SWATCHES);

			// this must run last to avoid recursion
			if (legend)
				legend.setSwatches(this._legend, swatches);
		}

		public function renderChart() : void
		{
			this.validatePreceding(AbstractChart.RENDER_CHART);

			if (this.isValid(AbstractChart.RENDER_CHART))
				return;

			this.renderChartOverride(this._chartWidth, this._chartHeight, this._legend.value);
			if (this._highlightedSeriesName)
				this.highlightSeriesOverride(this._highlightedSeriesName);
			if (this._highlightedElement)
				this.highlightElementOverride(this._highlightedElement);

			this.setValid(AbstractChart.RENDER_CHART);
		}

		public function highlightSeries(seriesName:String) : void
		{
			if (!seriesName)
				seriesName = null;

			if (this._highlightedSeriesName == seriesName)
				return;

			this._highlightedSeriesName = seriesName;

			this.highlightSeriesOverride(seriesName);
		}

		public function highlightElement(element:DataSprite) : void
		{
			if (this._highlightedElement == element)
				return;

			this._highlightedElement = element;

			this.highlightElementOverride(element);
		}

		public function getSeriesSwatch(seriesName:String) : SeriesSwatch
		{
			var swatchesMap:Object = this._swatchesMap;
			if (!swatchesMap)
				return null;

			return swatchesMap[seriesName];
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var availableWidth:Number = availableSize.width;
			var availableHeight:Number = availableSize.height;

			var finiteWidth:Boolean = (availableWidth != Infinity);
			var finiteHeight:Boolean = (availableHeight != Infinity);

			if (finiteWidth && finiteHeight)
				return new Size(availableWidth, availableHeight);
			if (finiteWidth)
				return new Size(availableWidth, availableWidth);
			if (finiteHeight)
				return new Size(availableHeight, availableHeight);
			return new Size(200, 200);
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			this.invalidate(AbstractChart.RENDER_CHART);

			this._chartWidth = Math.round(layoutSize.width);
			this._chartHeight = Math.round(layoutSize.height);

			return layoutSize;
		}

		protected function processDataOverride(data:IDataTable) : void
		{
		}

		protected function updateLegendLabelsOverride(data:IDataTable) : Array
		{
			return null;
		}

		protected function updateLegendSwatchesOverride(legend:ILegend, labels:Array) : Array
		{
			return null;
		}

		protected function renderChartOverride(chartWidth:Number, chartHeight:Number, legend:ILegend) : void
		{
		}

		protected function highlightSeriesOverride(seriesName:String) : void
		{
		}

		protected function highlightElementOverride(element:DataSprite) : void
		{
		}

		// Private Methods

		private function _data_changed(e:ChangedEvent) : void
		{
			this.invalidate(AbstractChart.PROCESS_DATA);
		}

		private function _legend_changed(e:ChangedEvent) : void
		{
			switch (e.changeType)
			{
				case LegendChangeType.LABEL_INDEX_MAP:
					this.invalidate(AbstractChart.UPDATE_LEGEND_SWATCHES);
					break;
				case PropertyChangedEvent.PROPERTY:
					var propertyChangedEvent:PropertyChangedEvent = e as PropertyChangedEvent;
					if (propertyChangedEvent && (propertyChangedEvent.source == this._legend))
					{
						var oldLegend:ILegend = propertyChangedEvent.oldValue as ILegend;
						var newLegend:ILegend = propertyChangedEvent.newValue as ILegend;

						if (oldLegend)
						{
							oldLegend.removeEventListener(LegendEvent.SET_SWATCHES, this.validates(AbstractChart.UPDATE_LEGEND_SWATCHES));
							oldLegend.removeEventListener(LegendEvent.SET_LABELS, this.validates(AbstractChart.UPDATE_LEGEND_LABELS));
							oldLegend.unregister(this._legend);
						}

						if (newLegend)
						{
							newLegend.register(this._legend);
							newLegend.addEventListener(LegendEvent.SET_LABELS, this.validates(AbstractChart.UPDATE_LEGEND_LABELS));
							newLegend.addEventListener(LegendEvent.SET_SWATCHES, this.validates(AbstractChart.UPDATE_LEGEND_SWATCHES));
						}

						this.invalidate(AbstractChart.UPDATE_LEGEND_LABELS);
					}
					break;
			}
		}

	}

}

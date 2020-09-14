package com.splunk.charting.legend
{

	import com.jasongatt.core.ChangedEvent;
	import com.splunk.external.JABridge;

	public class ExternalLegend extends AbstractLegend
	{

		// Private Properties

		private var _isConnected:Boolean = false;

		private var _labels:Array;
		private var _cachedExternalNumLabels:int = -1;
		private var _cachedExternalLabelMap:Object;

		// Constructor

		public function ExternalLegend()
		{
			this._labels = new Array();
		}

		// Public Getters/Setters

		public function get isConnected() : Boolean
		{
			return this._isConnected;
		}

		// Public Methods

		public function connect() : void
		{
			this.close();

			try
			{
				JABridge.addEventListener("legend.setLabels", this._JABridge_legend_setLabels);
				JABridge.addEventListener("legend.labelIndexMapChanged", this._JABridge_legend_labelIndexMapChanged);

				this._isConnected = true;
			}
			catch (e:Error)
			{
				throw new Error(e.message);
			}
		}

		public function close() : void
		{
			if (!this._isConnected)
				return;

			try
			{
				this._isConnected = false;

				JABridge.removeEventListener("legend.setLabels", this._JABridge_legend_setLabels);
				JABridge.removeEventListener("legend.labelIndexMapChanged", this._JABridge_legend_labelIndexMapChanged);
			}
			catch (e:Error)
			{
			}
		}

		// Protected Methods

		protected override function getNumLabelsOverride() : int
		{
			if (this._isConnected)
			{
				try
				{
					var value:int = this._cachedExternalNumLabels;
					if (value < 0)
						value = this._cachedExternalNumLabels = JABridge.getProperty("legend.numLabels");
					return value;
				}
				catch (e:Error)
				{
				}
			}

			return -1;
		}

		protected override function getLabelIndexOverride(label:String) : int
		{
			if (this._isConnected)
			{
				try
				{
					var labelMap:Object = this._cachedExternalLabelMap;
					if (!labelMap)
						labelMap = this._cachedExternalLabelMap = new Object();
					var index:* = labelMap[label];
					if (index == null)
						index = labelMap[label] = JABridge.callMethod("legend.getLabelIndex", label);
					return int(index);
				}
				catch (e:Error)
				{
				}
			}

			return -1;
		}

		protected override function updateLabelsOverride(labels:Array) : Boolean
		{
			this._labels = labels;

			if (this._isConnected)
			{
				try
				{
					JABridge.callMethod("legend.setLabels", labels);
					return true;
				}
				catch (e:Error)
				{
				}
			}

			return false;
		}

		// Private Methods

		private function _JABridge_legend_setLabels() : void
		{
			this.dispatchEvent(new LegendEvent(LegendEvent.SET_LABELS));
		}

		private function _JABridge_legend_labelIndexMapChanged() : void
		{
			this._cachedExternalNumLabels = -1;
			this._cachedExternalLabelMap = null;

			this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, LegendChangeType.LABEL_INDEX_MAP));
		}

	}

}

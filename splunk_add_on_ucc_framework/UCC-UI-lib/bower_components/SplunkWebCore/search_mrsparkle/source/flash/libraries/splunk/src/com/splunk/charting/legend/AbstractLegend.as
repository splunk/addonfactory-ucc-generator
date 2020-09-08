package com.splunk.charting.legend
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.shapes.IShape;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.layout.LayoutSprite;
	import com.splunk.charting.charts.SeriesSwatch;
	import com.splunk.palettes.brush.IBrushPalette;
	import flash.events.Event;
	import flash.utils.Dictionary;

	[Event(name="setLabels", type="com.splunk.charting.legend.LegendEvent")]
	[Event(name="setSwatches", type="com.splunk.charting.legend.LegendEvent")]

	public /*abstract*/ class AbstractLegend extends LayoutSprite implements ILegend
	{

		// Private Properties

		private var _labels:ObservableProperty;
		private var _defaultSwatchBrushPalette:ObservableProperty;
		private var _numLabels:int = 0;

		private var _targetMap:Dictionary;
		private var _targetList:Array;
		private var _labelMap:Object;
		private var _labelList:Array;
		private var _swatchList:Array;
		private var _isSettingLabels:Boolean = false;
		private var _isSettingSwatches:Boolean = false;

		// Constructor

		public function AbstractLegend()
		{
			this._labels = new ObservableProperty(this, "labels", Array, new Array(), this._updateLabelMap);
			this._defaultSwatchBrushPalette = new ObservableProperty(this, "defaultSwatchBrushPalette", IBrushPalette, null, this._updateSwatchMap);

			this._targetMap = new Dictionary();
			this._targetList = new Array();
			this._labelMap = new Object();
			this._labelList = new Array();
			this._swatchList = new Array();

			this.snap = true;
		}

		// Public Getters/Setters

		public function get labels() : Array
		{
			return this._labels.value.concat();
		}
		public function set labels(value:Array) : void
		{
			this._labels.value = value ? value.concat() : new Array();
		}

		public function get defaultSwatchBrushPalette() : IBrushPalette
		{
			return this._defaultSwatchBrushPalette.value;
		}
		public function set defaultSwatchBrushPalette(value:IBrushPalette) : void
		{
			this._defaultSwatchBrushPalette.value = value;
		}

		public function get numLabels() : int
		{
			var value:int = this.getNumLabelsOverride();
			if (value < 0)
				value = this._numLabels;
			return value;
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

			this._updateLabelMap();
			this._updateSwatchMap();
		}

		public function setLabels(target:Object, labels:Array) : void
		{
			var targetData:TargetData = this._targetMap[target];
			if (!targetData)
				return;

			targetData.labels = labels ? labels.concat() : null;

			if (!this._isSettingLabels)
				this.dispatchEvent(new LegendEvent(LegendEvent.SET_LABELS));
		}

		public function setSwatches(target:Object, swatches:Array) : void
		{
			var targetData:TargetData = this._targetMap[target];
			if (!targetData)
				return;

			targetData.swatches = swatches ? swatches.concat() : null;

			if (!this._isSettingSwatches)
				this.dispatchEvent(new LegendEvent(LegendEvent.SET_SWATCHES));
		}

		public function getLabelIndex(label:String) : int
		{
			var index:int = this.getLabelIndexOverride(label);
			if (index < 0)
			{
				var labelIndex:* = this._labelMap[label];
				index = (labelIndex != null) ? int(labelIndex) : -1;
			}
			return index;
		}

		public override function dispatchEvent(event:Event) : Boolean
		{
			var result:Boolean;

			switch (event.type)
			{
				case LegendEvent.SET_LABELS:
					if (this._isSettingLabels)
					{
						result = false;
					}
					else
					{
						this._isSettingLabels = true;
						result = super.dispatchEvent(event);
						this._updateLabelMap();
						this._isSettingLabels = false;
					}
					break;
				case LegendEvent.SET_SWATCHES:
					if (this._isSettingSwatches)
					{
						result = false;
					}
					else
					{
						this._isSettingSwatches = true;
						result = super.dispatchEvent(event);
						this._updateSwatchMap();
						this._isSettingSwatches = false;
					}
					break;
				default:
					result = super.dispatchEvent(event);
					break;
			}

			return result;
		}

		// Protected Methods

		protected function getNumLabelsOverride() : int
		{
			return -1;
		}

		protected function getLabelIndexOverride(label:String) : int
		{
			return -1;
		}

		protected function updateLabelsOverride(labels:Array) : Boolean
		{
			return false;
		}

		protected function updateSwatchesOverride(swatches:Array) : Boolean
		{
			return false;
		}

		// Private Methods

		private function _updateLabelMap(e:Event = null) : void
		{
			var currentLabelList:Array = this._labelList;
			var changed:Boolean = false;

			var labelMap:Object = new Object();
			var labelList:Array = new Array();

			var targetList:Array = this._targetList;
			var targetData:TargetData;
			var targetLabels:Array;
			var targetLabel:String;

			var numLabels:int;
			var i:int;

			targetLabels = this._labels.value;
			for each (targetLabel in targetLabels)
			{
				if (labelMap[targetLabel] == null)
				{
					labelMap[targetLabel] = labelList.length;
					labelList.push(targetLabel);
				}
			}

			for each (targetData in targetList)
			{
				targetLabels = targetData.labels;
				if (targetLabels)
				{
					for each (targetLabel in targetLabels)
					{
						if (labelMap[targetLabel] == null)
						{
							labelMap[targetLabel] = labelList.length;
							labelList.push(targetLabel);
						}
					}
				}
			}

			numLabels = labelList.length;
			if (numLabels != currentLabelList.length)
			{
				changed = true;
			}
			else
			{
				for (i = 0; i < numLabels; i++)
				{
					if (labelList[i] != currentLabelList[i])
					{
						changed = true;
						break;
					}
				}
			}

			if (changed)
			{
				this._labelMap = labelMap;
				this._labelList = labelList;
				this._numLabels = numLabels;

				if (!this.updateLabelsOverride(labelList.concat()))
					this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this, LegendChangeType.LABEL_INDEX_MAP));

				this._updateSwatchMap();
			}
		}

		private function _updateSwatchMap(e:Event = null) : void
		{
			var currentSwatchList:Array = this._swatchList;
			var changed:Boolean = false;

			var labelMap:Object = this._labelMap;
			var labelList:Array = this._labelList;

			var swatchMap:Object = new Object();
			var swatchList:Array = new Array(labelList.length);

			var targetList:Array = this._targetList;
			var targetData:TargetData;
			var targetLabels:Array;
			var targetLabel:String;
			var targetSwatches:Array;
			var targetSwatch:SeriesSwatch;

			var swatchBrushPalette:IBrushPalette = this._defaultSwatchBrushPalette.value;
			var swatchBrush:IBrush;
			var swatchShape:IShape;
			var numSwatches:int;
			var numLabels:int;
			var i:int;

			for each (targetData in targetList)
			{
				targetLabels = targetData.labels;
				targetSwatches = targetData.swatches;
				if (targetLabels && targetSwatches)
				{
					numSwatches = Math.min(targetLabels.length, targetSwatches.length);
					for (i = 0; i < numSwatches; i++)
					{
						targetLabel = targetLabels[i];
						if (!swatchMap[targetLabel])
						{
							targetSwatch = targetSwatches[i] as SeriesSwatch;
							if (targetSwatch)
							{
								swatchMap[targetLabel] = true;
								swatchList[labelMap[targetLabel]] = targetSwatch;
							}
						}
					}
				}
			}

			if (swatchBrushPalette)
			{
				numLabels = this.numLabels;
				swatchShape = new RectangleShape();
				for each (targetLabel in labelList)
				{
					if (!swatchMap[targetLabel])
					{
						swatchBrush = swatchBrushPalette.getBrush(targetLabel, this.getLabelIndex(targetLabel), numLabels);
						if (swatchBrush)
						{
							swatchMap[targetLabel] = true;
							swatchList[labelMap[targetLabel]] = new SeriesSwatch([ swatchShape ], [ swatchBrush ], [], 1);
						}
					}
				}
			}

			numSwatches = swatchList.length;
			if (numSwatches != currentSwatchList.length)
			{
				changed = true;
			}
			else
			{
				for (i = 0; i < numSwatches; i++)
				{
					if (swatchList[i] != currentSwatchList[i])
					{
						changed = true;
						break;
					}
				}
			}

			if (changed)
			{
				this._swatchList = swatchList;

				this.updateSwatchesOverride(swatchList.concat());
			}
		}

	}

}

class TargetData
{

	// Public Properties

	public var labels:Array;
	public var swatches:Array;

	// Constructor

	public function TargetData()
	{
	}

}

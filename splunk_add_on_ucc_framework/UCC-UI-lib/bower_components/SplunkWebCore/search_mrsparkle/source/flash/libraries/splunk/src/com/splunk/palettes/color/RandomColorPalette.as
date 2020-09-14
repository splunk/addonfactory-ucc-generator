package com.splunk.palettes.color
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import flash.events.EventDispatcher;
	import flash.events.TimerEvent;
	import flash.utils.Timer;

	public class RandomColorPalette extends ObservableObject implements IColorPalette
	{

		// Private Properties

		private var _minimumColor:ObservableProperty;
		private var _maximumColor:ObservableProperty;

		private var _cachedMinimumColor:uint;
		private var _cachedMaximumColor:uint;

		private var _fieldColorScaleMap:Object;
		private var _cleanTimer:Timer;
		private var _cleanTimerTick:int = 0;
		private var _cleanCount:Number = 0;

		// Constructor

		public function RandomColorPalette(minimumColor:uint = 0x000000, maximumColor:uint = 0xFFFFFF)
		{
			this._minimumColor = new ObservableProperty(this, "minimumColor", uint, minimumColor);
			this._maximumColor = new ObservableProperty(this, "maximumColor", uint, maximumColor);

			this._cachedMinimumColor = minimumColor;
			this._cachedMaximumColor = maximumColor;

			this._fieldColorScaleMap = new Object();
		}

		// Public Getters/Setters

		public function get minimumColor() : uint
		{
			return this._minimumColor.value;
		}
		public function set minimumColor(value:uint) : void
		{
			this._minimumColor.value = this._cachedMinimumColor = value;
		}

		public function get maximumColor() : uint
		{
			return this._maximumColor.value;
		}
		public function set maximumColor(value:uint) : void
		{
			this._maximumColor.value = this._cachedMaximumColor = value;
		}

		// Public Methods

		public function getColor(field:String, index:int, count:int) : uint
		{
			if (!field)
				return this._cachedMinimumColor;

			var colorScale:RandomColorScale = this._fieldColorScaleMap[field];
			if (!colorScale)
			{
				colorScale = this._fieldColorScaleMap[field] = new RandomColorScale();

				if (!this._cleanTimer)
				{
					this._cleanTimer = new Timer(1000, 0);
					this._cleanTimer.addEventListener(TimerEvent.TIMER, this._cleanTimer_timer);
					this._cleanTimer.start();
				}
			}

			colorScale.cleanCount = this._cleanCount;

			var minimumColor:uint = this._cachedMinimumColor;
			var maximumColor:uint = this._cachedMaximumColor;

			var minR:uint = (minimumColor >> 16) & 0xFF;
			var minG:uint = (minimumColor >> 8) & 0xFF;
			var minB:uint = minimumColor & 0xFF;

			var maxR:uint = (maximumColor >> 16) & 0xFF;
			var maxG:uint = (maximumColor >> 8) & 0xFF;
			var maxB:uint = maximumColor & 0xFF;

			var r:uint = minR + Math.round((maxR - minR) * colorScale.scaleR);
			var g:uint = minG + Math.round((maxG - minG) * colorScale.scaleG);
			var b:uint = minB + Math.round((maxB - minB) * colorScale.scaleB);

			return ((r << 16) | (g << 8) | b);
		}

		// Private Methods

		private function _cleanTimer_timer(e:TimerEvent) : void
		{
			if (this._cleanTimerTick == 0)
			{
				this._cleanTimerTick++;
				this._cleanCount++;
				this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this));
				return;
			}

			this._cleanTimer.stop();
			this._cleanTimer = null;
			this._cleanTimerTick = 0;

			var deleteFields:Array = new Array();
			var cleanCount:Number = this._cleanCount;
			var fieldColorScaleMap:Object = this._fieldColorScaleMap;
			var colorScale:RandomColorScale;
			var field:String;

			for (field in fieldColorScaleMap)
			{
				colorScale = fieldColorScaleMap[field];
				if (colorScale.cleanCount < cleanCount)
					deleteFields.push(field);
			}

			for each (field in deleteFields)
				delete fieldColorScaleMap[field];
		}

	}

}

class RandomColorScale
{

	// Public Properties

	public var scaleR:Number;
	public var scaleG:Number;
	public var scaleB:Number;
	public var cleanCount:Number = 0;

	// Constructor

	public function RandomColorScale()
	{
		this.scaleR = Math.random();
		this.scaleG = Math.random();
		this.scaleB = Math.random();
	}

}

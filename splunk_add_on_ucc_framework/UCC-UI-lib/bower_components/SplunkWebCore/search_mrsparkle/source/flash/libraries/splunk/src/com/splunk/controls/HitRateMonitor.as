package com.splunk.controls
{

	import com.jasongatt.controls.TextBlock;
	import com.jasongatt.motion.clocks.ClockEvent;
	import com.jasongatt.motion.clocks.FrameClock;
	import com.jasongatt.motion.clocks.IClock;
	import flash.text.TextFormat;

	public class HitRateMonitor extends TextBlock
	{

		// Private Properties

		private var _label:String = "hps";
		private var _clock:IClock;
		private var _numSamples:int = 100;
		private var _hitRate:Number = 0;

		private var _time:Number = 0;
		private var _hitCount:Number = 0;
		private var _times:Array;
		private var _counts:Array;
		private var _defaultClock:FrameClock;

		// Constructor

		public function HitRateMonitor()
		{
			this._times = new Array();
			this._times.push(this._time);

			this._counts = new Array();
			this._counts.push(0);

			this._defaultClock = new FrameClock(true);
			this._defaultClock.addEventListener(ClockEvent.TICK, this._clock_tick);

			this.defaultTextFormat = new TextFormat("_sans", 12);
			this.selectable = false;
			this.mouseEnabled = false;
		}

		// Public Getters/Setters

		public function get label() : String
		{
			return this._label;
		}
		public function set label(value:String) : void
		{
			this._label = value;
		}

		public function get clock() : IClock
		{
			return this._clock;
		}
		public function set clock(value:IClock) : void
		{
			if (this._clock == value)
				return;

			if (this._clock)
			{
				this._clock.removeEventListener(ClockEvent.TICK, this._clock_tick);
			}
			else
			{
				this._defaultClock.removeEventListener(ClockEvent.TICK, this._clock_tick);
				this._defaultClock.stop();
			}

			this._clock = value;

			if (this._clock)
			{
				this._clock.addEventListener(ClockEvent.TICK, this._clock_tick, false, 0, true);
			}
			else
			{
				this._defaultClock.addEventListener(ClockEvent.TICK, this._clock_tick);
				this._defaultClock.start();
			}
		}

		public function get numSamples() : int
		{
			return this._numSamples;
		}
		public function set numSamples(value:int) : void
		{
			this._numSamples = (value > 2) ? value : 2;
		}

		public function get hitRate() : Number
		{
			return this._hitRate;
		}

		// Public Methods

		public function hit() : void
		{
			this._hitCount++;
		}

		// Private Methods

		private function _clock_tick(e:ClockEvent) : void
		{
			this._time += e.time;

			var times:Array = this._times;
			times.push(this._time);

			var counts:Array = this._counts;
			counts.push(this._hitCount);

			var numSamples:int = times.length;
			var trimCount:int = numSamples - this._numSamples;
			if (trimCount > 0)
			{
				times.splice(0, trimCount);
				counts.splice(0, trimCount);
				numSamples -= trimCount;
			}

			var earliestTime:Number = times[0];
			var latestTime:Number = times[numSamples - 1];
			var earliestCount:Number = counts[0];
			var latestCount:Number = counts[numSamples - 1];
			var hitRate:Number = (latestCount - earliestCount) / (latestTime - earliestTime);

			this._hitRate = hitRate;

			var str:String = hitRate.toFixed(2);
			var i:int = str.indexOf(".") - 3;
			for (i; i > 0; i -= 3)
				str = str.substring(0, i) + "," + str.substring(i);

			var label:String = this._label;
			if (label)
				str += " " + label;

			this.text = str;
		}

	}

}

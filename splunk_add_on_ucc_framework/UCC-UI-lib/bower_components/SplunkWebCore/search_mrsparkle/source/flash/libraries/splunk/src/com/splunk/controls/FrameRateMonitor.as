package com.splunk.controls
{

	import com.jasongatt.controls.TextBlock;
	import flash.display.Shape;
	import flash.events.Event;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFormat;
	import flash.utils.getTimer;

	public class FrameRateMonitor extends TextBlock
	{

		// Private Properties

		private var _numSamples:int = 100;
		private var _frameRate:Number = 0;

		private var _times:Array;
		private var _beacon:Shape;

		// Constructor

		public function FrameRateMonitor()
		{
			this._times = new Array();
			this._times.push(getTimer() / 1000);

			this._beacon = new Shape();
			this._beacon.addEventListener(Event.ENTER_FRAME, this._beacon_enterFrame);

			this.defaultTextFormat = new TextFormat("_sans", 12);
			this.selectable = false;
			this.mouseEnabled = false;
		}

		// Public Getters/Setters

		public function get numSamples() : int
		{
			return this._numSamples;
		}
		public function set numSamples(value:int) : void
		{
			this._numSamples = (value > 2) ? value : 2;
		}

		public function get frameRate() : Number
		{
			return this._frameRate;
		}

		// Private Methods

		private function _beacon_enterFrame(e:Event) : void
		{
			var times:Array = this._times;
			times.push(getTimer() / 1000);

			var numSamples:int = times.length;
			var trimCount:int = numSamples - this._numSamples;
			if (trimCount > 0)
			{
				times.splice(0, trimCount);
				numSamples -= trimCount;
			}

			var earliestTime:Number = times[0];
			var latestTime:Number = times[numSamples - 1];
			var frameRate:Number = numSamples / (latestTime - earliestTime);

			this._frameRate = frameRate;

			this.text = frameRate.toFixed(2) + " fps";
		}

	}

}

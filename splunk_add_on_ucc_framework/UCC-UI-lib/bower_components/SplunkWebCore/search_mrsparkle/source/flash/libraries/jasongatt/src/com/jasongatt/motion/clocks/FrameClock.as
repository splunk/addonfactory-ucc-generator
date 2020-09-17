package com.jasongatt.motion.clocks
{

	import flash.display.Shape;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.utils.getTimer;

	[Event(name="tick", type="com.jasongatt.motion.clocks.ClockEvent")]

	public class FrameClock extends EventDispatcher implements IClock
	{

		// Private Properties

		private var _fixedTimeStep:Number = 0;
		private var _maximumTimeStep:Number = 0.1;
		private var _isRunning:Boolean = false;

		private var _beacon:Shape;
		private var _beaconTime:Number = 0;

		// Constructor

		public function FrameClock(autoStart:Boolean = false)
		{
			if (autoStart)
				this.start();
		}

		// Public Getters/Setters

		public function get fixedTimeStep() : Number
		{
			return this._fixedTimeStep;
		}
		public function set fixedTimeStep(value:Number) : void
		{
			this._fixedTimeStep = value;
		}

		public function get maximumTimeStep() : Number
		{
			return this._maximumTimeStep;
		}
		public function set maximumTimeStep(value:Number) : void
		{
			this._maximumTimeStep = value;
		}

		public function get isRunning() : Boolean
		{
			return this._isRunning;
		}

		// Public Methods

		public function start() : void
		{
			if (this._isRunning)
				return;

			this._isRunning = true;

			this._beaconTime = getTimer() / 1000;

			this._beacon = new Shape();
			this._beacon.addEventListener(Event.ENTER_FRAME, this._beacon_enterFrame);
		}

		public function stop() : void
		{
			if (!this._isRunning)
				return;

			this._isRunning = false;

			this._beacon.removeEventListener(Event.ENTER_FRAME, this._beacon_enterFrame);
			this._beacon = null;
		}

		// Private Methods

		private function _beacon_enterFrame(e:Event) : void
		{
			var beaconTime:Number = getTimer() / 1000;

			var time:Number;
			if (this._fixedTimeStep > 0)
			{
				time = this._fixedTimeStep;
			}
			else
			{
				time = beaconTime - this._beaconTime;

				var maximumTimeStep:Number = this._maximumTimeStep;
				if ((maximumTimeStep > 0) && (maximumTimeStep < time))
					time = maximumTimeStep;
			}

			this._beaconTime = beaconTime;

			this.dispatchEvent(new ClockEvent(ClockEvent.TICK, false, false, time));
		}

	}

}

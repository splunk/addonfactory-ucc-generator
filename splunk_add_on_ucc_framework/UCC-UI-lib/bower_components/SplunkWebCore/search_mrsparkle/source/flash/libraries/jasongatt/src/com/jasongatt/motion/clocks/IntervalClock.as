package com.jasongatt.motion.clocks
{

	import flash.events.TimerEvent;
	import flash.events.EventDispatcher;
	import flash.utils.getTimer;
	import flash.utils.Timer;

	[Event(name="tick", type="com.jasongatt.motion.clocks.ClockEvent")]

	public class IntervalClock extends EventDispatcher implements IClock
	{

		// Private Properties

		private var _interval:Number;
		private var _fixedTimeStep:Number = 0;
		private var _maximumTimeStep:Number = 0.1;
		private var _isRunning:Boolean = false;

		private var _timer:Timer;
		private var _timerTime:Number = 0;

		// Constructor

		public function IntervalClock(interval:Number = 0.02, autoStart:Boolean = false)
		{
			if ((interval != interval) || (interval == Infinity))
				throw new ArgumentError("Parameter interval must be a finite number.");
			if (interval < 0)
				throw new ArgumentError("Parameter interval must be non-negative.");

			this._interval = interval;

			if (autoStart)
				this.start();
		}

		// Public Getters/Setters

		public function get interval() : Number
		{
			return this._interval;
		}
		public function set interval(value:Number) : void
		{
			if ((value != value) || (value == Infinity))
				throw new ArgumentError("Parameter interval must be a finite number.");
			if (value < 0)
				throw new ArgumentError("Parameter interval must be non-negative.");

			this._interval = value;

			if (this._timer)
				this._timer.delay = value * 1000;
		}

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

			this._timerTime = getTimer() / 1000;

			this._timer = new Timer(this._interval * 1000, 0);
			this._timer.addEventListener(TimerEvent.TIMER, this._timer_timer);
			this._timer.start();
		}

		public function stop() : void
		{
			if (!this._isRunning)
				return;

			this._isRunning = false;

			this._timer.stop();
			this._timer.removeEventListener(TimerEvent.TIMER, this._timer_timer);
			this._timer = null;
		}

		// Private Methods

		private function _timer_timer(e:TimerEvent) : void
		{
			var timerTime:Number = getTimer() / 1000;

			var time:Number;
			if (this._fixedTimeStep > 0)
			{
				time = this._fixedTimeStep;
			}
			else
			{
				time = timerTime - this._timerTime;

				var maximumTimeStep:Number = this._maximumTimeStep;
				if ((maximumTimeStep > 0) && (maximumTimeStep < time))
					time = maximumTimeStep;
			}

			this._timerTime = timerTime;

			this.dispatchEvent(new ClockEvent(ClockEvent.TICK, false, false, time));

			e.updateAfterEvent();
		}

	}

}

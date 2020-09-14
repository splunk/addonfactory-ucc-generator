package com.jasongatt.motion.clocks
{

	import flash.events.Event;

	public class ClockEvent extends Event
	{

		// Public Static Constants

		public static const TICK:String = "tick";

		// Private Properties

		private var _time:Number;

		// Constructor

		public function ClockEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, time:Number = 0)
		{
			super(type, bubbles, cancelable);

			this._time = time;
		}

		// Public Getters/Setters

		public function get time() : Number
		{
			return this._time;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new ClockEvent(this.type, this.bubbles, this.cancelable, this.time);
		}

		public override function toString() : String
		{
			return this.formatToString("ClockEvent", "type", "bubbles", "cancelable", "eventPhase", "time");
		}

	}

}

package com.jasongatt.motion.clocks
{

	import flash.events.EventDispatcher;

	[Event(name="tick", type="com.jasongatt.motion.clocks.ClockEvent")]

	public class ManualClock extends EventDispatcher implements IClock
	{

		// Constructor

		public function ManualClock()
		{
		}

		// Public Methods

		public function tick(time:Number) : void
		{
			if (time > 0)
				this.dispatchEvent(new ClockEvent(ClockEvent.TICK, false, false, time));
		}

	}

}

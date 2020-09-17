package com.jasongatt.motion.clocks
{

	import flash.events.IEventDispatcher;

	[Event(name="tick", type="com.jasongatt.motion.clocks.ClockEvent")]

	public interface IClock extends IEventDispatcher
	{
	}

}

package com.jasongatt.motion
{

	import flash.events.IEventDispatcher;

	[Event(name="begin", type="com.jasongatt.motion.TweenEvent")]
	[Event(name="end", type="com.jasongatt.motion.TweenEvent")]
	[Event(name="update", type="com.jasongatt.motion.TweenEvent")]

	public interface ITween extends IEventDispatcher
	{

		// Methods

		function beginTween() : Boolean;
		function endTween() : Boolean;
		function updateTween(position:Number) : Boolean;

	}

}

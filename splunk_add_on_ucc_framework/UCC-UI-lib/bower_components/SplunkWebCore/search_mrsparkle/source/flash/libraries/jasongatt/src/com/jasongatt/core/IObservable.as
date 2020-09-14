package com.jasongatt.core
{

	import flash.events.IEventDispatcher;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public interface IObservable extends IEventDispatcher
	{
	}

}

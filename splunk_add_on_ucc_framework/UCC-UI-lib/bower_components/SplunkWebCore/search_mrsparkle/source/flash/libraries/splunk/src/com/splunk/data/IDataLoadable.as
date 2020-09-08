package com.splunk.data
{

	import flash.events.IEventDispatcher;

	[Event(name="complete", type="flash.events.Event")]
	[Event(name="error", type="flash.events.ErrorEvent")]

	public interface IDataLoadable extends IEventDispatcher
	{

		// Methods

		function load() : void;
		function close() : void;

	}

}

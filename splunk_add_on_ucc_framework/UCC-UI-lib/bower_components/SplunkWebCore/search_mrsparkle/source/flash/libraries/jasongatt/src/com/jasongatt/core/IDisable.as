package com.jasongatt.core
{

	import flash.events.IEventDispatcher;

	[Event(name="disabled", type="com.jasongatt.core.DisableEvent")]
	[Event(name="enabled", type="com.jasongatt.core.DisableEvent")]

	public interface IDisable extends IEventDispatcher
	{

		// Getters/Setters

		function get isEnabled() : Boolean;
		function set isEnabled(value:Boolean) : void;

		// Methods

		function disable(key:* = null) : Boolean;
		function enable(key:* = null) : Boolean;

	}

}

package com.jasongatt.core
{

	import flash.events.IEventDispatcher;

	[Event(name="invalidated", type="com.jasongatt.core.ValidateEvent")]
	[Event(name="validated", type="com.jasongatt.core.ValidateEvent")]

	public interface IValidate extends IEventDispatcher
	{

		// Methods

		function invalidate(pass:ValidatePass) : Boolean;
		function validate(pass:ValidatePass = null) : Boolean;
		function validatePreceding(pass:ValidatePass) : Boolean;
		function setValid(pass:ValidatePass = null) : Boolean;
		function isValid(pass:ValidatePass = null) : Boolean;
		function invalidates(pass:ValidatePass) : Function;
		function validates(pass:ValidatePass = null) : Function;

	}

}

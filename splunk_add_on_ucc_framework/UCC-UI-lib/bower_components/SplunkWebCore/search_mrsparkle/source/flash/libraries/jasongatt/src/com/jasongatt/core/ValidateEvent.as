package com.jasongatt.core
{

	import flash.events.Event;

	public class ValidateEvent extends Event
	{

		// Public Static Constants

		public static const INVALIDATED:String = "invalidated";
		public static const VALIDATED:String = "validated";

		// Private Properties

		private var _pass:ValidatePass;

		// Constructor

		public function ValidateEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, pass:ValidatePass = null)
		{
			super(type, bubbles, cancelable);

			this._pass = pass;
		}

		// Public Getters/Setters

		public function get pass() : ValidatePass
		{
			return this._pass;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new ValidateEvent(this.type, this.bubbles, this.cancelable, this.pass);
		}

		public override function toString() : String
		{
			return this.formatToString("ValidateEvent", "type", "bubbles", "cancelable", "eventPhase", "pass");
		}

	}

}

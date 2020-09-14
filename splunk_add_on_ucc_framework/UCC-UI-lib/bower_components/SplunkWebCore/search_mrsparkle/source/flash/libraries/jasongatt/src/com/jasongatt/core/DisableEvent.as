package com.jasongatt.core
{

	import flash.events.Event;

	public class DisableEvent extends Event
	{

		// Public Static Constants

		public static const DISABLED:String = "disabled";
		public static const ENABLED:String = "enabled";

		// Constructor

		public function DisableEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

		// Public Methods

		public override function clone() : Event
		{
			return new DisableEvent(this.type, this.bubbles, this.cancelable);
		}

		public override function toString() : String
		{
			return this.formatToString("DisableEvent", "type", "bubbles", "cancelable", "eventPhase");
		}

	}

}

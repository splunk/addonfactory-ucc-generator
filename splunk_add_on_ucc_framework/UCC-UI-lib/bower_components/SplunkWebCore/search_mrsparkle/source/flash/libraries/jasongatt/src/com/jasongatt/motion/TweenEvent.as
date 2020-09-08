package com.jasongatt.motion
{

	import flash.events.Event;

	public class TweenEvent extends Event
	{

		// Public Static Constants

		public static const BEGIN:String = "begin";
		public static const END:String = "end";
		public static const UPDATE:String = "update";

		// Constructor

		public function TweenEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

		// Public Methods

		public override function clone() : Event
		{
			return new TweenEvent(this.type, this.bubbles, this.cancelable);
		}

		public override function toString() : String
		{
			return this.formatToString("TweenEvent", "type", "bubbles", "cancelable", "eventPhase");
		}

	}

}

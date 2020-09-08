package com.splunk.particles.events
{

	import flash.events.Event;

	public class DropEvent extends Event
	{

		// Public Static Constants

		public static const DROPPED:String = "dropped";

		// Private Properties

		private var _count:int;

		// Constructor

		public function DropEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, count:int = 0)
		{
			super(type, bubbles, cancelable);

			this._count = count;
		}

		// Public Getters/Setters

		public function get count() : int
		{
			return this._count;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new DropEvent(this.type, this.bubbles, this.cancelable, this.count);
		}

		public override function toString() : String
		{
			return this.formatToString("DropEvent", "type", "bubbles", "cancelable", "eventPhase", "count");
		}

	}

}

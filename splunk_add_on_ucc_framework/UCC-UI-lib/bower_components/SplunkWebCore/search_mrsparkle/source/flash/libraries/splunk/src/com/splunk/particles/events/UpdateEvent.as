package com.splunk.particles.events
{

	import flash.events.Event;

	public class UpdateEvent extends Event
	{

		// Public Static Constants

		public static const EMITTER_UPDATED:String = "emitterUpdated";
		public static const COLLECTOR_UPDATED:String = "collectorUpdated";

		// Private Properties

		private var _time:Number;

		// Constructor

		public function UpdateEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, time:Number = 0)
		{
			super(type, bubbles, cancelable);

			this._time = time;
		}

		// Public Getters/Setters

		public function get time() : Number
		{
			return this._time;
		}

		// Public Methods

		public override function clone() : Event
		{
			return new UpdateEvent(this.type, this.bubbles, this.cancelable, this.time);
		}

		public override function toString() : String
		{
			return this.formatToString("UpdateEvent", "type", "bubbles", "cancelable", "eventPhase", "time");
		}

	}

}

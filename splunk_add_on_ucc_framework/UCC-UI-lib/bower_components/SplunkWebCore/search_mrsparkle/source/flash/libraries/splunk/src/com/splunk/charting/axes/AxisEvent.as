package com.splunk.charting.axes
{

	import flash.events.Event;

	public class AxisEvent extends Event
	{

		// Public Static Constants

		public static const SET_VALUES:String = "setValues";
		public static const SET_RANGE:String = "setRange";
		public static const SET_EXTENDED_RANGE:String = "setExtendedRange";

		// Constructor

		public function AxisEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

		// Public Methods

		public override function clone() : Event
		{
			return new AxisEvent(this.type, this.bubbles, this.cancelable);
		}

		public override function toString() : String
		{
			return this.formatToString("AxisEvent", "type", "bubbles", "cancelable", "eventPhase");
		}

	}

}

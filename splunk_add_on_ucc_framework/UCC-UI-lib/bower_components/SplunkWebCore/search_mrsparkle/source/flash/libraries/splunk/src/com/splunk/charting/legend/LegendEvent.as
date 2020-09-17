package com.splunk.charting.legend
{

	import flash.events.Event;

	public class LegendEvent extends Event
	{

		// Public Static Constants

		public static const SET_LABELS:String = "setLabels";
		public static const SET_SWATCHES:String = "setSwatches";

		// Constructor

		public function LegendEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

		// Public Methods

		public override function clone() : Event
		{
			return new LegendEvent(this.type, this.bubbles, this.cancelable);
		}

		public override function toString() : String
		{
			return this.formatToString("LegendEvent", "type", "bubbles", "cancelable", "eventPhase");
		}

	}

}
